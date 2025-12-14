import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get user progress
export const getUserProgress: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = db.prepare(`
      SELECT * FROM progress 
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(userId);
    
    res.json({ progress });
  } catch (error: any) {
    console.error("Get user progress error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch progress" });
  }
};

// Update user progress
export const updateProgress: RequestHandler = (req, res) => {
  try {
    const { userId, skill, level } = req.body;
    
    if (!userId || !skill || !level) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if progress exists
    const existing = db.prepare(`
      SELECT * FROM progress WHERE user_id = ? AND skill = ?
    `).get(userId, skill);
    
    if (existing) {
      db.prepare(`
        UPDATE progress 
        SET level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND skill = ?
      `).run(level, userId, skill);
    } else {
      db.prepare(`
        INSERT INTO progress (user_id, skill, level)
        VALUES (?, ?, ?)
      `).run(userId, skill, level);
    }
    
    const progress = db.prepare(`
      SELECT * FROM progress WHERE user_id = ? AND skill = ?
    `).get(userId, skill);
    
    res.json({ progress });
  } catch (error: any) {
    console.error("Update progress error:", error);
    res.status(500).json({ error: error.message || "Failed to update progress" });
  }
};

