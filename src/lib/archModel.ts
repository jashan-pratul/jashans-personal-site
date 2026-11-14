import type { Project } from "../data/profile";

/**
 * Analytical latency / cost model for the Architecture Sandbox.
 * Deliberately simple but grounded in real effects:
 *  - Edge compute is close to users but far from a regional database (per-query WAN hop).
 *  - Serverless runs next to the DB but pays cold starts that hurt p99 at low traffic.
 *  - Database queueing follows an M/M/1-style 1/(1-ρ) blow-up as utilization ρ rises.
 *  - A cache cuts DB load by its hit ratio — the difference between "fine" and "on fire" at 10k RPS.
 * Prices are rough public list-price approximations; treat outputs as order-of-magnitude.
 */

export type DbChoice = "mongo" | "postgres";
export type DeployChoice = "edge" | "serverless";
export type Traffic = 100 | 1000 | 10000;

export interface ArchParams {
  db: DbChoice;
  deploy: DeployChoice;
  rps: Traffic;
  cache: boolean;
}

interface Tier {
  name: string;
  qps: number;
  monthly: number;
}

const DB_TIERS: Record<DbChoice, Tier[]> = {
  mongo: [
    { name: "M10", qps: 2_000, monthly: 57 },
    { name: "M30", qps: 8_000, monthly: 388 },
    { name: "M50", qps: 20_000, monthly: 1_040 },
    { name: "M60", qps: 40_000, monthly: 2_010 },
  ],
  postgres: [
    { name: "0.5 CU", qps: 1_500, monthly: 35 },
    { name: "2 CU", qps: 7_000, monthly: 140 },
    { name: "8 CU", qps: 18_000, monthly: 560 },
    { name: "16 CU", qps: 34_000, monthly: 1_120 },
  ],
};

const DB_META: Record<DbChoice, { label: string; queryMs: number; connMs: number }> = {
  mongo: { label: "MongoDB Atlas", queryMs: 4.2, connMs: 0.4 },
  postgres: { label: "Postgres (pooled)", queryMs: 3.6, connMs: 1.4 },
};

const SECONDS_PER_MONTH = 2_592_000;
/** Peak RPS is not sustained: assume average load ≈ 25% of peak. */
const AVG_TO_PEAK = 0.25;

export interface ArchResult {
  p50: number;
  p95: number;
  p99: number;
  coldStartMs: number;
  dbTier: string;
  dbLabel: string;
  dbQps: number;
  utilization: number;
  saturated: boolean;
  errorRate: number;
  headroom: number;
  monthly: { compute: number; db: number; cache: number; external: number; total: number };
  grade: "A" | "B" | "C" | "D";
  insights: string[];
  edgeLatency: { userToCompute: number; computeToDb: number; computeToCache: number };
}

const round = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

