import { AnimatePresence, motion } from "framer-motion";
import { Command, FileText, Mail, MapPin } from "lucide-react";
import { usePersona } from "../../context/persona";
import { PROFILE } from "../../data/profile";
import { emit } from "../../lib/bus";
import { copyText, modKey } from "../../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "../ui/BrandIcons";

const swap = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export function HeroCard() {
  const { persona, config } = usePersona();

  return (
    <div className="relative flex h-full flex-col overflow-hidden p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-30 blur-3xl transition-colors duration-700"
        style={{ background: config.accent }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-em/30 bg-em/10 px-3 py-1 text-xs font-medium text-em">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-em opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-em" />
          </span>
          {PROFILE.status}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
          <MapPin className="size-3" /> {PROFILE.location}
        </span>
      </div>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {PROFILE.name}
        <span className="ml-3 align-middle font-mono text-sm font-normal text-faint">@{PROFILE.xHandle}</span>
      </h1>

      <div className="relative mt-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={`h-${persona}`} {...swap} className="text-lg font-medium leading-snug text-ink/90 sm:text-xl">
            {config.headline}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={`b-${persona}`} {...swap} className="max-w-2xl text-[15px] leading-relaxed text-muted">
            {config.bio}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={`c-${persona}`}
          className="mt-5 flex flex-wrap gap-2"
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={{ show: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
        >
          {config.chips.map((c) => (
            <motion.li
              key={c}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              className="rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink/80"
            >
              {c}
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <div className="mt-auto flex flex-wrap gap-2 pt-7">
        <button
          onClick={() => emit("palette:open")}
          className="group inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Command className="size-4" /> Command Palette
          <kbd className="rounded border border-black/15 px-1.5 font-mono text-[10px] text-black/60">{modKey} K</kbd>
        </button>
        {persona === "recruiter" && (
          <button
            onClick={() => emit("resume:open")}
            className="inline-flex items-center gap-2 rounded-lg border border-em/40 bg-em/10 px-3.5 py-2 text-sm font-medium text-em transition-colors hover:bg-em/20"
          >
            <FileText className="size-4" /> ATS Resume Summary
          </button>
        )}
        <button
          onClick={() => copyText(PROFILE.email, "Email copied")}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-sm text-ink transition-colors hover:border-line-strong"
        >
          <Mail className="size-4" /> Copy Email
        </button>
        <a
          href={PROFILE.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-sm text-ink transition-colors hover:border-line-strong"
        >
          <GitHubIcon /> GitHub
        </a>
        <a
          href={PROFILE.links.x}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-sm text-ink transition-colors hover:border-line-strong"
        >
          <XIcon size={14} /> @{PROFILE.xHandle}
        </a>
        <a
          href={PROFILE.links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-sm text-ink transition-colors hover:border-line-strong"
        >
          <LinkedInIcon size={14} /> LinkedIn
        </a>
      </div>
    </div>
  );
}
