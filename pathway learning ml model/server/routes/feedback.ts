import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get feedback for a mentor
export const getFeedback: RequestHandler = (req, res) => {
  try {
    const { mentorId } = req.query;
    
    if (!mentorId) {
      return res.status(400).json({ error: "mentorId is required" });
    }
    
    const feedback = db.prepare(`
      SELECT 
        f.*,
        u.name as user_name,
        u.email as user_email
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.mentor_id = ?
      ORDER BY f.created_at DESC
    `).all(mentorId);
    
    res.json({ feedback });
  } catch (error: any) {
    console.error("Get feedback error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch feedback" });
  }
};

// Submit feedback
export const submitFeedback: RequestHandler = (req, res) => {
  try {
    const { bookingId, userId, mentorId, rating, comment } = req.body;
    
    if (!bookingId || !userId || !mentorId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    // Check if feedback already exists for this booking
    const existing = db.prepare(`
      SELECT * FROM feedback WHERE booking_id = ?
    `).get(bookingId);
    
    if (existing) {
      return res.status(400).json({ error: "Feedback already submitted for this booking" });
    }
    
    // Insert feedback
    const result = db.prepare(`
      INSERT INTO feedback (booking_id, user_id, mentor_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookingId, userId, mentorId, rating, comment || null);
    
    // Update mentor rating
    const stats = db.prepare(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
      FROM feedback
      WHERE mentor_id = ?
    `).get(mentorId);
    
    if (stats) {
      db.prepare(`
        UPDATE mentors 
        SET rating = ?, total_ratings = ?
        WHERE id = ?
      `).run((stats as any).avg_rating, (stats as any).total_ratings, mentorId);
    }
    
    // Award badge for giving feedback
    const feedbackCount = db.prepare(`
      SELECT COUNT(*) as count FROM feedback WHERE user_id = ?
    `).get(userId);
    
    const count = (feedbackCount as any).count;
    if (count === 10) {
      db.prepare(`
        INSERT INTO badges (user_id, badge_name, badge_type)
        VALUES (?, '10 Reviews', 'achievement')
      `).run(userId);
    }
    
    const feedback = db.prepare("SELECT * FROM feedback WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json({ feedback });
  } catch (error: any) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ error: error.message || "Failed to submit feedback" });
  }
};

