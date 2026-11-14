import { emit } from "./bus";
import { toast } from "./toast";

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
export const modKey = isMac ? "⌘" : "Ctrl";

export async function copyText(text: string, label = "Copied to clipboard") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    toast(label, { description: text });
    return true;
  } catch {
    toast("Clipboard unavailable", { kind: "error", description: text });
    return false;
  }
}

export function scrollToSection(id: string, options?: { pushHistory?: boolean }) {
  const el = document.getElementById(id);
  if (!el) return;

  emit("nav:select", id);

  const pushHistory = options?.pushHistory ?? true;
  if (pushHistory && typeof window !== "undefined") {
    const nextUrl = id === "home" ? window.location.pathname : `#${id}`;
    if (window.location.hash !== `#${id}` && !(id === "home" && !window.location.hash)) {
      window.history.pushState({ section: id }, "", nextUrl);
    }
  }

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = 72;
  const targetTop = id === "home" ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset);

  window.scrollTo({
    top: targetTop,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}
