import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, REVEAL_VIEWPORT } from "../../lib/motion";

/** Shared section opener: a hairline that draws itself, then the label and title rise into place. */
export function SectionHeader({
  index,
  label,
  title,
  id,
  note,
  aside,
}: {
  index: string;
  label: string;
  title: string;
  id: string;
  note?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="relative pt-8">
      <motion.span
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-full origin-left bg-[#F2EFE9]/15"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 1.2, ease: EASE_OUT }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-28 origin-left bg-[#FF5500]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
      />

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <motion.span
            className="editorial-kicker"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
          >
            {index} — {label}
          </motion.span>
          <h2
            id={id}
            className="mt-3 overflow-hidden pb-1 font-display text-3xl font-bold tracking-[-0.03em] text-[#F2EFE9] sm:text-5xl"
          >
            <motion.span
              className="block"
              initial={{ y: "105%" }}
              whileInView={{ y: "0%" }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.85, delay: 0.12, ease: EASE_OUT }}
            >
              {title}
            </motion.span>
          </h2>
        </div>
        {aside ??
          (note && (
            <p className="max-w-md text-sm leading-relaxed text-[#A6A29A]">{note}</p>
          ))}
      </div>
    </div>
  );
}
