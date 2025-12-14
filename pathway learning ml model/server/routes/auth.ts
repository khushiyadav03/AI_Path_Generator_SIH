import { RequestHandler } from "express";
import * as authLib from "../lib/auth.js";
import { findUserByEmail } from "../lib/database.js";
import { sendPasswordResetEmail } from "../lib/email.js";
import { verifyToken, generateTokenPair, JWTPayload } from "../lib/jwt.js";
import { findUserById } from "../lib/database.js";

export const signUp: RequestHandler = async (req, res) => {
  try {
    // Support both Django format (username, email, password1, password2, academic_year)
    // and client format (email, password, displayName, photoURL)
    const { 
      username, 
      email, 
      password, 
      password1, 
      password2, 
      academic_year,
      displayName,
      photoURL
    } = req.body;

    // Determine which format is being used
    const isClientFormat = email && password && displayName && !username && !password1 && !password2;
    const isDjangoFormat = username && email && password1 && password2;

    if (isClientFormat) {
      // Client format: email, password, displayName, photoURL
      if (!email || !password || !displayName) {
        return res.status(400).json({
          error: "Must include \"email\", \"password\", and \"displayName\".",
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters.",
        });
      }

      // Generate username from email if not provided
      const generatedUsername = email.split("@")[0] || `user_${Date.now()}`;
      const academicYear = 1; // Default to year 1 for client format

      const result = await authLib.signUp(generatedUsername, email, password, academicYear, displayName, photoURL);

      res.json({
        access: result.access,
        refresh: result.refresh,
        user: result.user,
      });
    } else if (isDjangoFormat) {
      // Django format: username, email, password1, password2, academic_year
      if (!username || !email || !password1 || !password2) {
        return res.status(400).json({
          username: username ? [] : ["This field is required."],
          email: email ? [] : ["This field is required."],
          password1: password1 ? [] : ["This field is required."],
          password2: password2 ? [] : ["This field is required."],
        });
      }

      // Validate password match
      if (password1 !== password2) {
        return res.status(400).json({
          password2: ["The two password fields didn't match."],
        });
      }

      // Validate password length
      if (password1.length < 6) {
        return res.status(400).json({
          password1: ["This password is too short. It must contain at least 6 characters."],
        });
      }

      // Validate academic year
      const academicYear = parseInt(academic_year) || 1;
      if (![1, 2, 3, 4].includes(academicYear)) {
        return res.status(400).json({
          academic_year: ["Academic year must be between 1 and 4."],
        });
      }

      const result = await authLib.signUp(username, email, password1, academicYear);

      res.json({
        access: result.access,
        refresh: result.refresh,
        user: result.user,
      });
    } else {
      // Invalid format
      return res.status(400).json({
        error: "Invalid request format. Provide either (username, email, password1, password2, academic_year) or (email, password, displayName).",
      });
    }
  } catch (error: any) {
    console.error("Sign up error:", error);
    const errorMessage = error.message || "Sign up failed";
    
    // Return error in consistent format
    if (errorMessage.includes("email")) {
      res.status(400).json({ error: errorMessage });
    } else if (errorMessage.includes("username")) {
      res.status(400).json({ error: errorMessage });
    } else {
      res.status(400).json({ error: errorMessage });
    }
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    // Accept both 'username' and 'email' for backward compatibility
    const { username, email, password } = req.body;
    const usernameOrEmail = username || email;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        error: "Must include \"username\" or \"email\" and \"password\".",
      });
    }

    const result = await authLib.signIn(usernameOrEmail, password);

    // Return in Django dj_rest_auth format
    res.json({
      access: result.access,
      refresh: result.refresh,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Sign in error:", error);
    res.status(400).json({
      error: error.message || "Unable to log in with provided credentials.",
    });
  }
};

export const getUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const user = findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password
    const { password: _, resetToken: __, resetTokenExpiry: ___, ...userWithoutSensitive } = user;
    res.json({ user: userWithoutSensitive });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message || "Failed to get user" });
  }
};

export const requestPasswordReset: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // For security, always return success even if user doesn't exist
    const { resetToken } = await authLib.requestPasswordReset(email);
    
    if (resetToken !== "dummy") {
      const resetUrl = `${req.protocol}://${req.get("host")}/signin?resetToken=${resetToken}`;
      
      try {
        // Send email with reset link
        await sendPasswordResetEmail(email, resetToken, resetUrl);
      } catch (emailError) {
        // If email fails, still log it for manual use
        console.log(`\n=== Password Reset Token for ${email} ===`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Token: ${resetToken}\n`);
        console.error("Email sending failed, but reset token is available above");
      }
    }
    
    res.json({ 
      message: "If an account exists with this email, a password reset link has been sent."
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: error.message || "Failed to request password reset" });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    await authLib.resetPassword(resetToken, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error("Password reset error:", error);
    res.status(400).json({ error: error.message || "Invalid or expired reset token" });
  }
};

export const googleAuth: RequestHandler = async (req, res) => {
  try {
    const { getGoogleAuthUrl } = await import("../lib/googleAuth.js");
    const authUrl = await getGoogleAuthUrl();
    res.json({ authUrl });
  } catch (error: any) {
    console.error("Google auth error:", error);
    if (error.code === "MODULE_NOT_FOUND") {
      res.status(500).json({ error: "Google OAuth not configured. Install google-auth-library and set GOOGLE_CLIENT_ID in .env" });
    } else {
      res.status(500).json({ error: error.message || "Failed to initiate Google authentication" });
    }
  }
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Invalid authorization code" });
    }

    const { getGoogleUser } = await import("../lib/googleAuth.js");
    const user = await getGoogleUser(code);
    
    // Redirect to frontend with user data in session/state
    // For now, we'll redirect with a token or send user data
    res.redirect(`/signin?googleSuccess=true&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error: any) {
    console.error("Google callback error:", error);
    res.redirect(`/signin?error=${encodeURIComponent(error.message || "Google authentication failed")}`);
  }
};

// Token refresh endpoint (Django format: /api/auth/token/refresh/)
export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refresh } = req.body;

    if (!refresh) {
      return res.status(400).json({
        refresh: ["This field is required."],
      });
    }

    const payload = verifyToken(refresh);
    if (!payload) {
      return res.status(400).json({
        refresh: ["Token is invalid or expired."],
      });
    }

    // Verify user still exists
    const user = findUserById(payload.userId);
    if (!user) {
      return res.status(400).json({
        refresh: ["User not found."],
      });
    }

    // Generate new token pair
    const newPayload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const tokens = generateTokenPair(newPayload);

    res.json({
      access: tokens.access,
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(400).json({
      refresh: [error.message || "Token is invalid or expired."],
    });
  }
};

