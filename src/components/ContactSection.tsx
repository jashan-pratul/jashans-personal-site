import { ArrowUpRight, Copy, Download, Mail, MapPin } from "lucide-react";
import { EDUCATION, PROFILE, RESUME_TXT } from "../data/profile";
import { copyText, downloadText } from "../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";
import { SpotlightCard } from "./ui/SpotlightCard";

export function ContactSection() {
  const socials = [
    {
      id: "github",
      name: "GitHub",
      handle: `@${PROFILE.handle}`,
      url: PROFILE.links.github,
      accent: "#36D9E8",
      icon: GitHubIcon,
      description: "Public repositories, READMEs, and source code for my projects.",
      note: "github.com/jashan-pratul",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      handle: "jashan-pratul-9bb8a12b1",
      url: PROFILE.links.linkedin,
      accent: "#E84CA8",
      icon: LinkedInIcon,
      description:
        "Connect with me on LinkedIn. Note: 150K+ post reach listed on my résumé is a historical self-reported figure, not a live statistic.",
      note: "Historical résumé milestone: 150K+ reach",
    },
    {
      id: "x",
      name: "X",
      handle: `@${PROFILE.xHandle}`,
      url: PROFILE.links.x,
      accent: "#FF79C6",
      icon: XIcon,
      description: "Updates on what I am learning and building.",
      note: "x.com/JashanPratul",
    },
  ] as const;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="synth-badge">05 / Contact</span>
          <h2
            id="contact-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F5F0FA] sm:text-4xl"
          >
            Get in Touch
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-[#b6a8c9]">
          Feel free to reach out about internships, student projects, or feedback on any of my repositories.
        </p>
      </div>

      {/* Direct Email Card */}
      <SpotlightCard className="mt-8 p-6 sm:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h3 className="font-display text-xl font-bold text-[#F5F0FA] sm:text-2xl">
              Email &amp; Direct Contact
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#b6a8c9]">
              I&apos;m currently studying at <strong className="text-[#F5F0FA]">{EDUCATION.institution}</strong> in{" "}
              {PROFILE.city}. The fastest way to reach me is by email or LinkedIn.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-[#b6a8c9]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#FF79C6]" /> {PROFILE.city}
              </span>
              <span>·</span>
              <span className="text-[#36D9E8]">{PROFILE.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B35D5] via-[#E84CA8] to-[#FFAD57] px-5 py-3 text-sm font-semibold text-[#07050e] shadow-[0_0_24px_-6px_rgba(232,76,168,0.5)] transition-transform hover:scale-[1.01]"
            >
              <Mail className="size-4" />
              <span>Send Email</span>
            </a>

            <button
              type="button"
              onClick={() => copyText(PROFILE.email, "Email address copied")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#080510]/90 px-4 py-3 font-mono text-xs font-semibold text-[#F5F0FA] transition-colors hover:border-[#36D9E8]"
            >
              <Copy className="size-4 text-[#36D9E8]" />
              <span>Copy Email</span>
            </button>

            <button
              type="button"
              onClick={() => downloadText("Jashan_Pratul_Resume.txt", RESUME_TXT)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#080510]/90 px-4 py-3 font-mono text-xs font-semibold text-[#F5F0FA] transition-colors hover:border-[#FF79C6]"
            >
              <Download className="size-4 text-[#FF79C6]" />
              <span>Résumé (.txt)</span>
            </button>
          </div>
        </div>
      </SpotlightCard>

      {/* Social Profiles */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {socials.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.name} (${s.handle}) — opens in a new tab`}
              className="group block h-full focus:outline-none"
            >
              <SpotlightCard className="flex h-full flex-col justify-between p-6 transition-transform group-hover:-translate-y-0.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="grid size-10 place-items-center rounded-xl border"
                      style={{
                        borderColor: `${s.accent}55`,
                        backgroundColor: `${s.accent}18`,
                        color: s.accent,
                      }}
                    >
                      <Icon size={18} />
                    </span>
                    <ArrowUpRight className="size-4 text-[#b6a8c9] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#36D9E8]" />
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-[#F5F0FA] group-hover:text-[#FF79C6]">
                    {s.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-[#36D9E8]">{s.handle}</p>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#b6a8c9]">{s.description}</p>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] text-[#b6a8c9]">
                  {s.note}
                </div>
              </SpotlightCard>
            </a>
          );
        })}
      </div>
    </section>
  );
}
