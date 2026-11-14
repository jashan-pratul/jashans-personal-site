import { ArrowUp } from "lucide-react";
import { EDUCATION, PROFILE } from "../data/profile";
import { scrollToSection } from "../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#090611]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg border border-[#E84CA8]/45 bg-[#301044] font-display text-xs font-bold text-[#F5F0FA]">
                JP
              </span>
              <span className="font-display text-sm font-semibold text-[#F5F0FA]">{PROFILE.name}</span>
            </div>
            <p className="mt-2 text-xs text-[#b6a8c9]">
              {EDUCATION.degree} · {EDUCATION.institution} ({EDUCATION.period})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#120b20] px-3 py-2 font-mono text-xs text-[#F5F0FA] hover:border-white/35"
            >
              <ArrowUp className="size-3.5" /> Top
            </button>
            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-[#120b20] text-[#b6a8c9] hover:border-[#36D9E8] hover:text-[#36D9E8]"
            >
              <GitHubIcon size={16} />
            </a>
            <a
              href={PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-[#120b20] text-[#b6a8c9] hover:border-[#E84CA8] hover:text-[#FF79C6]"
            >
              <LinkedInIcon size={16} />
            </a>
            <a
              href={PROFILE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-[#120b20] text-[#b6a8c9] hover:border-[#FFAD57] hover:text-[#FFAD57]"
            >
              <XIcon size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
