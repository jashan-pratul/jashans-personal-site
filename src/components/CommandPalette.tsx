import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FolderGit2,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PROFILE, RESUME_TXT, VERIFIED_PROJECTS } from "../data/profile";
import { emit, useBus } from "../lib/bus";
import { fuzzyMatch } from "../lib/fuzzy";
import { copyText, downloadText, scrollToSection } from "../lib/utils";

interface PaletteItem {
  id: string;
  group: "Navigate" | "Projects" | "Actions";
  title: string;
  subtitle: string;
  keywords: string;
  icon: typeof Compass;
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useBus("palette:open", () => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActiveIndex(0);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const allItems: PaletteItem[] = useMemo(
    () => [
      // Navigation
      ...[
        { id: "home", label: "Home — Overview", sub: "Introduction and quick links" },
        { id: "about", label: "About — Background & Education", sub: "Kumaraguru College of Technology (2025 – 2029) & interests" },
        { id: "projects", label: "Projects — Verified Software & Prototypes", sub: "ReproPack, AdaptEd, Root Cause AI, Penguin ML, Park Pulse, JARVIS Mini" },
        { id: "skills", label: "Skills — Technical Stack", sub: "Used in Projects, Familiar With, Currently Learning, Explored Experimentally" },
        { id: "experience", label: "Experience & Education", sub: "KCT, Intellekt Genie, E-Cell IIT Bombay, LEED, KSI" },
        { id: "contact", label: "Contact & Social Profiles", sub: "Email, GitHub, LinkedIn, and X" },
      ].map((s) => ({
        id: `nav-${s.id}`,
        group: "Navigate" as const,
        title: s.label,
        subtitle: s.sub,
        keywords: `${s.id} ${s.label} ${s.sub} section jump`,
        icon: Compass,
        run: () => scrollToSection(s.id),
      })),

      // Verified Projects
      ...VERIFIED_PROJECTS.map((p) => ({
        id: `prj-${p.id}`,
        group: "Projects" as const,
        title: `${p.name} — ${p.category}`,
        subtitle: p.tagline,
        keywords: `${p.name} ${p.tagline} ${p.technologies.join(" ")}`,
        icon: FolderGit2,
        run: () => {
          scrollToSection("projects");
          emit("project:open", p.id);
        },
      })),

      // Actions
      {
        id: "act-copy-email",
        group: "Actions",
        title: `Copy Email (${PROFILE.email})`,
        subtitle: "Copy email address to clipboard",
        keywords: "copy email mail contact jashanpratul.8b@gmail.com",
        icon: Copy,
        run: () => void copyText(PROFILE.email, "Email copied to clipboard"),
      },
      {
        id: "act-resume",
        group: "Actions",
        title: "Download Plaintext Résumé (resume.txt)",
        subtitle: "Save verified education, internship & project summary",
        keywords: "resume cv download txt",
        icon: Download,
        run: () => downloadText("Jashan_Pratul_Resume.txt", RESUME_TXT),
      },
      {
        id: "act-github",
        group: "Actions",
        title: "Open GitHub (@jashan-pratul)",
        subtitle: PROFILE.links.github,
        keywords: "github repo code open",
        icon: ExternalLink,
        run: () => window.open(PROFILE.links.github, "_blank", "noopener,noreferrer"),
      },
      {
        id: "act-linkedin",
        group: "Actions",
        title: "Open LinkedIn (Jashan Pratul)",
        subtitle: PROFILE.links.linkedin,
        keywords: "linkedin connect profile open",
        icon: ExternalLink,
        run: () => window.open(PROFILE.links.linkedin, "_blank", "noopener,noreferrer"),
      },
      {
        id: "act-x",
        group: "Actions",
        title: "Open X (@JashanPratul)",
        subtitle: PROFILE.links.x,
        keywords: "twitter x social open",
        icon: ExternalLink,
        run: () => window.open(PROFILE.links.x, "_blank", "noopener,noreferrer"),
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return allItems;
    return allItems
      .map((item) => {
        const m = fuzzyMatch(q, `${item.title} ${item.subtitle} ${item.keywords}`);
        return m ? { item, score: m.score } : null;
      })
      .filter((x): x is { item: PaletteItem; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runSelected = (item: PaletteItem | undefined) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-start justify-center bg-black/80 px-4 pt-16 backdrop-blur-md sm:pt-24"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Navigation"
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#120b20]/95 shadow-2xl"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="size-4 text-[#FF79C6]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    runSelected(filtered[activeIndex]);
                  }
                }}
                placeholder="Jump to a section, inspect a project (ReproPack, AdaptEd, Root Cause AI...), or copy email..."
                className="w-full bg-transparent text-xs text-[#F5F0FA] placeholder:text-[#7a6b90] focus:outline-none sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close quick navigation"
                className="rounded-md border border-white/10 bg-[#090611] p-1 text-[#b6a8c9] hover:text-[#F5F0FA]"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="scrollbar-thin max-h-[380px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#b6a8c9]">
                  No matching items for &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <ul role="listbox" aria-label="Navigation suggestions" className="space-y-1">
                  {filtered.map((item, idx) => {
                    const Icon = item.icon;
                    const active = idx === activeIndex;
                    return (
                      <li key={item.id} role="option" aria-selected={active}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => runSelected(item)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                            active
                              ? "border border-[#E84CA8]/40 bg-[#301044]/75 text-[#F5F0FA]"
                              : "border border-transparent text-[#b6a8c9] hover:bg-white/5"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`grid size-8 shrink-0 place-items-center rounded-lg border ${
                                active
                                  ? "border-[#36D9E8]/50 bg-[#36D9E8]/15 text-[#36D9E8]"
                                  : "border-white/10 bg-[#090611] text-[#b6a8c9]"
                              }`}
                            >
                              <Icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-display text-sm font-semibold text-[#F5F0FA]">{item.title}</p>
                              <p className="truncate text-xs text-[#b6a8c9]">{item.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden rounded border border-white/10 bg-[#090611] px-2 py-0.5 font-mono text-[10px] text-[#FF79C6] sm:inline">
                              {item.group}
                            </span>
                            <ArrowRight className={`size-3.5 ${active ? "text-[#36D9E8]" : "text-white/20"}`} />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#090611]/90 px-4 py-2.5 font-mono text-[11px] text-[#b6a8c9]">
              <span className="inline-flex items-center gap-1.5 text-[#36D9E8]">
                <Command className="size-3.5" /> Quick Navigation
              </span>
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
