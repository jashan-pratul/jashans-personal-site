import { GraduationCap, Layers, MapPin } from "lucide-react";
import { useState } from "react";
import { EDUCATION, INTERESTS, PROFILE } from "../data/profile";
import { Reveal } from "./ui/Motion";
import { SectionHeader } from "./ui/SectionHeader";

const BUILD_PRINCIPLES = [
  {
    step: "01",
    label: "Scope & Model",
    detail: "Start with a concrete problem and define the exact data shapes before adding UI or AI layers.",
  },
  {
    step: "02",
    label: "Build a Running Core",
    detail: "Write the deterministic baseline first (like a local ring buffer, recursive-descent parser, or log ranker).",
  },
  {
    step: "03",
    label: "Check the Edges",
    detail: "Test malformed inputs, missing API keys, rate limits, and hardware debounce thresholds.",
  },
  {
    step: "04",
    label: "Document Limits",
    detail: "Write down what currently works and what the prototype does not do yet with equal clarity.",
  },
] as const;

const INTEREST_TAGS: Record<string, readonly string[]> = {
  "01": ["TypeScript", "React 19", "Next.js", "Node.js", "Express"],
  "02": ["Gemini API", "Zod Schemas", "Python", "Scikit-learn", "Pandas"],
  "03": ["Manifest V3", "FastAPI", "NetworkX", "Vitest", "CLI / Logs"],
  "04": ["ESP32 / C++", "MongoDB", "SQLite", "Three.js", "Vercel"],
};

