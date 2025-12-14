import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <main className="container mx-auto flex min-h-[60vh] items-center justify-center py-16">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-6xl font-extrabold text-transparent sm:text-8xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.h1>
        <p className="mt-4 text-xl text-foreground/70 sm:text-2xl">
          Oops! Page not found
        </p>
        <p className="mt-2 text-sm text-foreground/50">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        >
          <Home size={16} />
          Return to Home
        </Link>
      </motion.div>
    </main>
  );
}

