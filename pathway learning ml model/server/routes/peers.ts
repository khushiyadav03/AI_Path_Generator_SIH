import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get peer connections
export const getPeerConnections: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const connections = db.prepare(`
      SELECT 
        pc.*,
        u.name as peer_name,
        u.email as peer_email,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id AND status = 'completed') as peer_sessions
      FROM peer_connections pc
      JOIN users u ON (
        CASE 
          WHEN pc.user_id = ? THEN pc.peer_id
          ELSE pc.user_id
        END = u.id
      )
      WHERE (pc.user_id = ? OR pc.peer_id = ?) AND pc.status = 'accepted'
    `).all(userId, userId, userId);
    
    res.json({ connections });
  } catch (error: any) {
    console.error("Get peer connections error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch connections" });
  }
};

// Find peers with similar interests
export const findPeers: RequestHandler = (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    // Get user's booking topics
    const userTopics = db.prepare(`
      SELECT DISTINCT topic FROM bookings WHERE user_id = ?
    `).all(userId);
    
    const topics = (userTopics as any[]).map(t => t.topic);
    
    if (topics.length === 0) {
      // If no topics, return all other mentees
      const peers = db.prepare(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(DISTINCT b.id) as session_count
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'completed'
        WHERE u.id != ? AND u.role = 'mentee'
        GROUP BY u.id
        ORDER BY session_count DESC
        LIMIT 10
      `).all(userId);
      
      return res.json({ peers });
    }
    
    // Find users with similar topics
    const peers = db.prepare(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT b.id) as session_count,
        COUNT(DISTINCT CASE WHEN b.topic IN (${topics.map(() => '?').join(',')}) THEN b.id END) as common_topics
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'completed'
      WHERE u.id != ? AND u.role = 'mentee'
      GROUP BY u.id
      HAVING common_topics > 0
      ORDER BY common_topics DESC, session_count DESC
      LIMIT 10
    `).all(...topics, userId);
    
    res.json({ peers });
  } catch (error: any) {
    console.error("Find peers error:", error);
    res.status(500).json({ error: error.message || "Failed to find peers" });
  }
};

// Send connection request
export const sendConnectionRequest: RequestHandler = (req, res) => {
  try {
    const { userId, peerId } = req.body;
    
    if (!userId || !peerId) {
      return res.status(400).json({ error: "userId and peerId are required" });
    }
    
    if (userId === peerId) {
      return res.status(400).json({ error: "Cannot connect to yourself" });
    }
    
    // Check if connection already exists
    const existing = db.prepare(`
      SELECT * FROM peer_connections 
      WHERE (user_id = ? AND peer_id = ?) OR (user_id = ? AND peer_id = ?)
    `).get(userId, peerId, peerId, userId);
    
    if (existing) {
      return res.status(400).json({ error: "Connection already exists" });
    }
    
    const result = db.prepare(`
      INSERT INTO peer_connections (user_id, peer_id, status)
      VALUES (?, ?, 'pending')
    `).run(userId, peerId);
    
    const connection = db.prepare("SELECT * FROM peer_connections WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json({ connection });
  } catch (error: any) {
    console.error("Send connection request error:", error);
    res.status(500).json({ error: error.message || "Failed to send connection request" });
  }
};

// Accept/reject connection request
export const updateConnectionStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    db.prepare(`
      UPDATE peer_connections 
      SET status = ? 
      WHERE id = ?
    `).run(status, id);
    
    const connection = db.prepare("SELECT * FROM peer_connections WHERE id = ?").get(id);
    
    res.json({ connection });
  } catch (error: any) {
    console.error("Update connection status error:", error);
    res.status(500).json({ error: error.message || "Failed to update connection" });
  }
};

