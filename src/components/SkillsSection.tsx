import { motion } from "framer-motion";
import { HONEST_SKILLS } from "../data/profile";
import { SpotlightCard } from "./ui/SpotlightCard";

export function SkillsSection() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="synth-badge">03 / Skills</span>
          <h2
            id="skills-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F5F0FA] sm:text-4xl"
          >
            Technical Overview
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-[#b6a8c9]">
          Grouped honestly by how I have used each technology—with no arbitrary skill percentages or self-rated bars.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {HONEST_SKILLS.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
          >
            <SpotlightCard className="flex h-full flex-col p-6">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-display text-lg font-bold" style={{ color: group.accent }}>
                  {group.title}
                </h3>
                <p className="mt-1 text-xs text-[#b6a8c9]">{group.subtitle}</p>
              </div>

              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-col justify-between gap-1 rounded-xl border border-white/10 bg-[#090611]/65 px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <span className="font-mono text-xs font-semibold text-[#F5F0FA]">{item.name}</span>
                    <span className="text-xs text-[#b6a8c9] sm:text-right">{item.context}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
