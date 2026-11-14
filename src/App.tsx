import { MotionConfig } from "framer-motion";
import { AboutSection } from "./components/AboutSection";
import { CommandPalette } from "./components/CommandPalette";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";
import { CinematicBackground } from "./components/CinematicBackground";
import { Toaster } from "./components/ui/Toaster";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen text-[#F2EFE9] selection:bg-[#FF5500]/35 selection:text-[#F2EFE9]">
        <CinematicBackground />
        <Navbar />

        <main id="main-content" className="relative z-10 overflow-x-clip">
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <SkillsSection />
          <ExperienceSection />
          <ContactSection />
        </main>

        <Footer />
        <CommandPalette />
        <Toaster />
      </div>
    </MotionConfig>
  );
}

export default App;