export function simulate(project: Project, p: ArchParams): ArchResult {
  const w = project.workload;
  const db = DB_META[p.db];
  const edge = p.deploy === "edge";

  const userToCompute = edge ? 11 : 38; // edge PoP is near the user; serverless lives in one region
  const computeToDb = edge ? 36 : 1.8; // WAN round trip from a PoP to a regional DB vs same-AZ
  const computeToCache = edge ? 2.4 : 1.1; // global replicated KV vs regional
  const computeMs = w.computeMs * (edge ? 0.55 : 1); // V8 isolates start fast, lighter runtime

  const hit = p.cache ? w.cacheHitRatio : 0;
  const dbQueriesPerReq = w.queriesPerRequest * (1 - hit);
  const dbQps = p.rps * dbQueriesPerReq;

  // Auto-pick the smallest tier keeping utilization ≤ 70%; otherwise run the biggest hot.
  const tiers = DB_TIERS[p.db];
  const tier = tiers.find((t) => dbQps / t.qps <= 0.7) ?? tiers[tiers.length - 1];
  const rho = dbQps / tier.qps;
  const saturated = rho >= 0.9;
  const queueFactor = 1 / Math.max(1 - Math.min(rho, 0.97), 0.03);

  const perQuery = computeToDb + db.queryMs * queueFactor + db.connMs;
  const cacheMs = p.cache ? w.queriesPerRequest * computeToCache * 0.6 : 0;
  const externalAvg = w.externalMs * w.externalRatio;

  const p50 = userToCompute + computeMs + dbQueriesPerReq * perQuery + cacheMs + externalAvg * 0.4;

  // Cold starts: frequent at low RPS (instances scale to zero), rare when the pool stays warm.
  const coldStartMs = edge ? 6 : p.db === "postgres" ? 290 : 240;
  const coldShare = p.rps <= 100 ? 1 : p.rps <= 1000 ? 0.45 : 0.12;
  const tailExternal = w.externalRatio >= 0.05 ? w.externalMs : w.externalRatio > 0 ? w.externalMs * 0.5 : 0;

  const p95 = p50 * 1.7 + tailExternal * 0.6 + (saturated ? 120 * rho : 0);
  const p99 = p50 * 2.6 + tailExternal + coldStartMs * coldShare + (saturated ? 420 * rho : 0);

  const errorRate = saturated ? Math.min(25, (rho - 0.9) * 60 + 1.2) : rho > 0.7 ? 0.08 : 0.01;

  // ---- cost ----
  const reqPerMonth = p.rps * AVG_TO_PEAK * SECONDS_PER_MONTH;
  const millions = reqPerMonth / 1e6;
  const perMillion = edge ? 0.3 + computeMs * 0.012 : 0.6 + computeMs * 0.03;
  const compute = millions * perMillion;
  const cache = p.cache ? 10 + millions * w.queriesPerRequest * 0.08 : 0;
  const external = reqPerMonth * w.externalRatio * (1 - (p.cache ? w.cacheHitRatio * 0.5 : 0)) * w.externalCostPerCall;
  const total = compute + tier.monthly + cache + external;

  const headroom = tier.qps / Math.max(dbQps, 1);

  // ---- insights ----
  const insights: string[] = [];
  if (edge && !p.cache && dbQueriesPerReq >= 1)
    insights.push(`Edge → regional DB costs ~${round(computeToDb)}ms per query × ${round(dbQueriesPerReq, 1)} queries. Add a cache or co-locate compute.`);
  if (!edge && p.rps <= 100) insights.push(`Low traffic = frequent cold starts: ~${coldStartMs}ms hits your p99. Edge or provisioned concurrency fixes this.`);
  if (saturated) insights.push(`DB at ${round(rho * 100)}% utilization on the largest tier → queueing explodes. Cache or shard before scaling further.`);
  if (p.cache && p.rps >= 1000) insights.push(`Cache absorbs ${round(hit * 100)}% of reads → DB drops to ${round(dbQps).toLocaleString()} qps on ${tier.name}.`);
  if (p.db === "postgres" && !edge && p.rps >= 1000) insights.push("Serverless + Postgres: a connection pooler (PgBouncer / Neon pooling) is mandatory at this concurrency.");
  if (external > 50) insights.push(`${w.externalLabel} spend dominates at ~$${round(external).toLocaleString()}/mo — cache by content hash and batch.`);
  if (insights.length === 0) insights.push("Balanced configuration: low tail latency with healthy headroom.");

  const grade: ArchResult["grade"] = saturated ? "D" : p99 > 600 ? "C" : p99 > 260 ? "B" : "A";

  return {
    p50: round(p50),
    p95: round(p95),
    p99: round(p99),
    coldStartMs,
    dbTier: tier.name,
    dbLabel: db.label,
    dbQps: round(dbQps),
    utilization: round(rho * 100),
    saturated,
    errorRate: round(errorRate, 2),
    headroom: round(headroom, 1),
    monthly: {
      compute: round(compute),
      db: tier.monthly,
      cache: round(cache),
      external: round(external),
      total: round(total),
    },
    grade,
    insights: insights.slice(0, 3),
    edgeLatency: { userToCompute, computeToDb, computeToCache },
  };
}

/* ---------------------------- diagram ---------------------------- */

export interface DiagramNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  tone: "client" | "compute" | "data" | "cache" | "external" | "edge";
}
export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  hot?: boolean;
  dashed?: boolean;
}

