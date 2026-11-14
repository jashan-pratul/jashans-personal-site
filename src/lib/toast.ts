import { useSyncExternalStore } from "react";

export type ToastKind = "success" | "info" | "error";
export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

let toasts: Toast[] = [];
let seq = 0;
const subs = new Set<() => void>();
const notify = () => subs.forEach((s) => s());

export function toast(title: string, opts: { kind?: ToastKind; description?: string; duration?: number } = {}) {
  const id = ++seq;
  toasts = [...toasts.slice(-3), { id, kind: opts.kind ?? "success", title, description: opts.description }];
  notify();
  window.setTimeout(() => dismiss(id), opts.duration ?? 2600);
  return id;
}

export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}
