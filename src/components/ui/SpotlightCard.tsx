import { forwardRef, useCallback, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card surface with a cursor-tracked radial spotlight. Mouse position is written to
 * CSS custom properties directly, so hovering never triggers a React re-render.
 */
export const SpotlightCard = forwardRef<HTMLDivElement, Props>(function SpotlightCard(
  { children, className = "", onMouseMove, ...rest },
  ref,
) {
  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
      onMouseMove?.(e);
    },
    [onMouseMove],
  );
  return (
    <div ref={ref} onMouseMove={handleMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </div>
  );
});

export function CardHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-ink/80">{icon}</div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="truncate font-mono text-[11px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
