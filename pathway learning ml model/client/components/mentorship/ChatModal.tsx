import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp
} from "firebase/firestore";

interface Message {
  id: string;
  senderId: string | number;
  receiverId: string | number;
  message: string;
  timestamp: Timestamp | Date;
  sender_name?: string;
}

interface ChatModalProps {
  mentorId: number; // Mentor's ID from mentors table (for API calls)
  mentorUserId?: number; // Mentor's user_id (for Firestore chat)
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | number;
}

export default function ChatModal({ mentorId, mentorUserId, open, onOpenChange, userId }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mentorInfo, setMentorInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !userId) return;

    setLoading(true);
    setMessages([]);

    // Fetch mentor info using mentorId (from mentors table)
    fetch(`/api/mentors/${mentorId}`)
      .then((res) => res.json())
      .then((data) => setMentorInfo(data.mentor))
      .catch((error) => console.error("Error fetching mentor info:", error));

    // Use mentorUserId for Firestore chat (mentor's user_id), fallback to mentorId if not available
    // Convert userId and mentorUserId to strings for consistent comparison
    const senderIdStr = String(userId);
    const receiverIdStr = String(mentorUserId || mentorId);

    // Create a consistent chatRoomId by sorting IDs (ensures same room ID regardless of sender/receiver)
    const chatRoomId = [senderIdStr, receiverIdStr].sort().join("_");

    // Create Firestore query for messages in this chat room
    // Note: This query requires a composite index in Firestore (chatRoomId + timestamp)
    // Firestore will automatically prompt you to create it when you first run this query
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("chatRoomId", "==", chatRoomId),
      orderBy("timestamp", "asc")
    );

    // Set up real-time listener for messages
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            timestamp: data.timestamp,
            sender_name: data.sender_name,
          });
        });

        // Messages are already sorted by timestamp from the query, but sort again to be sure
        messagesData.sort((a, b) => {
          const timeA = a.timestamp instanceof Timestamp 
            ? a.timestamp.toMillis() 
            : a.timestamp instanceof Date 
            ? a.timestamp.getTime() 
            : 0;
          const timeB = b.timestamp instanceof Timestamp 
            ? b.timestamp.toMillis() 
            : b.timestamp instanceof Date 
            ? b.timestamp.getTime() 
            : 0;
          return timeA - timeB;
        });

        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to messages:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [open, mentorId, mentorUserId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setSending(true);

      // Use mentorUserId for Firestore chat (mentor's user_id), fallback to mentorId if not available
      // Convert userId and mentorUserId to strings for consistency
      const senderIdStr = String(userId);
      const receiverIdStr = String(mentorUserId || mentorId);

      // Create a consistent chatRoomId by sorting IDs (ensures same room ID regardless of sender/receiver)
      const chatRoomId = [senderIdStr, receiverIdStr].sort().join("_");

      // Add message to Firestore
      await addDoc(collection(db, "chats"), {
        senderId: senderIdStr,
        receiverId: receiverIdStr,
        message: messageText,
        timestamp: Timestamp.now(),
        chatRoomId: chatRoomId, // Store chatRoomId for efficient querying
      });

      // Message will be automatically added to the messages array via the onSnapshot listener
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message text on error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Chat with {mentorInfo?.name || "Mentor"}
          </DialogTitle>
          <DialogDescription>Send a message to get help</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-foreground/60">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = String(message.senderId) === String(userId);
              // Convert Firestore Timestamp to Date if needed
              const messageTime = message.timestamp instanceof Timestamp 
                ? message.timestamp.toDate() 
                : message.timestamp instanceof Date 
                ? message.timestamp 
                : new Date(message.timestamp);
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-xs">
                      {isOwnMessage ? "You" : mentorInfo?.name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${isOwnMessage ? "text-right" : ""}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                          : "glass border border-white/20"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {messageTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-background/60"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

