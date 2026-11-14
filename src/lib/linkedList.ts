/**
 * Pure linked-list engine. Every algorithm is compiled into an array of immutable
 * snapshots ("steps"), which makes step-forward / step-back / autoplay trivial and
 * keeps the React component a thin renderer over a deterministic state machine.
 */

export interface LLNode {
  id: string;
  value: number;
  addr: string;
  label: string;
}

export type NextMap = Record<string, string | null>;

export interface ListState {
  nodes: Record<string, LLNode>;
  /** Visual left-to-right order (matches traversal order whenever the list is idle). */
  order: string[];
  next: NextMap;
  head: string | null;
}

export type PointerName = "head" | "cursor" | "prev" | "curr" | "next" | "slow" | "fast";

export interface Step {
  next: NextMap;
  head: string | null;
  pointers: Partial<Record<PointerName, string | null>>;
  lines: number[];
  msg: string;
  reads: number;
  writes: number;
  flipped?: string;
  meet?: string;
  entry?: string;
  result?: "reversed" | "cycle" | "acyclic";
}

export const STATE_LABELS = ["IDLE", "AUTH", "FETCH", "PARSE", "RENDER", "COMMIT", "CACHE", "DONE"];
export const MAX_NODES = 6;
/** sizeof(struct Node) on x86-64: int val (4B) + 4B padding + Node* next (8B). */
export const NODE_BYTES = 16;

export const REVERSE_CODE = [
  "Node* reverse(Node* head) {",
  "  Node *prev = NULL, *curr = head;",
  "  while (curr != NULL) {",
  "    Node *next = curr->next;   // save",
  "    curr->next = prev;         // flip",
  "    prev = curr; curr = next;  // advance",
  "  }",
  "  return prev;                 // new head",
  "}",
];

export const FLOYD_CODE = [
  "Node* detectCycle(Node* head) {",
  "  Node *slow = head, *fast = head;",
  "  while (fast && fast->next) {",
  "    slow = slow->next;          // 1 hop",
  "    fast = fast->next->next;    // 2 hops",
  "    if (slow == fast) {         // met inside loop",
  "      slow = head;              // phase 2",
  "      while (slow != fast) { slow = slow->next; fast = fast->next; }",
  "      return slow;              // cycle entry",
  "    }",
  "  }",
  "  return NULL;                  // fast hit NULL",
  "}",
];

export const STRUCT_CODE = [
  "struct Node {",
  "  int   val;     // 4B (+4B padding)",
  "  Node* next;    // 8B pointer",
  "};               // sizeof = 16B",
  "",
  "// O(1) aux space for every op below.",
];

/* ---------------------------- allocation ---------------------------- */

const heapBase = 0x5500_0000_0000 + Math.floor(Math.random() * 0xffff) * 0x1_0000_00;
let allocCursor = 0x2a0;
let idSeq = 0;

export function allocNode(value: number, label: string): LLNode {
  // Simulate a bump allocator: 32B chunks (16B payload + malloc header + alignment) with occasional gaps.
  allocCursor += 0x20 * (1 + Math.floor(Math.random() * 3));
  const addr = "0x" + (heapBase + allocCursor).toString(16);
  return { id: `n${++idSeq}`, value, addr, label };
}

export function createInitialList(values = [12, 27, 42, 63]): ListState {
  const nodes: Record<string, LLNode> = {};
  const order: string[] = [];
  const next: NextMap = {};
  values.forEach((v, i) => {
    const n = allocNode(v, STATE_LABELS[i % STATE_LABELS.length]);
    nodes[n.id] = n;
    order.push(n.id);
  });
  order.forEach((id, i) => (next[id] = order[i + 1] ?? null));
  return { nodes, order, next, head: order[0] ?? null };
}

/* ---------------------------- queries ---------------------------- */

/** Walk from head; returns visited ids, the tail (last node before NULL/loop) and the loop target if any. */
export function walk(next: NextMap, head: string | null) {
  const seen = new Set<string>();
  const path: string[] = [];
  let cur = head;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    path.push(cur);
    cur = next[cur] ?? null;
  }
  return { path, tail: path[path.length - 1] ?? null, loopTo: cur };
}

export const hasCycle = (s: ListState) => walk(s.next, s.head).loopTo !== null;

/* ---------------------------- mutations ---------------------------- */

export function insertTail(s: ListState, value: number): { state: ListState; node: LLNode; reads: number } {
  const node = allocNode(value, STATE_LABELS[s.order.length % STATE_LABELS.length]);
  const { path, tail, loopTo } = walk(s.next, s.head);
  const next = { ...s.next, [node.id]: loopTo };
  if (tail) next[tail] = node.id;
  return {
    state: {
      nodes: { ...s.nodes, [node.id]: node },
      order: [...s.order, node.id],
      next,
      head: s.head ?? node.id,
    },
    node,
    reads: path.length,
  };
}

/** Point the tail back at the 2nd node (or itself for a single node) to create a loop. */
export function injectCycle(s: ListState): ListState {
  const { path, tail } = walk(s.next, s.head);
  if (!tail) return s;
  const target = path[Math.min(1, path.length - 1)];
  return { ...s, next: { ...s.next, [tail]: target } };
}

