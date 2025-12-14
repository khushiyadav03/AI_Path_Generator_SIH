import React,{ useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Github, LogIn, Globe } from "lucide-react";
import { motion } from "framer-motion";
import BackgroundFX from "@/components/common/BackgroundFX";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please provide email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 900);
  };

  // 🔥 REAL GOOGLE SIGN-IN FUNCTION
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

        

      console.log("✅ Google Sign-In Success:", user);
      navigate("/"); // redirect after login
    } catch (err) {
      console.error("❌ Google Sign-In Error:", err);
      setError("Failed to sign in with Google");
    } finally {
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

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-400/30 bg-red-400/10 p-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <label className="block text-sm">
            <div className="mb-1 text-xs text-foreground/70">Email</div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                placeholder="you@domain.com"
                autoFocus
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
            <a
              href="#"
              className="text-foreground/70 hover:text-foreground"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="pt-2 text-center text-xs text-foreground/60">
            or continue with
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 🟣 Google Sign-In Button */}
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
            Don’t have an account?{" "}
            <a href="/" className="text-white underline">
              Get started
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
