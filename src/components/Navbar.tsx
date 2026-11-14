import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/profile";
import { useBus } from "../lib/bus";
import { scrollToSection } from "../lib/utils";

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];
const VALID_IDS = new Set<string>(NAV_ITEMS.map((item) => item.id));

export function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSectionRef = useRef<string>("home");
  const programmaticTargetRef = useRef<string | null>(null);
  const programmaticLockUntilRef = useRef<number>(0);

  const updateActiveSection = (nextId: string) => {
    if (!VALID_IDS.has(nextId)) return;
    if (activeSectionRef.current !== nextId) {
      activeSectionRef.current = nextId;
      setActiveSection(nextId);
    }
  };

  // Listen for programmatic navigation events from anywhere in the app
  useBus("nav:select", (targetId) => {
    if (!VALID_IDS.has(targetId)) return;
    programmaticTargetRef.current = targetId;
    programmaticLockUntilRef.current = performance.now() + 850;
    updateActiveSection(targetId);
  });

  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id);

    const computeActiveSection = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      // Respect short lock window during programmatic smooth scroll until target reached
      const now = performance.now();
      if (programmaticTargetRef.current && now < programmaticLockUntilRef.current) {
        const targetEl = document.getElementById(programmaticTargetRef.current);
        if (targetEl) {
          const targetTop =
            programmaticTargetRef.current === "home"
              ? 0
              : Math.max(0, targetEl.getBoundingClientRect().top + scrollY - 72);
          if (Math.abs(scrollY - targetTop) <= 28) {
            programmaticTargetRef.current = null;
            programmaticLockUntilRef.current = 0;
          } else {
            return;
          }
        }
      } else {
        programmaticTargetRef.current = null;
      }

      // Deterministic active section resolution across arbitrary section heights
      if (scrollY <= 40) {
        updateActiveSection("home");
        return;
      }
      if (winHeight + scrollY >= docHeight - 36) {
        updateActiveSection("contact");
        return;
      }

      const probeY = Math.max(96, winHeight * 0.28);
      let candidate = "home";

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          candidate = id;
          break;
        }
        if (rect.top <= probeY) {
          candidate = id;
        }
      }

      updateActiveSection(candidate);
    };

    let rafTicking = false;
    const onScrollOrResize = () => {
      if (!rafTicking) {
        rafTicking = true;
        window.requestAnimationFrame(() => {
          rafTicking = false;
          computeActiveSection();
        });
      }
    };

    // Release programmatic lock immediately if user manually scrolls with wheel/touch
    const releaseLockOnManualInput = () => {
      programmaticTargetRef.current = null;
      programmaticLockUntilRef.current = 0;
    };

    // IntersectionObserver as secondary trigger when section boundaries cross the reading zone
    const observer = new IntersectionObserver(
      () => {
        onScrollOrResize();
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.1, 0.5] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Handle initial hash & browser back/forward navigation
    const handleHashOrPopState = () => {
      const hashId = window.location.hash.replace(/^#/, "");
      if (hashId && VALID_IDS.has(hashId)) {
        scrollToSection(hashId, { pushHistory: false });
      } else if (!window.location.hash) {
        scrollToSection("home", { pushHistory: false });
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    window.addEventListener("wheel", releaseLockOnManualInput, { passive: true });
    window.addEventListener("touchmove", releaseLockOnManualInput, { passive: true });
    window.addEventListener("popstate", handleHashOrPopState);
    window.addEventListener("hashchange", handleHashOrPopState);

    // Sync initial state on mount
    const initialHash = window.location.hash.replace(/^#/, "");
    if (initialHash && VALID_IDS.has(initialHash)) {
      window.setTimeout(() => scrollToSection(initialHash, { pushHistory: false }), 20);
    } else {
      computeActiveSection();
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("wheel", releaseLockOnManualInput);
      window.removeEventListener("touchmove", releaseLockOnManualInput);
      window.removeEventListener("popstate", handleHashOrPopState);
      window.removeEventListener("hashchange", handleHashOrPopState);
    };
  }, []);

  const handleNav = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id, { pushHistory: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07050e]/85 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#36D9E8] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-bold focus:text-[#07050e]"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNav("home");
          }}
          className="group flex shrink-0 items-center gap-3"
          aria-label="Jashan Pratul — Home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#E84CA8]/40 bg-gradient-to-br from-[#280d3b] to-[#07050e] font-display text-xs font-bold text-[#F5F0FA] shadow-[0_0_16px_-4px_rgba(232,76,168,0.4)]">
            JP
          </span>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-display text-sm font-semibold tracking-tight text-[#F5F0FA] transition-colors group-hover:text-[#FF79C6]">
              {PROFILE.name}
            </span>
            <span className="hidden font-mono text-[11px] text-[#b6a8c9] sm:block">
              BE CSE · KCT Coimbatore
            </span>
          </div>
        </a>

        {/* Desktop Navigation — Minimal, Balanced Pill Capsule */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-[#110a1f]/75 p-1 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.id);
                }}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "text-[#F5F0FA]" : "text-[#b6a8c9] hover:text-[#F5F0FA]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-[#E84CA8]/45 bg-gradient-to-r from-[#8B35D5]/30 via-[#E84CA8]/20 to-[#36D9E8]/20"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile Menu Button (Hidden on Desktop so no empty space remains) */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 bg-[#120b20] text-[#F5F0FA] md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#07050e]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.id);
                    }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "border border-[#E84CA8]/40 bg-[#301044]/50 text-[#F5F0FA]"
                        : "text-[#b6a8c9] hover:bg-[#301044]/30 hover:text-[#F5F0FA]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs text-[#36D9E8]">{isActive ? "Active" : "→"}</span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