export function breakCycle(s: ListState): ListState {
  const { tail, loopTo } = walk(s.next, s.head);
  if (!tail || !loopTo) return s;
  return { ...s, next: { ...s.next, [tail]: null } };
}

/** Re-layout visual order to match traversal order (after a reversal commits). */
export function relayout(s: ListState, next: NextMap, head: string | null): ListState {
  const { path } = walk(next, head);
  const rest = s.order.filter((id) => !path.includes(id));
  return { ...s, next, head, order: [...path, ...rest] };
}

/* ---------------------------- algorithm compilers ---------------------------- */

export function compileReverse(s: ListState): Step[] {
  const steps: Step[] = [];
  const next: NextMap = { ...s.next };
  let prev: string | null = null;
  let curr: string | null = s.head;
  let reads = 0;
  let writes = 0;
  const label = (id: string | null) => (id ? `${s.nodes[id].value}` : "NULL");

  steps.push({
    next: { ...next },
    head: s.head,
    pointers: { head: s.head, prev, curr },
    lines: [1],
    msg: `Init: prev = NULL, curr = head (${label(curr)}).`,
    reads,
    writes,
  });

  let guard = 0;
  while (curr && guard++ < 64) {
    const nxt: string | null = next[curr] ?? null;
    reads++;
    steps.push({
      next: { ...next },
      head: s.head,
      pointers: { head: s.head, prev, curr, next: nxt },
      lines: [3],
      msg: `Save next = curr->next (${label(nxt)}) so we don't lose the rest of the list.`,
      reads,
      writes,
    });
    next[curr] = prev;
    writes++;
    steps.push({
      next: { ...next },
      head: s.head,
      pointers: { head: s.head, prev, curr, next: nxt },
      lines: [4],
      msg: `Flip: ${label(curr)}->next now points to ${label(prev)} (1 pointer write).`,
      reads,
      writes,
      flipped: curr,
    });
    prev = curr;
    curr = nxt;
    steps.push({
      next: { ...next },
      head: s.head,
      pointers: { head: s.head, prev, curr, next: nxt },
      lines: [5],
      msg: `Advance: prev = ${label(prev)}, curr = ${label(curr)}.`,
      reads,
      writes,
    });
  }

  steps.push({
    next: { ...next },
    head: prev,
    pointers: { head: prev, prev, curr: null },
    lines: [7],
    msg: `curr == NULL → return prev. New head = ${label(prev)}. ${writes} writes, O(1) extra memory.`,
    reads,
    writes,
    result: "reversed",
  });
  return steps;
}

export function compileFloyd(s: ListState): Step[] {
  const steps: Step[] = [];
  const next = s.next;
  const v = (id: string | null) => (id ? `${s.nodes[id].value}` : "NULL");
  let slow: string | null = s.head;
  let fast: string | null = s.head;
  let reads = 0;
  const base = { next: { ...next }, head: s.head, writes: 0 };

  steps.push({ ...base, pointers: { head: s.head, slow, fast }, lines: [1], msg: "Tortoise and hare both start at head.", reads });

  let guard = 0;
  while (fast && next[fast] && guard++ < 64) {
    slow = next[slow!] ?? null;
    fast = next[next[fast]!] ?? null;
    reads += 3;
    if (slow && slow === fast) {
      steps.push({
        ...base,
        pointers: { head: s.head, slow, fast },
        lines: [3, 4, 5],
        msg: `Tortoise → ${v(slow)}, hare → ${v(fast)}. They MEET → a cycle exists.`,
        reads,
        meet: slow,
      });
      const meet = slow;
      slow = s.head;
      steps.push({
        ...base,
        pointers: { head: s.head, slow, fast },
        lines: [6],
        msg: "Phase 2: reset tortoise to head; move both 1 hop at a time.",
        reads,
        meet,
      });
      let g2 = 0;
      while (slow !== fast && g2++ < 64) {
        slow = next[slow!] ?? null;
        fast = next[fast!] ?? null;
        reads += 2;
        steps.push({
          ...base,
          pointers: { head: s.head, slow, fast },
          lines: [7],
          msg: `Tortoise → ${v(slow)}, hare → ${v(fast)}.`,
          reads,
          meet,
        });
      }
      steps.push({
        ...base,
        pointers: { head: s.head, slow, fast },
        lines: [8],
        msg: `Cycle entry found at node ${v(slow)} (${slow ? s.nodes[slow].addr : ""}). O(n) time, O(1) space.`,
        reads,
        meet,
        entry: slow ?? undefined,
        result: "cycle",
      });
      return steps;
    }
    steps.push({
      ...base,
      pointers: { head: s.head, slow, fast },
      lines: [3, 4],
      msg: `Tortoise → ${v(slow)}, hare → ${v(fast)}.`,
      reads,
    });
  }

  steps.push({
    ...base,
    pointers: { head: s.head, slow, fast },
    lines: [11],
    msg: "Hare reached NULL → the list is acyclic. No cycle.",
    reads,
    result: "acyclic",
  });
  return steps;
}
