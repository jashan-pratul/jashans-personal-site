import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { dismiss, useToasts } from "../../lib/toast";

const ICONS = {
  success: <CheckCircle2 className="size-4 text-em" />,
  info: <Info className="size-4 text-ind" />,
  error: <XCircle className="size-4 text-rose" />,
};

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            type="button"
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line-strong bg-surface-2/95 px-4 py-3 text-left shadow-2xl shadow-black/50 backdrop-blur-md"
          >
            <span className="mt-0.5">{ICONS[t.kind]}</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{t.title}</span>
              {t.description && <span className="block truncate font-mono text-xs text-muted">{t.description}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
