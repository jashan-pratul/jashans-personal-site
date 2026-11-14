import { motion } from "framer-motion";
import { ArrowUpRight, Network, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { HONEST_SKILLS, VERIFIED_PROJECTS } from "../data/profile";
import { EASE_OUT, REVEAL_VIEWPORT } from "../lib/motion";
import { SectionHeader } from "./ui/SectionHeader";

const PROJECT_MAP = new Map(VERIFIED_PROJECTS.map((p) => [p.id, p]));

export function SkillsSection() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const jumpToProject = (projectId: string) => {
    const el = document.getElementById(`project-${projectId}`);
    if (el) {
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84);
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Compute which projects and skill groups are currently highlighted
  const activeProjectIds = useMemo(() => {
    if (selectedProject) return new Set([selectedProject]);
    if (selectedSkill) {
      for (const g of HONEST_SKILLS) {
        const found = g.items.find((i) => i.name === selectedSkill);
        if (found) return new Set(found.relatedProjects);
      }
    }
    return new Set<string>();
  }, [selectedProject, selectedSkill]);

  const activeGroupIds = useMemo(() => {
    if (selectedSkill) {
      for (const g of HONEST_SKILLS) {
        if (g.items.some((i) => i.name === selectedSkill)) return new Set([g.id]);
      }
    }
    if (selectedProject) {
      const s = new Set<string>();
      for (const g of HONEST_SKILLS) {
        if (g.items.some((i) => i.relatedProjects.includes(selectedProject))) {
          s.add(g.id);
        }
      }
      return s;
    }
    return new Set<string>();
  }, [selectedProject, selectedSkill]);

  const hasFilter = selectedSkill !== null || selectedProject !== null;

  // Coordinates for the SVG connection conduit between the 6 project nodes (top) and 4 skill clusters (bottom)
  const projectX = [85, 250, 415, 580, 745, 910];
  const groupX = [145, 380, 620, 855];

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10"
    >
      <SectionHeader
        id="skills-heading"
        index="03"
        label="Skills"
        title="Skills and Where I Used Them"
        note="Grouped by how I have actually used each one, with no skill percentages. Select a project or skill to trace its connections."
      />

      {/* Interactive Skill <-> Project Architecture Conduit */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="mt-10 border border-[#F2EFE9]/12 bg-[#0B0B0F]/90 p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFE9]/10 pb-3.5">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF5500]">
            <Network className="size-3.5" />
            <span>Interactive Project ↔ Skill Connection Map</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#A6A29A]">
              {selectedProject
                ? `Showing skills used in ${PROJECT_MAP.get(selectedProject)?.name}`
                : selectedSkill
                  ? `Showing projects using ${selectedSkill}`
                  : "Select any project node or skill below"}
            </span>
            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedSkill(null);
                }}
                className="inline-flex items-center gap-1 border border-[#FF5500]/50 bg-[#FF5500]/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#FF5500] transition-colors hover:bg-[#FF5500]/20"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Project Nodes */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {VERIFIED_PROJECTS.map((proj) => {
            const isSelected = selectedProject === proj.id;
            const isConnected = activeProjectIds.has(proj.id);
            const active = isSelected || isConnected;

            return (
              <button
                key={proj.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedSkill(null);
                  setSelectedProject(isSelected ? null : proj.id);
                }}
                className={`group flex flex-col justify-between border p-3 text-left transition-all ${
                  active
                    ? "border-[#FF5500] bg-[#FF5500]/14 text-[#F2EFE9]"
                    : hasFilter
                      ? "border-[#F2EFE9]/8 bg-[#08080A]/60 text-[#6E6B65] opacity-55 hover:opacity-100"
                      : "border-[#F2EFE9]/12 bg-[#08080A] text-[#A6A29A] hover:border-[#F2EFE9]/30 hover:text-[#F2EFE9]"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-[#FF5500]">{proj.index}</span>
                  <span
                    className={`size-1.5 rounded-full ${
                      active ? "bg-[#FF5500] shadow-[0_0_8px_#FF5500]" : "bg-[#F2EFE9]/20"
                    }`}
                  />
                </div>
                <div className="mt-1.5 truncate font-display text-xs font-bold text-[#F2EFE9]">{proj.name}</div>
              </button>
            );
          })}
        </div>

        {/* Desktop SVG Animated Connection Conduit between Projects and Skill Clusters */}
        <div className="hidden lg:block">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 68"
            className="h-16 w-full overflow-visible"
            fill="none"
          >
            {VERIFIED_PROJECTS.map((proj, pIdx) =>
              HONEST_SKILLS.map((group, gIdx) => {
                const linksCount = group.items.filter((item) =>
                  item.relatedProjects.includes(proj.id),
                ).length;
                if (linksCount === 0) return null;

                const x1 = projectX[pIdx];
                const x2 = groupX[gIdx];
                const isHighlighted =
                  (selectedProject === proj.id && activeGroupIds.has(group.id)) ||
                  (selectedSkill !== null &&
                    activeProjectIds.has(proj.id) &&
                    activeGroupIds.has(group.id));

                const stroke = isHighlighted ? group.accent : "#F2EFE9";
                const opacity = isHighlighted ? 0.85 : hasFilter ? 0.05 : 0.14;
                const width = isHighlighted ? 1.75 : 1;

                return (
                  <path
                    key={`${proj.id}-${group.id}`}
                    d={`M ${x1} 4 C ${x1} 34, ${x2} 34, ${x2} 64`}
                    stroke={stroke}
                    strokeOpacity={opacity}
                    strokeWidth={width}
                    className="transition-all duration-300"
                  />
                );
              }),
            )}
          </svg>

          {/* 4 Cluster Node Indicators aligned with SVG bottom endpoints */}
          <div className="grid grid-cols-4 gap-3 border-t border-[#F2EFE9]/10 pt-3">
            {HONEST_SKILLS.map((g) => {
              const active = activeGroupIds.has(g.id);
              const matchCount = selectedProject
                ? g.items.filter((i) => i.relatedProjects.includes(selectedProject)).length
                : g.items.length;
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between border px-3 py-1.5 font-mono text-[10px] transition-colors ${
                    active
                      ? "border-[#FF5500]/50 bg-[#0E0E14] text-[#F2EFE9]"
                      : "border-[#F2EFE9]/8 bg-[#08080A] text-[#6E6B65]"
                  }`}
                >
                  <span className="truncate">
                    <strong style={{ color: g.accent }}>{g.index}</strong> · {g.title}
                  </span>
                  <span className="ml-2 shrink-0 tabular-nums text-[#A6A29A]">{matchCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 4 Honest Skill Groupings */}
      <div className="mt-8 grid border-t border-l border-[#F2EFE9]/12 lg:grid-cols-2">
        {HONEST_SKILLS.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.7, delay: (idx % 2) * 0.08, ease: EASE_OUT }}
            className="flex flex-col justify-between border-r border-b border-[#F2EFE9]/12 bg-[#08080A]/85 p-6 sm:p-8"
          >
            <div>
              <div className="relative flex items-baseline justify-between gap-3 pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-bold tabular-nums" style={{ color: group.accent }}>
                    {group.index}
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#F2EFE9] sm:text-2xl">{group.title}</h3>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6E6B65]">
                  {group.items.length} items
                </span>
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-px w-full origin-left"
                  style={{ backgroundColor: "rgba(242,239,233,0.12)" }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 1, delay: 0.1, ease: EASE_OUT }}
                />
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-px w-16 origin-left"
                  style={{ backgroundColor: group.accent }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
                />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-[#A6A29A]">{group.subtitle}</p>

              <ul className="mt-5 divide-y divide-[#F2EFE9]/[0.08] border-y border-[#F2EFE9]/[0.08]">
                {group.items.map((item) => {
                  const isSkillActive = selectedSkill === item.name;
                  const isProjectMatched =
                    selectedProject !== null && item.relatedProjects.includes(selectedProject);
                  const isActive = isSkillActive || isProjectMatched;
                  const dimmed = hasFilter && !isActive;

                  return (
                    <li
                      key={item.name}
                      className={`py-3 transition-opacity duration-300 ${dimmed ? "opacity-35" : "opacity-100"}`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSkillActive}
                        onClick={() => {
                          setSelectedProject(null);
                          setSelectedSkill(isSkillActive ? null : item.name);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedProject(null);
                            setSelectedSkill(isSkillActive ? null : item.name);
                          }
                        }}
                        className="flex cursor-pointer flex-col justify-between gap-1.5 text-left sm:flex-row sm:items-center sm:gap-4"
                      >
                        <span className="flex items-center gap-2.5 font-mono text-xs font-semibold text-[#F2EFE9]">
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 transition-colors duration-300"
                            style={{ backgroundColor: isActive ? group.accent : "rgba(242,239,233,0.2)" }}
                          />
                          {item.name}
                        </span>
                        <span className="text-xs text-[#A6A29A] sm:text-right">{item.context}</span>
                      </div>

                      {item.relatedProjects.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-4">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#6E6B65]">
                            Used in
                          </span>
                          {item.relatedProjects.map((pid) => {
                            const proj = PROJECT_MAP.get(pid);
                            if (!proj) return null;
                            const pillHighlighted = isActive && (isSkillActive || selectedProject === pid);
                            return (
                              <button
                                key={pid}
                                type="button"
                                onClick={() => jumpToProject(pid)}
                                className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] transition-colors hover:border-[#FF5500] hover:text-[#F2EFE9] ${
                                  pillHighlighted
                                    ? "border-[#FF5500]/65 bg-[#FF5500]/15 text-[#F2EFE9]"
                                    : "border-[#F2EFE9]/10 bg-[#0E0E12] text-[#A6A29A]"
                                }`}
                              >
                                <span className="text-[#FF5500]">{proj.index}</span>
                                <span>{proj.name}</span>
                                <ArrowUpRight className="size-2.5" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