export function AboutSection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10"
    >
      <SectionHeader
        id="about-heading"
        index="01"
        label="About"
        title="Learning Computer Science by Building"
        aside={
          <p className="inline-flex items-center gap-2 font-mono text-xs text-[#A6A29A]">
            <MapPin className="size-3.5 text-[#FF5500]" />
            <span>{PROFILE.location}</span>
          </p>
        }
      />

      {/* Editorial 12-Column Spread (Zero duplicate portraits) */}
      <div className="mt-12 grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left 5 Columns: Architectural Education Specification Dossier */}
        <Reveal className="lg:col-span-5">
          <div className="relative flex h-full flex-col justify-between border border-[#F2EFE9]/14 bg-[#0E0E12]/90 backdrop-blur-sm">
            {/* Corner ticks */}
            <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-[#FF5500]" />
            <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-[#FF5500]" />

            <div>
              <div className="flex items-center justify-between border-b border-[#F2EFE9]/10 px-5 py-3.5">
                <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF5500]">
                  <GraduationCap className="size-4" />
                  <span>Education</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-[#38BDF8]">2025 – 2029</span>
              </div>

              <dl className="divide-y divide-[#F2EFE9]/[0.08] font-mono text-xs">
                <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                  <dt className="text-[#6E6B65]">COLLEGE</dt>
                  <dd className="col-span-2 font-sans font-semibold text-[#F2EFE9]">{EDUCATION.institution}</dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                  <dt className="text-[#6E6B65]">DEGREE</dt>
                  <dd className="col-span-2 font-sans text-[#F2EFE9]">{EDUCATION.degree}</dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                  <dt className="text-[#6E6B65]">TIMELINE</dt>
                  <dd className="col-span-2 text-[#FF5500]">{EDUCATION.period}</dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                  <dt className="text-[#6E6B65]">LOCATION</dt>
                  <dd className="col-span-2 text-[#A6A29A]">{EDUCATION.location}</dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                  <dt className="text-[#6E6B65]">COURSEWORK</dt>
                  <dd className="col-span-2 font-sans leading-relaxed text-[#A6A29A]">
                    Programming in C and Python, discrete mathematics, data structures, and applied engineering labs
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-[#F2EFE9]/10 bg-[#08080A]/65 px-5 py-3.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6E6B65]">
                Campus Communities
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Kumaraguru School of Innovation", "LEED Kumaraguru", "E-Cell IIT Bombay"].map((org) => (
                  <span
                    key={org}
                    className="border border-[#F2EFE9]/12 bg-[#0E0E12] px-2.5 py-1 font-mono text-[10px] text-[#F2EFE9]/90"
                  >
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right 7 Columns: Editorial Narrative & Interactive Engineering Workflow */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <Reveal>
              <p className="font-display text-xl leading-[1.45] font-medium text-[#F2EFE9] sm:text-2xl">
                I&apos;m <span className="text-[#FF5500]">{PROFILE.name}</span>, an undergraduate Computer Science
                Engineering student at{" "}
                <span className="underline decoration-[#FF5500]/60 underline-offset-4">{EDUCATION.institution}</span> in
                Coimbatore ({EDUCATION.period}).
              </p>
            </Reveal>

            <Reveal
              delay={0.08}
              className="mt-6 grid gap-6 border-t border-[#F2EFE9]/10 pt-6 text-sm leading-[1.75] text-[#A6A29A] sm:grid-cols-2 sm:text-[15px]"
            >
              <p>
                Alongside my classes in programming, discrete maths and data structures, I build things. Turning an idea
                into a working project, and fixing the places where my first assumptions turned out wrong, is the best
                way I have found to understand how software works.
              </p>
              <p>
                My projects include web apps, a local-first developer tool, apps that use the Gemini API, and machine
                learning notebooks. I would rather be clear about what each project does, and what it does not do yet,
                than claim I have mastered everything.
              </p>
            </Reveal>
          </div>

          {/* Interactive 4-Step Engineering Principle Schematic */}
          <Reveal
            delay={0.12}
            className="mt-8 border border-[#F2EFE9]/12 border-l-2 border-l-[#FF5500] bg-[#0E0E12]/85 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF5500]">
                <Layers className="size-3.5" />
                <span>How I like to work</span>
              </span>
              <span className="font-mono text-[10px] text-[#6E6B65]">Select a stage</span>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {BUILD_PRINCIPLES.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    onMouseEnter={() => setActiveStep(idx)}
                    className={`border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-[#FF5500] bg-[#FF5500]/14 text-[#F2EFE9]"
                        : "border-[#F2EFE9]/10 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/25 hover:text-[#F2EFE9]"
                    }`}
                  >
                    <span className="block font-mono text-[10px] font-bold text-[#FF5500]">{item.step}</span>
                    <span className="mt-0.5 block font-display text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3.5 text-xs leading-relaxed text-[#F2EFE9]/90 sm:text-sm">
              <span className="font-mono text-xs font-bold text-[#FF5500]">
                {BUILD_PRINCIPLES[activeStep].step} · {BUILD_PRINCIPLES[activeStep].label}:{" "}
              </span>
              <span className="text-[#A6A29A]">{BUILD_PRINCIPLES[activeStep].detail}</span>
            </p>
          </Reveal>
        </div>
      </div>

      {/* What I work on — 4-Column Architectural Grid */}
      <div className="mt-14">
        <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[#6E6B65]">
          <span>What I work on</span>
          <span className="hidden text-[#A6A29A] sm:inline">04 Focus Areas</span>
        </div>

        <div className="grid border-t border-l border-[#F2EFE9]/12 sm:grid-cols-2 lg:grid-cols-4">
          {INTERESTS.map((interest, idx) => {
            const tags = INTEREST_TAGS[interest.index] ?? [];
            return (
              <Reveal
                key={interest.title}
                delay={idx * 0.06}
                y={12}
                className="group relative flex flex-col justify-between border-r border-b border-[#F2EFE9]/12 bg-[#08080A]/85 p-6 transition-colors hover:bg-[#0E0E12]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tabular-nums text-[#FF5500]">{interest.index}</span>
                    <span className="size-1.5 bg-[#F2EFE9]/20 transition-colors group-hover:bg-[#FF5500]" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-[#F2EFE9] transition-colors group-hover:text-[#FF5500]">
                    {interest.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A6A29A] sm:text-[13px]">{interest.description}</p>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#F2EFE9]/10 bg-[#0E0E12] px-2 py-0.5 font-mono text-[10px] text-[#6E6B65] transition-colors group-hover:text-[#A6A29A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-px w-0 bg-[#FF5500] transition-all duration-500 group-hover:w-full"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
