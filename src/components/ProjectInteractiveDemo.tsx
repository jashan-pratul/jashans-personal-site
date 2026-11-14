import { motion } from "framer-motion";
import { Activity, Cpu, Play } from "lucide-react";
import { useMemo, useState } from "react";
import type { VerifiedProject } from "../data/profile";

function scrubPayload(raw: string): { scrubbed: string; redactions: number } {
  let count = 0;
  const scrubbed = raw
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, () => {
      count += 1;
      return "Bearer [REDACTED_TOKEN]";
    })
    .replace(/\bsk_[a-z0-9_]{8,}\b/gi, () => {
      count += 1;
      return "[REDACTED_API_KEY]";
    })
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, () => {
      count += 1;
      return "[REDACTED_EMAIL]";
    });
  return { scrubbed, redactions: count };
}

function ReproPackDemo() {
  const presets = [
    {
      label: "Auth Header Event",
      raw: 'POST /api/session 401 — Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user_token',
    },
    {
      label: "PII + Key in Error",
      raw: 'CheckoutError: failed for student@kct.ac.in using key sk_live_98f72b10c4a8d21e',
    },
    {
      label: "Uncaught TypeError",
      raw: "TypeError: Cannot read properties of undefined (reading 'slotId') at bundle.js:142",
    },
  ];
  const [input, setInput] = useState(presets[0].raw);
  const { scrubbed, redactions } = useMemo(() => scrubPayload(input), [input]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#36D9E8]">
          Interactive Demo · Regex Scrubber &amp; Ring Buffer
        </span>
        <span className="rounded border border-[#36D9E8]/35 bg-[#36D9E8]/10 px-2 py-0.5 font-mono text-[10px] text-[#36D9E8]">
          {redactions} sensitive pattern{redactions === 1 ? "" : "s"} scrubbed
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setInput(p.raw)}
            className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
              input === p.raw
                ? "border-[#36D9E8] bg-[#36D9E8]/20 text-[#F5F0FA]"
                : "border-white/10 bg-[#120b20] text-[#b6a8c9] hover:border-white/25 hover:text-[#F5F0FA]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Test diagnostic event string for ReproPack scrubbing"
        className="w-full rounded-lg border border-white/15 bg-[#120b20] px-2.5 py-1.5 font-mono text-[11px] text-[#F5F0FA] focus:border-[#36D9E8] focus:outline-none"
      />

      <div className="rounded-lg border border-white/10 bg-[#07040d] p-2.5 font-mono text-[11px]">
        <div className="flex items-center justify-between text-[10px] text-[#b6a8c9]">
          <span>chrome.storage.session · Ring Buffer (max 1,000)</span>
          <span className="text-[#FF79C6]">TTL: 24h</span>
        </div>
        <p className="mt-1.5 break-all text-[#36D9E8]">{scrubbed}</p>
      </div>
    </div>
  );
}

