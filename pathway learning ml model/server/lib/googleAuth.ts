import { createUser, findUserByEmail, updateUser } from "./database.js";
import { User } from "./database.js";

let googleAuthLibrary: any = null;
let client: any = null;

async function loadGoogleAuthLibrary() {
  if (!googleAuthLibrary) {
    googleAuthLibrary = await import("google-auth-library");
  }
  return googleAuthLibrary;
}

async function getClient() {
  if (!client) {
    const { OAuth2Client } = await loadGoogleAuthLibrary();
    client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || "",
      process.env.GOOGLE_CLIENT_SECRET || "",
      process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080/api/auth/google/callback"
    );
  }
  return client;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const oauthClient = await getClient();
  return oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent",
  });
}

export async function getGoogleUser(code: string): Promise<User> {
  try {
    const oauthClient = await getClient();
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Failed to get user info from Google");
    }

    const email = payload.email!;
    const displayName = payload.name || email.split("@")[0];
    const photoURL = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

    // Validate Gmail
    if (!email.endsWith("@gmail.com")) {
      throw new Error("Only Gmail addresses are allowed");
    }

    // Check if user exists
    let user = findUserByEmail(email);

    if (user) {
      // Update last login
      updateUser(user.id, {
        lastLogin: new Date().toISOString(),
        photoURL, // Update photo in case it changed
      });
      user = { ...user, lastLogin: new Date().toISOString(), photoURL };
    } else {
      // Check user limit
      const { readUsers } = await import("./database.js");
      const users = readUsers();
      if (users.length >= 10) {
        throw new Error("Maximum 10 users allowed");
      }

      // Generate username from email (before @)
      const username = email.split("@")[0];

      // Create new user
      user = createUser({
        username,
        email,
        displayName,
        photoURL,
        academicYear: 1, // Default to 1st year for Google OAuth users
      });
    }

    // Return user without sensitive data
    const { password: _, resetToken: __, resetTokenExpiry: ___, ...userWithoutSensitive } = user;
    return userWithoutSensitive as User;
  } catch (error: any) {
    console.error("Google auth error:", error);
    throw error;
  }
}

