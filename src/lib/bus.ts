import { useEffect, useRef } from "react";

/**
 * Typed event bus. Lets decoupled modules (⌘K palette, terminal, lab widgets,
 * project & article readers, audio controller) communicate cleanly without prop drilling.
 */
export type BusEvents = {
  "terminal:run": string;
  "terminal:focus": undefined;
  "ll:reverse": undefined;
  "ll:cycle": undefined;
  "ll:insert": undefined;
  "ll:transition": undefined;
  "resume:open": undefined;
  "palette:open": undefined;
  "project:open": string;
  "nav:select": string;
  "article:open": string;
  "lab:select": string;
  "sound:toggle": undefined;
  "fx:toggle": undefined;
};

type Handler<T> = (payload: T) => void;
const listeners = new Map<keyof BusEvents, Set<Handler<unknown>>>();

export function emit<K extends keyof BusEvents>(
  event: K,
  ...payload: BusEvents[K] extends undefined ? [] : [BusEvents[K]]
): void {
  listeners.get(event)?.forEach((fn) => fn(payload[0]));
}

export function on<K extends keyof BusEvents>(event: K, fn: Handler<BusEvents[K]>): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(fn as Handler<unknown>);
  return () => {
    set.delete(fn as Handler<unknown>);
  };
}

/** Subscribe for the component lifetime; always calls the latest handler. */
export function useBus<K extends keyof BusEvents>(event: K, fn: Handler<BusEvents[K]>): void {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => on(event, (p) => ref.current(p)), [event]);
}
