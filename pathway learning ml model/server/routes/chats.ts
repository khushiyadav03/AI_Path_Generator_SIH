import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get chat messages between two users
export const getChatMessages: RequestHandler = (req, res) => {
  try {
    const { userId1, userId2 } = req.query;
    
    if (!userId1 || !userId2) {
      return res.status(400).json({ error: "Both userId1 and userId2 are required" });
    }
    
    const messages = db.prepare(`
      SELECT 
        c.*,
        COALESCE(u1.name, m1.name) as sender_name,
        COALESCE(u2.name, m2.name) as receiver_name
      FROM chats c
      LEFT JOIN users u1 ON c.sender_id = u1.id
      LEFT JOIN users u2 ON c.receiver_id = u2.id
      LEFT JOIN mentors m1 ON c.sender_id = m1.id
      LEFT JOIN mentors m2 ON c.receiver_id = m2.id
      WHERE (c.sender_id = ? AND c.receiver_id = ?) 
         OR (c.sender_id = ? AND c.receiver_id = ?)
      ORDER BY c.timestamp ASC
    `).all(userId1, userId2, userId2, userId1);
    
    // Mark messages as read
    db.prepare(`
      UPDATE chats 
      SET read = 1 
      WHERE receiver_id = ? AND sender_id = ? AND read = 0
    `).run(userId1, userId2);
    
    res.json({ messages });
  } catch (error: any) {
    console.error("Get chat messages error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch messages" });
  }
};

// Get all conversations for a user
export const getConversations: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = db.prepare(`
      SELECT DISTINCT
        CASE 
          WHEN c.sender_id = ? THEN c.receiver_id
          ELSE c.sender_id
        END as other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        (SELECT message FROM chats 
         WHERE (sender_id = ? AND receiver_id = other_user_id) 
            OR (sender_id = other_user_id AND receiver_id = ?)
         ORDER BY timestamp DESC LIMIT 1) as last_message,
        (SELECT timestamp FROM chats 
         WHERE (sender_id = ? AND receiver_id = other_user_id) 
            OR (sender_id = other_user_id AND receiver_id = ?)
         ORDER BY timestamp DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM chats 
         WHERE sender_id = other_user_id AND receiver_id = ? AND read = 0) as unread_count
      FROM chats c
      JOIN users u ON (CASE WHEN c.sender_id = ? THEN c.receiver_id ELSE c.sender_id END = u.id)
      WHERE c.sender_id = ? OR c.receiver_id = ?
      ORDER BY last_message_time DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId);
    
    res.json({ conversations });
  } catch (error: any) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch conversations" });
  }
};

// Get chat history between user and mentor
export const getChatHistory: RequestHandler = (req, res) => {
  try {
    const { mentorId, userId } = req.params;
    
    const messages = db.prepare(`
      SELECT 
        c.*,
        COALESCE(u1.name, m1.name) as sender_name,
        COALESCE(u2.name, m2.name) as receiver_name
      FROM chats c
      LEFT JOIN users u1 ON c.sender_id = u1.id
      LEFT JOIN users u2 ON c.receiver_id = u2.id
      LEFT JOIN mentors m1 ON c.sender_id = m1.id
      LEFT JOIN mentors m2 ON c.receiver_id = m2.id
      WHERE (c.sender_id = ? AND c.receiver_id = ?) 
         OR (c.sender_id = ? AND c.receiver_id = ?)
      ORDER BY c.timestamp ASC
    `).all(userId, mentorId, mentorId, userId);
    
    // Mark messages as read
    db.prepare(`
      UPDATE chats 
      SET read = 1 
      WHERE receiver_id = ? AND sender_id = ? AND read = 0
    `).run(userId, mentorId);
    
    res.json({ messages });
  } catch (error: any) {
    console.error("Get chat history error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch chat history" });
  }
};

// Save chat message (called from Socket.io handler)
export function saveChatMessage(senderId: number, receiverId: number, message: string) {
  try {
    const result = db.prepare(`
      INSERT INTO chats (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `).run(senderId, receiverId, message);
    
    const savedMessage = db.prepare(`
      SELECT 
        c.*,
        COALESCE(u.name, m.name) as sender_name
      FROM chats c
      LEFT JOIN users u ON c.sender_id = u.id
      LEFT JOIN mentors m ON c.sender_id = m.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    return savedMessage;
  } catch (error: any) {
    console.error("Save chat message error:", error);
    throw error;
  }
}

