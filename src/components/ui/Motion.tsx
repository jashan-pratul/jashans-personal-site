import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { EASE_OUT, REVEAL_VIEWPORT } from "../../lib/motion";

/** Fade + rise when scrolled into view. Disabled automatically for reduced motion (see MotionConfig in App). */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string } & Omit<
  HTMLMotionProps<"div">,
  "children" | "initial" | "whileInView" | "viewport" | "transition"
>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Masked per-letter rise with optional tactile hover micro-interaction.
 * The visible text stays in the DOM as an aria-label; letters are decorative.
 */
export function SplitReveal({
  text,
  delay = 0,
  stagger = 0.035,
  className,
  animateOnView = false,
  interactive = false,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  animateOnView?: boolean;
  interactive?: boolean;
}) {
  const view = animateOnView
    ? { whileInView: "show", viewport: REVEAL_VIEWPORT }
    : { animate: "show" };
  return (
    <motion.span
      aria-label={text}
      className={`inline-flex ${className ?? ""}`}
      initial="hidden"
      {...view}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            className={`inline-block ${
              interactive ? "transition-colors duration-200 hover:text-[#FF5500]" : ""
            }`}
            variants={{
              hidden: { y: "110%", rotateZ: 2 },
              show: { y: "0%", rotateZ: 0 },
            }}
            whileHover={interactive ? { y: -3, transition: { duration: 0.18, ease: EASE_OUT } } : undefined}
            transition={{ duration: 0.88, ease: EASE_OUT }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Subtle damped magnetic wrapper for primary CTAs and interactive controls.
 * Only activates for fine mouse pointers.
 */
export function Magnetic({
  children,
  strength = 0.22,
  className = "inline-flex",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(dx * strength);
    my.set(dy * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
