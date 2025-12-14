import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PeerConnectProps {
  userId?: string | number;
}

export default function PeerConnect({ userId }: PeerConnectProps) {
  const [peers, setPeers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPeers();
      fetchConnections();
    }
  }, [userId]);

  const fetchPeers = async () => {
    try {
      const response = await fetch(`/api/peers/find?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch peers");
      const data = await response.json();
      setPeers(data.peers || []);
    } catch (error) {
      console.error("Error fetching peers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/peers/connections/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch connections");
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const handleConnect = async (peerId: number) => {
    if (!userId) return;

    try {
      const response = await fetch("/api/peers/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          peerId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send connection request");
      
      toast({
        title: "Success",
        description: "Connection request sent!",
      });
      
      fetchPeers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent mb-2">
          Peer Connections
        </h2>
        <p className="text-foreground/70">
          Connect with other mentees who share similar interests and goals
        </p>
      </div>

      {/* Connections */}
      {connections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Connections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="glass border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400">
                        {connection.peer_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{connection.peer_name}</h4>
                      <p className="text-xs text-foreground/60">{connection.peer_sessions || 0} sessions</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Peers */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Suggested Peers</h3>
        {peers.length === 0 ? (
          <Card className="glass border border-white/20 p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
            <p className="text-foreground/70">No peers found with similar interests</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peers.map((peer) => (
              <Card key={peer.id} className="glass border border-white/20 hover:border-cyan-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400">
                          {peer.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{peer.name}</h4>
                        <p className="text-xs text-foreground/60">{peer.session_count || 0} sessions</p>
                      </div>
                    </div>
                  </div>
                  {peer.common_topics > 0 && (
                    <Badge variant="outline" className="text-xs mb-3">
                      {peer.common_topics} common topics
                    </Badge>
                  )}
                  <Button
                    onClick={() => handleConnect(peer.id)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

