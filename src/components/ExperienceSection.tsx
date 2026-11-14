import { motion } from "framer-motion";
import { Award, Calendar, Cpu, GraduationCap, Users } from "lucide-react";
import { TIMELINE } from "../data/profile";
import { SpotlightCard } from "./ui/SpotlightCard";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="synth-badge">04 / Experience</span>
          <h2
            id="experience-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F5F0FA] sm:text-4xl"
          >
            Experience &amp; Campus Involvement
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-[#b6a8c9]">
          Documented internships, campus organizations, and undergraduate education.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {TIMELINE.map((item, idx) => {
          const Icon =
            item.type === "internship"
              ? Cpu
              : item.type === "leadership"
                ? Award
                : item.type === "education"
                  ? GraduationCap
                  : Users;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className={idx === 0 ? "md:col-span-2" : ""}
            >
              <SpotlightCard className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-xs"
                      style={{
                        borderColor: `${item.accent}55`,
                        backgroundColor: `${item.accent}18`,
                        color: item.accent,
                      }}
                    >
                      <Icon className="size-3.5" />
                      {item.organization}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#b6a8c9]">
                      <Calendar className="size-3.5" /> {item.period}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-bold text-[#F5F0FA]">{item.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#b6a8c9]">{item.summary}</p>

                  <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[#F5F0FA]/85">
                    {item.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#E84CA8]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-white/10 bg-[#090611]/70 px-2.5 py-0.5 font-mono text-[11px] text-[#b6a8c9]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
