import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  Gauge,
  GitBranch,
  Link2,
  Link2Off,
  Pause,
  Play,
  Plus,
  Rabbit,
  RotateCcw,
  SkipBack,
  SkipForward,
  StepBack,
  Turtle,
  Workflow,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBus } from "../../lib/bus";
import {
  FLOYD_CODE,
  MAX_NODES,
  NODE_BYTES,
  REVERSE_CODE,
  STRUCT_CODE,
  breakCycle,
  compileFloyd,
  compileReverse,
  createInitialList,
  hasCycle,
  injectCycle,
  insertTail,
  relayout,
  walk,
  type ListState,
  type NextMap,
  type PointerName,
  type Step,
} from "../../lib/linkedList";
import { toast } from "../../lib/toast";
import { CardHeader } from "../ui/SpotlightCard";

/* ------------------------------ geometry ------------------------------ */
const PAD = 16;
const NULL_W = 52;
const NULL_H = 34;
const W = 120;
const H = 74;
const GAP = 44;
const TOP = 104;
const BELOW = 92;
const CY = TOP + H / 2;
const xNode = (i: number) => PAD + NULL_W + GAP + i * (W + GAP);

type Op = "idle" | "insert" | "reverse" | "floyd" | "transition";
type Mode = "idle" | "reverse" | "floyd";
type Tone = "default" | "em" | "amber" | "faint";

const INSERT_CODE = [
  "void push_back(Node **head, int v) {",
  "  Node *n = malloc(sizeof(Node));  // 16B",
  "  n->val = v; n->next = NULL;",
  "  Node *t = *head;",
  "  while (t->next) t = t->next;     // O(n) walk",
  "  t->next = n;                     // 1 write",
  "}",
];
const TRANSITION_CODE = [
  "State *step(State *s) {",
  "  if (s == NULL) return head;      // boot",
  "  emit(s->label, s->next);         // side effect",
  "  return s->next;                  // O(1) transition",
  "}",
];

const COMPLEXITY: Record<Op, { time: string; space: string; note: string }> = {
  idle: { time: "—", space: "O(n)", note: "n nodes × 16 B heap" },
  insert: { time: "O(n)", space: "O(1)", note: "walk to tail, 1 pointer write" },
  reverse: { time: "O(n)", space: "O(1)", note: "3 pointers, in-place flips" },
  floyd: { time: "O(n)", space: "O(1)", note: "tortoise ×1, hare ×2" },
  transition: { time: "O(1)", space: "O(1)", note: "per state transition" },
};

const POINTER_STYLE: Record<PointerName, { cls: string; icon?: typeof Turtle }> = {
  head: { cls: "border-white/25 bg-white/10 text-white" },
  cursor: { cls: "border-em/50 bg-em/15 text-em" },
  prev: { cls: "border-amber/50 bg-amber/15 text-amber" },
  curr: { cls: "border-ind/60 bg-ind/20 text-indigo-300" },
  next: { cls: "border-sky-400/50 bg-sky-400/15 text-sky-300" },
  slow: { cls: "border-em/50 bg-em/15 text-em", icon: Turtle },
  fast: { cls: "border-rose/50 bg-rose/15 text-rose", icon: Rabbit },
};
const POINTER_ORDER: PointerName[] = ["head", "cursor", "prev", "curr", "next", "slow", "fast"];

const TONE_STROKE: Record<Tone, string> = {
  default: "rgba(230,232,238,0.42)",
  em: "#10B981",
  amber: "#F59E0B",
  faint: "rgba(230,232,238,0.22)",
};

const shortAddr = (addr: string) => "…" + addr.slice(-4);

interface LogEntry {
  id: number;
  text: string;
  tone: "em" | "ind" | "amber" | "muted" | "rose";
}

