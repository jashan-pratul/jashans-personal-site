import { ArrowUp } from "lucide-react";
import { EDUCATION, PROFILE } from "../data/profile";
import { scrollToSection } from "../lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./ui/BrandIcons";

export function Footer() {
  return (
    <footer className="relative border-t border-[#F2EFE9]/12 bg-[#08080A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex size-7 items-center justify-center border border-[#F2EFE9]/15 bg-[#0E0E12] font-display text-xs font-bold text-[#F2EFE9]">
                <span className="absolute inset-y-0 left-0 w-1 bg-[#FF5500]" />
                <span className="pl-1">JP</span>
              </span>
              <span className="font-display text-sm font-semibold text-[#F2EFE9]">{PROFILE.name}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-[#6E6B65]">
              {EDUCATION.degree} · {EDUCATION.institution} ({EDUCATION.period})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-1.5 border border-[#F2EFE9]/15 bg-[#0E0E12] px-3.5 py-2 font-mono text-xs text-[#F2EFE9] transition-colors hover:border-[#FF5500]"
            >
              <ArrowUp className="size-3.5 text-[#FF5500]" /> Top
            </button>
            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid size-9 place-items-center border border-[#F2EFE9]/12 bg-[#0E0E12] text-[#A6A29A] transition-colors hover:border-[#FF5500] hover:text-[#F2EFE9]"
            >
              <GitHubIcon size={15} />
            </a>
            <a
              href={PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center border border-[#F2EFE9]/12 bg-[#0E0E12] text-[#A6A29A] transition-colors hover:border-[#FF5500] hover:text-[#F2EFE9]"
            >
              <LinkedInIcon size={15} />
            </a>
            <a
              href={PROFILE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="grid size-9 place-items-center border border-[#F2EFE9]/12 bg-[#0E0E12] text-[#A6A29A] transition-colors hover:border-[#FF5500] hover:text-[#F2EFE9]"
            >
              <XIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
