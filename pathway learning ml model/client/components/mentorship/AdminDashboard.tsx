import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-16">Failed to load analytics</div>;
  }

  const bookingsChartData = {
    labels: analytics.bookingsPerMonth?.map((b: any) => b.month) || [],
    datasets: [
      {
        label: "Bookings",
        data: analytics.bookingsPerMonth?.map((b: any) => b.count) || [],
        backgroundColor: "rgba(6, 182, 212, 0.5)",
        borderColor: "rgb(6, 182, 212)",
        borderWidth: 2,
      },
    ],
  };

  const usersChartData = {
    labels: analytics.activeUsersOverTime?.map((u: any) => u.month) || [],
    datasets: [
      {
        label: "Active Users",
        data: analytics.activeUsersOverTime?.map((u: any) => u.count) || [],
        backgroundColor: "rgba(168, 85, 247, 0.5)",
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
        Admin Analytics Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <div className="text-2xl font-bold">{analytics.overview?.totalUsers || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-400" />
              <div className="text-2xl font-bold">{analytics.overview?.totalMentors || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <div className="text-2xl font-bold">{analytics.overview?.completedBookings || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">Active Users (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <div className="text-2xl font-bold">{analytics.overview?.activeUsers || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border border-white/20">
          <CardHeader>
            <CardTitle>Bookings Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={bookingsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </CardContent>
        </Card>

        <Card className="glass border border-white/20">
          <CardHeader>
            <CardTitle>Active Users Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={usersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </CardContent>
        </Card>
      </div>

      {/* Top Mentors */}
      <Card className="glass border border-white/20">
        <CardHeader>
          <CardTitle>Top 5 Mentors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topMentors?.map((mentor: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 glass rounded-lg border border-white/10">
                <div>
                  <h4 className="font-semibold">{mentor.name}</h4>
                  <p className="text-sm text-foreground/60">{mentor.domain}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{mentor.session_count} sessions</div>
                  <div className="text-sm text-foreground/60">Rating: {mentor.rating?.toFixed(1) || "N/A"}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Topics */}
      <Card className="glass border border-white/20">
        <CardHeader>
          <CardTitle>Top Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topTopics?.map((topic: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <span>{topic.topic}</span>
                <span className="text-sm text-foreground/60">{topic.count} sessions</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

