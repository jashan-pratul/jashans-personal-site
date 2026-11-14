import { useSyncExternalStore } from "react";

/**
 * Real, measured page-performance numbers for this very page
 * (Navigation Timing + Paint Timing + React hydration mark). Nothing here is hard-coded.
 */
export interface PerfStats {
  ttfb: number | null;
  fcp: number | null;
  domReady: number | null;
  hydrated: number | null;
  transferKB: number | null;
}

let stats: PerfStats = { ttfb: null, fcp: null, domReady: null, hydrated: null, transferKB: null };
const subs = new Set<() => void>();
const set = (p: Partial<PerfStats>) => {
  stats = { ...stats, ...p };
  subs.forEach((s) => s());
};

let started = false;
export function startPerf() {
  if (started || typeof window === "undefined" || !("performance" in window)) return;
  started = true;

  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const readNav = () => {
    const n = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!n) return;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = resources.reduce((s, r) => s + (r.transferSize || 0), n.transferSize || 0);
    set({
      ttfb: Math.round(n.responseStart - n.startTime),
      domReady: n.domContentLoadedEventEnd > 0 ? Math.round(n.domContentLoadedEventEnd - n.startTime) : null,
      transferKB: bytes > 0 ? Math.round(bytes / 102.4) / 10 : null,
    });
  };
  if (nav) readNav();
  window.addEventListener("load", () => window.setTimeout(readNav, 0), { once: true });

  const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
  if (fcpEntry) set({ fcp: Math.round(fcpEntry.startTime) });
  else if ("PerformanceObserver" in window) {
    try {
      const po = new PerformanceObserver((list) => {
        const e = list.getEntriesByName("first-contentful-paint")[0];
        if (e) {
          set({ fcp: Math.round(e.startTime) });
          po.disconnect();
        }
      });
      po.observe({ type: "paint", buffered: true });
    } catch {
      /* unsupported */
    }
  }
}

export function markHydrated() {
  if (stats.hydrated == null) set({ hydrated: Math.round(performance.now()) });
}

export function usePerf(): PerfStats {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => stats,
    () => stats,
  );
}
