import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PERSONAS, PERSONAS_ORDER, type Persona, type PersonaConfig } from "../data/profile";

interface PersonaCtx {
  persona: Persona;
  config: PersonaConfig;
  setPersona: (p: Persona) => void;
}

const Ctx = createContext<PersonaCtx | null>(null);
const STORAGE_KEY = "jp:persona";

const isPersona = (v: unknown): v is Persona => typeof v === "string" && (PERSONAS_ORDER as string[]).includes(v);

/** URL (?as=founder) wins so links can be shared per audience; then localStorage; then recruiter. */
function initialPersona(): Persona {
  if (typeof window === "undefined") return "recruiter";
  const fromUrl = new URLSearchParams(window.location.search).get("as");
  if (isPersona(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isPersona(stored)) return stored;
  } catch {
    /* storage may be blocked (Safari private mode) */
  }
  return "recruiter";
}

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(initialPersona);

  const setPersona = useCallback((p: Persona) => setPersonaState(p), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, persona);
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("as", persona);
    window.history.replaceState(null, "", url);
    document.documentElement.style.setProperty("--spot", PERSONAS[persona].accent);
  }, [persona]);

  const value = useMemo(() => ({ persona, config: PERSONAS[persona], setPersona }), [persona, setPersona]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePersona(): PersonaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePersona must be used inside <PersonaProvider>");
  return ctx;
}
