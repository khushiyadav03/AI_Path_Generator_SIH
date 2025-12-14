import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get user badges
export const getUserBadges: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const badges = db.prepare(`
      SELECT * FROM badges 
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `).all(userId);
    
    res.json({ badges });
  } catch (error: any) {
    console.error("Get user badges error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch badges" });
  }
};

// Get all available badges
export const getAllBadges: RequestHandler = (req, res) => {
  try {
    const badges = [
      { name: "First Session", type: "achievement", description: "Complete your first mentorship session" },
      { name: "5 Sessions", type: "milestone", description: "Complete 5 mentorship sessions" },
      { name: "10 Sessions", type: "milestone", description: "Complete 10 mentorship sessions" },
      { name: "10 Reviews", type: "achievement", description: "Submit 10 feedback reviews" },
      { name: "Active Mentor", type: "achievement", description: "Become an active mentor" },
      { name: "Community Helper", type: "achievement", description: "Help others in the forum" },
    ];
    
    res.json({ badges });
  } catch (error: any) {
    console.error("Get all badges error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch badges" });
  }
};

