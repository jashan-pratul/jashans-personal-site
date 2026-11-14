import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Mail, MapPin } from "lucide-react";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { EDUCATION, PROFILE, RESUME_TXT } from "../data/profile";
import { EASE_OUT, REVEAL_VIEWPORT } from "../lib/motion";
import { copyText, downloadText } from "../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";
import { Magnetic, Reveal } from "./ui/Motion";
import { SectionHeader } from "./ui/SectionHeader";

const SOCIALS = [
  {
    id: "github",
    index: "01",
    name: "GitHub",
    handle: `@${PROFILE.handle}`,
    url: PROFILE.links.github,
    icon: GitHubIcon,
    description: "Source code and READMEs for my projects.",
    note: "github.com/jashan-pratul",
  },
  {
    id: "linkedin",
    index: "02",
    name: "LinkedIn",
    handle: "jashan-pratul-9bb8a12b1",
    url: PROFILE.links.linkedin,
    icon: LinkedInIcon,
    description: "Connect with me or send a message.",
    note: "linkedin.com/in/jashan-pratul-9bb8a12b1",
  },
  {
    id: "x",
    index: "03",
    name: "X",
    handle: `@${PROFILE.xHandle}`,
    url: PROFILE.links.x,
    icon: XIcon,
    description: "Updates on what I am learning and building.",
    note: "x.com/JashanPratul",
  },
] as const;

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const mx = useMotionValue(30);
  const my = useMotionValue(40);
  const light = useMotionTemplate`radial-gradient(460px circle at ${mx}% ${my}%, rgba(255,85,0,0.09), transparent 66%)`;

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  const handleCopyEmail = () => {
    void copyText(PROFILE.email, "Email address copied");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10"
    >
      <SectionHeader
        id="contact-heading"
        index="05"
        label="Contact"
        title="Get in Touch"
        note="I am happy to hear about internships, student collaborations, or feedback on any of my projects."
      />

      <motion.div
        onPointerMove={onMove}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="relative mt-12 overflow-hidden border border-[#F2EFE9]/15 bg-[#0E0E12]/92 p-6 sm:p-10"
      >
        {/* Corner architectural reticles */}
        <span aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t-2 border-l-2 border-[#FF5500]" />
        <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-[#F2EFE9]/35" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-[#F2EFE9]/35" />
        <span aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 h-3.5 w-3.5 border-r-2 border-b-2 border-[#FF5500]" />

        <motion.div aria-hidden="true" style={{ background: light }} className="pointer-events-none absolute inset-0" />

        {/* Top subtle technical ruler bar */}
        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFE9]/10 pb-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6E6B65]">
          <span className="flex items-center gap-2 text-[#FF5500]">
            <span className="inline-block size-1.5 bg-[#FF5500]" />
            <span>Direct Channel</span>
          </span>
          <span>Coimbatore, Tamil Nadu · IST (UTC+05:30)</span>
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5500]">
              Email
            </span>
            <a
              href={`mailto:${PROFILE.email}`}
              className="mt-2 block break-all font-display text-2xl font-bold tracking-tight text-[#F2EFE9] transition-colors hover:text-[#FF5500] sm:text-4xl lg:text-[2.6rem]"
            >
              {PROFILE.email}
            </a>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#A6A29A]">
              I am studying Computer Science Engineering at{" "}
              <strong className="font-medium text-[#F2EFE9]">{EDUCATION.institution}</strong> in {PROFILE.city}. Email is
              the fastest way to reach me, and LinkedIn works too.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-[#6E6B65]">
              <MapPin className="size-3.5 text-[#FF5500]" />
              <span>{PROFILE.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Magnetic strength={0.16}>
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex items-center justify-center gap-2 bg-[#FF5500] px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#08080A] transition-colors hover:bg-[#FF6B22]"
              >
                <Mail className="size-4" />
                <span>Send email</span>
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-2 border border-[#F2EFE9]/20 bg-[#08080A] px-4 py-3.5 font-mono text-xs font-semibold text-[#F2EFE9] transition-colors hover:border-[#FF5500]"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 text-[#FF5500]" />
                  <span>Copy email</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => downloadText("Jashan_Pratul_Resume.txt", RESUME_TXT)}
              className="inline-flex items-center justify-center gap-2 border border-[#F2EFE9]/20 bg-[#08080A] px-4 py-3.5 font-mono text-xs font-semibold text-[#F2EFE9] transition-colors hover:border-[#38BDF8]"
            >
              <Download className="size-4 text-[#38BDF8]" />
              <span>Résumé (.txt)</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid border-t border-l border-[#F2EFE9]/12 md:grid-cols-3">
        {SOCIALS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.id} delay={i * 0.07} y={12} className="contents">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name} (${s.handle}), opens in a new tab`}
                className="group relative flex flex-col justify-between overflow-hidden border-r border-b border-[#F2EFE9]/12 bg-[#08080A]/85 p-6 transition-colors hover:bg-[#0E0E12]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tabular-nums text-[#FF5500]">{s.index}</span>
                    <ArrowUpRight className="size-4 text-[#6E6B65] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#FF5500]" />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="grid size-9 place-items-center border border-[#F2EFE9]/15 bg-[#0E0E12] text-[#F2EFE9] transition-colors group-hover:border-[#FF5500]">
                      <Icon size={16} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#F2EFE9] transition-colors group-hover:text-[#FF5500]">
                        {s.name}
                      </h3>
                      <p className="font-mono text-xs text-[#38BDF8]">{s.handle}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[#A6A29A]">{s.description}</p>
                </div>

                <div className="mt-6 border-t border-[#F2EFE9]/10 pt-3 font-mono text-[11px] text-[#6E6B65]">
                  {s.note}
                </div>

                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF5500] transition-all duration-300 group-hover:w-full"
                />
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
