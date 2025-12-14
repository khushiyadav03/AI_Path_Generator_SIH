import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi! I’m your AI mentor. Ask me anything about your learning path." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Based on your goals, I recommend starting with a Python fundamentals course and a weekly project. Want me to generate a personalized plan?",
        },
      ]);
    }, 600);
  };

  return (
    <div id="assistant" className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen(true)}
        className="glass inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/70 to-cyan-400/70 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur hover:from-purple-500 hover:to-cyan-400"
      >
        <Bot size={16} /> Ask Assistant
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="glass fixed bottom-24 right-6 w-[340px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl dark:bg-white/5"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bot size={16} className="text-purple-400" /> AI Mentor
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={16} className="text-foreground/70" /></button>
            </div>
            <div className="max-h-80 space-y-3 overflow-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm shadow ${m.role === "user" ? "bg-gradient-to-r from-purple-500/80 to-cyan-400/80 text-white" : "bg-white/10 text-foreground"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 p-2 text-white shadow">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
