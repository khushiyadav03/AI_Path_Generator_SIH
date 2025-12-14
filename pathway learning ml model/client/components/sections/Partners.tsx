import { motion } from "framer-motion";

const partners = [
  { name: "LinkedIn", logo: "linkedin" },
  { name: "Otto Group", logo: "otto group" },
  { name: "Telus", logo: "TELUS" },
  { name: "KPMG", logo: "KPMG" },
  { name: "Carlsberg Group", logo: "Carlsberg Group" },
  { name: "Hexagonal", logo: "H" },
  { name: "DD", logo: "DD" },
];

// Duplicate for seamless loop
const duplicatedPartners = [...partners, ...partners];

export default function Partners() {
  return (
    <section className="container mx-auto py-12 overflow-hidden">
      <div className="relative">
        {/* Infinite scroll animation */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-12 shrink-0"
            animate={{
              x: [0, -(192 * 7)], // 7 logos * 192px (w-48) each
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex h-16 w-48 shrink-0 items-center justify-center"
              >
                <div className="text-lg font-semibold text-foreground/60 uppercase tracking-wide whitespace-nowrap">
                  {partner.logo}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Fade gradients on sides */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}

