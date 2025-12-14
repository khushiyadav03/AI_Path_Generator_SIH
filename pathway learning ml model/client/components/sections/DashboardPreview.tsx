import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const progressData = [
  { name: "Week 1", progress: 20 },
  { name: "Week 2", progress: 40 },
  { name: "Week 3", progress: 55 },
  { name: "Week 4", progress: 70 },
];

const radarData = [
  { skill: "Python", A: 80 },
  { skill: "DSA", A: 55 },
  { skill: "ML", A: 45 },
  { skill: "SQL", A: 65 },
  { skill: "Cloud", A: 35 },
];

const recs = [
  {
    title: "Python for Everybody (Coursera)",
    by: "University of Michigan",
  },
  { title: "Intro to Machine Learning", by: "Kaggle" },
  { title: "Data Structures in JS", by: "freeCodeCamp" },
  { title: "SQL Fundamentals", by: "Udemy" },
];

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="container mx-auto py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Dashboard Preview</h2>
        <p className="mt-2 text-foreground/70">Track progress, skills, and recommendations at a glance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass rounded-2xl p-4 lg:col-span-7"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground/70">Progress Tracker</h3>
          <ChartContainer config={{ progress: { color: "hsl(var(--accent))" } }} className="h-64">
            <BarChart data={progressData}>
              <XAxis dataKey="name" stroke="hsl(var(--foreground)/0.5)" />
              <YAxis stroke="hsl(var(--foreground)/0.5)" />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="progress" fill="var(--color-progress)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass rounded-2xl p-4 lg:col-span-5"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground/70">Skill Mastery Map</h3>
          <ChartContainer config={{ A: { color: "hsl(var(--primary))" } }} className="h-64">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--foreground)/0.2)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--foreground)/0.6)" }} />
              <PolarRadiusAxis stroke="hsl(var(--foreground)/0.2)" />
              <Radar name="Mastery" dataKey="A" stroke="var(--color-A)" fill="var(--color-A)" fillOpacity={0.4} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-12 grid gap-4 md:grid-cols-3"
        >
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-foreground/60">Ongoing courses</div>
            <div className="mt-1 text-2xl font-bold">3</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: "60%" }} />
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-foreground/60">Achievements & badges</div>
            <div className="mt-1 text-2xl font-bold">8</div>
            <div className="mt-2 text-xs text-foreground/60">New: Python Novice</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-foreground/60">Learning streak</div>
            <div className="mt-1 text-2xl font-bold">12 days</div>
            <div className="mt-2 text-xs text-foreground/60">Keep it up!</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass rounded-2xl p-4 lg:col-span-12"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground/70">Personalized Recommendations</h3>
          </div>
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {recs.map((r, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <div className="glass h-full rounded-xl p-4">
                    <div className="mb-2 text-sm font-semibold">{r.title}</div>
                    <div className="text-xs text-foreground/60">{r.by}</div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
