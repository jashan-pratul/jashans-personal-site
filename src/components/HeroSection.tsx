import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ExternalLink, GraduationCap, Mail, MapPin } from "lucide-react";
import { EDUCATION, PROFILE } from "../data/profile";
import { scrollToSection } from "../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";
import { SpotlightCard } from "./ui/SpotlightCard";

const PORTFOLIO_INDEX = [
  { id: "about", index: "01", label: "About", detail: "Personal background, KCT education & core interests" },
  { id: "projects", index: "02", label: "Projects", detail: "6 verified software, AI, ML & IoT case studies" },
  { id: "skills", index: "03", label: "Skills", detail: "Honest technical breakdown by practical usage" },
  { id: "experience", index: "04", label: "Experience", detail: "Internship, campus organizations & academic timeline" },
  { id: "contact", index: "05", label: "Contact", detail: "Direct email, plaintext résumé & social profiles" },
] as const;

export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="grid items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Editorial Typographic Composition */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/12 bg-[#120b20]/80 px-3.5 py-1.5 font-mono text-xs text-[#F5F0FA]"
          >
            <GraduationCap className="size-3.5 text-[#36D9E8]" />
            <span>{EDUCATION.institution}</span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1 text-[#b6a8c9]">
              <MapPin className="size-3 text-[#FF79C6]" /> {PROFILE.city}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
            className="chroma-title mt-6 font-display text-5xl font-bold tracking-tight text-[#F5F0FA] sm:text-6xl lg:text-[4.25rem] lg:leading-[1.04]"
          >
            {PROFILE.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-4 font-mono text-xs font-medium tracking-wide text-[#36D9E8] sm:text-sm"
          >
            {PROFILE.positioning}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[#F5F0FA] sm:text-xl"
          >
            {PROFILE.intro}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b6a8c9] sm:text-base"
          >
            {PROFILE.summary}
          </motion.p>

          {/* What I Study & What I Build Summary Strip */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2"
          >
            <div className="rounded-xl border border-white/10 bg-[#0c0717]/80 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#FF79C6]">What I Study</p>
              <p className="mt-1 text-xs font-medium text-[#F5F0FA]">{EDUCATION.degree}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#b6a8c9]">{EDUCATION.period}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0c0717]/80 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#36D9E8]">What I Build</p>
              <p className="mt-1 text-xs font-medium text-[#F5F0FA]">
                Full-Stack Web Apps, Developer Tools &amp; AI Prototypes
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-[#b6a8c9]">TypeScript · Python · React · Next.js</p>
            </div>
          </motion.div>

          {/* Primary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={() => scrollToSection("projects")}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B35D5] via-[#E84CA8] to-[#FFAD57] px-5 py-3 text-sm font-semibold text-[#07050e] shadow-[0_0_24px_-6px_rgba(232,76,168,0.5)] transition-transform hover:scale-[1.01]"
            >
              <span>Explore Projects</span>
              <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#120b20]/90 px-4 py-3 text-sm font-medium text-[#F5F0FA] transition-colors hover:border-[#FF79C6]/60 hover:bg-[#1a1030]"
            >
              <span>About Me</span>
            </button>

            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#36D9E8]/35 bg-[#120b20]/90 px-4 py-3 text-sm font-medium text-[#F5F0FA] transition-colors hover:border-[#36D9E8] hover:bg-[#1a1030]"
            >
              <GitHubIcon size={16} />
              <span>GitHub</span>
              <ExternalLink className="size-3.5 text-[#b6a8c9]" />
            </a>

            <a
              href={PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E84CA8]/35 bg-[#120b20]/90 px-4 py-3 text-sm font-medium text-[#F5F0FA] transition-colors hover:border-[#FF79C6] hover:bg-[#1a1030]"
            >
              <LinkedInIcon size={16} />
              <span>LinkedIn</span>
              <ExternalLink className="size-3.5 text-[#b6a8c9]" />
            </a>

            <a
              href={PROFILE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-[#120b20]/70 px-3.5 py-3 text-sm text-[#b6a8c9] transition-colors hover:border-white/30 hover:text-[#F5F0FA]"
              aria-label="X profile (@JashanPratul)"
            >
              <XIcon size={14} />
              <span>@{PROFILE.xHandle}</span>
            </a>

            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-[#120b20]/70 px-3.5 py-3 text-sm text-[#F5F0FA] transition-colors hover:border-[#36D9E8]/50"
            >
              <Mail className="size-4 text-[#36D9E8]" />
              <span>Contact</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Editorial Portfolio Directory & Student Dossier */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="lg:col-span-5"
        >
          <SpotlightCard className="p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF79C6]">
                Portfolio Directory
              </span>
              <span className="font-mono text-xs text-[#36D9E8]">KCT · 2025 – 2029</span>
            </div>

            <p className="mt-3.5 text-xs leading-relaxed text-[#b6a8c9]">
              Navigate directly to any section of this portfolio to read about my background, inspect my project case
              studies, or review my technical stack.
            </p>

            <nav aria-label="Portfolio sections directory" className="mt-4 space-y-2">
              {PORTFOLIO_INDEX.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080510]/80 px-4 py-3 text-left transition-all hover:border-[#E84CA8]/45 hover:bg-[#170e29]/80"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[#36D9E8]">{sec.index}</span>
                      <span className="font-display text-sm font-semibold text-[#F5F0FA] group-hover:text-[#FF79C6]">
                        {sec.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#b6a8c9]">{sec.detail}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-[#b6a8c9] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#36D9E8]" />
                </button>
              ))}
            </nav>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5 font-mono text-[11px] text-[#b6a8c9]">
              <span>Coimbatore, Tamil Nadu, India</span>
              <a
                href={`mailto:${PROFILE.email}`}
                className="text-[#36D9E8] transition-colors hover:text-[#FF79C6]"
              >
                {PROFILE.email}
              </a>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
