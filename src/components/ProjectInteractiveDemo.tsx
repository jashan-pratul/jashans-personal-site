import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { Code2, Eye, FileCode2, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import type { VerifiedProject } from "../data/profile";
import { EASE_OUT, REVEAL_VIEWPORT } from "../lib/motion";

/* ============================================================================
 * 01. ReproPack — Genuine Client-Side Regex Redaction & Session Buffer Schema
 * ========================================================================== */
function scrubReproPackEvent(raw: string): {
  scrubbed: string;
  redactions: string[];
} {
  const redactions: string[] = [];
  const scrubbed = raw
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, () => {
      redactions.push("Bearer JWT/Token");
      return "Bearer [REDACTED_TOKEN]";
    })
    .replace(/\bsk_[a-z0-9_]{8,}\b/gi, () => {
      redactions.push("Secret API Key (sk_*)");
      return "[REDACTED_API_KEY]";
    })
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, () => {
      redactions.push("Email Address (PII)");
      return "[REDACTED_EMAIL]";
    })
    .replace(/([?&](?:token|password|secret|api_key)=)[^&\s"']+/gi, (_match, prefix: string) => {
      redactions.push(`Query Param (${prefix.replace(/[?&=]/g, "")})`);
      return `${prefix}[REDACTED]`;
    });

  return { scrubbed, redactions };
}

