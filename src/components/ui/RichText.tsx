import { Fragment } from "react";

/** Renders `backtick` segments as inline code and leaves everything else as plain text. */
export function RichText({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded-sm border border-[#F2EFE9]/10 bg-[#F2EFE9]/[0.05] px-1 py-px font-mono text-[0.88em] text-[#F2EFE9]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
