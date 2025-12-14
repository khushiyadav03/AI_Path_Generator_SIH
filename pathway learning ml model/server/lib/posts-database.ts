import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  authorId: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  date: string;
  title: string;
  content: string;
  upvotes: number;
  likes: number;
  likedBy: string[];
  views: number;
  comments: number;
  commentsList: Comment[];
  image?: string;
  category?: string;
}

const DB_PATH = path.join(__dirname, "../data/posts.json");

export function readPosts(): Post[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const posts: Post[] = JSON.parse(data);
    return posts;
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

export function writePosts(posts: Post[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error("Error writing posts:", error);
    throw error;
  }
}

export function findPostById(id: string): Post | undefined {
  const posts = readPosts();
  return posts.find((p) => p.id === id);
}

export function createPost(post: Omit<Post, "id" | "date" | "upvotes" | "likes" | "likedBy" | "views" | "comments" | "commentsList">): Post {
  const posts = readPosts();
  
  const newPost: Post = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    upvotes: 0,
    likes: 0,
    likedBy: [],
    views: 0,
    comments: 0,
    commentsList: [],
  };

  posts.unshift(newPost); // Add to beginning
  writePosts(posts);
  return newPost;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return null;
  }

  posts[index] = { ...posts[index], ...updates };
  writePosts(posts);
  return posts[index];
}

export function deletePost(id: string): boolean {
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return false;
  }

  posts.splice(index, 1);
  writePosts(posts);
  return true;
}

export function getAllPosts(): Post[] {
  return readPosts();
}

