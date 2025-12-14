import { RequestHandler } from "express";
import db from "../lib/database.js";
import { findUserById } from "../lib/database.js";

// Get all mentors
export const getAllMentors: RequestHandler = (req, res) => {
  try {
    const { domain, search } = req.query;
    
    let query = `
      SELECT 
        m.*,
        u.email,
        COUNT(DISTINCT b.id) as total_sessions,
        COUNT(DISTINCT f.id) as total_feedback
      FROM mentors m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN bookings b ON m.id = b.mentor_id AND b.status = 'completed'
      LEFT JOIN feedback f ON m.id = f.mentor_id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (domain && domain !== "all") {
      conditions.push("m.domain LIKE ?");
      params.push(`%${domain}%`);
    }
    
    if (search) {
      conditions.push("(m.name LIKE ? OR m.bio LIKE ? OR m.domain LIKE ? OR m.skills LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    query += " GROUP BY m.id ORDER BY m.rating DESC, total_sessions DESC";
    
    const mentors = db.prepare(query).all(...params);
    
    // Parse skills JSON if present
    const mentorsWithParsedSkills = mentors.map((mentor: any) => {
      if (mentor.skills) {
        try {
          mentor.skills = JSON.parse(mentor.skills);
        } catch {
          // If not JSON, keep as is
        }
      }
      return mentor;
    });
    
    res.json({ mentors: mentorsWithParsedSkills });
  } catch (error: any) {
    console.error("Get mentors error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch mentors" });
  }
};

// Get mentors by domain
export const getMentorsByDomain: RequestHandler = (req, res) => {
  try {
    const { domain } = req.params;
    
    const mentors = db.prepare(`
      SELECT 
        m.*,
        u.email,
        COUNT(DISTINCT b.id) as total_sessions
      FROM mentors m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN bookings b ON m.id = b.mentor_id AND b.status = 'completed'
      WHERE m.domain LIKE ?
      GROUP BY m.id
      ORDER BY m.rating DESC
    `).all(`%${domain}%`);
    
    // Parse skills JSON
    const mentorsWithParsedSkills = mentors.map((mentor: any) => {
      if (mentor.skills) {
        try {
          mentor.skills = JSON.parse(mentor.skills);
        } catch {
          // If not JSON, keep as is
        }
      }
      return mentor;
    });
    
    res.json({ mentors: mentorsWithParsedSkills });
  } catch (error: any) {
    console.error("Get mentors by domain error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch mentors" });
  }
};

// Get mentor by ID
export const getMentorById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = db.prepare(`
      SELECT 
        m.*,
        u.email,
        COUNT(DISTINCT b.id) as total_sessions,
        COUNT(DISTINCT f.id) as total_feedback
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN bookings b ON m.id = b.mentor_id
      LEFT JOIN feedback f ON m.id = f.mentor_id
      WHERE m.id = ?
      GROUP BY m.id
    `).get(id);
    
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    
    // Get upcoming bookings
    const upcomingBookings = db.prepare(`
      SELECT * FROM bookings 
      WHERE mentor_id = ? AND status IN ('pending', 'confirmed') AND date > datetime('now')
      ORDER BY date ASC
      LIMIT 10
    `).all(id);
    
    // Get recent feedback
    const recentFeedback = db.prepare(`
      SELECT f.*, u.name as user_name
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.mentor_id = ?
      ORDER BY f.created_at DESC
      LIMIT 5
    `).all(id);
    
    res.json({
      mentor: {
        ...mentor,
        upcomingBookings,
        recentFeedback,
      },
    });
  } catch (error: any) {
    console.error("Get mentor error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch mentor" });
  }
};

// Update mentor rating (called after feedback submission)
export const updateMentorRating: RequestHandler = (req, res) => {
  try {
    const { mentorId } = req.body;
    
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
      `).run(stats.avg_rating, stats.total_ratings, mentorId);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Update rating error:", error);
    res.status(500).json({ error: error.message || "Failed to update rating" });
  }
};

// Register user as mentor
export const registerAsMentor: RequestHandler = (req, res) => {
  try {
    const {
      userId,
      name,
      domain,
      skills,
      bio,
      experience,
      linkedin,
      github,
      hourly_rate,
      availability,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !domain || !bio) {
      return res.status(400).json({
        error: "Missing required fields: userId, name, domain, and bio are required",
      });
    }

    // Check if user exists
    const user = findUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user role to mentor if not already
    if (user.role !== "mentor") {
      db.prepare(`UPDATE users SET role = 'mentor' WHERE id = ?`).run(userId);
    }

    // Check if mentor profile already exists
    const existingMentor = db
      .prepare("SELECT id FROM mentors WHERE user_id = ?")
      .get(userId) as { id: number } | undefined;

    // Prepare skills as JSON string
    const skillsJson = skills && Array.isArray(skills) ? JSON.stringify(skills) : null;

    if (existingMentor) {
      // Update existing mentor profile
      db.prepare(`
        UPDATE mentors 
        SET 
          name = ?,
          domain = ?,
          skills = ?,
          bio = ?,
          experience = ?,
          linkedin = ?,
          github = ?,
          hourly_rate = ?,
          availability = ?
        WHERE user_id = ?
      `).run(
        name,
        domain,
        skillsJson,
        bio,
        experience || null,
        linkedin || null,
        github || null,
        hourly_rate || null,
        availability || null,
        userId
      );

      const updatedMentor = db
        .prepare("SELECT * FROM mentors WHERE user_id = ?")
        .get(userId);

      return res.json({
        success: true,
        mentor: updatedMentor,
        message: "Mentor profile updated successfully",
      });
    } else {
      // Create new mentor profile
      const result = db
        .prepare(`
        INSERT INTO mentors (
          user_id, name, domain, skills, bio, experience,
          linkedin, github, hourly_rate, availability,
          rating, total_ratings
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0)
      `)
        .run(
          userId,
          name,
          domain,
          skillsJson,
          bio,
          experience || null,
          linkedin || null,
          github || null,
          hourly_rate || null,
          availability || null
        );

      const newMentor = db
        .prepare("SELECT * FROM mentors WHERE id = ?")
        .get(result.lastInsertRowid);

      return res.json({
        success: true,
        mentor: newMentor,
        message: "Registered as mentor successfully",
      });
    }
  } catch (error: any) {
    console.error("Register as mentor error:", error);
    res.status(500).json({
      error: error.message || "Failed to register as mentor",
    });
  }
};

