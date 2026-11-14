import { AboutSection } from "./components/AboutSection";
import { CommandPalette } from "./components/CommandPalette";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";
import { SynthwaveBackground } from "./components/SynthwaveBackground";
import { Toaster } from "./components/ui/Toaster";

export function App() {
  return (
    <div className="relative min-h-screen text-[#F5F0FA] selection:bg-[#E84CA8]/40 selection:text-[#F5F0FA]">
      <SynthwaveBackground />
      <Navbar />

      <main id="main-content" className="relative z-10">
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
  );
}

export default App;
