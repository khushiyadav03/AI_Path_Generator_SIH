import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, Zap, ArrowRight, Brain, Rocket } from "lucide-react";
import BackgroundFX from "@/components/common/BackgroundFX";

export default function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundFX />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 backdrop-blur-sm mb-8"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span>AI-Powered Career Guidance</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Your Personalized
              <br />
              Learning Journey
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-3xl mx-auto">
              Discover tailored vocational training pathways powered by AI.
              Match your skills and aspirations with NSQF-aligned courses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/learning-path">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-purple-500/50 transition-all hover:shadow-purple-500/70"
                >
                  <Brain size={24} />
                  Generate My Path
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>

              <Link to="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Target,
                title: "Skill Matching",
                description: "AI analyzes your background and matches you with the perfect courses",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: TrendingUp,
                title: "Career Insights",
                description: "Get personalized recommendations based on market demand and trends",
                gradient: "from-pink-500 to-orange-500"
              },
              {
                icon: Zap,
                title: "Instant Results",
                description: "Receive your customized learning pathway in seconds",
                gradient: "from-cyan-500 to-blue-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-3xl border border-white/10 p-12 text-center"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: "500+", label: "NSQF Courses" },
                { value: "8", label: "Industry Sectors" },
                { value: "5", label: "Learner Personas" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-foreground/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Rocket size={48} className="mx-auto mb-6 text-purple-400" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              Let AI guide you to the perfect learning path tailored just for you.
            </p>
            <Link to="/learning-path">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-10 py-5 text-xl font-semibold text-white shadow-2xl shadow-purple-500/50"
              >
                Get Started Now
                <ArrowRight size={24} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
