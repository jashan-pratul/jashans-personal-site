import { useSyncExternalStore } from "react";
import { PROFILE } from "../data/profile";

/**
 * Live telemetry pulled from public APIs (GitHub REST + Codeforces API).
 * Results are cached in sessionStorage for 10 minutes to respect rate limits.
 * Every consumer degrades gracefully when a source is unreachable.
 */

export interface GitHubStats {
  publicRepos: number;
  followers: number;
  stars: number;
  topLanguages: { name: string; count: number }[];
  lastPushRepo: string | null;
  lastPushAt: string | null;
  activity30d: number[];
  events30d: number;
}

export interface CodeforcesStats {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  solved: number;
  topTags: { name: string; count: number }[];
}

export interface Source<T> {
  state: "loading" | "live" | "offline";
  data: T | null;
  error?: string;
}

export interface Telemetry {
  github: Source<GitHubStats>;
  codeforces: Source<CodeforcesStats>;
  fetchedAt: number | null;
}

const CACHE_KEY = "jp:telemetry:v1";
const TTL = 10 * 60 * 1000;

let state: Telemetry = {
  github: { state: "loading", data: null },
  codeforces: { state: "loading", data: null },
  fetchedAt: null,
};
const subs = new Set<() => void>();
const set = (patch: Partial<Telemetry>) => {
  state = { ...state, ...patch };
  subs.forEach((s) => s());
};

async function getJSON<T>(url: string, timeoutMs = 7000): Promise<T> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(t);
  }
}

function tally(values: string[], top: number) {
  const m = new Map<string, number>();
  values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, count]) => ({ name, count }));
}

async function fetchGitHub(): Promise<GitHubStats> {
  const base = `https://api.github.com/users/${PROFILE.handle}`;
  type U = { public_repos: number; followers: number };
  type R = { name: string; language: string | null; stargazers_count: number; pushed_at: string; fork: boolean };
  type E = { created_at: string };
  const [user, repos, events] = await Promise.all([
    getJSON<U>(base),
    getJSON<R[]>(`${base}/repos?per_page=100&sort=pushed`).catch(() => [] as R[]),
    getJSON<E[]>(`${base}/events/public?per_page=100`).catch(() => [] as E[]),
  ]);
  const own = repos.filter((r) => !r.fork);
  const days = new Array<number>(30).fill(0);
  const now = Date.now();
  let events30d = 0;
  for (const e of events) {
    const ageDays = Math.floor((now - new Date(e.created_at).getTime()) / 86_400_000);
    if (ageDays >= 0 && ageDays < 30) {
      days[29 - ageDays] += 1;
      events30d += 1;
    }
  }
  return {
    publicRepos: user.public_repos,
    followers: user.followers,
    stars: own.reduce((s, r) => s + r.stargazers_count, 0),
    topLanguages: tally(own.map((r) => r.language).filter((l): l is string => !!l), 4),
    lastPushRepo: repos[0]?.name ?? null,
    lastPushAt: repos[0]?.pushed_at ?? null,
    activity30d: days,
    events30d,
  };
}

async function fetchCodeforces(): Promise<CodeforcesStats> {
  const h = encodeURIComponent(PROFILE.codeforcesHandle);
  type Info = { status: string; comment?: string; result: { rating?: number; maxRating?: number; rank?: string }[] };
  type Sub = { verdict?: string; problem: { contestId?: number; index: string; name: string; tags: string[] } };
  type Status = { status: string; result: Sub[] };
  const info = await getJSON<Info>(`https://codeforces.com/api/user.info?handles=${h}`);
  if (info.status !== "OK" || !info.result[0]) throw new Error(info.comment ?? "Codeforces lookup failed");
  const subs = await getJSON<Status>(`https://codeforces.com/api/user.status?handle=${h}&from=1&count=2000`).catch(
    () => ({ status: "FAILED", result: [] as Sub[] }),
  );
  const solved = new Map<string, string[]>();
  for (const s of subs.result) {
    if (s.verdict === "OK") solved.set(`${s.problem.contestId ?? "x"}-${s.problem.index}-${s.problem.name}`, s.problem.tags);
  }
  const u = info.result[0];
  return {
    rating: u.rating ?? null,
    maxRating: u.maxRating ?? null,
    rank: u.rank ?? null,
    solved: solved.size,
    topTags: tally([...solved.values()].flat(), 5),
  };
}

let started = false;
export function startTelemetry() {
  if (started || typeof window === "undefined") return;
  started = true;

  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null") as Telemetry | null;
    if (cached?.fetchedAt && Date.now() - cached.fetchedAt < TTL) {
      set(cached);
      return;
    }
  } catch {
    /* ignore corrupt cache */
  }

  const persist = () => {
    if (state.github.state === "loading" || state.codeforces.state === "loading") return;
    set({ fetchedAt: Date.now() });
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  };

  fetchGitHub()
    .then((data) => set({ github: { state: "live", data } }))
    .catch((e: Error) => set({ github: { state: "offline", data: null, error: e.message } }))
    .finally(persist);

  fetchCodeforces()
    .then((data) => set({ codeforces: { state: "live", data } }))
    .catch((e: Error) => set({ codeforces: { state: "offline", data: null, error: e.message } }))
    .finally(persist);
}

export function useTelemetry(): Telemetry {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => state,
    () => state,
  );
}
