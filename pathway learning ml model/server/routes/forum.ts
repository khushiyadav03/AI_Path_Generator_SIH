import { RequestHandler } from "express";
import db from "../lib/database.js";

// Get all forum posts
export const getForumPosts: RequestHandler = (req, res) => {
  try {
    const { tag, search, sortBy = "recent" } = req.query;
    
    let query = `
      SELECT 
        f.*,
        u.name as author_name,
        u.email as author_email,
        COUNT(DISTINCT fc.id) as comment_count
      FROM forum f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN forum_comments fc ON f.id = fc.forum_id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (tag) {
      conditions.push("f.tags LIKE ?");
      params.push(`%${tag}%`);
    }
    
    if (search) {
      conditions.push("(f.topic LIKE ? OR f.content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    query += " GROUP BY f.id";
    
    if (sortBy === "popular") {
      query += " ORDER BY f.upvotes DESC, f.views DESC";
    } else if (sortBy === "recent") {
      query += " ORDER BY f.created_at DESC";
    }
    
    const posts = db.prepare(query).all(...params);
    
    res.json({ posts });
  } catch (error: any) {
    console.error("Get forum posts error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch forum posts" });
  }
};

// Get forum post by ID
export const getForumPost: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const post = db.prepare(`
      SELECT 
        f.*,
        u.name as author_name,
        u.email as author_email
      FROM forum f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `).get(id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Increment views
    db.prepare("UPDATE forum SET views = views + 1 WHERE id = ?").run(id);
    
    // Get comments
    const comments = db.prepare(`
      SELECT 
        fc.*,
        u.name as author_name
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.forum_id = ?
      ORDER BY fc.created_at ASC
    `).all(id);
    
    res.json({ post: { ...post, comments } });
  } catch (error: any) {
    console.error("Get forum post error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch forum post" });
  }
};

// Create forum post
export const createForumPost: RequestHandler = (req, res) => {
  try {
    const { userId, topic, content, tags } = req.body;
    
    if (!userId || !topic || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = db.prepare(`
      INSERT INTO forum (user_id, topic, content, tags)
      VALUES (?, ?, ?, ?)
    `).run(userId, topic, content, tags || null);
    
    const post = db.prepare("SELECT * FROM forum WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json({ post });
  } catch (error: any) {
    console.error("Create forum post error:", error);
    res.status(500).json({ error: error.message || "Failed to create forum post" });
  }
};

// Add comment to forum post
export const addForumComment: RequestHandler = (req, res) => {
  try {
    const { forumId, userId, content } = req.body;
    
    if (!forumId || !userId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = db.prepare(`
      INSERT INTO forum_comments (forum_id, user_id, content)
      VALUES (?, ?, ?)
    `).run(forumId, userId, content);
    
    const comment = db.prepare(`
      SELECT 
        fc.*,
        u.name as author_name
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({ comment });
  } catch (error: any) {
    console.error("Add forum comment error:", error);
    res.status(500).json({ error: error.message || "Failed to add comment" });
  }
};

// Upvote forum post
export const upvoteForumPost: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare("UPDATE forum SET upvotes = upvotes + 1 WHERE id = ?").run(id);
    
    const post = db.prepare("SELECT * FROM forum WHERE id = ?").get(id);
    
    res.json({ post });
  } catch (error: any) {
    console.error("Upvote forum post error:", error);
    res.status(500).json({ error: error.message || "Failed to upvote post" });
  }
};

