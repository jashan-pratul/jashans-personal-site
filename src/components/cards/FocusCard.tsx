import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Download, FileText, GraduationCap, Rocket, ShieldCheck, Trophy, Workflow, Zap } from "lucide-react";
import { usePersona } from "../../context/persona";
import { EXPERIENCE, PROFILE, RESUME_TXT } from "../../data/profile";
import { emit } from "../../lib/bus";
import { usePerf } from "../../lib/perf";
import { downloadText, scrollToSection } from "../../lib/utils";
import { CardHeader } from "../ui/SpotlightCard";

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

function RecruiterFocus() {
  const items = [
    { icon: <Zap className="size-3.5 text-em" />, title: `${EXPERIENCE[0].role} · ${EXPERIENCE[0].org}`, body: EXPERIENCE[0].detail },
    { icon: <GraduationCap className="size-3.5 text-ind" />, title: "Kumaraguru College of Technology", body: "B.E. Computer Science Engineering (September 2025 – September 2029)." },
    { icon: <Trophy className="size-3.5 text-amber" />, title: "Data Structures & Algorithms", body: "Practicing problem solving with arrays, linked lists, trees, and graphs." },
    { icon: <ShieldCheck className="size-3.5 text-sky-400" />, title: "Engineering Habits", body: "Typed schemas, input validation, deterministic baselines, and automated tests." },
  ];
  return (
    <motion.div {...fade} className="flex h-full flex-col">
      <ol className="relative mt-5 space-y-4 border-l border-line pl-5">
        {items.map((it) => (
          <li key={it.title} className="relative">
            <span className="absolute -left-[29px] top-0 grid size-[18px] place-items-center rounded-full border border-line bg-surface-2">
              {it.icon}
            </span>
            <p className="text-sm font-medium text-ink">{it.title}</p>
            <p className="text-[13px] leading-relaxed text-muted">{it.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          onClick={() => emit("resume:open")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-em px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <FileText className="size-4" /> ATS Summary
        </button>
        <button
          onClick={() => downloadText("G_Jashan_Pratul_Resume.txt", RESUME_TXT)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:border-line-strong"
        >
          <Download className="size-4" /> resume.txt
        </button>
      </div>
    </motion.div>
  );
}

function FounderFocus() {
  const pipeline = [
    { t: "Day 0", s: "Scope the riskiest assumption" },
    { t: "Day 1–2", s: "Clickable prototype → real users" },
    { t: "Day 3", s: "Next.js + Atlas MVP live on Vercel" },
    { t: "Week 1", s: "n8n + LLM automations remove ops toil" },
    { t: "Weekly", s: "Ship, measure, iterate" },
  ];
  return (
    <motion.div {...fade} className="flex h-full flex-col">
      <ol className="mt-5 space-y-2">
        {pipeline.map((p, i) => (
          <motion.li
            key={p.t}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/60 px-3 py-2"
          >
            <span className="w-14 shrink-0 font-mono text-[11px] text-ind">{p.t}</span>
            <span className="text-[13px] text-ink/90">{p.s}</span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        {["E-Cell · IIT Bombay", "LEED · Kumaraguru"].map((e) => (
          <span key={e} className="inline-flex items-center gap-1.5 rounded-md border border-ind/30 bg-ind/10 px-2 py-1 font-mono text-[11px] text-indigo-300">
            <Rocket className="size-3" /> {e}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink/80">
          <Workflow className="size-3" /> Gemini API · FastAPI
        </span>
      </div>
      <div className="mt-auto pt-5">
        <a
          href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("Project collaboration")}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ind px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Get in touch <ArrowRight className="size-4" />
        </a>
      </div>
    </motion.div>
  );
}

function EngineerFocus() {
  const perf = usePerf();
  const rows: [string, string][] = [
    ["runtime", "React 19 · TypeScript strict"],
    ["bundler", "Vite · code-split vendor chunks"],
    ["motion", "Framer Motion · transform/opacity only"],
    ["state", "React state + typed event bus"],
    ["data", "GitHub REST + Codeforces API · 10m cache"],
    ["sizeof(Node)", "16 B (4 val + 4 pad + 8 ptr)"],
    ["hydrated", perf.hydrated != null ? `${perf.hydrated} ms after nav start` : "measuring…"],
    ["FCP", perf.fcp != null ? `${perf.fcp} ms` : "measuring…"],
  ];
  return (
    <motion.div {...fade} className="flex h-full flex-col">
      <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line font-mono text-[12px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr] gap-3 bg-surface-2/40 px-3 py-2">
            <dt className="text-faint">{k}</dt>
            <dd className="truncate text-ink/90">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          onClick={() => {
            scrollToSection("visualizer");
            emit("ll:reverse");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-3 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          Reverse a list
        </button>
        <button
          onClick={() => {
            scrollToSection("sandbox");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:border-line-strong"
        >
          Model latency
        </button>
      </div>
    </motion.div>
  );
}

const TITLES = {
  recruiter: { title: "Experience & Fundamentals", sub: "what you'd verify in a screen" },
  founder: { title: "Shipping Velocity", sub: "0 → 1 playbook" },
  engineer: { title: "Low-Level Specs", sub: "this page, measured live" },
};

export function FocusCard() {
  const { persona } = usePersona();
  const Icon = persona === "recruiter" ? GraduationCap : persona === "founder" ? Rocket : Zap;
  return (
    <div className="flex h-full flex-col p-6">
      <CardHeader icon={<Icon className="size-4" />} title={TITLES[persona].title} subtitle={TITLES[persona].sub} />
      <div className="flex flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {persona === "recruiter" && <RecruiterFocus key="r" />}
          {persona === "founder" && <FounderFocus key="f" />}
          {persona === "engineer" && <EngineerFocus key="e" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
