import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get all users
export const getAllUsers: RequestHandler = (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").all();
    res.json({ users });
  } catch (error: any) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
};

// Get analytics data
export const getAnalytics: RequestHandler = (req, res) => {
  try {
    // Total users
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();
    
    // Total mentors
    const totalMentors = db.prepare("SELECT COUNT(*) as count FROM mentors").get();
    
    // Total bookings
    const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
    
    // Completed bookings
    const completedBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'
    `).get();
    
    // Active users (users with bookings in last 30 days)
    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM bookings 
      WHERE date > datetime('now', '-30 days')
    `).get();
    
    // Top 5 mentors by sessions
    const topMentors = db.prepare(`
      SELECT 
        m.name,
        m.domain,
        m.rating,
        COUNT(b.id) as session_count
      FROM mentors m
      LEFT JOIN bookings b ON m.id = b.mentor_id AND b.status = 'completed'
      GROUP BY m.id
      ORDER BY session_count DESC
      LIMIT 5
    `).all();
    
    // Bookings per month (last 6 months)
    const bookingsPerMonth = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(*) as count
      FROM bookings
      WHERE date > datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `).all();
    
    // Active users over time (last 6 months)
    const activeUsersOverTime = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(DISTINCT user_id) as count
      FROM bookings
      WHERE date > datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `).all();
    
    // Top topics
    const topTopics = db.prepare(`
      SELECT 
        topic,
        COUNT(*) as count
      FROM bookings
      WHERE status = 'completed'
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    res.json({
      overview: {
        totalUsers: (totalUsers as any).count,
        totalMentors: (totalMentors as any).count,
        totalBookings: (totalBookings as any).count,
        completedBookings: (completedBookings as any).count,
        activeUsers: (activeUsers as any).count,
      },
      topMentors,
      bookingsPerMonth,
      activeUsersOverTime,
      topTopics,
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch analytics" });
  }
};