export function LinkedListVisualizer() {
  const [list, setList] = useState<ListState>(() => createInitialList());
  const [mode, setMode] = useState<Mode>("idle");
  const [op, setOp] = useState<Op>("idle");
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [visited, setVisited] = useState<string[]>([]);
  const [counters, setCounters] = useState({ reads: 0, writes: 0, ops: 0 });
  const [inputVal, setInputVal] = useState("");
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, text: "Heap initialised: 4 nodes allocated (64 B).", tone: "muted" },
  ]);
  const logSeq = useRef(1);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((text: string, tone: LogEntry["tone"] = "muted") => {
    setLog((l) => [{ id: logSeq.current++, text, tone }, ...l].slice(0, 7));
  }, []);

  const step: Step | null = mode !== "idle" ? steps[stepIdx] ?? null : null;
  const view = useMemo(() => {
    const next: NextMap = step ? step.next : list.next;
    const head = step ? step.head : list.head;
    const pointers: Partial<Record<PointerName, string | null>> = step
      ? step.pointers
      : { head: list.head, ...(cursor !== undefined ? { cursor } : {}) };
    return { next, head, pointers };
  }, [step, list, cursor]);

  const cyclic = hasCycle(list);
  const loopNodes = useMemo(() => {
    const { path, loopTo } = walk(list.next, list.head);
    if (!loopTo) return new Set<string>();
    return new Set(path.slice(path.indexOf(loopTo)));
  }, [list]);

  const n = list.order.length;
  const width = xNode(n) + NULL_W + PAD;
  const height = TOP + H + BELOW;
  const idxOf = useMemo(() => new Map(list.order.map((id, i) => [id, i])), [list.order]);

  /* ------------------------------ operations ------------------------------ */

  const resetTransitions = () => {
    setCursor(undefined);
    setVisited([]);
  };

  const insert = useCallback(() => {
    if (mode !== "idle") return toast("Finish the running algorithm first", { kind: "info" });
    if (list.order.length >= MAX_NODES) return toast(`Heap demo capped at ${MAX_NODES} nodes`, { kind: "error" });
    const parsed = Number.parseInt(inputVal, 10);
    const existing = new Set(Object.values(list.nodes).map((x) => x.value));
    let value = Number.isFinite(parsed) ? Math.max(-999, Math.min(999, parsed)) : 0;
    if (!Number.isFinite(parsed)) {
      do value = 1 + Math.floor(Math.random() * 98);
      while (existing.has(value));
    }
    const { state, node, reads } = insertTail(list, value);
    setList(state);
    setOp("insert");
    resetTransitions();
    setCounters((c) => ({ reads, writes: 1, ops: c.ops + 1 }));
    setInputVal("");
    pushLog(`malloc(16) → ${node.addr}; tail->next = ${shortAddr(node.addr)} (${node.value}). Walked ${reads} node(s).`, "em");
    requestAnimationFrame(() => scrollerRef.current?.scrollTo({ left: scrollerRef.current.scrollWidth, behavior: "smooth" }));
  }, [mode, list, inputVal, pushLog]);

  const startReverse = useCallback(() => {
    if (mode !== "idle") return;
    let base = list;
    if (hasCycle(list)) {
      base = breakCycle(list);
      setList(base);
      pushLog("Cycle detected → broke tail link so reversal terminates.", "amber");
    }
    if (!base.head) return;
    resetTransitions();
    setSteps(compileReverse(base));
    setStepIdx(0);
    setMode("reverse");
    setOp("reverse");
    setPlaying(true);
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [mode, list, pushLog]);

  const startFloyd = useCallback(
    (forceCycle = false) => {
      if (mode !== "idle") return;
      let base = list;
      if (forceCycle && !hasCycle(list)) {
        base = injectCycle(list);
        setList(base);
        pushLog("Injected cycle: tail->next = node[1].", "amber");
      }
      if (!base.head) return;
      resetTransitions();
      setSteps(compileFloyd(base));
      setStepIdx(0);
      setMode("floyd");
      setOp("floyd");
      setPlaying(true);
    },
    [mode, list, pushLog],
  );

  const toggleCycle = useCallback(() => {
    if (mode !== "idle") return;
    if (list.order.length < 2) return toast("Need at least 2 nodes for a cycle", { kind: "info" });
    if (hasCycle(list)) {
      setList(breakCycle(list));
      pushLog("Cycle removed: tail->next = NULL.", "muted");
    } else {
      setList(injectCycle(list));
      pushLog("Cycle injected: tail->next = node[1]. Try Floyd's algorithm.", "amber");
    }
    resetTransitions();
    setCounters((c) => ({ reads: list.order.length, writes: 1, ops: c.ops + 1 }));
  }, [mode, list, pushLog]);

  const transition = useCallback(() => {
    if (mode !== "idle") return toast("Finish the running algorithm first", { kind: "info" });
    if (!list.head) return;
    setOp("transition");
    const label = (id: string) => `${list.nodes[id].label}@${shortAddr(list.nodes[id].addr)}`;
    if (cursor === undefined || cursor === null) {
      setCursor(list.head);
      setVisited([list.head]);
      setCounters((c) => ({ reads: 1, writes: 0, ops: c.ops + 1 }));
      pushLog(`boot → ${label(list.head)}`, "em");
      return;
    }
    const nxt = list.next[cursor] ?? null;
    setCounters((c) => ({ reads: c.reads + 1, writes: 0, ops: c.ops + 1 }));
    if (nxt === null) {
      setCursor(null);
      pushLog(`${label(cursor)} → NULL · terminal state, machine halted.`, "rose");
      return;
    }
    const looped = visited.includes(nxt);
    setCursor(nxt);
    setVisited((v) => [...v, nxt]);
    pushLog(`${label(cursor)} → ${label(nxt)}${looped ? " · ⟲ revisited (cyclic FSM)" : ""}`, looped ? "amber" : "ind");
  }, [mode, list, cursor, visited, pushLog]);

  const resetAll = useCallback(() => {
    setMode("idle");
    setPlaying(false);
    setSteps([]);
    setStepIdx(0);
    setOp("idle");
    resetTransitions();
    setCounters({ reads: 0, writes: 0, ops: 0 });
    setList(createInitialList());
    setLog([{ id: logSeq.current++, text: "Heap reset: 4 fresh nodes allocated (64 B).", tone: "muted" }]);
  }, []);

  /* ------------------------------ stepping ------------------------------ */

  const commitReverse = useCallback(() => {
    const final = steps[steps.length - 1];
    if (!final) return;
    setList((l) => relayout(l, final.next, final.head));
    setCounters((c) => ({ reads: final.reads, writes: final.writes, ops: c.ops + 1 }));
    pushLog(`Reversed in place: ${final.writes} pointer writes, 0 allocations. Re-laid out from new head.`, "em");
    setMode("idle");
    setPlaying(false);
    setSteps([]);
  }, [steps, pushLog]);

  const exitAlgorithm = useCallback(() => {
    if (mode === "reverse") {
      if (stepIdx === steps.length - 1) return commitReverse();
      pushLog("Reversal aborted mid-flight — list restored (no torn pointers).", "rose");
    } else if (mode === "floyd") {
      const last = steps[stepIdx];
      if (last?.result === "cycle") pushLog(`Floyd: cycle confirmed, entry = ${list.nodes[last.entry!]?.value}.`, "amber");
      else if (last?.result === "acyclic") pushLog("Floyd: no cycle — hare reached NULL.", "em");
      if (last) setCounters((c) => ({ reads: last.reads, writes: 0, ops: c.ops + 1 }));
    }
    setMode("idle");
    setPlaying(false);
    setSteps([]);
  }, [mode, stepIdx, steps, commitReverse, pushLog, list.nodes]);

  useEffect(() => {
    if (!playing || mode === "idle") return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStepIdx((i) => Math.min(i + 1, steps.length - 1)), 760 / speed);
    return () => window.clearTimeout(t);
  }, [playing, mode, stepIdx, steps.length, speed]);

  // Auto-apply a finished reversal so the nodes physically re-order to match the new head.
  useEffect(() => {
    if (mode !== "reverse" || steps.length === 0 || stepIdx !== steps.length - 1) return;
    const t = window.setTimeout(commitReverse, 1500);
    return () => window.clearTimeout(t);
  }, [mode, stepIdx, steps.length, commitReverse]);

  /* ------------------------------ bus wiring (⌘K / terminal) ------------------------------ */
  useBus("ll:reverse", () => {
    if (mode !== "idle") exitAlgorithm();
    window.setTimeout(startReverse, mode !== "idle" ? 60 : 0);
  });
  useBus("ll:cycle", () => {
    if (mode === "idle") startFloyd(true);
  });
  useBus("ll:insert", insert);
  useBus("ll:transition", transition);

  /* ------------------------------ derived render data ------------------------------ */

  const arrows = list.order.map((id) => {
    const i = idxOf.get(id)!;
    const target = view.next[id] ?? null;
    const flipped = step?.flipped === id;
    let d: string;
    let tone: Tone = "default";
    let stub = false;
    if (target === null) {
      tone = "faint";
      if (i === n - 1) {
        const sx = xNode(i) + W;
        const ex = xNode(n) - 3;
        d = `M ${sx} ${CY} C ${sx + 14} ${CY}, ${ex - 14} ${CY}, ${ex} ${CY}`;
      } else if (i === 0) {
        const sx = xNode(0);
        const ex = PAD + NULL_W + 3;
        d = `M ${sx} ${CY} C ${sx - 14} ${CY}, ${ex + 14} ${CY}, ${ex} ${CY}`;
      } else {
        const sx = xNode(i) + W - 18;
        const sy = TOP + H;
        d = `M ${sx} ${sy} C ${sx} ${sy + 8}, ${sx} ${sy + 16}, ${sx} ${sy + 24}`;
        stub = true;
      }
    } else {
      const j = idxOf.get(target)!;
      if (j === i + 1) {
        const sx = xNode(i) + W;
        const ex = xNode(j) - 3;
        d = `M ${sx} ${CY} C ${sx + 14} ${CY}, ${ex - 14} ${CY}, ${ex} ${CY}`;
      } else {
        const sx = xNode(i) + W - 18;
        const sy = TOP + H;
        const ex = j === i ? xNode(j) + 22 : xNode(j) + W / 2;
        const depth = Math.min(30 + 16 * Math.abs(i - j), 80);
        d = `M ${sx} ${sy} C ${sx} ${sy + depth}, ${ex} ${sy + depth}, ${ex} ${sy + 3}`;
        tone = mode === "reverse" ? "em" : "amber";
      }
    }
    if (flipped) tone = "em";
    return { id, d, tone, stub, flipped };
  });

  const badges = useMemo(() => {
    const groups = new Map<string, PointerName[]>();
    POINTER_ORDER.forEach((p) => {
      if (!(p in view.pointers)) return;
      const target = view.pointers[p] ?? null;
      const key = target ?? (p === "prev" ? "__nullL" : "__nullR");
      groups.set(key, [...(groups.get(key) ?? []), p]);
    });
    const out: { name: PointerName; x: number; y: number }[] = [];
    groups.forEach((names, key) => {
      const cx =
        key === "__nullL" ? PAD + NULL_W / 2 : key === "__nullR" ? xNode(n) + NULL_W / 2 : xNode(idxOf.get(key) ?? 0) + W / 2;
      const baseY = key.startsWith("__null") ? CY - NULL_H / 2 : TOP;
      names.forEach((name, k) => out.push({ name, x: cx - 32, y: baseY - 26 - k * 23 }));
    });
    return out;
  }, [view.pointers, idxOf, n]);

  const registers = useMemo(() => {
    const names: PointerName[] =
      mode === "reverse" ? ["head", "prev", "curr", "next"] : mode === "floyd" ? ["head", "slow", "fast"] : ["head", "cursor"];
    const tail = walk(list.next, list.head).tail;
    const rows = names.map((p) => {
      const id = p === "cursor" ? cursor ?? null : view.pointers[p] ?? null;
      return { name: p as string, addr: id ? list.nodes[id].addr : "NULL", val: id ? list.nodes[id].value : null };
    });
    if (mode === "idle") rows.push({ name: "tail", addr: tail ? list.nodes[tail].addr : "NULL", val: tail ? list.nodes[tail].value : null });
    return rows;
  }, [mode, view.pointers, cursor, list]);

  const code = op === "reverse" ? REVERSE_CODE : op === "floyd" ? FLOYD_CODE : op === "insert" ? INSERT_CODE : op === "transition" ? TRANSITION_CODE : STRUCT_CODE;
  const activeLines = step?.lines ?? (op === "insert" ? [4, 5] : op === "transition" ? (cursor === null ? [1] : [3]) : []);
  const complexity = COMPLEXITY[op];
  const reads = step ? step.reads : counters.reads;
  const writes = step ? step.writes : counters.writes;
  const narration =
    step?.msg ??
    (op === "idle"
      ? "Pick an operation. Every pointer below is a real reference in React state — watch them move."
      : log[0]?.text ?? "");

  const atEnd = stepIdx === steps.length - 1;

  return (
    <div className="p-5 sm:p-6">
      <CardHeader
        icon={<GitBranch className="size-4" />}
        title="Linked List State-Machine Visualizer"
        subtitle="from @JashanPratul's pointer threads · live React state"
        right={
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="rounded-md border border-em/30 bg-em/10 px-2 py-1 text-em">T: {complexity.time}</span>
            <span className="rounded-md border border-ind/30 bg-ind/10 px-2 py-1 text-indigo-300">S: {complexity.space}</span>
          </div>
        }
      />

      {/* ------------------------------ canvas ------------------------------ */}
      <div
        ref={scrollerRef}
        className="scrollbar-thin grid-bg relative mt-5 overflow-x-auto rounded-xl border border-line bg-bg/60"
        role="img"
        aria-label={`Linked list with ${n} nodes: ${walk(view.next, view.head)
          .path.map((id) => list.nodes[id].value)
          .join(" → ")}${cyclic ? " (cyclic)" : " → null"}`}
      >
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} className="absolute inset-0" aria-hidden>
            <defs>
              {(Object.keys(TONE_STROKE) as Tone[]).map((t) => (
                <marker key={t} id={`ah-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill={TONE_STROKE[t]} />
                </marker>
              ))}
            </defs>
            {arrows.map((a) => (
              <g key={a.id}>
                <motion.path
                  initial={false}
                  animate={{ d: a.d, stroke: TONE_STROKE[a.tone] }}
                  transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  fill="none"
                  strokeWidth={a.flipped ? 2.4 : 1.6}
                  markerEnd={a.stub ? undefined : `url(#ah-${a.tone})`}
                />
                {a.stub && (
                  <text x={xNode(idxOf.get(a.id)!) + W - 18} y={TOP + H + 38} textAnchor="middle" className="fill-faint font-mono text-[11px]">
                    ∅
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* NULL sentinels */}
          {[
            { key: "L", x: PAD, active: Object.values(view.next).some((v, k) => v === null && idxOf.get(Object.keys(view.next)[k]) === 0 && n > 1) || ("prev" in view.pointers && view.pointers.prev === null) },
            { key: "R", x: xNode(n), active: true },
          ].map((s) => (
            <motion.div
              key={s.key}
              initial={false}
              animate={{ x: s.x, opacity: s.active ? 1 : 0.28 }}
              className="absolute grid place-items-center rounded-lg border border-dashed border-line-strong font-mono text-[11px] text-muted"
              style={{ top: CY - NULL_H / 2, width: NULL_W, height: NULL_H }}
            >
              NULL
            </motion.div>
          ))}

          {/* nodes */}
          <AnimatePresence initial={false}>
            {list.order.map((id, i) => {
              const node = list.nodes[id];
              const nextId = view.next[id] ?? null;
              const isCurr = step?.pointers.curr === id;
              const isFlipped = step?.flipped === id;
              const isMeet = step?.meet === id;
              const isEntry = step?.entry === id;
              const isCursor = mode === "idle" && cursor === id;
              const inLoop = mode === "idle" && loopNodes.has(id);
              const ring = isEntry
                ? "border-rose shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
                : isMeet
                  ? "border-amber shadow-[0_0_0_3px_rgba(245,158,11,0.22)]"
                  : isFlipped
                    ? "border-em shadow-[0_0_24px_-4px_#10B981]"
                    : isCursor
                      ? "border-em shadow-[0_0_28px_-6px_#10B981]"
                      : isCurr
                        ? "border-ind shadow-[0_0_0_3px_rgba(99,102,241,0.22)]"
                        : "border-line-strong";
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.6, x: xNode(i), y: TOP - 30 }}
                  animate={{ opacity: 1, scale: 1, x: xNode(i), y: TOP }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={`absolute left-0 top-0 overflow-hidden rounded-xl border bg-surface-2 transition-[border-color,box-shadow] duration-300 ${ring}`}
                  style={{ width: W, height: H }}
                >
                  <div className="flex items-center justify-between border-b border-line bg-black/20 px-2 py-1 font-mono text-[9px] text-faint">
                    <span>{node.addr}</span>
                    {inLoop && <span className="size-1.5 rounded-full bg-amber" title="part of a cycle" />}
                  </div>
                  <div className="flex h-[calc(100%-21px)]">
                    <div className="flex flex-1 flex-col justify-center px-2.5">
                      <span className="font-mono text-lg font-semibold leading-none text-white">{node.value}</span>
                      <span className="mt-1 font-mono text-[9px] tracking-wider text-muted">{node.label}</span>
                    </div>
                    <div className="flex w-[46px] flex-col items-center justify-center border-l border-line bg-black/15">
                      <span className="font-mono text-[8px] uppercase text-faint">next</span>
                      <motion.span
                        key={nextId ?? "null"}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`font-mono text-[10px] ${nextId ? "text-ink" : "text-rose/80"}`}
                      >
                        {nextId ? shortAddr(list.nodes[nextId].addr) : "NULL"}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* pointer badges */}
          <AnimatePresence initial={false}>
            {badges.map((b) => {
              const s = POINTER_STYLE[b.name];
              const Icon = s.icon;
              return (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, x: b.x, y: b.y - 8 }}
                  animate={{ opacity: 1, x: b.x, y: b.y }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className={`absolute left-0 top-0 flex h-5 w-16 items-center justify-center gap-1 rounded-md border font-mono text-[10px] font-medium ${s.cls}`}
                >
                  {Icon && <Icon className="size-3" />}
                  {b.name}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ------------------------------ controls ------------------------------ */}
      <div className="mt-4 min-h-[44px]">
        <AnimatePresence mode="wait" initial={false}>
          {mode === "idle" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap items-center gap-2"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  insert();
                }}
                className="flex items-center overflow-hidden rounded-lg border border-line bg-surface-2"
              >
                <input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value.replace(/[^\d-]/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder="val"
                  aria-label="Node value"
                  className="w-14 bg-transparent px-2.5 py-2 font-mono text-sm text-ink placeholder:text-faint focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={n >= MAX_NODES}
                  className="flex items-center gap-1.5 border-l border-line px-3 py-2 text-sm text-ink hover:bg-white/5 disabled:opacity-40"
                >
                  <Plus className="size-4" /> Insert Node
                </button>
              </form>
              <CtlButton onClick={startReverse} icon={<ArrowRightLeft className="size-4" />} tone="em">
                Reverse In-Place
              </CtlButton>
              <CtlButton onClick={() => startFloyd(false)} icon={<Rabbit className="size-4" />} tone="amber">
                Detect Cycle
              </CtlButton>
              <CtlButton onClick={transition} icon={<Workflow className="size-4" />} tone="ind">
                Simulate State Transition
              </CtlButton>
              <CtlButton onClick={toggleCycle} icon={cyclic ? <Link2Off className="size-4" /> : <Link2 className="size-4" />}>
                {cyclic ? "Break Cycle" : "Inject Cycle"}
              </CtlButton>
              <button
                onClick={resetAll}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted hover:text-ink"
                title="Reset list"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="rounded-md border border-line bg-surface-2 px-2.5 py-2 font-mono text-xs text-muted">
                {mode === "reverse" ? "reverse()" : "floyd()"} · step {stepIdx + 1}/{steps.length}
              </span>
              <IconBtn label="First step" onClick={() => { setPlaying(false); setStepIdx(0); }}>
                <SkipBack className="size-4" />
              </IconBtn>
              <IconBtn label="Step back" onClick={() => { setPlaying(false); setStepIdx((i) => Math.max(0, i - 1)); }} disabled={stepIdx === 0}>
                <StepBack className="size-4" />
              </IconBtn>
              <button
                onClick={() => {
                  if (atEnd) setStepIdx(0);
                  setPlaying((p) => !p || atEnd);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                {playing ? "Pause" : atEnd ? "Replay" : "Play"}
              </button>
              <IconBtn label="Step forward" onClick={() => { setPlaying(false); setStepIdx((i) => Math.min(steps.length - 1, i + 1)); }} disabled={atEnd}>
                <SkipForward className="size-4" />
              </IconBtn>
              <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Playback speed">
                <Gauge className="ml-1.5 size-3.5 text-faint" />
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={speed === s}
                    onClick={() => setSpeed(s)}
                    className={`rounded-md px-2 py-1 font-mono text-xs ${speed === s ? "bg-white/10 text-white" : "text-muted hover:text-ink"}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <button
                onClick={exitAlgorithm}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink hover:border-line-strong"
              >
                <X className="size-4" />
                {mode === "reverse" ? (atEnd ? "Apply now" : "Abort") : "Done"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------ panels ------------------------------ */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-line bg-bg/70">
          <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[11px] text-faint">
            <span>{op === "idle" ? "node.h" : op === "reverse" ? "reverse.c" : op === "floyd" ? "floyd.c" : op === "insert" ? "insert.c" : "fsm.c"}</span>
            <span>{complexity.note}</span>
          </div>
          <pre className="scrollbar-thin overflow-x-auto py-2 font-mono text-[12px] leading-[1.7]">
            {code.map((line, i) => {
              const active = activeLines.includes(i);
              return (
                <div key={`${op}-${i}`} className={`flex px-3 transition-colors duration-200 ${active ? "bg-ind/15" : ""}`}>
                  <span className={`mr-4 w-5 shrink-0 select-none text-right ${active ? "text-indigo-300" : "text-faint/60"}`}>{i + 1}</span>
                  <span className={active ? "text-white" : "text-ink/65"}>{line || " "}</span>
                </div>
              );
            })}
          </pre>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-line bg-bg/70 p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={narration}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="min-h-[40px] text-[13px] leading-relaxed text-ink/90"
              >
                {narration}
              </motion.p>
            </AnimatePresence>
            <div className="mt-3 grid grid-cols-4 gap-2 font-mono">
              {[
                ["reads", reads],
                ["writes", writes],
                ["nodes", n],
                ["heap", `${n * NODE_BYTES}B`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-surface-2/50 px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-faint">{k}</p>
                  <p className="text-sm text-white">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-bg/70 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">pointer registers</p>
              <ul className="space-y-1 font-mono text-[11px]">
                {registers.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-2">
                    <span className="text-muted">{r.name}</span>
                    <motion.span
                      key={r.addr}
                      initial={{ backgroundColor: "rgba(16,185,129,0.35)" }}
                      animate={{ backgroundColor: "rgba(16,185,129,0)" }}
                      transition={{ duration: 0.8 }}
                      className={`rounded px-1 ${r.addr === "NULL" ? "text-rose/80" : "text-ink"}`}
                    >
                      {r.addr}
                      {r.val !== null && <span className="text-faint"> ({r.val})</span>}
                    </motion.span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-bg/70 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">event log</p>
              <ul className="space-y-1 font-mono text-[10.5px] leading-snug">
                <AnimatePresence initial={false}>
                  {log.slice(0, 4).map((l) => (
                    <motion.li
                      key={l.id}
                      layout
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={
                        l.tone === "em"
                          ? "text-em"
                          : l.tone === "ind"
                            ? "text-indigo-300"
                            : l.tone === "amber"
                              ? "text-amber"
                              : l.tone === "rose"
                                ? "text-rose"
                                : "text-muted"
                      }
                    >
                      › {l.text}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtlButton({
  onClick,
  icon,
  children,
  tone,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "em" | "amber" | "ind";
}) {
  const toneCls =
    tone === "em"
      ? "border-em/35 text-em hover:bg-em/10"
      : tone === "amber"
        ? "border-amber/35 text-amber hover:bg-amber/10"
        : tone === "ind"
          ? "border-ind/40 text-indigo-300 hover:bg-ind/10"
          : "border-line text-ink hover:bg-white/5";
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg border bg-surface-2 px-3 py-2 text-sm transition-colors ${toneCls}`}>
      {icon}
      {children}
    </button>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-ink hover:border-line-strong disabled:opacity-35"
    >
      {children}
    </button>
  );
}
