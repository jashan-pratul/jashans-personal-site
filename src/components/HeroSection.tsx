import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Mail, MapPin } from "lucide-react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { EDUCATION, PROFILE, VERIFIED_PROJECTS } from "../data/profile";
import { EASE_IN_OUT, EASE_OUT } from "../lib/motion";
import { scrollToSection } from "../lib/utils";
import { Scene3DSlot } from "./Scene3DSlot";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";
import { Magnetic, SplitReveal } from "./ui/Motion";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE_OUT },
});

/**
 * Architectural SVG perimeter linework that draws around the portrait frame on entrance
 * and provides full orbital vector framing on mobile viewports where 3D WebGL is skipped.
 */
function PortraitLinework() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 440"
      className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[116%] -translate-x-1/2 -translate-y-1/2"
      fill="none"
    >
      {/* Mobile-only full orbital arcs (on desktop, Three.js Scene3D renders real 3D orbits) */}
      <g className="md:hidden">
        <motion.circle
          cx="220"
          cy="220"
          r="204"
          stroke="#FF5500"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeDasharray="2 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 0.35, ease: EASE_IN_OUT }}
        />
        <motion.ellipse
          cx="220"
          cy="220"
          rx="212"
          ry="76"
          transform="rotate(-24 220 220)"
          stroke="#38BDF8"
          strokeOpacity="0.42"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, delay: 0.55, ease: EASE_IN_OUT }}
        />
      </g>

      {/* Precision cardinal calibration ticks visible on all viewports */}
      <motion.g
        stroke="#F2EFE9"
        strokeOpacity="0.28"
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.6, ease: EASE_OUT }}
      >
        <line x1="220" y1="4" x2="220" y2="16" />
        <line x1="220" y1="424" x2="220" y2="436" />
        <line x1="4" y1="220" x2="16" y2="220" />
        <line x1="424" y1="220" x2="436" y2="220" />
      </motion.g>
    </svg>
  );
}

function PortraitStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 115, damping: 17 });
  const ry = useSpring(useMotionValue(0), { stiffness: 115, damping: 17 });
  const gx = useMotionValue(62);
  const gy = useMotionValue(30);
  const light = useMotionTemplate`radial-gradient(380px circle at ${gx}% ${gy}%, rgba(255,105,25,0.14), transparent 64%)`;
  const borderGlow = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgba(255,85,0,0.42), rgba(242,239,233,0.15) 70%)`;

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * 7.5);
    ry.set((px - 0.5) * 9.5);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.0, delay: 0.22, ease: EASE_OUT }}
      className="relative z-10 [perspective:1400px]"
    >
      <motion.figure
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative mx-auto max-w-md border border-[#F2EFE9]/15 bg-[#0B0B0E]/92 p-3 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-4 lg:max-w-[26.5rem]"
      >
        {/* Subtle cursor-reactive rim highlight */}
        <motion.span
          aria-hidden="true"
          style={{ background: borderGlow }}
          className="pointer-events-none absolute -inset-px -z-10 opacity-45"
        />

        {/* Precision corner reticles */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3.5 w-3.5 border-t-2 border-l-2 border-[#FF5500]" />
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px h-2.5 w-2.5 border-t border-r border-[#F2EFE9]/40" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-2.5 w-2.5 border-b border-l border-[#F2EFE9]/40" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px h-3.5 w-3.5 border-r-2 border-b-2 border-[#FF5500]" />

        <div className="mb-3 flex items-center justify-between border-b border-[#F2EFE9]/10 pb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6E6B65]">
          <span className="flex items-center gap-2 text-[#F2EFE9]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#FF5500] opacity-75" />
              <span className="relative inline-flex size-1.5 bg-[#FF5500]" />
            </span>
            {PROFILE.fullName}
          </span>
          <span className="tabular-nums text-[#FF5500]">CSE · 2025–2029</span>
        </div>

        <div className="relative aspect-square w-full overflow-hidden border border-[#F2EFE9]/10 bg-[#08080A]">
          <motion.img
            src={PROFILE.portraitUrl}
            alt="Stylized monochrome portrait of Jashan Pratul with orange geometric accents"
            width={1000}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-center"
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: EASE_OUT }}
          />

          {/* Cursor-following atmospheric light */}
          <motion.div
            aria-hidden="true"
            style={{ background: light }}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
          />

          {/* Reveal curtain + orange laser scanline */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 origin-bottom bg-[#08080A]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.15, delay: 0.28, ease: EASE_IN_OUT }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 left-0 z-30 h-0.5 bg-[#FF5500] shadow-[0_0_12px_#FF5500]"
            initial={{ top: "0%", opacity: 1 }}
            animate={{ top: "100%", opacity: [1, 1, 0] }}
            transition={{ duration: 1.15, delay: 0.28, ease: EASE_IN_OUT }}
          />

          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#F2EFE9]/10" />
        </div>

        <figcaption className="mt-3 flex items-center justify-between gap-2 pt-1 font-mono text-[11px] text-[#A6A29A]">
          <span className="inline-flex items-center gap-1.5 truncate font-medium text-[#F2EFE9]">
            <MapPin className="size-3 text-[#FF5500]" />
            {PROFILE.city}
          </span>
          <span className="shrink-0 text-[#6E6B65]">{EDUCATION.institution}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const portraitY = useTransform(scrollY, [0, 800], [0, 52]);
  const nameY = useTransform(scrollY, [0, 800], [0, -22]);

  const jumpToProject = (projectId: string) => {
    const el = document.getElementById(`project-${projectId}`);
    if (el) {
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84);
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      scrollToSection("projects");
    }
  };

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10"
    >
      {/* Top architectural telemetry strip */}
      <motion.div
        {...rise(0)}
        className="relative flex flex-wrap items-center justify-between gap-3 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6E6B65]"
      >
        <motion.span
          aria-hidden="true"
          className="absolute top-0 left-0 h-px w-full origin-left bg-[#F2EFE9]/[0.09]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px w-full origin-right bg-[#F2EFE9]/[0.09]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE_OUT }}
        />

        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2 bg-[#FF5500]" />
          <span className="text-[#F2EFE9]">Portfolio</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span>{EDUCATION.institution}</span>
          <span className="text-[#FF5500]">/</span>
          <span className="text-[#A6A29A]">{EDUCATION.period}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#A6A29A]">
          <MapPin className="size-3 text-[#FF5500]" />
          <span>{PROFILE.city}</span>
        </div>
      </motion.div>

      <div className="mt-10 grid items-start gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        {/* Left column: Typography & Identity */}
        <div className="lg:col-span-7">
          <motion.div {...rise(0.05)}>
            <span className="editorial-kicker">{PROFILE.positioning}</span>
          </motion.div>

          <motion.h1
            style={{ y: nameY }}
            aria-label="Jashan Pratul"
            className="mt-5 font-display text-[3.25rem] leading-[0.93] font-bold tracking-[-0.042em] text-[#F2EFE9] sm:text-7xl lg:text-[5.65rem]"
          >
            <span className="block">
              <SplitReveal text="JASHAN" delay={0.1} interactive />
            </span>
            <span className="inline-flex items-baseline gap-3">
              <SplitReveal text="PRATUL" delay={0.28} interactive />
              <motion.span
                aria-hidden="true"
                className="inline-block size-3.5 bg-[#FF5500] sm:size-4"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.55, delay: 0.92, ease: EASE_OUT }}
              />
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.4)}
            className="mt-7 max-w-2xl font-display text-xl leading-[1.45] font-medium text-[#F2EFE9] sm:text-2xl"
          >
            {PROFILE.intro}
          </motion.p>

          <motion.p {...rise(0.48)} className="mt-4 max-w-2xl text-base leading-[1.72] text-[#A6A29A]">
            {PROFILE.summary}
          </motion.p>

          {/* Studying & Building architectural diptych */}
          <motion.div
            {...rise(0.56)}
            className="relative mt-8 grid border border-[#F2EFE9]/[0.11] bg-[#0E0E12]/88 backdrop-blur-sm sm:grid-cols-2"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-2 w-2 border-t border-l border-[#FF5500]" />
            <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px h-2 w-2 border-r border-b border-[#38BDF8]" />

            <div className="border-b border-[#F2EFE9]/[0.1] p-5 sm:border-r sm:border-b-0">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#FF5500]">
                <span>Studying</span>
                <span className="text-[#6E6B65]">01</span>
              </div>
              <p className="mt-2 font-display text-sm font-semibold text-[#F2EFE9]">{EDUCATION.degree}</p>
              <p className="mt-1 font-mono text-xs text-[#A6A29A]">
                {EDUCATION.institution} · {EDUCATION.period}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#38BDF8]">
                <span>Building</span>
                <span className="text-[#6E6B65]">02</span>
              </div>
              <p className="mt-2 font-display text-sm font-semibold text-[#F2EFE9]">
                Web apps, developer tools and AI prototypes
              </p>
              <p className="mt-1 font-mono text-xs text-[#A6A29A]">TypeScript · Python · React · Next.js · Gemini</p>
            </div>
          </motion.div>

          {/* Primary & secondary CTAs */}
          <motion.div {...rise(0.64)} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.18}>
              <button
                type="button"
                onClick={() => scrollToSection("projects")}
                className="group inline-flex items-center gap-2.5 bg-[#FF5500] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#08080A] transition-colors hover:bg-[#FF6B22]"
              >
                <span>View my projects</span>
                <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>
            </Magnetic>

            <Magnetic strength={0.14}>
              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="inline-flex items-center gap-2 border border-[#F2EFE9]/20 bg-[#0E0E12] px-5 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#F2EFE9] transition-colors hover:border-[#FF5500] hover:text-[#FF5500]"
              >
                <span>About me</span>
              </button>
            </Magnetic>

            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#F2EFE9]/12 bg-[#0E0E12]/80 px-4 py-3.5 font-mono text-xs text-[#F2EFE9] transition-colors hover:border-[#F2EFE9]/35"
            >
              <GitHubIcon size={15} />
              <span>GitHub</span>
              <ExternalLink className="size-3 text-[#6E6B65]" />
            </a>

            <a
              href={PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#F2EFE9]/12 bg-[#0E0E12]/80 px-4 py-3.5 font-mono text-xs text-[#F2EFE9] transition-colors hover:border-[#F2EFE9]/35"
            >
              <LinkedInIcon size={15} />
              <span>LinkedIn</span>
              <ExternalLink className="size-3 text-[#6E6B65]" />
            </a>

            <a
              href={PROFILE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#F2EFE9]/12 bg-[#0E0E12]/80 px-3.5 py-3.5 font-mono text-xs text-[#A6A29A] transition-colors hover:border-[#F2EFE9]/35 hover:text-[#F2EFE9]"
              aria-label="X profile (@JashanPratul)"
            >
              <XIcon size={13} />
              <span>@{PROFILE.xHandle}</span>
            </a>

            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center gap-2 border border-[#F2EFE9]/12 bg-[#0E0E12]/80 px-4 py-3.5 font-mono text-xs text-[#F2EFE9] transition-colors hover:border-[#FF5500]"
            >
              <Mail className="size-3.5 text-[#FF5500]" />
              <span>Contact</span>
            </button>
          </motion.div>
        </div>

        {/* Right column: Signature Interactive Portrait & 3D Orbital Composition */}
        <motion.div style={{ y: portraitY }} className="relative lg:col-span-5 lg:px-2 lg:pt-4">
          <Scene3DSlot
            variant="portrait"
            className="scene-mask absolute -inset-[20%] z-0 hidden md:block"
          />
          <PortraitLinework />
          <PortraitStage />
        </motion.div>
      </div>

      {/* Selected projects directory strip */}
      <motion.div {...rise(0.75)} className="mt-14 border-t border-[#F2EFE9]/12 pt-6 lg:mt-16">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF5500]">
            Selected projects
          </span>
          <span className="font-mono text-[11px] text-[#6E6B65]">Tap one to jump to its case study</span>
        </div>

        <div className="grid border-t border-l border-[#F2EFE9]/[0.09] sm:grid-cols-2 lg:grid-cols-3">
          {VERIFIED_PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => jumpToProject(project.id)}
              className="group relative flex flex-col justify-between overflow-hidden border-r border-b border-[#F2EFE9]/[0.09] bg-[#08080A]/80 p-4 text-left transition-colors hover:bg-[#101016]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold tabular-nums text-[#FF5500]">{project.index}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6B65] transition-colors group-hover:text-[#A6A29A]">
                  {project.category}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="font-display text-base font-bold text-[#F2EFE9] transition-colors group-hover:text-[#FF5500]">
                  {project.name}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-[#6E6B65] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#FF5500]" />
              </div>

              <p className="mt-1 line-clamp-1 text-xs text-[#A6A29A]">{project.tagline}</p>

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF5500] transition-all duration-300 group-hover:w-full"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
