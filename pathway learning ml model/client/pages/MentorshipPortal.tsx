import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Star, MessageCircle, Calendar, Users, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import MentorCard from "@/components/mentorship/MentorCard";
import MentorProfileModal from "@/components/mentorship/MentorProfileModal";
import ChatModal from "@/components/mentorship/ChatModal";
import BookingForm from "@/components/mentorship/BookingForm";
import FeedbackForm from "@/components/mentorship/FeedbackForm";
import AIChatbot from "@/components/mentorship/AIChatbot";
import PeerConnect from "@/components/mentorship/PeerConnect";
import ForumPage from "@/components/mentorship/ForumPage";
import Dashboard from "@/components/mentorship/Dashboard";
import AdminDashboard from "@/components/mentorship/AdminDashboard";
import RegisterMentorModal from "@/components/mentorship/RegisterMentorModal";
import { UserPlus } from "lucide-react";

interface Mentor {
  id: number;
  user_id?: number;
  name: string;
  domain: string;
  skills?: string[];
  bio: string;
  experience: string;
  rating: number;
  total_ratings: number;
  linkedin?: string;
  github?: string;
  profile_image?: string;
  hourly_rate?: number;
  availability?: string;
  total_sessions: number;
  total_feedback: number;
}

export default function MentorshipPortal() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showRegisterMentorModal, setShowRegisterMentorModal] = useState(false);
  const [chatMentorId, setChatMentorId] = useState<number | null>(null);
  const [chatMentorUserId, setChatMentorUserId] = useState<number | null>(null);
  const [bookingMentorId, setBookingMentorId] = useState<number | null>(null);
  const [completedBookingId, setCompletedBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMentors();
  }, [selectedDomain, searchTerm]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDomain !== "all") {
        params.append("domain", selectedDomain);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      const response = await fetch(`/api/mentors?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch mentors");
      
      const data = await response.json();
      setMentors(data.mentors || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowProfileModal(true);
  };

  const handleAskForHelp = (mentor: Mentor) => {
    if (!user) {
      alert("Please sign in to chat with mentors");
      return;
    }
    // Store both mentor.id (for API calls) and mentor.user_id (for Firestore chat)
    // For registered mentors, user_id should be available
    setChatMentorId(mentor.id);
    setChatMentorUserId(mentor.user_id || mentor.id);
    setShowChatModal(true);
  };

  const handleBookSession = (mentorId: number) => {
    if (!user) {
      alert("Please sign in to book a session");
      return;
    }
    setBookingMentorId(mentorId);
    setShowBookingForm(true);
  };

  const handleBookingComplete = (bookingId: number) => {
    setCompletedBookingId(bookingId);
    setShowFeedbackForm(true);
  };

  const domains = ["all", "Web Development", "Data Science", "Machine Learning", "Mobile Development", "DevOps", "UI/UX Design", "Product Management"];

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-4xl font-extrabold text-transparent mb-2">
          Mentorship Portal
        </h1>
        <p className="text-foreground/70">
          Connect with experienced mentors and accelerate your learning journey
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="glass border border-white/20 mb-6">
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
          <TabsTrigger value="forum">Discussion Forum</TabsTrigger>
          <TabsTrigger value="peers">Peer Connections</TabsTrigger>
          {user?.role === "admin" && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          {/* Search and Filters */}
          <div className="glass rounded-xl border border-white/20 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                <Input
                  placeholder="Search mentors by name, domain, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/60"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {domains.map((domain) => (
                  <Button
                    key={domain}
                    variant={selectedDomain === domain ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDomain(domain)}
                    className={selectedDomain === domain ? "bg-gradient-to-r from-cyan-500 to-purple-500" : ""}
                  >
                    {domain === "all" ? "All Domains" : domain}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Mentors Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
              <p className="mt-4 text-foreground/70">Loading mentors...</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-16 glass rounded-xl border border-white/20">
              <Users className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
              <p className="text-foreground/70">No mentors found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  index={index}
                  onMentorClick={() => handleMentorClick(mentor)}
                  onAskForHelp={() => handleAskForHelp(mentor)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Dashboard
            userId={user?.id}
            onBookingComplete={handleBookingComplete}
          />
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum">
          <ForumPage userId={user?.id} />
        </TabsContent>

        {/* Peer Connections Tab */}
        <TabsContent value="peers">
          <PeerConnect userId={user?.id} />
        </TabsContent>

        {/* Admin Dashboard Tab */}
        {user?.role === "admin" && (
          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {selectedMentor && (
        <MentorProfileModal
          mentor={selectedMentor}
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          onBookSession={() => {
            setShowProfileModal(false);
            handleBookSession(selectedMentor.id);
          }}
        />
      )}

      {chatMentorId && chatMentorUserId && (
        <ChatModal
          mentorId={chatMentorId}
          mentorUserId={chatMentorUserId}
          open={showChatModal}
          onOpenChange={setShowChatModal}
          userId={user?.id}
        />
      )}

      {bookingMentorId && (
        <BookingForm
          mentorId={bookingMentorId}
          open={showBookingForm}
          onOpenChange={setShowBookingForm}
          userId={user?.id}
          onSuccess={() => {
            setShowBookingForm(false);
            fetchMentors();
          }}
        />
      )}

      {completedBookingId && (
        <FeedbackForm
          bookingId={completedBookingId}
          open={showFeedbackForm}
          onOpenChange={setShowFeedbackForm}
          userId={user?.id}
          onSuccess={() => {
            setShowFeedbackForm(false);
            setCompletedBookingId(null);
          }}
        />
      )}

      {/* AI Chatbot */}
      <AIChatbot userId={user?.id} />

      {/* Register as Mentor Modal */}
      <RegisterMentorModal
        open={showRegisterMentorModal}
        onOpenChange={setShowRegisterMentorModal}
        userId={user?.id}
        onSuccess={() => {
          // Refresh mentors list after registration
          fetchMentors();
        }}
      />

      {/* Floating Register as Mentor Button */}
      {user && (
        <Button
          onClick={() => {
            if (!user) {
              alert("Please sign in to register as a mentor");
              return;
            }
            setShowRegisterMentorModal(true);
          }}
          className="fixed bottom-8 right-8 z-50 h-14 px-6 rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold flex items-center gap-2"
          style={{
            borderRadius: "9999px",
          }}
        >
          <UserPlus className="h-5 w-5" />
          Register as Mentor
        </Button>
      )}
    </main>
  );
}

