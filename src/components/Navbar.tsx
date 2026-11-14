import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/profile";
import { useBus } from "../lib/bus";
import { scrollToSection } from "../lib/utils";

export const NAV_ITEMS = [
  { id: "home", index: "00", label: "Home" },
  { id: "about", index: "01", label: "About" },
  { id: "projects", index: "02", label: "Projects" },
  { id: "skills", index: "03", label: "Skills" },
  { id: "experience", index: "04", label: "Experience" },
  { id: "contact", index: "05", label: "Contact" },
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

    const releaseLockOnManualInput = () => {
      programmaticTargetRef.current = null;
      programmaticLockUntilRef.current = 0;
    };

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
    <header className="sticky top-0 z-50 border-b border-[#F2EFE9]/[0.09] bg-[#08080A]/88 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#FF5500] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-bold focus:text-[#08080A]"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        {/* Editorial Brand Identity */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNav("home");
          }}
          className="group flex shrink-0 items-center gap-3.5"
          aria-label="Jashan Pratul — Home"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden border border-[#F2EFE9]/15 bg-[#0E0E12] font-display text-xs font-bold tracking-tight text-[#F2EFE9]">
            <span className="absolute inset-y-0 left-0 w-1 bg-[#FF5500]" />
            <span className="pl-1">JP</span>
          </span>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-display text-sm font-semibold tracking-tight text-[#F2EFE9] transition-colors group-hover:text-[#FF5500]">
              {PROFILE.name}
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6B65] lg:block">
              KCT Coimbatore · CSE &apos;29
            </span>
          </div>
        </a>

        {/* Desktop Navigation — Architectural Editorial Bar */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 md:flex lg:gap-1">
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
                className={`relative flex items-baseline gap-1.5 whitespace-nowrap px-2.5 py-2 text-xs font-medium tracking-wide transition-colors lg:px-3.5 ${
                  isActive ? "text-[#F2EFE9]" : "text-[#A6A29A] hover:text-[#F2EFE9]"
                }`}
              >
                <span
                  className={`hidden font-mono text-[10px] tabular-nums transition-colors lg:inline ${
                    isActive ? "text-[#FF5500]" : "text-[#6E6B65]"
                  }`}
                >
                  {item.index}
                </span>
                <span className="font-display text-[13px]">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="editorial-nav-indicator"
                    className="absolute inset-x-2.5 bottom-0 h-[2px] bg-[#FF5500] lg:inset-x-3"
                    transition={{ type: "spring", stiffness: 440, damping: 36 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Mobile Menu Trigger (Hidden on Desktop) */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center border border-[#F2EFE9]/15 bg-[#0E0E12] text-[#F2EFE9] md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[#F2EFE9]/10 bg-[#08080A]/98 backdrop-blur-2xl md:hidden"
          >
            <div className="divide-y divide-[#F2EFE9]/[0.07] px-4 py-2">
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
                    className={`flex items-center justify-between py-3.5 text-sm font-medium transition-colors ${
                      isActive ? "text-[#F2EFE9]" : "text-[#A6A29A] hover:text-[#F2EFE9]"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs tabular-nums text-[#FF5500]">{item.index}</span>
                      <span className="font-display text-base">{item.label}</span>
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#FF5500]">
                      {isActive ? "Active" : "→"}
                    </span>
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
