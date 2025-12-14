import { useState, useEffect } from "react";
import { Calendar, Star, Award, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DashboardProps {
  userId?: string | number;
  onBookingComplete: (bookingId: number) => void;
}

export default function Dashboard({ userId, onBookingComplete }: DashboardProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [bookingsRes, badgesRes, progressRes] = await Promise.all([
        fetch(`/api/bookings?userId=${userId}`),
        fetch(`/api/badges/${userId}`),
        fetch(`/api/progress/${userId}`),
      ]);

      const bookingsData = await bookingsRes.json();
      const badgesData = await badgesRes.json();
      const progressData = await progressRes.json();

      setBookings(bookingsData.bookings || []);
      setBadges(badgesData.badges || []);
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId: number) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchData();
      onBookingComplete(bookingId);
    } catch (error) {
      console.error("Error completing booking:", error);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.date) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || new Date(b.date) < new Date()
  );

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
          </CardContent>
        </Card>
        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Skills Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="glass border border-white/20">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
            {upcomingBookings.length === 0 ? (
              <Card className="glass border border-white/20 p-6 text-center">
                <p className="text-foreground/70">No upcoming sessions</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="glass border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{booking.mentor_name}</h4>
                          <p className="text-sm text-foreground/70">{booking.topic}</p>
                          <p className="text-xs text-foreground/60 mt-1">
                            {format(new Date(booking.date), "PPP 'at' p")}
                          </p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Past Sessions</h3>
            {pastBookings.length === 0 ? (
              <Card className="glass border border-white/20 p-6 text-center">
                <p className="text-foreground/70">No past sessions</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="glass border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{booking.mentor_name}</h4>
                          <p className="text-sm text-foreground/70">{booking.topic}</p>
                          <p className="text-xs text-foreground/60 mt-1">
                            {format(new Date(booking.date), "PPP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{booking.status}</Badge>
                          {booking.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteBooking(booking.id)}
                            >
                              Leave Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          {badges.length === 0 ? (
            <Card className="glass border border-white/20 p-6 text-center">
              <Award className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
              <p className="text-foreground/70">No badges earned yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="glass border border-white/20">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 mx-auto text-cyan-400 mb-3" />
                    <h4 className="font-semibold mb-1">{badge.badge_name}</h4>
                    <p className="text-xs text-foreground/60">
                      {format(new Date(badge.earned_at), "PPP")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {progress.length === 0 ? (
            <Card className="glass border border-white/20 p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
              <p className="text-foreground/70">No progress tracked yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {progress.map((item) => (
                <Card key={item.id} className="glass border border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{item.skill}</h4>
                        <p className="text-sm text-foreground/60">
                          Level {item.level}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 w-3 rounded-full ${
                              i < item.level
                                ? "bg-cyan-400"
                                : "bg-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

