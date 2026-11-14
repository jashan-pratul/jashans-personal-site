import { motion } from "framer-motion";
import { Briefcase, Cpu, Rocket } from "lucide-react";
import { useEffect } from "react";
import { usePersona } from "../context/persona";
import { PERSONAS, PERSONAS_ORDER, PROFILE, type Persona } from "../data/profile";
import { isTypingTarget } from "../lib/utils";

export const PERSONA_ICON: Record<Persona, typeof Briefcase> = {
  recruiter: Briefcase,
  founder: Rocket,
  engineer: Cpu,
};

export function Header() {
  const { persona, setPersona } = usePersona();

  // 1 / 2 / 3 switch personas when the user isn't typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const idx = ["1", "2", "3"].indexOf(e.key);
      if (idx !== -1) setPersona(PERSONAS_ORDER[idx]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPersona]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4">
        <a href="#hero" className="group flex items-center gap-2.5" aria-label={`${PROFILE.name} — home`}>
          <span className="relative grid size-8 place-items-center rounded-lg border border-line bg-surface font-mono text-[13px] font-bold">
            jp
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-em shadow-[0_0_8px_#10B981]" />
          </span>
          <span className="hidden font-mono text-sm text-muted transition-colors group-hover:text-ink md:block">
            {PROFILE.handle}
          </span>
        </a>

        <nav aria-label="Audience persona" className="flex flex-1 justify-center">
          <div role="radiogroup" className="relative flex rounded-full border border-line bg-surface p-1 shadow-inner shadow-black/40">
            {PERSONAS_ORDER.map((p, i) => {
              const Icon = PERSONA_ICON[p];
              const active = p === persona;
              return (
                <button
                  key={p}
                  role="radio"
                  aria-checked={active}
                  aria-label={`${PERSONAS[p].label} mode`}
                  onClick={() => setPersona(p)}
                  title={`${PERSONAS[p].label} mode (${i + 1})`}
                  className={`relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-[13px] ${
                    active ? "text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="persona-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-white/10"
                      style={{
                        background: `linear-gradient(135deg, ${PERSONAS[p].accent}40, ${PERSONAS[p].accent}14)`,
                        boxShadow: `0 0 24px -6px ${PERSONAS[p].accent}`,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon className="size-3.5" style={{ color: active ? PERSONAS[p].accent : undefined }} />
                  <span className={active ? "inline" : "hidden sm:inline"}>{PERSONAS[p].label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
