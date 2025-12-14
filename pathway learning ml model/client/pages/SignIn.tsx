import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Github, LogIn, Globe, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { signIn as apiSignIn, signUp as apiSignUp, requestPasswordReset, resetPassword, initiateGoogleAuth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import BackgroundFX from "@/components/common/BackgroundFX";

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if user came from password reset email
    const token = searchParams.get("resetToken");
    const googleSuccess = searchParams.get("googleSuccess");
    const googleError = searchParams.get("error");
    const googleUser = searchParams.get("user");
    const mode = searchParams.get("mode");
    
    // Check if mode is signup to show signup form
    if (mode === "signup") {
      setShowSignUp(true);
    }
    
    if (token) {
      setResetToken(token);
      setShowResetForm(true);
    }
    
    if (googleSuccess && googleUser) {
      try {
        const user = JSON.parse(decodeURIComponent(googleUser));
        setUser(user);
        navigate("/dashboard");
      } catch (err) {
        setError("Failed to process Google authentication");
      }
    }
    
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams, setUser, navigate]);

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("Invalid email or password") || errorMessage.includes("Invalid credentials")) {
      return "Invalid email or password. Please check your credentials.";
    }
    if (errorMessage.includes("User already exists")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (errorMessage.includes("Only Gmail")) {
      return "Only Gmail addresses are allowed for sign up.";
    }
    if (errorMessage.includes("Maximum 10 users")) {
      return "Registration is currently limited to 10 users.";
    }
    if (errorMessage.includes("Invalid or expired reset token")) {
      return "This password reset link has expired or is invalid. Please request a new one.";
    }
    return errorMessage || "An error occurred. Please try again.";
  };

  const handlePasswordReset = async () => {
    if (!resetToken) {
      setError("Invalid reset code. Please request a new password reset.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(resetToken, newPassword);
      setError(null);
      alert("Password reset successful! You can now sign in with your new password.");
      setShowResetForm(false);
      setNewPassword("");
      setConfirmPassword("");
      setResetToken(null);
      navigate("/signin");
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(getErrorMessage(err.message || "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetEmailSent(false);

    if (!email || !password) {
      setError("Please provide email and password");
      return;
    }

    setLoading(true);
    try {
      if (showSignUp) {
        // Sign up
        if (!displayName) {
          setError("Please provide your name");
          setLoading(false);
          return;
        }
        const user = await apiSignUp(
          email,
          password,
          displayName,
          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`
        );
        setUser(user);
        navigate("/dashboard");
      } else {
        // Sign in
        const user = await apiSignIn(email, password);
        setUser(user);
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(getErrorMessage(err.message || "Authentication failed"));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setResetEmailSent(false);
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      // Password reset token is generated on backend
      // In production, you'd send an email with the reset link
      // For demo, check server console logs for the reset token
      setResetEmailSent(true);
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(getErrorMessage(err.message || "Failed to request password reset"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setResetEmailSent(false);
      
      const { authUrl } = await initiateGoogleAuth();
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Failed to initiate Google sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      <BackgroundFX />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow-lg">
            <LogIn size={20} />
          </div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Sign in to continue to your personalized learning dashboard
          </p>
        </div>

        {showResetForm ? (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Reset Your Password</h2>
              <p className="text-sm text-foreground/70">
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{error}</p>
                  {error.includes("expired") || error.includes("invalid") ? (
                    <button
                      onClick={() => {
                        setShowResetForm(false);
                        setShowForgotPassword(true);
                        setResetToken(null);
                        setError(null);
                      }}
                      className="mt-2 text-xs underline hover:text-cyan-300"
                    >
                      Request a new password reset link
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <label className="block text-sm">
              <div className="mb-1 text-xs text-foreground/70">Email</div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground/60 cursor-not-allowed"
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-foreground/70">New Password</div>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                  placeholder="Enter new password"
                  autoFocus
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  size={16}
                />
              </div>
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-foreground/70">Confirm New Password</div>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                  placeholder="Confirm new password"
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  size={16}
                />
              </div>
            </label>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setActionCode(null);
                setError(null);
                navigate("/signin");
              }}
              className="w-full text-xs text-foreground/60 hover:text-foreground/80"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {resetEmailSent && (
            <div className="rounded-md border border-green-400/30 bg-green-400/10 p-4 text-sm text-green-400">
              <p className="font-semibold mb-2">✓ Password reset email sent!</p>
              <p className="text-xs text-green-300/80">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-green-300/80 mt-1">
                Please check your inbox and spam folder. The link will expire in 1 hour and can only be used once.
              </p>
              <p className="text-xs text-green-300/60 mt-2">
                Didn't receive it? Wait a few minutes and try again, or check if you have an account with this email.
              </p>
            </div>
          )}

          {showSignUp && (
            <label className="block text-sm">
              <div className="mb-1 text-xs text-foreground/70">Full Name</div>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                  placeholder="John Doe"
                  autoFocus={showSignUp}
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  size={16}
                />
              </div>
            </label>
          )}

          <label className="block text-sm">
            <div className="mb-1 text-xs text-foreground/70">Email {showSignUp && "(Gmail only)"}</div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                placeholder="you@gmail.com"
                autoFocus={!showSignUp}
              />
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
                size={16}
              />
            </div>
          </label>

          <label className="block text-sm">
            <div className="mb-1 text-xs text-foreground/70">Password</div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                placeholder="••••••••"
              />
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
                size={16}
              />
            </div>
          </label>

          <div className="flex items-center justify-between text-xs text-foreground/70">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-white/10 bg-white/5"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(!showForgotPassword);
                setError(null);
                setResetEmailSent(false);
              }}
              className="text-foreground/70 hover:text-cyan-300 transition"
            >
              Forgot password?
            </button>
          </div>

          {showForgotPassword && (
            <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
              <p className="text-sm text-foreground/80">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                  placeholder="your@email.com"
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading || !email}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError(null);
                }}
                className="text-xs text-foreground/60 hover:text-foreground/80"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
            disabled={loading}
          >
            {loading ? (showSignUp ? "Signing up..." : "Signing in...") : (showSignUp ? "Sign up" : "Sign in")}
          </button>

          <div className="pt-2 text-center text-xs text-foreground/60">
            or continue with
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground hover:bg-white/10"
              disabled={loading}
            >
              <Globe size={16} /> Google
            </button>

            <button
              type="button"
              onClick={() => alert("Mock GitHub signin")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground hover:bg-white/10"
            >
              <Github size={16} /> GitHub
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-foreground/70">
            {showSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignUp(false);
                    setError(null);
                  }}
                  className="text-white underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignUp(true);
                    setError(null);
                  }}
                  className="text-white underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </form>
        )}
      </motion.div>
    </div>
  );
}

