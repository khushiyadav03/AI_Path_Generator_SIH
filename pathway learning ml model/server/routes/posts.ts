import { RequestHandler } from "express";
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  findPostById,
  Post,
  Comment,
} from "../lib/posts-database.js";

// Get all posts
export const getPosts: RequestHandler = (req, res) => {
  try {
    const { sortBy = "votes" } = req.query;
    let posts = getAllPosts();

    // Sort posts
    if (sortBy === "votes") {
      posts = posts.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "newest") {
      posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    res.json({ posts, total: posts.length });
  } catch (error: any) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch posts" });
  }
};

// Create a new post
export const createNewPost: RequestHandler = (req, res) => {
  try {
    const { title, content, image, author, authorId, authorAvatar, authorVerified } = req.body;

    if (!title || !content || !author || !authorId) {
      return res.status(400).json({
        error: "Title, content, author, and authorId are required",
      });
    }

    const post = createPost({
      title: title.trim(),
      content: content.trim(),
      image: image || undefined,
      author,
      authorId,
      authorAvatar,
      authorVerified: authorVerified || false,
    });

    res.status(201).json({ post });
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({ error: error.message || "Failed to create post" });
  }
};

// Update post (for likes, upvotes, etc.)
export const updatePostData: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPost = updatePost(id, updates);
    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Update post error:", error);
    res.status(500).json({ error: error.message || "Failed to update post" });
  }
};

// Delete a post
export const deletePostById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // User ID from request body

    const post = findPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user is the author
    if (post.authorId !== userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    const deleted = deletePost(id);
    if (!deleted) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: error.message || "Failed to delete post" });
  }
};

// Add a comment to a post
export const addComment: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { content, author, authorId, authorAvatar } = req.body;

    if (!content || !author || !authorId) {
      return res.status(400).json({
        error: "Content, author, and authorId are required",
      });
    }

    const post = findPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author,
      authorId,
      authorAvatar,
      content: content.trim(),
      date: new Date().toISOString(),
    };

    const updatedPost = updatePost(id, {
      comments: post.comments + 1,
      commentsList: [comment, ...post.commentsList],
    });

    res.json({ post: updatedPost, comment });
  } catch (error: any) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: error.message || "Failed to add comment" });
  }
};

// Like/Unlike a post
export const toggleLike: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const post = findPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likedBy.includes(userId);
    const updatedLikedBy = isLiked
      ? post.likedBy.filter((id) => id !== userId)
      : [...post.likedBy, userId];

    const updatedPost = updatePost(id, {
      likes: isLiked ? post.likes - 1 : post.likes + 1,
      likedBy: updatedLikedBy,
    });

    res.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: error.message || "Failed to toggle like" });
  }
};

// Upvote a post
export const upvotePost: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const post = findPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = updatePost(id, {
      upvotes: post.upvotes + 1,
    });

    res.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Upvote post error:", error);
    res.status(500).json({ error: error.message || "Failed to upvote post" });
  }
};

// Increment view count
export const incrementViews: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const post = findPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = updatePost(id, {
      views: post.views + 1,
    });

    res.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Increment views error:", error);
    res.status(500).json({ error: error.message || "Failed to increment views" });
  }
};

