import { motion } from "framer-motion";
import { BookOpen, Code2, Cpu, GraduationCap, MapPin, Wrench } from "lucide-react";
import { EDUCATION, INTERESTS, PROFILE } from "../data/profile";
import { SpotlightCard } from "./ui/SpotlightCard";

export function AboutSection() {
  const icons = [Code2, Cpu, Wrench, BookOpen];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="synth-badge">01 / About</span>
          <h2
            id="about-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F5F0FA] sm:text-4xl"
          >
            Personal Background &amp; Education
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#b6a8c9]">
            My academic path, how I approach learning computer science, and the areas of software engineering I enjoy
            exploring.
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 font-mono text-xs text-[#b6a8c9]">
          <MapPin className="size-3.5 text-[#FF79C6]" />
          <span>{PROFILE.location}</span>
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Personal Introduction & Learning Journey */}
        <SpotlightCard className="p-6 sm:p-8 lg:col-span-7">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#FF79C6]">Introduction</span>
          <h3 className="mt-1.5 font-display text-xl font-bold text-[#F5F0FA] sm:text-2xl">
            Learning Computer Science by Building
          </h3>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#b6a8c9] sm:text-base">
            <p className="text-[#F5F0FA]/95">
              I&apos;m <strong className="text-[#FF79C6]">Jashan Pratul</strong>, a Computer Science Engineering student
              at <strong className="text-[#36D9E8]">{EDUCATION.institution}</strong> in Coimbatore ({EDUCATION.period}).
            </p>
            <p>
              Alongside my undergraduate coursework in programming, discrete mathematics, and data structures, I spend
              my time building practical software projects. Turning an idea into a working repository—and debugging the
              places where my initial assumptions fail—has been the most effective way for me to learn how software
              systems work.
            </p>
            <p>
              My interests span full-stack web development, developer tooling, applied artificial intelligence, and
              foundational machine learning. Rather than claiming mastery over every tool, I document what I have
              actually built, what I am currently learning, and where each project still has room to grow.
            </p>
          </div>
        </SpotlightCard>

        {/* Academic Profile Card */}
        <SpotlightCard className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#36D9E8]">Education</span>
            <div className="mt-3 flex items-start gap-3.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#36D9E8]/40 bg-[#36D9E8]/10 text-[#36D9E8]">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#36D9E8]">{EDUCATION.period}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-[#F5F0FA]">{EDUCATION.institution}</h3>
                <p className="mt-0.5 text-sm font-medium text-[#FF79C6]">{EDUCATION.degree}</p>
                <p className="mt-1 font-mono text-xs text-[#b6a8c9]">{EDUCATION.location}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#b6a8c9]">{EDUCATION.summary}</p>
          </div>

          <div className="mt-6 space-y-2.5 rounded-xl border border-white/10 bg-[#080510]/85 p-4">
            <p className="font-mono text-xs font-semibold text-[#FFAD57]">Current Academic &amp; Self-Study Focus</p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-[#b6a8c9]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#36D9E8]" />
                <span>Core data structures, algorithms, and problem-solving in C and Python</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FF79C6]" />
                <span>Full-stack TypeScript and Python web applications with structured API validation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FFAD57]" />
                <span>Exploratory data analysis, feature preprocessing, and LLM integration patterns</span>
              </li>
            </ul>
          </div>
        </SpotlightCard>
      </div>

      {/* Areas of Interest */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INTERESTS.map((interest, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <motion.div
              key={interest.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
            >
              <SpotlightCard className="h-full p-5">
                <Icon className="size-4 text-[#E84CA8]" />
                <h4 className="mt-3 font-display text-base font-semibold text-[#F5F0FA]">{interest.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#b6a8c9]">{interest.description}</p>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
