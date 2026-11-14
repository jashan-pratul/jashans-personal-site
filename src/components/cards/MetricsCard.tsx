import { LayoutGroup, motion } from "framer-motion";
import { usePersona } from "../../context/persona";
import type { MetricId } from "../../data/profile";
import { usePerf } from "../../lib/perf";
import { useTelemetry } from "../../lib/telemetry";

interface Metric {
  label: string;
  value: string;
  sub: string;
  live?: boolean;
  loading?: boolean;
}

export function MetricsCard() {
  const { config } = usePersona();
  const t = useTelemetry();
  const perf = usePerf();
  const gh = t.github.data;
  const cf = t.codeforces.data;

  const metrics: Record<MetricId, Metric> = {
    cf: {
      label: "Codeforces",
      value: cf?.rating != null ? String(cf.rating) : cf ? `${cf.solved}` : "DSA",
      sub: cf ? (cf.rating != null ? `${cf.rank ?? "rated"} · ${cf.solved} solved` : "problems solved") : "competitive programming",
      live: t.codeforces.state === "live",
      loading: t.codeforces.state === "loading",
    },
    gh: {
      label: "GitHub",
      value: gh ? String(gh.publicRepos) : "OSS",
      sub: gh ? `public repos · ${gh.events30d} events/30d` : `@jashan-pratul`,
      live: t.github.state === "live",
      loading: t.github.state === "loading",
    },
    cs50: { label: "Education", value: "KCT", sub: "B.E. CSE ('25–'29)" },
    intern: { label: "Internship", value: "Intellekt", sub: "Web Dev Intern" },
    esummit: { label: "Campus", value: "E-Cell", sub: "IIT Bombay · LEED KCT" },
    ship: { label: "Projects", value: "6", sub: "verified repositories" },
    auto: { label: "AI Tools", value: "Gemini", sub: "structured JSON + FastAPI" },
    sec: { label: "Extension", value: "MV3", sub: "Chrome Web Store" },
    perf: {
      label: "This page",
      value: perf.hydrated != null ? `${perf.hydrated}ms` : "…",
      sub: "measured to interactive",
      live: perf.hydrated != null,
    },
    deploy: { label: "Deploy stack", value: "Vercel", sub: "+ MongoDB Atlas" },
  };

  return (
    <div className="p-4 sm:p-5">
      <LayoutGroup id="metrics">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {config.metricOrder.map((id, i) => {
            const m = metrics[id];
            const top = i < 5;
            return (
              <motion.li
                layout
                key={id}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className={`relative overflow-hidden rounded-xl border px-3.5 py-3 ${
                  top ? "border-line-strong bg-surface-2" : "border-line bg-surface-2/40"
                }`}
              >
                {top && i === 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }}
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-wider text-faint">{m.label}</span>
                  {m.live && (
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase text-em">
                      <span className="size-1.5 rounded-full bg-em" /> live
                    </span>
                  )}
                </div>
                {m.loading ? (
                  <div className="shimmer mt-2 h-7 w-16 rounded-md" />
                ) : (
                  <motion.p layout="position" className={`mt-1 font-mono text-2xl font-semibold tracking-tight ${top ? "text-white" : "text-ink/70"}`}>
                    {m.value}
                  </motion.p>
                )}
                <p className="truncate text-[12px] text-muted">{m.sub}</p>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </div>
  );
}