export const DIAGRAM_W = 760;
export const DIAGRAM_H = 250;
export const BOX_W = 128;
export const BOX_H = 50;

const COL = [16, 166, 316, 466, 616];
const ROW = { top: 28, mid: 100, bot: 172 };

export function buildDiagram(project: Project, p: ArchParams, r: ArchResult): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const edge = p.deploy === "edge";
  const computeNode: DiagramNode = {
    id: "compute",
    label: edge ? "Edge Functions" : "Serverless Fn",
    sub: edge ? "V8 isolates · global PoPs" : "Node.js · single region",
    x: COL[2],
    y: ROW.mid,
    tone: "compute",
  };
  const dbNode: DiagramNode = {
    id: "db",
    label: p.db === "mongo" ? "MongoDB Atlas" : "Postgres",
    sub: `${r.dbTier} · ${r.utilization}% util`,
    x: COL[4],
    y: ROW.mid,
    tone: "data",
  };
  const cacheNode: DiagramNode = {
    id: "cache",
    label: "Redis Cache",
    sub: `${Math.round(project.workload.cacheHitRatio * 100)}% hit ratio`,
    x: COL[3],
    y: ROW.top,
    tone: "cache",
  };
  const cdn: DiagramNode = { id: "cdn", label: "Vercel Edge Network", sub: "TLS · CDN · routing", x: COL[1], y: ROW.mid, tone: "edge" };
  const dbHop = `${Math.round(r.edgeLatency.computeToDb)}ms/q`;

  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  if (project.id === "fullstack") {
    nodes.push({ id: "client", label: "Browser", sub: "Next.js client", x: COL[0], y: ROW.mid, tone: "client" }, cdn, computeNode, dbNode);
    nodes.push({ id: "auth", label: "Auth Provider", sub: "JWT / sessions", x: COL[3], y: ROW.bot, tone: "external" });
    edges.push(
      { from: "client", to: "cdn", label: `${p.rps.toLocaleString()} rps`, hot: true },
      { from: "cdn", to: "compute", label: `${r.edgeLatency.userToCompute}ms`, hot: true },
      { from: "compute", to: "db", label: dbHop, hot: !p.cache },
      { from: "compute", to: "auth", label: "verify", dashed: true },
    );
  } else if (project.id === "automation") {
    nodes.push(
      { id: "client", label: "Webhooks", sub: "CRM · forms · Slack", x: COL[0], y: ROW.mid, tone: "client" },
      computeNode,
      { id: "n8n", label: "n8n Orchestrator", sub: "queue-backed DAG", x: COL[1], y: ROW.mid, tone: "edge" },
      { id: "llm", label: "LLM API", sub: `~${project.workload.externalMs}ms · 1% of events`, x: COL[3], y: ROW.bot, tone: "external" },
      dbNode,
    );
    edges.push(
      { from: "client", to: "n8n", label: `${p.rps.toLocaleString()} ev/s`, hot: true },
      { from: "n8n", to: "compute", label: "enqueue", hot: true },
      { from: "compute", to: "llm", label: "escalate", dashed: true },
      { from: "compute", to: "db", label: dbHop, hot: !p.cache },
    );
  } else {
    nodes.push(
      { id: "client", label: "Dashboard / CLI", sub: "scan requests", x: COL[0], y: ROW.mid, tone: "client" },
      cdn,
      computeNode,
      { id: "target", label: "Target App", sub: "headers · CSP · CORS", x: COL[3], y: ROW.bot, tone: "external" },
      dbNode,
    );
    edges.push(
      { from: "client", to: "cdn", label: `${p.rps.toLocaleString()} rps`, hot: true },
      { from: "cdn", to: "compute", label: `${r.edgeLatency.userToCompute}ms`, hot: true },
      { from: "compute", to: "target", label: "probe", dashed: true },
      { from: "compute", to: "db", label: dbHop, hot: !p.cache },
    );
  }

  if (p.cache) {
    nodes.push(cacheNode);
    edges.push({ from: "compute", to: "cache", label: `${r.edgeLatency.computeToCache}ms`, hot: true });
    edges.push({ from: "cache", to: "db", label: "miss", dashed: true });
  }
  return { nodes, edges };
}
