import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  ExternalLink,
  Eye,
  Lock,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { VERIFIED_PROJECTS, type VerifiedProject } from "../data/profile";
import { useBus } from "../lib/bus";
import { ProjectInteractiveDemo } from "./ProjectInteractiveDemo";
import { GitHubIcon } from "./ui/BrandIcons";
import { SpotlightCard } from "./ui/SpotlightCard";

const CATEGORIES = ["All", "Developer Tool", "AI Application", "Machine Learning", "Full-Stack & IoT"] as const;

export function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [activeProject, setActiveProject] = useState<VerifiedProject | null>(null);

  useBus("project:open", (id) => {
    const found = VERIFIED_PROJECTS.find((p) => p.id === id);
    if (found) setActiveProject(found);
  });

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProject]);

  const filtered =
    selectedCategory === "All"
      ? VERIFIED_PROJECTS
      : VERIFIED_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      {/* Section Header & Filter */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="synth-badge">02 / Projects</span>
          <h2
            id="projects-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F5F0FA] sm:text-4xl"
          >
            Selected Work &amp; Interactive Demonstrations
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#b6a8c9]">
            Each project below includes an interactive simulation of its actual core logic alongside what it does, what
            I implemented, what currently works, and its known limitations.
          </p>
        </div>

        <div role="tablist" aria-label="Filter projects by category" className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                  active
                    ? "border-[#E84CA8] bg-[#E84CA8]/20 text-[#F5F0FA]"
                    : "border-white/10 bg-[#120b20]/70 text-[#b6a8c9] hover:border-white/25 hover:text-[#F5F0FA]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {filtered.map((project, idx) => (
          <motion.article
            key={project.id}
            layout
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
          >
            <SpotlightCard className="flex h-full flex-col justify-between p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#36D9E8]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-[#F5F0FA]">{project.name}</h3>
                  </div>
                  <span
                    className="rounded-md border px-2.5 py-0.5 font-mono text-[11px]"
                    style={{
                      borderColor: `${project.accent}55`,
                      backgroundColor: `${project.accent}18`,
                      color: project.accent,
                    }}
                  >
                    {project.category}
                  </span>
                </div>

                <p className="mt-1 mb-4 text-xs font-medium text-[#FF79C6]">{project.tagline}</p>

                <ProjectInteractiveDemo project={project} />

                {/* What it does & Why it was built */}
                <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#b6a8c9]">
                  <p>
                    <strong className="font-mono text-xs uppercase text-[#F5F0FA]">What it does: </strong>
                    {project.whatItDoes}
                  </p>
                  <p>
                    <strong className="font-mono text-xs uppercase text-[#F5F0FA]">Why it was built: </strong>
                    {project.whyBuilt}
                  </p>
                </div>

                {/* What currently works vs Known limitations summary */}
                <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-[#090611]/65 p-4 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#36D9E8]">
                      <CheckCircle2 className="size-3.5" /> What Currently Works
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#F5F0FA]/85">
                      {project.whatCurrentlyWorks.map((w) => (
                        <li key={w} className="flex items-start gap-1.5">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#36D9E8]" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#FFAD57]">
                      <AlertCircle className="size-3.5" /> Known Limitations
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#b6a8c9]">
                      {project.knownLimitations.map((lim) => (
                        <li key={lim} className="flex items-start gap-1.5">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#FFAD57]" />
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technologies */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-white/10 bg-[#120b20] px-2.5 py-1 font-mono text-[11px] text-[#F5F0FA]/90"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E84CA8]/45 bg-[#E84CA8]/15 px-3.5 py-2 font-mono text-xs font-semibold text-[#FF79C6] transition-colors hover:bg-[#E84CA8]/25"
                >
                  <Eye className="size-3.5" />
                  <span>Implementation Details</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {project.chromeWebStoreUrl && (
                    <a
                      href={project.chromeWebStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#36D9E8]/45 bg-[#36D9E8]/15 px-3 py-2 font-mono text-xs font-medium text-[#36D9E8] transition-colors hover:bg-[#36D9E8]/25"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFAD57]/45 bg-[#FFAD57]/15 px-3 py-2 font-mono text-xs font-medium text-[#FFAD57] transition-colors hover:bg-[#FFAD57]/25"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  )}

                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#120b20] px-3 py-2 font-mono text-xs text-[#F5F0FA] transition-colors hover:border-[#36D9E8]"
                    >
                      <GitHubIcon size={14} />
                      <span>GitHub</span>
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#090611]/80 px-3 py-2 font-mono text-xs text-[#b6a8c9]"
                      title="Source code is in a private repository"
                    >
                      <Lock className="size-3.5 text-[#FFAD57]" />
                      <span>{project.repoNote ?? "Private Repo"}</span>
                    </span>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </motion.article>
        ))}
      </div>

      {/* Full Implementation Breakdown Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="scrollbar-thin max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E84CA8]/45 bg-[#120b20] p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-xs" style={{ color: activeProject.accent }}>
                    {activeProject.category}
                  </span>
                  <h3 id="project-modal-title" className="mt-1 font-display text-2xl font-bold text-[#F5F0FA] sm:text-3xl">
                    {activeProject.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#FF79C6]">{activeProject.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  aria-label="Close project details"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-[#090611] text-[#b6a8c9] hover:text-[#F5F0FA]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-[#b6a8c9]">
                <ProjectInteractiveDemo project={activeProject} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#090611]/70 p-4">
                    <h4 className="font-mono text-xs font-bold uppercase text-[#F5F0FA]">What It Does</h4>
                    <p className="mt-2 text-xs leading-relaxed text-[#b6a8c9]">{activeProject.whatItDoes}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#090611]/70 p-4">
                    <h4 className="font-mono text-xs font-bold uppercase text-[#F5F0FA]">Why It Was Built</h4>
                    <p className="mt-2 text-xs leading-relaxed text-[#b6a8c9]">{activeProject.whyBuilt}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#090611]/70 p-4">
                  <h4 className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#FF79C6]">
                    <Wrench className="size-4" /> What I Actually Implemented
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#F5F0FA]/90">
                    {activeProject.whatIImplemented.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FF79C6]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#090611]/70 p-4">
                    <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#36D9E8]">
                      <CheckCircle2 className="size-4" /> What Currently Works
                    </h4>
                    <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#F5F0FA]/90">
                      {activeProject.whatCurrentlyWorks.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#36D9E8]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#090611]/70 p-4">
                    <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#FFAD57]">
                      <AlertCircle className="size-4" /> Known Limitations
                    </h4>
                    <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#b6a8c9]">
                      {activeProject.knownLimitations.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FFAD57]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#b6a8c9]">
                    <Code2 className="size-3.5 text-[#36D9E8]" /> Technologies Actually Used
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeProject.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/10 bg-[#090611] px-2.5 py-1 font-mono text-xs text-[#F5F0FA]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  {activeProject.githubUrl ? (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#090611] px-4 py-2.5 font-mono text-xs font-semibold text-[#F5F0FA] hover:border-[#36D9E8]"
                    >
                      <GitHubIcon size={15} />
                      <span>View Source on GitHub</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#090611] px-4 py-2.5 font-mono text-xs text-[#b6a8c9]">
                      <Lock className="size-3.5 text-[#FFAD57]" />
                      <span>Private Repository</span>
                    </span>
                  )}

                  {activeProject.liveUrl && (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B35D5] to-[#E84CA8] px-4 py-2.5 font-mono text-xs font-bold text-[#F5F0FA]"
                    >
                      <span>Open Live Deployment</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}

                  {activeProject.chromeWebStoreUrl && (
                    <a
                      href={activeProject.chromeWebStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#36D9E8]/50 bg-[#36D9E8]/15 px-4 py-2.5 font-mono text-xs font-semibold text-[#36D9E8]"
                    >
                      <span>Chrome Web Store</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 font-mono text-xs text-[#b6a8c9] hover:text-[#F5F0FA]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
