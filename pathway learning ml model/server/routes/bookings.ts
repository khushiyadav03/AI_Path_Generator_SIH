import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get all bookings (with optional filters)
export const getBookings: RequestHandler = (req, res) => {
  try {
    const { userId, mentorId, status } = req.query;
    
    let query = `
      SELECT 
        b.*,
        m.name as mentor_name,
        m.domain as mentor_domain,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN mentors m ON b.mentor_id = m.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (userId) {
      query += " AND b.user_id = ?";
      params.push(userId);
    }
    
    if (mentorId) {
      query += " AND b.mentor_id = ?";
      params.push(mentorId);
    }
    
    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }
    
    query += " ORDER BY b.date DESC";
    
    const bookings = db.prepare(query).all(...params);
    res.json({ bookings });
  } catch (error: any) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};

// Create a new booking
export const createBooking: RequestHandler = (req, res) => {
  try {
    const { mentorId, userId, date, topic, duration } = req.body;
    
    if (!mentorId || !userId || !date || !topic) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if mentor exists
    const mentor = db.prepare("SELECT * FROM mentors WHERE id = ?").get(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    
    // Check if user exists
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check for conflicting bookings
    const conflicting = db.prepare(`
      SELECT * FROM bookings 
      WHERE mentor_id = ? AND date = ? AND status IN ('pending', 'confirmed')
    `).get(mentorId, date);
    
    if (conflicting) {
      return res.status(400).json({ error: "Time slot already booked" });
    }
    
    const result = db.prepare(`
      INSERT INTO bookings (mentor_id, user_id, date, topic, duration, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(mentorId, userId, date, topic, duration || 60);
    
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(result.lastInsertRowid);
    
    // Award badge for first booking
    const userBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'completed'
    `).get(userId);
    
    if (userBookings && (userBookings as any).count === 0) {
      // Check if badge already exists
      const existingBadge = db.prepare(`
        SELECT * FROM badges WHERE user_id = ? AND badge_name = 'First Session'
      `).get(userId);
      
      if (!existingBadge) {
        db.prepare(`
          INSERT INTO badges (user_id, badge_name, badge_type)
          VALUES (?, 'First Session', 'achievement')
        `).run(userId);
      }
    }
    
    res.status(201).json({ booking });
  } catch (error: any) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

// Update booking status
export const updateBookingStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updateQuery = meetingLink
      ? "UPDATE bookings SET status = ?, meeting_link = ? WHERE id = ?"
      : "UPDATE bookings SET status = ? WHERE id = ?";
    
    const params = meetingLink ? [status, meetingLink, id] : [status, id];
    
    db.prepare(updateQuery).run(...params);
    
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
    
    // Award badges based on completed sessions
    if (status === "completed") {
      const bookingData = db.prepare(`
        SELECT user_id FROM bookings WHERE id = ?
      `).get(id);
      
      if (bookingData) {
        const userId = (bookingData as any).user_id;
        const completedCount = db.prepare(`
          SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'completed'
        `).get(userId);
        
        const count = (completedCount as any).count;
        
        // Award milestone badges
        if (count === 5) {
          db.prepare(`
            INSERT INTO badges (user_id, badge_name, badge_type)
            VALUES (?, '5 Sessions', 'milestone')
          `).run(userId);
        } else if (count === 10) {
          db.prepare(`
            INSERT INTO badges (user_id, badge_name, badge_type)
            VALUES (?, '10 Sessions', 'milestone')
          `).run(userId);
        }
      }
    }
    
    res.json({ booking });
  } catch (error: any) {
    console.error("Update booking error:", error);
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

// Delete booking
export const deleteBooking: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
    
    res.json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    console.error("Delete booking error:", error);
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};

