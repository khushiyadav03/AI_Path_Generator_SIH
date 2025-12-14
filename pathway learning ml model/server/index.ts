import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth.js";
import * as adminRoutes from "./routes/admin.js";
import * as postsRoutes from "./routes/posts.js";
import * as mentorsRoutes from "./routes/mentors.js";
import * as bookingsRoutes from "./routes/bookings.js";
import * as feedbackRoutes from "./routes/feedback.js";
import * as chatsRoutes from "./routes/chats.js";
import * as forumRoutes from "./routes/forum.js";
import * as progressRoutes from "./routes/progress.js";
import * as badgesRoutes from "./routes/badges.js";
import * as aiRoutes from "./routes/ai.js";
import * as peersRoutes from "./routes/peers.js";
import { initializeDatabase } from "./lib/database.js";
import { saveChatMessage } from "./routes/chats.js";
import { autoSeedMentors } from "./lib/auto-seed.js";

export function createServer(existingHttpServer?: any) {
  // Initialize database
  initializeDatabase();

  // Auto-seed dummy mentors on startup if table is empty
  autoSeedMentors();

  const app = express();

  // Use existing HTTP server (from Vite) or create a new one (for production)
  const httpServer = existingHttpServer || createHttpServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize email transporter
  (async () => {
    try {
      const { initEmailTransporter } = await import("./lib/email.js");
      await initEmailTransporter();
    } catch (error) {
      console.warn("Email not configured. Password reset emails will not be sent.");
      console.warn("Set EMAIL_USER and EMAIL_APP_PASSWORD in .env file");
    }
  })();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes - Django compatible endpoints
  app.post("/api/auth/registration/", authRoutes.signUp); // Django format
  app.post("/api/auth/login/", authRoutes.signIn); // Django format
  app.post("/api/auth/token/refresh/", authRoutes.refreshToken); // Django format

  // Legacy routes (for backward compatibility)
  app.post("/api/auth/signup", authRoutes.signUp);
  app.post("/api/auth/signin", authRoutes.signIn);

  // Other auth routes
  app.get("/api/auth/user/:email", authRoutes.getUser);
  app.post("/api/auth/reset-request", authRoutes.requestPasswordReset);
  app.post("/api/auth/reset-password", authRoutes.resetPassword);
  app.get("/api/auth/google", authRoutes.googleAuth);
  app.get("/api/auth/google/callback", authRoutes.googleCallback);

  // Admin routes
  app.get("/api/admin/users", adminRoutes.getAllUsers);

  // Community/Posts routes
  app.get("/api/posts", postsRoutes.getPosts);
  app.post("/api/posts", postsRoutes.createNewPost);
  app.put("/api/posts/:id", postsRoutes.updatePostData);
  app.delete("/api/posts/:id", postsRoutes.deletePostById);
  app.post("/api/posts/:id/comments", postsRoutes.addComment);
  app.post("/api/posts/:id/like", postsRoutes.toggleLike);
  app.post("/api/posts/:id/upvote", postsRoutes.upvotePost);
  app.post("/api/posts/:id/view", postsRoutes.incrementViews);

  // Mentorship routes
  app.get("/api/mentors", mentorsRoutes.getAllMentors);
  app.get("/api/mentors/domain/:domain", mentorsRoutes.getMentorsByDomain);
  app.get("/api/mentors/:id", mentorsRoutes.getMentorById);
  app.post("/api/mentors/update-rating", mentorsRoutes.updateMentorRating);
  app.post("/api/mentors/register", mentorsRoutes.registerAsMentor);

  app.get("/api/bookings", bookingsRoutes.getBookings);
  app.post("/api/bookings", bookingsRoutes.createBooking);
  app.put("/api/bookings/:id", bookingsRoutes.updateBookingStatus);
  app.delete("/api/bookings/:id", bookingsRoutes.deleteBooking);

  app.get("/api/feedback", feedbackRoutes.getFeedback);
  app.post("/api/feedback", feedbackRoutes.submitFeedback);

  app.get("/api/chats/conversations/:userId", chatsRoutes.getConversations);
  app.get("/api/chats/messages", chatsRoutes.getChatMessages);
  app.get("/api/chat/:mentorId/:userId", chatsRoutes.getChatHistory);

  app.get("/api/forum", forumRoutes.getForumPosts);
  app.get("/api/forum/:id", forumRoutes.getForumPost);
  app.post("/api/forum", forumRoutes.createForumPost);
  app.post("/api/forum/:id/comment", forumRoutes.addForumComment);
  app.post("/api/forum/:id/upvote", forumRoutes.upvoteForumPost);

  app.get("/api/progress/:userId", progressRoutes.getUserProgress);
  app.post("/api/progress", progressRoutes.updateProgress);

  app.get("/api/badges/:userId", badgesRoutes.getUserBadges);
  app.get("/api/badges", badgesRoutes.getAllBadges);

  app.post("/api/ai/chatbot", aiRoutes.aiChatbot);
  app.post("/api/ai/recommend", aiRoutes.recommendMentors);
  app.post("/api/ai/pathway", aiRoutes.generateLearningPathway);

  app.get("/api/peers/connections/:userId", peersRoutes.getPeerConnections);
  app.get("/api/peers/find", peersRoutes.findPeers);
  app.post("/api/peers/connect", peersRoutes.sendConnectionRequest);
  app.put("/api/peers/:id", peersRoutes.updateConnectionStatus);

  // Admin routes
  app.get("/api/admin/analytics", adminRoutes.getAnalytics);

  // Catch-all for API routes that don't match - return 404 JSON
  // Use a middleware that runs after all routes to catch unmatched API routes
  app.use((req, res, next) => {
    // If it's an API route and hasn't been handled, return 404 JSON
    if (req.url?.startsWith("/api/") && !res.headersSent) {
      res.status(404).json({ error: "API route not found", path: req.url });
    } else {
      next();
    }
  });

  // Socket.io for real-time chat
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("join-chat-room", (data: { userId: string; mentorId: string }) => {
      const roomId = `chat-${data.userId}-${data.mentorId}`;
      socket.join(roomId);
      console.log(`User ${data.userId} joined chat room with mentor ${data.mentorId}`);
    });

    socket.on("send-message", async (data: { senderId: number; receiverId: number; message: string }) => {
      try {
        const savedMessage = saveChatMessage(data.senderId, data.receiverId, data.message);

        // Create room ID for this chat pair
        const roomId = `chat-${data.senderId}-${data.receiverId}`;
        const reverseRoomId = `chat-${data.receiverId}-${data.senderId}`;

        // Emit to sender
        socket.emit("message-sent", savedMessage);

        // Emit to receiver in both possible room configurations
        io.to(`user-${data.receiverId}`).emit("new-message", savedMessage);
        io.to(roomId).emit("new-message", savedMessage);
        io.to(reverseRoomId).emit("new-message", savedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return { app, httpServer, io };
}