function AdaptEdDemo() {
  const scenarios = [
    {
      id: "bsearch",
      label: "Case 1: Binary Search Boundary",
      answer: "while (low < high) { mid = (low + high) / 2; if (arr[mid] < target) low = mid; }",
      steps: [
        {
          stage: "1. Error Classification",
          detail: "Infinite loop risk when low + 1 == high and target > arr[mid] (low = mid never advances).",
        },
        {
          stage: "2. Misconception Diagnosis",
          detail: "Learner treats inclusive [low, high] bounds as half-open without excluding the tested midpoint.",
        },
        {
          stage: "3. Pedagogical Strategy",
          detail: "Trace a 2-element array [4, 9] searching for 9 step-by-step to expose why low = mid + 1 is needed.",
        },
        {
          stage: "4. Reassessment Prompt",
          detail: "If low = 0, high = 1, and mid = 0, what happens on the next iteration if we set low = mid?",
        },
      ],
    },
    {
      id: "pydef",
      label: "Case 2: Python Mutable Default",
      answer: "def add_item(x, items=[]): items.append(x); return items",
      steps: [
        {
          stage: "1. Error Classification",
          detail: "State persistence bug across function calls due to shared default list reference.",
        },
        {
          stage: "2. Misconception Diagnosis",
          detail: "Assumes default parameter expressions are re-evaluated on every call rather-than at def time.",
        },
        {
          stage: "3. Pedagogical Strategy",
          detail: "Contrast function definition binding vs. runtime execution using id(items) across two calls.",
        },
        {
          stage: "4. Reassessment Prompt",
          detail: "How can you use None as a sentinel default so each caller gets a fresh list?",
        },
      ],
    },
  ];

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const active = scenarios[scenarioIdx];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#E84CA8]">
          Interactive Demo · Structured Pedagogical Loop (Zod Schema)
        </span>
        <div className="flex gap-1.5">
          {scenarios.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScenarioIdx(idx);
                setStepIdx(0);
              }}
              className={`rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                scenarioIdx === idx
                  ? "border-[#E84CA8] bg-[#E84CA8]/20 text-[#F5F0FA]"
                  : "border-white/10 bg-[#120b20] text-[#b6a8c9]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#07040d] px-2.5 py-1.5 font-mono text-[11px] text-[#b6a8c9]">
        <span className="text-[#FF79C6]">Learner Input: </span>
        <code className="text-[#F5F0FA]">{active.answer}</code>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {active.steps.map((s, i) => (
          <button
            key={s.stage}
            type="button"
            onClick={() => setStepIdx(i)}
            className={`rounded-lg border p-2 text-left font-mono text-[10px] transition-colors ${
              stepIdx === i
                ? "border-[#E84CA8] bg-[#301044]/70 text-[#F5F0FA]"
                : "border-white/10 bg-[#120b20]/80 text-[#b6a8c9] hover:border-white/25"
            }`}
          >
            {s.stage}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#E84CA8]/30 bg-[#120b20]/90 p-2.5 text-xs text-[#F5F0FA]">
        <span className="font-mono text-[10px] uppercase text-[#FF79C6]">{active.steps[stepIdx].stage}: </span>
        {active.steps[stepIdx].detail}
      </div>
    </div>
  );
}

function RootCauseAiDemo() {
  const nodes = [
    {
      id: "db",
      name: "postgres-primary",
      time: "14:02:11.040Z",
      errors: 14,
      impacted: ["auth-service", "checkout-api", "api-gateway"],
      reason: "Earliest fatal connection pool exhaustion (14:02:11.040Z); upstream of 3 dependent services.",
    },
    {
      id: "auth",
      name: "auth-service",
      time: "14:02:11.420Z",
      errors: 9,
      impacted: ["checkout-api", "api-gateway"],
      reason: "Earliest error at +380ms; reverse graph walk shows 2 downstream callers affected.",
    },
    {
      id: "checkout",
      name: "checkout-api",
      time: "14:02:12.110Z",
      errors: 6,
      impacted: ["api-gateway"],
      reason: "Downstream timeout cascade (+1,070ms); only impacts api-gateway.",
    },
  ];
  const [faultIdx, setFaultIdx] = useState(0);
  const current = nodes[faultIdx];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#8B35D5]">
          Interactive Demo · Deterministic Graph Ranker (FastAPI + NetworkX)
        </span>
        <span className="font-mono text-[10px] text-[#b6a8c9]">Click origin fault node:</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {nodes.map((n, idx) => {
          const isRoot = idx === faultIdx;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setFaultIdx(idx)}
              className={`rounded-lg border p-2 text-left font-mono transition-colors ${
                isRoot
                  ? "border-[#FFAD57] bg-[#FFAD57]/15 text-[#F5F0FA]"
                  : "border-white/10 bg-[#120b20] text-[#b6a8c9] hover:border-white/25"
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={isRoot ? "font-bold text-[#FFAD57]" : "text-[#36D9E8]"}>
                  {isRoot ? "ROOT CANDIDATE" : "DEPENDENT"}
                </span>
                <span>{n.errors} err</span>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold text-[#F5F0FA]">{n.name}</p>
              <p className="text-[10px] text-[#b6a8c9]">{n.time}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-white/10 bg-[#07040d] p-2.5 font-mono text-[11px]">
        <p className="text-[#36D9E8]">
          Reverse-Graph Blast Radius:{" "}
          <span className="text-[#F5F0FA]">{[current.name, ...current.impacted].join(" → ")}</span>
        </p>
        <p className="mt-1 text-[11px] text-[#b6a8c9]">{current.reason}</p>
      </div>
    </div>
  );
}

function PenguinMlDemo() {
  const [culmenLength, setCulmenLength] = useState(46.5);
  const [flipperLength, setFlipperLength] = useState(214);

  const prediction = useMemo(() => {
    if (flipperLength >= 207) {
      return {
        species: "Gentoo",
        island: "Biscoe",
        note: "Longer flipper length (>= 207 mm) strongly separates Gentoo in Palmer Penguins EDA.",
        color: "#36D9E8",
      };
    }
    if (culmenLength >= 45.5) {
      return {
        species: "Chinstrap",
        island: "Dream",
        note: "Shorter flippers (< 207 mm) combined with longer culmen (>= 45.5 mm) classifies as Chinstrap.",
        color: "#FF79C6",
      };
    }
    return {
      species: "Adelie",
      island: "Torgersen / Biscoe",
      note: "Shorter culmen (< 45.5 mm) and compact flipper (< 207 mm) classifies as Adelie.",
      color: "#FFAD57",
    };
  }, [culmenLength, flipperLength]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#FFAD57]">
          Interactive Demo · Palmer Penguins Feature Classifier
        </span>
        <span
          className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold"
          style={{ borderColor: `${prediction.color}55`, color: prediction.color }}
        >
          Predicted: {prediction.species}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block rounded-lg border border-white/10 bg-[#120b20] p-2 font-mono text-[11px]">
          <div className="flex justify-between text-[#b6a8c9]">
            <span>Culmen Length</span>
            <span className="text-[#F5F0FA]">{culmenLength.toFixed(1)} mm</span>
          </div>
          <input
            type="range"
            min={35}
            max={56}
            step={0.5}
            value={culmenLength}
            onChange={(e) => setCulmenLength(Number(e.target.value))}
            className="mt-1.5 w-full accent-[#FFAD57]"
          />
        </label>

        <label className="block rounded-lg border border-white/10 bg-[#120b20] p-2 font-mono text-[11px]">
          <div className="flex justify-between text-[#b6a8c9]">
            <span>Flipper Length</span>
            <span className="text-[#F5F0FA]">{flipperLength} mm</span>
          </div>
          <input
            type="range"
            min={178}
            max={228}
            step={1}
            value={flipperLength}
            onChange={(e) => setFlipperLength(Number(e.target.value))}
            className="mt-1.5 w-full accent-[#36D9E8]"
          />
        </label>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#07040d] p-2.5 font-mono text-[11px] text-[#b6a8c9]">
        {prediction.note}
      </div>
    </div>
  );
}

function ParkPulseDemo() {
  const [distanceCm, setDistanceCm] = useState(42);
  const occupied = distanceCm < 100;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#FF79C6]">
          Interactive Demo · KCT-A1 Ultrasonic Sensor (HC-SR04 → Express API)
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${
            occupied
              ? "border-[#FFAD57]/50 bg-[#FFAD57]/15 text-[#FFAD57]"
              : "border-[#36D9E8]/50 bg-[#36D9E8]/15 text-[#36D9E8]"
          }`}
        >
          Slot KCT-A1: {occupied ? "OCCUPIED (< 100 cm)" : "AVAILABLE (>= 100 cm)"}
        </span>
      </div>

      <label className="block rounded-lg border border-white/10 bg-[#120b20] p-2.5 font-mono text-[11px]">
        <div className="flex justify-between text-[#b6a8c9]">
          <span>Simulated HC-SR04 Ultrasonic Distance</span>
          <span className="text-[#F5F0FA]">{distanceCm} cm</span>
        </div>
        <input
          type="range"
          min={10}
          max={180}
          step={2}
          value={distanceCm}
          onChange={(e) => setDistanceCm(Number(e.target.value))}
          className="mt-1.5 w-full accent-[#FF79C6]"
        />
      </label>

      <div className="rounded-lg border border-white/10 bg-[#07040d] p-2.5 font-mono text-[11px] text-[#36D9E8]">
        {`PATCH /api/slots/hardware/KCT-SENSOR-01/availability → { "slotId": "KCT-A1", "distanceCm": ${distanceCm}, "sensorBlocked": ${occupied}, "isAvailable": ${!occupied} }`}
      </div>
    </div>
  );
}

function JarvisMiniDemo() {
  const commands = [
    {
      cmd: "Calculate 24 * 18 + 64",
      route: "Local Math Parser (0ms API latency)",
      output: "Result: 496 (computed locally without calling Gemini API)",
    },
    {
      cmd: "Remember: Submit CSE data structures lab by Friday",
      route: "Express 5 + better-sqlite3 Local Store",
      output: "Saved note #14 to local SQLite memory table.",
    },
    {
      cmd: "Explain recursion base cases in two sentences",
      route: "Gemini 2.5 Flash SSE Stream",
      output: "A base case stops recursive calls when the problem reaches its smallest solvable unit...",
    },
  ];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = commands[selectedIdx];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[#36D9E8]">
          Interactive Demo · Intent Router &amp; Reactor HUD
        </span>
        <span className="rounded border border-[#36D9E8]/35 bg-[#36D9E8]/10 px-2 py-0.5 font-mono text-[10px] text-[#36D9E8]">
          {current.route}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {commands.map((c, idx) => (
          <button
            key={c.cmd}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
              selectedIdx === idx
                ? "border-[#36D9E8] bg-[#36D9E8]/20 text-[#F5F0FA]"
                : "border-white/10 bg-[#120b20] text-[#b6a8c9]"
            }`}
          >
            {c.cmd}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#07040d] p-2.5 font-mono text-[11px]">
        <motion.div
          key={selectedIdx}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-[#36D9E8]/60 bg-[#36D9E8]/15 text-[#36D9E8]"
        >
          <Activity className="size-4" />
        </motion.div>
        <div className="min-w-0">
          <p className="truncate text-[10px] text-[#FF79C6]">&gt; {current.cmd}</p>
          <p className="mt-0.5 text-[#F5F0FA]">{current.output}</p>
        </div>
      </div>
    </div>
  );
}

export function ProjectInteractiveDemo({ project }: { project: VerifiedProject }) {
  const [mode, setMode] = useState<"flow" | "demo">("demo");

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#090611]/92 p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${project.accent}38, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode("demo")}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
              mode === "demo"
                ? "bg-[#E84CA8]/25 text-[#F5F0FA] border border-[#E84CA8]/50"
                : "text-[#b6a8c9] hover:text-[#F5F0FA]"
            }`}
          >
            <Play className="size-3 text-[#36D9E8]" />
            <span>Interactive Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("flow")}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
              mode === "flow"
                ? "bg-[#36D9E8]/20 text-[#F5F0FA] border border-[#36D9E8]/50"
                : "text-[#b6a8c9] hover:text-[#F5F0FA]"
            }`}
          >
            <Cpu className="size-3 text-[#FF79C6]" />
            <span>4-Step Architecture Flow</span>
          </button>
        </div>

        <span className="font-mono text-[10px] text-[#b6a8c9]">{project.category}</span>
      </div>

      <div className="relative z-10">
        {mode === "flow" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {project.flow.map((step, i) => (
              <div
                key={step}
                className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#120b20]/90 p-2.5"
              >
                <span className="font-mono text-[10px]" style={{ color: project.accent }}>
                  Step {i + 1}
                </span>
                <span className="mt-1 font-mono text-[11px] leading-snug text-[#F5F0FA]">{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {project.id === "repropack" && <ReproPackDemo />}
            {project.id === "adapted" && <AdaptEdDemo />}
            {project.id === "rootcause-ai" && <RootCauseAiDemo />}
            {project.id === "penguin-ml" && <PenguinMlDemo />}
            {project.id === "park-pulse" && <ParkPulseDemo />}
            {project.id === "jarvis-mini" && <JarvisMiniDemo />}
          </>
        )}
      </div>
    </div>
  );
}
