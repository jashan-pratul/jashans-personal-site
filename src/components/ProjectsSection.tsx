import { motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, ArrowUpRight, CheckCircle2, ExternalLink, Lock, Wrench } from "lucide-react";
import { useRef, useState } from "react";
import { VERIFIED_PROJECTS, type VerifiedProject } from "../data/profile";
import { useBus } from "../lib/bus";
import { EASE_OUT, REVEAL_VIEWPORT } from "../lib/motion";
import { ProjectInteractiveDemo } from "./ProjectInteractiveDemo";
import { GitHubIcon } from "./ui/BrandIcons";
import { Reveal } from "./ui/Motion";
import { RichText } from "./ui/RichText";
import { SectionHeader } from "./ui/SectionHeader";

const CATEGORIES = ["All", "Developer Tool", "AI Application", "Machine Learning", "Full-Stack & IoT"] as const;

function ProjectArticle({ project, highlighted }: { project: VerifiedProject; highlighted: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numeralY = useTransform(scrollYProgress, [0, 1], [65, -85]);

  return (
    <motion.article
      ref={ref}
      id={`project-${project.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative py-12 transition-colors duration-500 sm:py-16 ${
        highlighted ? "bg-[#FF5500]/[0.03]" : ""
      }`}
    >
      <motion.span
        aria-hidden="true"
        style={{ y: numeralY, WebkitTextStroke: "1px rgba(242,239,233,0.065)" }}
        className="pointer-events-none absolute top-6 right-0 hidden font-display text-[11rem] leading-none font-bold text-transparent select-none lg:block"
      >
        {project.index}
      </motion.span>

      {/* Case Study Masthead */}
      <Reveal className="relative flex flex-col justify-between gap-4 border-b border-[#F2EFE9]/10 pb-6 lg:flex-row lg:items-end">
        <div className="flex items-start gap-4 sm:gap-6">
          <span className="font-display text-4xl leading-none font-bold tabular-nums text-[#FF5500] sm:text-5xl">
            {project.index}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#F2EFE9]/15 bg-[#0E0E12] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#A6A29A]">
                {project.category}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6B65]">
                Case Study {project.index} / 06
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#F2EFE9] sm:text-4xl">
              {project.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm font-medium text-[#A6A29A] sm:text-base">{project.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {project.chromeWebStoreUrl && (
            <a
              href={project.chromeWebStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-[#38BDF8]/45 bg-[#38BDF8]/10 px-3.5 py-2 font-mono text-xs font-semibold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20"
            >
              <span>Chrome Web Store</span>
              <ExternalLink className="size-3.5" />
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#FF5500] px-4 py-2 font-mono text-xs font-bold text-[#08080A] transition-colors hover:bg-[#FF6B22]"
            >
              <span>Live site</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          )}

          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#F2EFE9]/20 bg-[#0E0E12] px-4 py-2 font-mono text-xs font-medium text-[#F2EFE9] transition-colors hover:border-[#FF5500]"
            >
              <GitHubIcon size={14} />
              <span>GitHub</span>
              <ArrowUpRight className="size-3.5 text-[#A6A29A]" />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 border border-[#F2EFE9]/12 bg-[#0E0E12] px-3.5 py-2 font-mono text-xs text-[#A6A29A]"
              title="The source code is in a private repository"
            >
              <Lock className="size-3.5 text-[#F59E0B]" />
              <span>{project.repoNote ?? "Private repository"}</span>
            </span>
          )}
        </div>
      </Reveal>

      {/* Case Study Body */}
      <div className="relative mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <ProjectInteractiveDemo project={project} />

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-[#6E6B65]">Built with</span>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="border border-[#F2EFE9]/12 bg-[#0E0E12] px-2.5 py-1 font-mono text-[11px] text-[#F2EFE9]/90 transition-colors hover:border-[#FF5500]/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <Reveal className="grid gap-4 border border-[#F2EFE9]/12 bg-[#0E0E12]/75 p-5">
            <div>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF5500]">
                What it does
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[#F2EFE9]/95">{project.whatItDoes}</p>
            </div>

            <div className="border-t border-[#F2EFE9]/10 pt-4">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#38BDF8]">
                Why I built this
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[#A6A29A]">{project.whyBuilt}</p>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="border border-[#F2EFE9]/12 bg-[#0E0E12]/75 p-5">
            <h4 className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#F2EFE9]">
              <Wrench className="size-3.5 text-[#FF5500]" />
              <span>My contribution</span>
            </h4>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#A6A29A] sm:text-[13px]">
              {project.whatIImplemented.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 bg-[#FF5500]" />
                  <span>
                    <RichText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#10B981]/25 bg-[#0B1210]/75 p-4">
              <h4 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
                <CheckCircle2 className="size-3.5" />
                <span>What works</span>
              </h4>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#F2EFE9]/90">
                {project.whatCurrentlyWorks.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1 shrink-0 bg-[#10B981]" />
                    <span>
                      <RichText text={w} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[#F59E0B]/25 bg-[#14100B]/75 p-4">
              <h4 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                <AlertCircle className="size-3.5" />
                <span>Limitations</span>
              </h4>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#A6A29A]">
                {project.knownLimitations.map((lim) => (
                  <li key={lim} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1 shrink-0 bg-[#F59E0B]" />
                    <span>
                      <RichText text={lim} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const jumpToCaseStudy = (id: string) => {
    setSelectedCategory("All");
    setHighlightedId(id);
    window.setTimeout(() => {
      const el = document.getElementById(`project-${id}`);
      if (el) {
        const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84);
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 40);
  };

  useBus("project:open", (id) => {
    jumpToCaseStudy(id);
  });

  const filtered =
    selectedCategory === "All"
      ? VERIFIED_PROJECTS
      : VERIFIED_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10"
    >
      <SectionHeader
        id="projects-heading"
        index="02"
        label="Projects"
        title="My Projects"
        aside={
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-md text-sm leading-relaxed text-[#A6A29A] lg:text-right">
              Six things I have built, from a Chrome extension to a sensor prototype. Each one has an overview and a
              technical details tab with a small working version of its logic.
            </p>
            <div role="tablist" aria-label="Filter projects by category" className="flex flex-wrap gap-1.5 lg:justify-end">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`border px-3.5 py-2 font-mono text-xs transition-colors ${
                      active
                        ? "border-[#FF5500] bg-[#FF5500] font-bold text-[#08080A]"
                        : "border-[#F2EFE9]/12 bg-[#0E0E12] text-[#A6A29A] hover:border-[#F2EFE9]/30 hover:text-[#F2EFE9]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {/* Quick Case Study Directory Strip */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border border-[#F2EFE9]/10 bg-[#0E0E12]/70 px-4 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FF5500]">
          Case Studies:
        </span>
        {VERIFIED_PROJECTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => jumpToCaseStudy(p.id)}
            className="inline-flex items-center gap-1.5 border border-[#F2EFE9]/10 bg-[#08080A] px-2.5 py-1 font-mono text-[11px] text-[#A6A29A] transition-colors hover:border-[#FF5500] hover:text-[#F2EFE9]"
          >
            <span className="font-bold text-[#FF5500]">{p.index}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="mt-10 divide-y divide-[#F2EFE9]/12 border-t border-b border-[#F2EFE9]/12"
      >
        {filtered.map((project) => (
          <ProjectArticle key={project.id} project={project} highlighted={highlightedId === project.id} />
        ))}
      </motion.div>
    </section>
  );
}
