import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, UserPlus, LifeBuoy } from "lucide-react";

const mentors = [
  {
    name: "Aarav Shah",
    role: "Senior ML Engineer",
    avatar: "AS",
    domains: ["machine learning"],
    skills: ["python", "django"],
  },
  {
    name: "Ishita Verma",
    role: "Data Scientist",
    avatar: "IV",
    domains: ["machine learning", "cloud computing"],
    skills: ["python"],
  },
  {
    name: "Rahul Mehta",
    role: "Backend Lead",
    avatar: "RM",
    domains: ["fullstack development"],
    skills: ["java", "django"],
  },
  {
    name: "Neha Gupta",
    role: "Cloud Architect",
    avatar: "NG",
    domains: ["cloud computing"],
    skills: ["python", "c++"],
  },
  {
    name: "Ananya Patel",
    role: "Android Engineer",
    avatar: "AP",
    domains: ["android development"],
    skills: ["kotlin", "java"],
  },
];

const domainOptions = [
  "machine learning",
  "fullstack development",
  "cloud computing",
  "android development",
] as const;

const skillOptions = ["python", "java", "django", "c++", "kotlin"] as const;

export default function MentorshipPortal() {
  const [askIndex, setAskIndex] = useState<number | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (s: string) => {
    setSelectedSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filteredMentors = mentors.filter((m) => {
    const domainOk = selectedDomain
      ? m.domains.includes(selectedDomain)
      : true;
    const skillsOk = selectedSkills.length
      ? selectedSkills.every((s) => m.skills.includes(s))
      : true;
    return domainOk && skillsOk;
  });

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Mentorship Portal</h2>
        <p className="mt-2 text-foreground/70">Connect with seniors and mentors for real-time guidance.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs uppercase tracking-wide text-foreground/50">Domain</span>
        <button
          onClick={() => setSelectedDomain(null)}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            selectedDomain === null
              ? "border-cyan-400/60 bg-white/10 text-white"
              : "border-white/20 bg-white/5 text-foreground/80 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {domainOptions.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
              selectedDomain === d
                ? "border-cyan-400/60 bg-white/10 text-white"
                : "border-white/20 bg-white/5 text-foreground/80 hover:bg-white/10"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs uppercase tracking-wide text-foreground/50">Skills</span>
        {skillOptions.map((s) => (
          <button
            key={s}
            onClick={() => toggleSkill(s)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
              selectedSkills.includes(s)
                ? "border-cyan-400/60 bg-white/10 text-white"
                : "border-white/20 bg-white/5 text-foreground/80 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredMentors.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow">
                {m.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="text-xs text-foreground/60">{m.role}</div>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {m.domains.map((d) => (
                <span key={d} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                  {d}
                </span>
              ))}
              {m.skills.map((s) => (
                <span key={s} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/20">
                <UserPlus size={14} />
              </button>
              <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/20">
                <MessageCircle size={14} />
              </button>
              <button
                onClick={() => setAskIndex(i)}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-90"
              >
                <LifeBuoy size={14} /> Ask for Help
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {askIndex !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal>
          <div className="glass w-full max-w-md rounded-2xl">
            <div className="border-b border-white/10 p-4 text-sm font-semibold">Ask Your Mentor</div>
            <div className="p-4 text-sm text-foreground/80">Briefly describe your question. We'll route it to your mentor.</div>
            <div className="flex gap-2 p-4 pt-0">
              <input className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none backdrop-blur" placeholder="Type your question..." />
              <button
                onClick={() => setAskIndex(null)}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow"
              >
                Send
              </button>
            </div>
          </div>
          <button className="absolute inset-0 -z-10" onClick={() => setAskIndex(null)} aria-label="Close overlay" />
        </div>
      )}
    </section>
  );
}
