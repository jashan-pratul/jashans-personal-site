import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";

const Scene3D = lazy(() => import("./Scene3D"));

/**
 * Mounts the three.js scene only when it is worth it:
 *  - viewport is at least 768px wide (phones get lightweight SVG linework instead)
 *  - the browser is idle (never competes with first paint)
 *  - the user has not asked to save data
 *  - optionally only once the slot is near the viewport
 */
export function Scene3DSlot({
  variant,
  className = "",
  style,
  whenNearViewport = false,
}: {
  variant: "portrait" | "sculpture";
  className?: string;
  style?: CSSProperties;
  whenNearViewport?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!wide || conn?.saveData) return;

    let cancelled = false;
    let io: IntersectionObserver | undefined;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const go = () => {
      if (cancelled) return;
      const run = () => !cancelled && setMount(true);
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(run, { timeout: 1200 });
      } else {
        timeoutId = window.setTimeout(run, 400);
      }
    };

    if (whenNearViewport && ref.current) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io?.disconnect();
            go();
          }
        },
        { rootMargin: "600px 0px" },
      );
      io.observe(ref.current);
    } else {
      go();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [whenNearViewport]);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} style={style}>
      {mount && (
        <Suspense fallback={null}>
          <div className="scene-fade-in size-full">
            <Scene3D variant={variant} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
