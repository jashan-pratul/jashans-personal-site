import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { TIMELINE } from "../data/profile";
import { EASE_OUT } from "../lib/motion";
import { SectionHeader } from "./ui/SectionHeader";

const TYPE_LABEL: Record<(typeof TIMELINE)[number]["type"], string> = {
  education: "Education",
  internship: "Internship",
  leadership: "Campus role",
  community: "Community",
};

export function ExperienceSection() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10"
    >
      <SectionHeader
        id="experience-heading"
        index="04"
        label="Experience"
        title="Experience"
        note="My degree, a short robotics internship, and the student communities I am part of."
      />

      <div ref={listRef} className="relative mt-12 border-b border-[#F2EFE9]/12">
        {/* Spine: the orange line fills as you scroll down the list */}
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[5px] w-px bg-[#F2EFE9]/12" />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: fill }}
          className="absolute top-0 bottom-0 left-[5px] w-px origin-top bg-[#FF5500] shadow-[0_0_8px_#FF5500]"
        />

        {TIMELINE.map((item) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="group relative grid gap-6 border-t border-[#F2EFE9]/12 py-8 pl-9 transition-colors hover:bg-[#0E0E12]/60 sm:py-10 lg:grid-cols-12 lg:gap-8"
          >
            {/* Precision timeline node reticle */}
            <motion.span
              aria-hidden="true"
              className="absolute top-9 left-0 size-[11px] border border-[#FF5500] sm:top-11"
              initial={{ backgroundColor: "#08080A", scale: 0.85 }}
              whileInView={{ backgroundColor: "#FF5500", scale: 1 }}
              viewport={{ once: true, margin: "-35% 0px -35% 0px" }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[41px] left-[11px] hidden h-px w-4 bg-[#FF5500]/50 sm:top-[49px] sm:block"
            />

            <div className="lg:col-span-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold tabular-nums text-[#FF5500]">{item.index}</span>
                <span
                  className="border border-[#F2EFE9]/15 bg-[#0E0E12] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: item.accent }}
                >
                  {TYPE_LABEL[item.type]}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs tabular-nums text-[#F2EFE9]">{item.period}</p>
            </div>

            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#FF5500]">
                {item.organization}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-[#F2EFE9] transition-colors group-hover:text-white sm:text-2xl">
                {item.role}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A6A29A]">{item.summary}</p>
            </div>

            <div className="flex flex-col justify-between lg:col-span-4">
              <ul className="space-y-2 text-xs leading-relaxed text-[#F2EFE9]/90">
                {item.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 bg-[#FF5500]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-[#F2EFE9]/10 bg-[#0E0E12] px-2 py-0.5 font-mono text-[10px] text-[#A6A29A] transition-colors group-hover:border-[#F2EFE9]/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
