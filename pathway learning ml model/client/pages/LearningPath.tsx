import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Award, Clock, Building2, Loader2, CheckCircle2 } from "lucide-react";
import BackgroundFX from "@/components/common/BackgroundFX";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  title: string;
  sector: string;
  nsqf_level: number;
  description: string;
  skills: string;
  duration_hours: number;
  provider: string;
  match_score: number;
}

interface PathwayResponse {
  status: string;
  profile: {
    persona_id: number;
    persona_label: string;
    inferred_role: string;
  };
  recommendations: Recommendation[];
}

export default function LearningPath() {
  const { user } = useAuth();
  const [aspiration, setAspiration] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PathwayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);

      const response = await fetch("/api/ai/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aspiration,
          skills: skillsArray
        })
      });

      const data = await response.json();

      if (data.status === "error") {
        setError(data.message || "Failed to generate pathway");
      } else {
        setResults(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI engine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundFX />

      <div className="relative px-6 py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 backdrop-blur-sm mb-6">
              <Brain size={16} className="animate-pulse" />
              <span>AI-Powered Recommendations</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Generate Your Learning Path
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Tell us about your career goals and skills, and our AI will create a personalized pathway for you.
            </p>
          </motion.div>

          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl border border-white/10 p-8 md:p-12 mb-12"
          >
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Aspiration Input */}
              <div>
                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  What do you want to become?
                </label>
                <textarea
                  value={aspiration}
                  onChange={(e) => setAspiration(e.target.value)}
                  placeholder="e.g., I want to become a data scientist and work with machine learning"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-foreground/40 outline-none backdrop-blur-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Skills Input */}
              <div>
                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                  <Award size={18} className="text-cyan-400" />
                  What skills do you have?
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Python, Statistics, Mathematics (comma-separated)"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-foreground/40 outline-none backdrop-blur-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  required
                />
                <p className="mt-2 text-xs text-foreground/50">Separate multiple skills with commas</p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-purple-500/50 transition-all hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain size={24} />
                    Generate My Path
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Profile Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-3xl border border-white/10 p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 size={24} className="text-green-400" />
                    <h2 className="text-2xl font-bold">Your Profile</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                      <div className="text-sm text-foreground/60 mb-1">Learner Persona</div>
                      <div className="text-lg font-semibold text-purple-300">{results.profile.persona_label}</div>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <div className="text-sm text-foreground/60 mb-1">Career Path</div>
                      <div className="text-lg font-semibold text-cyan-300 capitalize">{results.profile.inferred_role || "General Learner"}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Recommendations */}
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <TrendingUp className="text-purple-400" />
                    Recommended Courses
                  </h2>

                  <div className="grid gap-6">
                    {results.recommendations.map((course, index) => (
                      <motion.div
                        key={course.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="glass rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-foreground/70 mb-4">{course.description}</p>
                          </div>
                          <div className="ml-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg">
                            {Math.round(course.match_score * 100)}% Match
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 size={16} className="text-foreground/60" />
                            <span className="text-foreground/80">{course.sector}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award size={16} className="text-foreground/60" />
                            <span className="text-foreground/80">Level {course.nsqf_level}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} className="text-foreground/60" />
                            <span className="text-foreground/80">{course.duration_hours}h</span>
                          </div>
                          <div className="text-sm text-foreground/60 md:text-right">
                            {course.provider}
                          </div>
                        </div>

                        {course.skills && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="text-xs text-foreground/50 mb-2">Skills Covered:</div>
                            <div className="flex flex-wrap gap-2">
                              {course.skills.split(",").map((skill, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/80"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Try Again Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <button
                    onClick={() => {
                      setResults(null);
                      setAspiration("");
                      setSkills("");
                    }}
                    className="rounded-2xl border border-white/20 bg-white/5 px-8 py-3 text-foreground backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    Generate Another Path
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Prompt for Non-Authenticated Users */}
          {!user && !results && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center glass rounded-3xl border border-white/10 p-8"
            >
              <p className="text-foreground/70 mb-4">
                Want to save your learning path and track progress?
              </p>
              <Link to="/signin">
                <button className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95">
                  Sign In to Save Progress
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
