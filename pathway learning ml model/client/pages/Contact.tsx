import { motion } from "framer-motion";

export default function Contact() {
  return (
    <main className="container mx-auto py-16">
      <motion.h1
        className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Contact
      </motion.h1>
      <motion.p
        className="mt-4 max-w-2xl text-foreground/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Reach out at team@sih25199.example for partnerships, support, and feedback.
      </motion.p>
    </main>
  );
}