function ReproPackXRay() {
  const samples = [
    {
      label: "401 Auth Failure + Query Token",
      severity: "ERROR",
      source: "auth-client.ts:84",
      raw: "POST /api/session?token=eyJhbGciOiJIUzI1NiJ9 401 — Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload",
    },
    {
      label: "Checkout Exception (PII + API Key)",
      severity: "ERROR",
      source: "checkout-worker.ts:142",
      raw: "PaymentError: charge failed for jashanpratul.8b@gmail.com using key sk_live_98f72b10c4a8d21e",
    },
    {
      label: "Service Worker Checkpoint",
      severity: "INFO",
      source: "background/service-worker.ts:56",
      raw: "Flushed ring buffer checkpoint (4 events, FIFO max 1000, TTL 24h) to chrome.storage.session",
    },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customInput, setCustomInput] = useState(samples[0].raw);

  const activeSample = samples[selectedIdx];
  const { scrubbed, redactions } = useMemo(() => scrubReproPackEvent(customInput), [customInput]);

  const sessionRecordJson = useMemo(
    () =>
      JSON.stringify(
        {
          id: `evt_0${selectedIdx + 1}_repropack`,
          severity: activeSample.severity,
          source: activeSample.source,
          storage: "chrome.storage.session",
          ringBufferCapacity: "1000 (FIFO, 24h TTL)",
          redactionsApplied: redactions.length,
          message: scrubbed,
        },
        null,
        2,
      ),
    [activeSample, redactions.length, scrubbed, selectedIdx],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#FF5500]">
          Try the redaction
        </span>
        <span className="border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[10px] text-[#10B981]">
          {redactions.length} item{redactions.length === 1 ? "" : "s"} redacted
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {samples.map((s, idx) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setSelectedIdx(idx);
              setCustomInput(s.raw);
            }}
            className={`border px-2.5 py-1 font-mono text-[10px] transition-colors ${
              selectedIdx === idx && customInput === s.raw
                ? "border-[#FF5500] bg-[#FF5500]/15 text-[#F2EFE9]"
                : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30 hover:text-[#F2EFE9]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="repropack-raw-input"
          className="block font-mono text-[10px] uppercase tracking-wider text-[#6E6B65]"
        >
          Event text (edit it to test Bearer tokens, sk_ keys, emails or ?token= values)
        </label>
        <input
          id="repropack-raw-input"
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="mt-1 w-full border border-[#F2EFE9]/15 bg-[#08080A] px-3 py-2 font-mono text-xs text-[#F2EFE9] focus:border-[#FF5500] focus:outline-none"
        />
      </div>

      <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-[#6E6B65]">
          <span>Exported record (JSON)</span>
          <span className="text-[#38BDF8]">permissions: [&quot;storage&quot;]</span>
        </div>
        <pre className="scrollbar-thin overflow-x-auto font-mono text-[11px] leading-relaxed text-[#F2EFE9]">
          {sessionRecordJson}
        </pre>
      </div>
    </div>
  );
}

/* ============================================================================
 * 02. AdaptEd — Verbatim Zod Schema & Documented 3-Round Pedagogical Trace
 * ========================================================================== */
function AdaptEdXRay() {
  const rounds = [
    {
      round: 0,
      badge: "Round 0 · Initial Diagnosis",
      question: "What is 1/2 + 1/4?",
      learnerAnswer: "2/6",
      output: {
        difficultyType: "Conceptual misunderstanding",
        confidence: 92,
        diagnosis: "The learner added numerators (1+1=2) and denominators (2+4=6) directly without finding a common denominator.",
        evidence: ["Submitted '2/6' for '1/2 + 1/4'"],
        strategy: "Demonstrate equivalent fractions using equal-sized visual parts before adding.",
        representation: "Visual / Structured Explanation",
        adaptedExplanation: "Fractions must represent equal-sized pieces before they can be added: 1/2 = 2/4, so 2/4 + 1/4 = 3/4.",
        nextQuestion: "If a pizza is divided into 4 equal pieces, how many fourths are equal to 1/2?",
        whyItChanged: "Isolates denominator equivalence (converting halves to fourths) before re-testing addition.",
        masteryStatus: "continue",
      },
    },
    {
      round: 1,
      badge: "Round 1 · Equivalence Check",
      question: "If a pizza is divided into 4 equal pieces, how many fourths are equal to 1/2?",
      learnerAnswer: "2 fourths (2/4)",
      output: {
        difficultyType: "Sequential/process difficulty",
        confidence: 88,
        diagnosis: "Learner correctly converted 1/2 into 2/4; ready to combine common-denominator fractions.",
        evidence: ["Correctly identified 1/2 = 2/4"],
        strategy: "Prompt addition using the newly established common denominator (fourths).",
        representation: "Simplified Text",
        adaptedExplanation: "Since 1/2 equals 2/4, adding 1/4 more means combining two fourths and one fourth.",
        nextQuestion: "Now that 1/2 is written as 2/4, what is 2/4 + 1/4?",
        whyItChanged: "Advances from denominator conversion to completing the original fraction sum.",
        masteryStatus: "continue",
      },
    },
    {
      round: 2,
      badge: "Round 2 · Transfer & Mastery",
      question: "Now that 1/2 is written as 2/4, what is 2/4 + 1/4?",
      learnerAnswer: "3/4",
      output: {
        difficultyType: "Conceptual misunderstanding",
        confidence: 96,
        diagnosis: "Learner resolved the denominator misconception and accurately summed fourths.",
        evidence: ["Converted 1/2 -> 2/4 in Round 1", "Computed 2/4 + 1/4 = 3/4 in Round 2"],
        strategy: "Verify retention with a real-world transfer prompt.",
        representation: "Example / Analogy-Based Explanation",
        adaptedExplanation: "Keeping the denominator (4) fixed while adding numerators (2 + 1 = 3) yields 3/4.",
        nextQuestion: "A chocolate bar has 4 equal pieces. You have 3/4 and give away 1/4. What fraction remains?",
        whyItChanged: "Confirms mastery of common-denominator arithmetic.",
        masteryStatus: "mastered",
      },
    },
  ];

  const [roundIdx, setRoundIdx] = useState(0);
  const current = rounds[roundIdx];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#38BDF8]">
          Example walkthrough: 3 reassessment rounds
        </span>
        <span className="font-mono text-[10px] text-[#A6A29A]">Sample outputs, not a live model call</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {rounds.map((r, idx) => (
          <button
            key={r.round}
            type="button"
            onClick={() => setRoundIdx(idx)}
            className={`border px-2.5 py-2 text-left font-mono text-[10px] transition-colors ${
              roundIdx === idx
                ? "border-[#38BDF8] bg-[#38BDF8]/15 text-[#F2EFE9]"
                : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30"
            }`}
          >
            {r.badge}
          </button>
        ))}
      </div>

      <div className="grid gap-2 border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-xs sm:grid-cols-2">
        <div>
          <span className="text-[10px] uppercase text-[#6E6B65]">Prompt Question:</span>
          <p className="mt-0.5 text-[#F2EFE9]">{current.question}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase text-[#FF5500]">Learner Response:</span>
          <p className="mt-0.5 font-semibold text-[#F2EFE9]">&ldquo;{current.learnerAnswer}&rdquo;</p>
        </div>
      </div>

      <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-[#6E6B65]">
          <span>Analysis object (shape defined in lib/schema.ts)</span>
          <span className={current.output.masteryStatus === "mastered" ? "text-[#10B981]" : "text-[#FF5500]"}>
            masteryStatus: &quot;{current.output.masteryStatus}&quot;
          </span>
        </div>
        <pre className="scrollbar-thin max-h-48 overflow-auto font-mono text-[11px] leading-relaxed text-[#F2EFE9]">
          {JSON.stringify(current.output, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/* ============================================================================
 * 03. Root Cause AI — Genuine Python Deterministic Ranker & Reverse Graph Walk
 * ========================================================================== */
interface IncidentLog {
  timestamp: string;
  service: string;
  error: string;
  severity: "CRITICAL" | "ERROR" | "WARNING" | "INFO";
}

function runDeterministicIncidentBaseline(
  logs: IncidentLog[],
  dependencies: Record<string, string[]>,
) {
  const toEpoch = (iso: string) => {
    const t = Date.parse(iso);
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };

  const ordered = [...logs].sort((a, b) => toEpoch(a.timestamp) - toEpoch(b.timestamp));
  const counts: Record<string, number> = {};
  for (const log of ordered) {
    counts[log.service] = (counts[log.service] ?? 0) + 1;
  }

  // Exact ranking rule from main.py lines 102-112:
  // (severity == "CRITICAL", counts[service], -timestamp_key(log))
  const candidates = [...ordered].sort((a, b) => {
    const critA = a.severity === "CRITICAL" ? 1 : 0;
    const critB = b.severity === "CRITICAL" ? 1 : 0;
    if (critA !== critB) return critB - critA;
    const countDiff = (counts[b.service] ?? 0) - (counts[a.service] ?? 0);
    if (countDiff !== 0) return countDiff;
    return toEpoch(a.timestamp) - toEpoch(b.timestamp);
  });

  const candidate = candidates[0];
  const rootService = candidate.service;

  // Exact reverse dependency graph closure from main.py lines 118-136
  const downstream = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [service, requiredServices] of Object.entries(dependencies)) {
      if (
        !downstream.has(service) &&
        requiredServices.some((req) => req === rootService || downstream.has(req))
      ) {
        downstream.add(service);
        changed = true;
      }
    }
  }

  return {
    rootCandidate: rootService,
    triggerEvent: candidate,
    serviceErrorCounts: counts,
    impactedDownstream: Array.from(downstream).sort(),
  };
}

function RootCauseAiXRay() {
  const datasets: {
    label: string;
    logs: IncidentLog[];
    dependencies: Record<string, string[]>;
  }[] = [
    {
      label: "Payload 1: Payment DB Timeout (Bundled Demo)",
      logs: [
        {
          timestamp: "2026-10-09T10:00:00Z",
          service: "payment-service",
          error: "Database connection timeout",
          severity: "CRITICAL" as const,
        },
        {
          timestamp: "2026-10-09T10:00:02Z",
          service: "order-service",
          error: "Upstream payment-service 504 Gateway Timeout",
          severity: "ERROR" as const,
        },
        {
          timestamp: "2026-10-09T10:00:04Z",
          service: "api-gateway",
          error: "Checkout route failed: order-service unavailable",
          severity: "ERROR" as const,
        },
      ],
      dependencies: {
        "order-service": ["payment-service"],
        "billing-worker": ["payment-service"],
        "api-gateway": ["order-service", "auth-service"],
      },
    },
    {
      label: "Payload 2: Auth Token Signing Outage",
      logs: [
        {
          timestamp: "2026-10-09T11:14:10Z",
          service: "auth-service",
          error: "JWKS key rotation fetch failed",
          severity: "CRITICAL" as const,
        },
        {
          timestamp: "2026-10-09T11:14:12Z",
          service: "auth-service",
          error: "Token verification aborted",
          severity: "CRITICAL" as const,
        },
        {
          timestamp: "2026-10-09T11:14:15Z",
          service: "api-gateway",
          error: "401 Unauthorized spike across protected routes",
          severity: "ERROR" as const,
        },
      ],
      dependencies: {
        "order-service": ["payment-service", "auth-service"],
        "api-gateway": ["order-service", "auth-service"],
      },
    },
  ];

  const [idx, setIdx] = useState(0);
  const current = datasets[idx];
  const result = useMemo(
    () => runDeterministicIncidentBaseline(current.logs, current.dependencies),
    [current],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#FF5500]">
          Try the ranking logic
        </span>
        <span className="font-mono text-[10px] text-[#10B981]">Same rules as main.py</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {datasets.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onClick={() => setIdx(i)}
            className={`border px-2.5 py-1.5 font-mono text-[10px] transition-colors ${
              idx === i
                ? "border-[#FF5500] bg-[#FF5500]/15 text-[#F2EFE9]"
                : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-[11px]">
          <p className="text-[10px] uppercase text-[#6E6B65]">Input Dependencies (dependent → required):</p>
          <pre className="mt-1.5 overflow-x-auto text-[#A6A29A]">
            {JSON.stringify(current.dependencies, null, 2)}
          </pre>
        </div>

        <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-[11px]">
          <p className="text-[10px] uppercase text-[#FF5500]">Ranking result:</p>
          <pre className="mt-1.5 overflow-x-auto text-[#F2EFE9]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 04. Penguin ML — Honest 3-Notebook Pipeline & Dataset Feature Breakdown
 * ========================================================================== */
function PenguinMlXRay() {
  const notebooks = [
    {
      file: "Penguin_EDA.ipynb",
      stage: "Stage 01 · Exploratory Data Analysis",
      summary: "Inspects 344 records across 7 columns in penguins_size.xlsx, checking missing values, duplicates, and species distributions.",
      table: [
        { species: "Adelie", count: "152", culmenLength: "38.8 mm (mean)", flipperLength: "190.0 mm (mean)", islands: "Torgersen, Biscoe, Dream" },
        { species: "Chinstrap", count: "68", culmenLength: "48.8 mm (mean)", flipperLength: "195.8 mm (mean)", islands: "Dream" },
        { species: "Gentoo", count: "124", culmenLength: "47.5 mm (mean)", flipperLength: "217.2 mm (mean)", islands: "Biscoe" },
      ],
    },
    {
      file: "Penguin_Preprocessing.ipynb",
      stage: "Stage 02 · Data Cleaning & Feature Encoding",
      summary: "Handles missing numeric/categorical rows, removes duplicates, applies Label Encoding & One-Hot Encoding, and exports penguins_preprocessed.xlsx.",
      table: [
        { species: "culmen_length_mm / depth_mm", count: "float64", culmenLength: "Null rows cleaned", flipperLength: "Continuous feature", islands: "Retained" },
        { species: "flipper_length_mm / body_mass_g", count: "float64", culmenLength: "Null rows cleaned", flipperLength: "Continuous feature", islands: "Retained" },
        { species: "island / sex / species", count: "categorical", culmenLength: "Mode imputed", flipperLength: "Label & One-Hot Encoded", islands: "Target = species" },
      ],
    },
    {
      file: "Penguin_Machine_Learning.ipynb",
      stage: "Stage 03 · Logistic Regression Classification",
      summary: "Splits preprocessed features into training and test subsets, fits Scikit-learn LogisticRegression, and evaluates via accuracy, confusion matrix, and classification report.",
      table: [
        { species: "Algorithm", count: "LogisticRegression", culmenLength: "sklearn.linear_model", flipperLength: "Supervised 3-class", islands: "Baseline classifier" },
        { species: "Evaluation", count: "3 Metrics", culmenLength: "accuracy_score", flipperLength: "confusion_matrix", islands: "classification_report" },
      ],
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const current = notebooks[activeIdx];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#10B981]">
          How the notebooks fit together
        </span>
        <span className="font-mono text-[10px] text-[#A6A29A]">Jupyter notebooks</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {notebooks.map((n, i) => (
          <button
            key={n.file}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`border px-2.5 py-2 text-left font-mono text-[10px] transition-colors ${
              activeIdx === i
                ? "border-[#10B981] bg-[#10B981]/15 text-[#F2EFE9]"
                : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30"
            }`}
          >
            <div className="font-bold text-[#F2EFE9]">{n.file}</div>
            <div className="mt-0.5 truncate text-[9px] text-[#A6A29A]">{n.stage}</div>
          </button>
        ))}
      </div>

      <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3">
        <p className="font-mono text-xs text-[#F2EFE9]">{current.summary}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-[#F2EFE9]/10 text-[10px] uppercase text-[#6E6B65]">
                <th className="py-1.5 pr-3">Item / Species</th>
                <th className="py-1.5 pr-3">Type / Count</th>
                <th className="py-1.5 pr-3">Detail A</th>
                <th className="py-1.5 pr-3">Detail B</th>
                <th className="py-1.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]/[0.06] text-[#A6A29A]">
              {current.table.map((row) => (
                <tr key={row.species}>
                  <td className="py-1.5 pr-3 font-semibold text-[#F2EFE9]">{row.species}</td>
                  <td className="py-1.5 pr-3 text-[#38BDF8]">{row.count}</td>
                  <td className="py-1.5 pr-3">{row.culmenLength}</td>
                  <td className="py-1.5 pr-3">{row.flipperLength}</td>
                  <td className="py-1.5">{row.islands}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 05. Park Pulse — ESP32 / NodeMCU Sketch Contract & KCT-SENSOR-01 Endpoint
 * ========================================================================== */
function ParkPulseXRay() {
  const [distanceCm, setDistanceCm] = useState(42);
  // Exact rule from hardware/README.md line 84:
  // distance <= 100 cm -> sensorBlocked=true -> slot unavailable
  const sensorBlocked = distanceCm <= 100;
  const isAvailable = !sensorBlocked;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#F59E0B]">
          How the sensor reports availability
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[10px] font-bold ${
            sensorBlocked
              ? "border-[#FF5500]/50 bg-[#FF5500]/15 text-[#FF5500]"
              : "border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]"
          }`}
        >
          KCT-A1: {sensorBlocked ? "OCCUPIED (<= 100 cm)" : "AVAILABLE (> 100 cm)"}
        </span>
      </div>

      <label className="block border border-[#F2EFE9]/12 bg-[#08080A] p-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[#A6A29A]">
          <span>HC-SR04 Ultrasonic Distance Reading (BLOCKED_DISTANCE_CM = 100.0)</span>
          <span className="font-bold tabular-nums text-[#F2EFE9]">{distanceCm}.0 cm</span>
        </div>
        <input
          type="range"
          min={15}
          max={180}
          step={5}
          value={distanceCm}
          onChange={(e) => setDistanceCm(Number(e.target.value))}
          className="mt-2 w-full accent-[#FF5500]"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-[11px]">
          <p className="text-[10px] uppercase text-[#6E6B65]">Serial Monitor (115200 baud):</p>
          <pre className="mt-1.5 overflow-x-auto leading-relaxed text-[#A6A29A]">
{`Slot: KCT-A1 | ID: KCT-SENSOR-01
[SENSOR] distanceCm=${distanceCm}.0
[SENSOR] stable sensorBlocked=${sensorBlocked} isAvailable=${isAvailable}
[HTTP] POST {"sensorBlocked":${sensorBlocked}} -> 200`}
          </pre>
        </div>

        <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-[11px]">
          <p className="text-[10px] uppercase text-[#38BDF8]">Express + MongoDB Seed &amp; Route:</p>
          <pre className="mt-1.5 overflow-x-auto leading-relaxed text-[#F2EFE9]">
{`POST /api/slots/hardware/KCT-SENSOR-01/availability
{
  "slotNumber": "KCT-A1",
  "locationName": "KCT",
  "sensorBlocked": ${sensorBlocked},
  "isAvailable": ${isAvailable}
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 06. JARVIS Mini — Genuine Recursive-Descent Math Evaluator (Zero eval())
 * ========================================================================== */
function evaluateMathSafely(input: string): {
  tokens: string[];
  result: number | null;
  error?: string;
} {
  const normalized = input
    .toLowerCase()
    .replace(/multiplied by|times/g, "*")
    .replace(/divided by/g, "/")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/[^0-9.+\-*/^()%a-z\s]/g, " ");

  const tokenRegex = /\d+(?:\.\d+)?|sqrt|[+\-*/^()%]/g;
  const tokens = normalized.match(tokenRegex) ?? [];
  if (tokens.length === 0) {
    return { tokens: [], result: null, error: "Enter a mathematical expression." };
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr(): number {
    let val = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseTerm();
      val = op === "+" ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parsePower();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = consume();
      const right = parsePower();
      if ((op === "/" || op === "%") && right === 0) {
        throw new Error("Division by zero");
      }
      val = op === "*" ? val * right : op === "/" ? val / right : val % right;
    }
    return val;
  }

  function parsePower(): number {
    const base = parseUnary();
    if (peek() === "^") {
      consume();
      const exp = parsePower();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (peek() === "+") {
      consume();
      return parseUnary();
    }
    if (peek() === "-") {
      consume();
      return -parseUnary();
    }
    if (peek() === "sqrt") {
      consume();
      const inner = parseUnary();
      if (inner < 0) throw new Error("Square root of negative number");
      return Math.sqrt(inner);
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const tok = peek();
    if (!tok) throw new Error("Unexpected end of expression");
    if (tok === "(") {
      consume();
      const val = parseExpr();
      if (peek() === ")") consume();
      return val;
    }
    const num = Number(consume());
    if (Number.isNaN(num)) throw new Error(`Invalid token: ${tok}`);
    return num;
  }

  try {
    const res = parseExpr();
    if (pos < tokens.length) {
      return { tokens, result: null, error: `Unexpected trailing token: ${tokens[pos]}` };
    }
    return { tokens, result: Number(res.toFixed(6)) };
  } catch (err) {
    return {
      tokens,
      result: null,
      error: err instanceof Error ? err.message : "Parse error",
    };
  }
}

function JarvisMiniXRay() {
  const presets = [
    "987 multiplied by 654",
    "(24 * 18) + 64",
    "sqrt(144) + 2 ^ 8",
    "(1024 / 16) * 3 - 12",
  ];
  const [expr, setExpr] = useState(presets[0]);
  const parsed = useMemo(() => evaluateMathSafely(expr), [expr]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#38BDF8]">
          Try the math parser
        </span>
        <span className="border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-2 py-0.5 font-mono text-[10px] text-[#38BDF8]">
          Runs in your browser
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setExpr(p)}
            className={`border px-2.5 py-1 font-mono text-[10px] transition-colors ${
              expr === p
                ? "border-[#38BDF8] bg-[#38BDF8]/15 text-[#F2EFE9]"
                : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="jarvis-math-input"
          className="block font-mono text-[10px] uppercase tracking-wider text-[#6E6B65]"
        >
          Expression to evaluate:
        </label>
        <input
          id="jarvis-math-input"
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="mt-1 w-full border border-[#F2EFE9]/15 bg-[#08080A] px-3 py-2 font-mono text-xs text-[#F2EFE9] focus:border-[#38BDF8] focus:outline-none"
        />
      </div>

      <div className="grid gap-2 border border-[#F2EFE9]/10 bg-[#08080A] p-3 font-mono text-xs sm:grid-cols-2">
        <div>
          <span className="text-[10px] uppercase text-[#6E6B65]">Tokens:</span>
          <p className="mt-1 break-all text-[#A6A29A]">
            {parsed.tokens.length ? parsed.tokens.map((t) => `[${t}]`).join(" ") : "—"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase text-[#FF5500]">Result:</span>
          <p className="mt-1 font-bold text-[#10B981]">
            {parsed.error ? (
              <span className="text-[#FF5500]">{parsed.error}</span>
            ) : (
              `= ${parsed.result?.toLocaleString()}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Project stage: Overview (original project preview + flow)
 * and Technical details (small working versions of the project's logic, source).
 * ========================================================================== */

function ProjectMedia({ project }: { project: VerifiedProject }) {
  return (
    <div className="group relative overflow-hidden border border-[#F2EFE9]/12 bg-[#08080A] transition-colors duration-300 hover:border-[#FF5500]/45">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 h-2.5 w-2.5 border-t border-l border-[#FF5500]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 z-10 h-2.5 w-2.5 border-r border-b border-[#FF5500]"
      />
      <img
        src={project.previewImage}
        alt={`${project.name} architecture and interface preview`}
        width={960}
        height={560}
        loading="lazy"
        decoding="async"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

/** The four stages of the project, drawn in as you scroll to them. */
function FlowDiagram({ steps }: { steps: readonly string[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <motion.ol
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      transition={{ staggerChildren: 0.16 }}
      aria-label="How the project fits together"
      className="relative mt-5 grid gap-5 sm:grid-cols-4 sm:gap-0"
    >
      {steps.map((step, i) => {
        const isHovered = activeIdx === i;
        return (
          <motion.li
            key={step}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="group relative pl-6 sm:pt-6 sm:pr-4 sm:pl-0"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 size-3 border border-[#FF5500] transition-colors duration-200 sm:top-0 ${
                isHovered ? "bg-[#FF5500]" : "bg-[#08080A] group-hover:bg-[#FF5500]"
              }`}
            />
            {i < steps.length - 1 && (
              <>
                <motion.span
                  aria-hidden="true"
                  variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1 } }}
                  transition={{ duration: 0.7, ease: EASE_OUT }}
                  className="absolute top-5 -bottom-5 left-[5px] w-px origin-top bg-[#F2EFE9]/20 sm:hidden"
                />
                <motion.span
                  aria-hidden="true"
                  variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
                  transition={{ duration: 0.7, ease: EASE_OUT }}
                  className="absolute top-[5px] right-0 left-4 hidden h-px origin-left bg-[#F2EFE9]/20 sm:block"
                />
              </>
            )}
            <span className="font-mono text-[10px] font-semibold tabular-nums text-[#FF5500]">0{i + 1}</span>
            <p className="mt-0.5 font-mono text-[11px] leading-snug text-[#F2EFE9] transition-colors group-hover:text-white">
              {step}
            </p>
          </motion.li>
        );
      })}

      {/* a single pulse travelling along the pipeline */}
      <span
        aria-hidden="true"
        className="flow-pulse pointer-events-none absolute top-[3px] right-0 left-0 hidden h-[7px] overflow-hidden sm:block"
      >
        <span className="flow-pulse-dot absolute top-[2px] h-[3px] w-12 bg-gradient-to-r from-transparent to-[#FF5500]" />
      </span>
    </motion.ol>
  );
}

const TAB_BASE =
  "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors";
const TAB_ON = "border-[#FF5500] bg-[#FF5500] text-[#08080A]";
const TAB_OFF = "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:text-[#F2EFE9]";

export function ProjectInteractiveDemo({ project }: { project: VerifiedProject }) {
  const [stageMode, setStageMode] = useState<"overview" | "technical">("overview");
  const [techTab, setTechTab] = useState<"demo" | "source">("demo");

  return (
    <div className="relative border border-[#F2EFE9]/14 bg-[#0B0B0F]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFE9]/10 bg-[#0E0E14] px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={`${project.name} views`}>
          <button
            type="button"
            role="tab"
            aria-selected={stageMode === "overview"}
            onClick={() => setStageMode("overview")}
            className={`${TAB_BASE} ${stageMode === "overview" ? TAB_ON : TAB_OFF}`}
          >
            <Eye className="size-3.5" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={stageMode === "technical"}
            onClick={() => setStageMode("technical")}
            className={`${TAB_BASE} ${stageMode === "technical" ? TAB_ON : TAB_OFF}`}
          >
            <Terminal className="size-3.5" />
            <span>Technical details</span>
          </button>
        </div>

        <span className="hidden truncate font-mono text-[10px] text-[#6E6B65] sm:inline">
          {project.xraySourcePath}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {stageMode === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="p-3 sm:p-4"
          >
            <ProjectMedia project={project} />
            <FlowDiagram steps={project.flow} />
          </motion.div>
        ) : (
          <motion.div
            key="technical"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="p-4 sm:p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFE9]/10 pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#FF5500]">Technical details</p>
                <h4 className="mt-0.5 font-display text-sm font-bold text-[#F2EFE9]">{project.xrayTitle}</h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTechTab("demo")}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] transition-colors ${
                    techTab === "demo"
                      ? "border-[#38BDF8] bg-[#38BDF8]/15 text-[#F2EFE9]"
                      : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:text-[#F2EFE9]"
                  }`}
                >
                  <Code2 className="size-3 text-[#38BDF8]" />
                  <span>Try it</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTechTab("source")}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] transition-colors ${
                    techTab === "source"
                      ? "border-[#38BDF8] bg-[#38BDF8]/15 text-[#F2EFE9]"
                      : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:text-[#F2EFE9]"
                  }`}
                >
                  <FileCode2 className="size-3 text-[#FF5500]" />
                  <span>Source code</span>
                </button>
              </div>
            </div>

            {techTab === "source" ? (
              <div className="border border-[#F2EFE9]/10 bg-[#08080A] p-3.5">
                <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] text-[#6E6B65]">
                  <span className="truncate">{project.xraySourcePath}</span>
                  <span className="shrink-0 text-[#FF5500]">from the repository</span>
                </div>
                <pre className="scrollbar-thin overflow-x-auto font-mono text-xs leading-relaxed text-[#F2EFE9]">
                  {project.xrayCodeExcerpt}
                </pre>
              </div>
            ) : (
              <>
                {project.id === "repropack" && <ReproPackXRay />}
                {project.id === "adapted" && <AdaptEdXRay />}
                {project.id === "rootcause-ai" && <RootCauseAiXRay />}
                {project.id === "penguin-ml" && <PenguinMlXRay />}
                {project.id === "park-pulse" && <ParkPulseXRay />}
                {project.id === "jarvis-mini" && <JarvisMiniXRay />}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
