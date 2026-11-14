/**
 * Single source of truth for Jashan Pratul's portfolio.
 * Every project, skill category, and experience entry is verified against
 * actual repositories, source code, and documented student history.
 */

export type Persona = "recruiter" | "founder" | "engineer";
export const PERSONAS_ORDER: Persona[] = ["recruiter", "founder", "engineer"];

export const PROFILE = {
  name: "Jashan Pratul",
  fullName: "Jashan Pratul G",
  firstName: "Jashan",
  handle: "jashan-pratul",
  xHandle: "JashanPratul",
  email: "jashanpratul.8b@gmail.com",
  city: "Coimbatore, India",
  location: "Coimbatore, Tamil Nadu, India",
  positioning: "Computer Science Engineering Student | Software Developer | AI Enthusiast",
  intro:
    "I'm Jashan, a Computer Science Engineering student at Kumaraguru College of Technology. I enjoy building software, exploring AI and learning by turning ideas into working projects.",
  summary:
    "I started my undergraduate degree in Computer Science Engineering in September 2025. Outside of coursework, I spend my time building web applications, developer tools, AI prototypes, and machine learning notebooks to understand how software works in practice.",
  status: "BE Computer Science Engineering (2025–2029)",
  codeforcesHandle: "jashan-pratul",
  linkedinReachNote: "150K+ LinkedIn post impressions (historical self-reported figure from résumé, not a live feed)",
  links: {
    github: "https://github.com/jashan-pratul",
    linkedin: "https://www.linkedin.com/in/jashan-pratul-9bb8a12b1/",
    x: "https://x.com/JashanPratul",
    email: "mailto:jashanpratul.8b@gmail.com",
    codeforces: "https://codeforces.com/profile/jashan-pratul",
  },
} as const;

export const EDUCATION = {
  institution: "Kumaraguru College of Technology",
  location: "Coimbatore, India",
  degree: "Bachelor of Engineering in Computer Science Engineering",
  shortDegree: "BE Computer Science Engineering",
  period: "September 2025 – September 2029",
  summary:
    "First-year undergraduate student focusing on programming fundamentals, data structures, discrete mathematics, and hands-on software engineering projects.",
} as const;

export const INTERESTS = [
  {
    title: "Software & Web Development",
    description:
      "Building full-stack web applications with TypeScript, React, Next.js, Node.js, and Python backends.",
  },
  {
    title: "Artificial Intelligence & ML",
    description:
      "Working with structured LLM outputs (Google Gemini API + Zod) and foundational machine learning workflows in Python.",
  },
  {
    title: "Developer Tools",
    description:
      "Creating practical utilities like local-first browser extensions and incident log analyzers that make debugging clearer.",
  },
  {
    title: "Product Building & Entrepreneurship",
    description:
      "Taking small, concrete problems from an initial idea to a deployed MVP and iterating based on what works.",
  },
] as const;

export interface VerifiedProject {
  id: string;
  name: string;
  tagline: string;
  category: "AI Application" | "Developer Tool" | "Full-Stack & IoT" | "Machine Learning";
  accent: string;
  flow: readonly [string, string, string, string];
  whatItDoes: string;
  whyBuilt: string;
  whatIImplemented: string[];
  technologies: string[];
  whatCurrentlyWorks: string[];
  knownLimitations: string[];
  githubUrl?: string;
  repoNote?: string;
  liveUrl?: string;
  chromeWebStoreUrl?: string;
  extraLinkLabel?: string;
  extraLinkUrl?: string;
}

export const VERIFIED_PROJECTS: VerifiedProject[] = [
  {
    id: "repropack",
    name: "ReproPack",
    tagline: "Local-first Chrome extension for recording, filtering, redacting, and exporting diagnostic events",
    category: "Developer Tool",
    accent: "#36D9E8",
    flow: [
      "Event Dispatched to Extension",
      "Bounded Ring Buffer (1,000 max)",
      "Regex Token & PII Scrubbing",
      "Inspector & JSON Blob Export",
    ],
    whatItDoes:
      "A Manifest V3 Chrome extension (v0.3.0) and companion documentation site that records developer diagnostic events in a bounded local session buffer, applies heuristic token/PII masking, and exports structured JSON for bug reproduction.",
    whyBuilt:
      "When reproducing frontend bugs, developers often have to manually copy console errors and payloads from DevTools and strip out tokens by hand before sharing a bug report.",
    whatIImplemented: [
      "Built the Manifest V3 background service worker and popup/full-tab inspector in TypeScript and Vite, requesting only the Chrome `storage` permission.",
      "Implemented a bounded in-memory ring buffer (up to 1,000 events with FIFO eviction and 24-hour expiration) checkpointed to `chrome.storage.session`.",
      "Added regex-based client-side scrubbing for common sensitive patterns (Bearer tokens, JWTs, API keys, emails, and query parameters like `token` or `password`).",
      "Built severity filtering (`Error`, `Warn`, `Info`, `Debug`), text search, payload inspection, client-side JSON Blob export, and a Vitest unit test suite, plus the companion web playground (`repropack.vercel.app`).",
    ],
    technologies: [
      "TypeScript",
      "Chrome Extensions API (Manifest V3)",
      "Vite",
      "Vitest",
      "React (Documentation Site)",
      "HTML / CSS",
    ],
    whatCurrentlyWorks: [
      "Captures diagnostic events sent to the extension and persists up to 1,000 events across service-worker idle cycles using `chrome.storage.session`.",
      "Filters events by severity and keyword, inspects formatted JSON payloads, and downloads 2-space indented JSON reproduction files.",
      "Published on the Chrome Web Store and documented with an interactive web playground.",
    ],
    knownLimitations: [
      "Because it intentionally avoids requesting `<all_urls>` or `webRequest` permissions, it does not passively intercept third-party network traffic or automatically hook `window.console` on arbitrary tabs—events must be dispatched to the extension.",
      "Credential redaction uses regex heuristics rather than guaranteed parser-level secret detection, so exported files should still be reviewed before sharing.",
    ],
    githubUrl: "https://github.com/jashan-pratul/ReproPack",
    liveUrl: "https://repropack.vercel.app/",
    chromeWebStoreUrl: "https://chromewebstore.google.com/detail/repropack/fmdemocakcbjgppjeipgabbgbafbkaaa",
  },
  {
    id: "adapted",
    name: "AdaptEd",
    tagline: "Error-aware adaptive learning prototype using structured Gemini outputs and reassessment rounds",
    category: "AI Application",
    accent: "#E84CA8",
    flow: [
      "Concept, Question & Answer",
      "Zod Validation (/api/analyze)",
      "Gemini Diagnosis & Strategy",
      "Adapted Explanation + Reassessment",
    ],
    whatItDoes:
      "An adaptive learning web application that inspects a learner's answer to a concept question, identifies the likely type of mistake, generates a tailored explanation in a different representation, and creates a follow-up question to reassess understanding.",
    whyBuilt:
      "Standard practice tools often just mark an answer wrong or lower the difficulty without addressing why the student made that mistake (for example, adding numerators and denominators directly in `1/2 + 1/4 = 2/6`).",
    whatIImplemented: [
      "Built a Next.js App Router application (`app/page.tsx` and `app/api/analyze/route.ts`) using TypeScript and Tailwind CSS.",
      "Defined strict Zod schemas (`lib/schema.ts`) to validate incoming requests and enforce structured model outputs (`difficultyType`, `confidence`, `diagnosis`, `evidence`, `strategy`, `representation`, `adaptedExplanation`, `nextQuestion`, `masteryStatus`).",
      "Integrated the Vercel AI SDK (`ai`, `@ai-sdk/google`) with Google Gemini (`gemini-3.5-flash-lite`) to run up to 3 iterative reassessment rounds per concept.",
      "Implemented explicit error handling for API rate limits (`429`), authentication errors (`401/403`), and service unavailability (`503`).",
    ],
    technologies: [
      "TypeScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "Vercel AI SDK",
      "Google Gemini API",
      "Zod",
    ],
    whatCurrentlyWorks: [
      "Accepts a concept, question, and learner response, then returns a structured misconception diagnosis and an adapted explanation (`Simplified Text`, `Visual / Structured`, or `Example / Analogy`).",
      "Tracks up to 3 reassessment rounds in session state and updates mastery status (`mastered`, `continue`, or `needs_support`) based on the learner's follow-up answers.",
    ],
    knownLimitations: [
      "Research prototype with in-memory client session state only (no user accounts or persistent database).",
      "Requires an active Gemini API key and available quota; infers difficulty strictly from written responses and does not perform clinical or medical diagnosis.",
    ],
    githubUrl: "https://github.com/jashan-pratul/AdaptEd-MVP",
    liveUrl: "https://adapted-igtv8sofj-jashanpratuls-projects.vercel.app/",
  },
  {
    id: "rootcause-ai",
    name: "Root Cause AI",
    tagline: "AI-assisted incident log and service dependency analyzer",
    category: "AI Application",
    accent: "#FFAD57",
    flow: [
      "JSON Logs + Dependency Map",
      "FastAPI Deterministic Ranking",
      "Reverse Graph Impact Walk",
      "Optional Gemini Hypothesis",
    ],
    whatItDoes:
      "A debugging web application that analyzes structured application error logs alongside a service dependency map to highlight a candidate root-cause service, trace downstream impacted services, and suggest diagnostic checks.",
    whyBuilt:
      "Built to explore how deterministic graph and log rules can be paired with LLM-generated hypotheses during incident investigation without treating AI output as ground truth.",
    whatIImplemented: [
      "Built a Python FastAPI backend (`api.py`, `main.py`, `graph.py`, `pdf_report.py`) and a Next.js frontend dashboard.",
      "Implemented a deterministic baseline that validates ISO-8601 log entries (`CRITICAL`, `ERROR`, `WARNING`, `INFO`), ranks candidate services by severity, frequency, and earliest timestamp, and walks the dependency graph in reverse to list potentially impacted downstream services.",
      "Added an optional server-side Google Gemini step that generates a labeled hypothesis and diagnostic checklist, while returning `ai_status: 'unavailable'` if Gemini is unconfigured so the deterministic analysis still succeeds.",
      "Wrote Python `unittest` suites that mock the Gemini client for offline testing.",
    ],
    technologies: [
      "Python",
      "FastAPI",
      "Next.js",
      "TypeScript",
      "Google Gemini API",
      "NetworkX",
      "Matplotlib",
    ],
    whatCurrentlyWorks: [
      "Processes bundled demo logs or uploaded JSON log/dependency payloads (up to 500 log entries / 1 MiB).",
      "Displays deterministic root-cause candidate ranking, downstream service impact, and clearly separated AI hypotheses.",
    ],
    knownLimitations: [
      "Requires pre-formatted JSON logs (`timestamp`, `service`, `error`, `severity`) and a static dependency dictionary rather than connecting to live log streams.",
      "Both the deterministic ranking and Gemini output are investigative aids and do not prove causation.",
    ],
    repoNote: "Private repository",
    liveUrl: "https://root-causeai.vercel.app/",
  },
  {
    id: "penguin-ml",
    name: "Penguin Machine Learning",
    tagline: "Exploratory data analysis, preprocessing, and species classification on the Palmer Penguins dataset",
    category: "Machine Learning",
    accent: "#FF79C6",
    flow: [
      "Palmer Penguins Raw Dataset",
      "EDA & Missing-Value Cleaning",
      "Label & One-Hot Encoding",
      "Logistic Regression Evaluation",
    ],
    whatItDoes:
      "A Python data-science repository containing Jupyter notebooks that walk through exploratory data analysis (EDA), data cleaning, feature encoding, and supervised classification of penguin species (`Adelie`, `Chinstrap`, `Gentoo`).",
    whyBuilt:
      "Built to practice the core steps of a tabular machine learning workflow—cleaning messy data, visualizing distributions, encoding categorical features, and evaluating a baseline classifier.",
    whatIImplemented: [
      "Created three separate notebooks (`Penguin_EDA.ipynb`, `Penguin_Preprocessing.ipynb`, `Penguin_Machine_Learning.ipynb`) and an EDA script (`eda_penguins.py`).",
      "Handled missing values and duplicates, and created univariate, bivariate, and multivariate plots including correlation heatmaps and pair plots.",
      "Applied label encoding and one-hot encoding across physical and categorical features (`Culmen Length`, `Culmen Depth`, `Flipper Length`, `Body Mass`, `Island`, `Sex`).",
      "Trained a `Logistic Regression` model in Scikit-learn and evaluated it using accuracy score, confusion matrix, and classification report.",
    ],
    technologies: [
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Scikit-learn",
      "Jupyter Notebook",
    ],
    whatCurrentlyWorks: [
      "Reproducible notebook pipeline from raw dataset (`penguins_size.xlsx`) to preprocessed output (`penguins_preprocessed.xlsx`) and model evaluation metrics.",
    ],
    knownLimitations: [
      "Introductory notebook project using a small static dataset and a single baseline algorithm (`Logistic Regression`); does not yet include hyperparameter tuning, cross-validation, or a deployed API.",
    ],
    githubUrl: "https://github.com/jashan-pratul/Penguin-Machine-Learning",
  },
  {
    id: "park-pulse",
    name: "Park Pulse (Slotify)",
    tagline: "Smart parking web application with ESP32 / NodeMCU slot sensor prototype sketches",
    category: "Full-Stack & IoT",
    accent: "#8B35D5",
    flow: [
      "ESP32 / NodeMCU Sensor Sketch",
      "HTTP Slot Availability Update",
      "Express + MongoDB Atlas API",
      "React + Vite Booking Frontend",
    ],
    whatItDoes:
      "A smart parking software and hardware prototype combining a Node.js + Express + MongoDB backend and a React + Vite frontend with Arduino sketches for updating a campus parking bay (`KCT-A1` / `KCT-SENSOR-01`) via ESP32 or NodeMCU.",
    whyBuilt:
      "Built to learn how a physical ultrasonic (`HC-SR04`) or IR obstacle sensor wired to a microcontroller can update real slot availability in a web database and booking UI.",
    whatIImplemented: [
      "Built an Express + Mongoose REST API supporting JWT login/registration, location and slot seeding (`seedSlots.js`, `seedLocations.js`), booking endpoints, and hardware availability routes (`POST/PATCH /api/slots/hardware/:hardwareId/availability`).",
      "Created a React + Vite + Tailwind CSS web frontend for viewing locations, checking slot availability, and creating bookings.",
      "Wrote Arduino sketches (`esp32_kct_slot_monitor.ino`, `nodemcu_kct_slot_monitor.ino`, `ultrasonic_sensor_test.ino`) using a 100 cm distance threshold and debounce timing to post occupancy changes over Wi-Fi.",
    ],
    technologies: [
      "JavaScript",
      "Node.js",
      "Express",
      "MongoDB Atlas",
      "Mongoose",
      "React",
      "Vite",
      "Tailwind CSS",
      "Arduino C++ (ESP32 / ESP8266)",
      "HC-SR04 Ultrasonic & IR Sensors",
    ],
    whatCurrentlyWorks: [
      "REST API for authentication, locations, bookings, and hardware slot state updates (`sensorBlocked` / `isAvailable`).",
      "Single-slot hardware sketch (`KCT-SENSOR-01`) and documented wiring/setup guide for ESP32 and NodeMCU.",
    ],
    knownLimitations: [
      "Hardware integration is currently a single-bay prototype rather than a multi-node campus deployment.",
      "The hosted Render backend runs on a free-tier instance that can sleep when idle.",
    ],
    githubUrl: "https://github.com/jashan-pratul/Decentralised-Smart-Parking-System",
  },
  {
    id: "jarvis-mini",
    name: "JARVIS Mini",
    tagline: "Voice-and-text AI assistant web app with a Three.js 3D reactor and local command parser",
    category: "AI Application",
    accent: "#36D9E8",
    flow: [
      "Voice / Text Input",
      "Local Math & Command Parser",
      "Express + SQLite + Gemini SSE",
      "Three.js 3D / 2D Reactor UI",
    ],
    whatItDoes:
      "A Progressive Web App (PWA) personal assistant experiment featuring a 3D Three.js reactor visualization, browser speech recognition and synthesis, a local math/command parser, and server-side Gemini chat streaming.",
    whyBuilt:
      "Built as a custom pocket AI assistant project to experiment with combining Web Speech APIs, 3D `@react-three/fiber` graphics, SQLite persistence, and streaming LLM responses.",
    whatIImplemented: [
      "Built a React + TypeScript + Vite frontend with a Three.js / `@react-three/fiber` 3D reactor (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `ERROR` states) and a 2D SVG fallback for weaker GPUs.",
      "Implemented push-to-talk Web Speech API hooks and a recursive-descent mathematical evaluator (`mathEval.ts` without `eval`).",
      "Built an Express + `better-sqlite3` backend with `@google/genai` (`gemini-2.5-flash`) Server-Sent Events streaming.",
    ],
    technologies: [
      "TypeScript",
      "React",
      "Three.js",
      "@react-three/fiber",
      "Express",
      "SQLite (better-sqlite3)",
      "Google Gemini API",
      "Web Speech API",
    ],
    whatCurrentlyWorks: [
      "Interactive 3D/2D reactor UI, local math and website-launch commands, guided showcase mode, and installable PWA shell.",
    ],
    knownLimitations: [
      "Browser speech recognition requires Web Speech API support (primarily Chromium browsers over HTTPS).",
      "Live Gemini responses and SQLite features require running the Node/Express backend with a valid `GEMINI_API_KEY`.",
    ],
    githubUrl: "https://github.com/jashan-pratul/jarvis-mini",
    liveUrl: "https://jarvis-mini-eta.vercel.app",
  },
];

export interface HonestSkillCategory {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  items: { name: string; context: string }[];
}

export const HONEST_SKILLS: HonestSkillCategory[] = [
  {
    id: "used",
    title: "Used in Projects",
    subtitle: "Technologies I have actively written and shipped code with in the repositories above",
    accent: "#36D9E8",
    items: [
      { name: "TypeScript & JavaScript", context: "ReproPack, AdaptEd, JARVIS Mini, Park Pulse" },
      { name: "Python", context: "Root Cause AI (FastAPI) & Penguin ML notebooks" },
      { name: "React, Next.js & Vite", context: "Web frontends across my projects" },
      { name: "HTML, CSS & Tailwind CSS", context: "Responsive UI styling and layouts" },
      { name: "Node.js & Express", context: "Park Pulse REST API & JARVIS Mini server" },
      { name: "Google Gemini API & Zod", context: "Structured LLM outputs & schema validation" },
      { name: "MongoDB (Mongoose) & SQLite", context: "Park Pulse & JARVIS Mini persistence" },
      { name: "Chrome Extensions (Manifest V3)", context: "ReproPack service worker & session storage" },
      { name: "Git & GitHub", context: "Version control and project documentation" },
    ],
  },
  {
    id: "familiar",
    title: "Familiar With",
    subtitle: "Libraries and tools I have used in coursework, notebooks, or smaller features",
    accent: "#E84CA8",
    items: [
      { name: "C", context: "Undergraduate programming coursework & pointers" },
      { name: "Pandas, NumPy, Matplotlib & Seaborn", context: "Exploratory data analysis in Penguin ML" },
      { name: "Scikit-learn & Jupyter Notebook", context: "Data preprocessing & Logistic Regression" },
      { name: "FastAPI & NetworkX", context: "Root Cause AI backend & dependency graphs" },
      { name: "Three.js & @react-three/fiber", context: "3D reactor scene in JARVIS Mini" },
      { name: "Vitest & Python unittest", context: "Unit tests in ReproPack & Root Cause AI" },
    ],
  },
  {
    id: "learning",
    title: "Currently Learning",
    subtitle: "Core computer science topics I am actively studying and practicing",
    accent: "#FFAD57",
    items: [
      {
        name: "Data Structures & Algorithms",
        context: "Arrays, linked lists, stacks, queues, trees, recursion, sorting, and basic graph search (BFS, DFS, Dijkstra, A*)",
      },
      {
        name: "Backend Architecture & API Design",
        context: "Input validation, error handling, authentication, and database schema design",
      },
      {
        name: "Machine Learning Fundamentals",
        context: "Feature engineering, model evaluation metrics, and classification workflows",
      },
    ],
  },
  {
    id: "explored",
    title: "Explored Experimentally",
    subtitle: "Hardware, robotics, and computer vision topics explored during my internship and prototypes",
    accent: "#8B35D5",
    items: [
      { name: "Arduino, ESP32 & NodeMCU (ESP8266)", context: "KCT parking sensor sketches & serial debugging" },
      { name: "HC-SR04 Ultrasonic & IR Sensors", context: "Distance threshold & obstacle detection" },
      { name: "Raspberry Pi", context: "Linux edge compute & sensor interfacing exploration" },
      { name: "ROS 2, SLAM & Autonomous Navigation Concepts", context: "Explored during Intellekt Genie internship" },
      { name: "LiDAR, IMU, Encoders & OpenCV", context: "Sensor & computer-vision exploration during internship" },
    ],
  },
];

export interface TimelineEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  type: "internship" | "leadership" | "community" | "education";
  accent: string;
  summary: string;
  highlights: string[];
  tags: string[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    id: "kct-be-cs",
    role: "Bachelor of Engineering in Computer Science Engineering",
    organization: "Kumaraguru College of Technology, Coimbatore",
    period: "September 2025 – September 2029",
    type: "education",
    accent: "#36D9E8",
    summary:
      "Undergraduate Computer Science Engineering student learning core computer science fundamentals while building independent software and AI projects.",
    highlights: [
      "Coursework in programming (C, Python), discrete mathematics, and data structures",
      "Applying classroom concepts by building and documenting open-source projects on GitHub",
    ],
    tags: ["BE Computer Science Engineering", "2025–2029", "Coimbatore"],
  },
  {
    id: "intellekt-genie",
    role: "Intern",
    organization: "Intellekt Genie",
    period: "June 2026 – July 2026",
    type: "internship",
    accent: "#E84CA8",
    summary:
      "Short-term internship focused on learning and exploring Autonomous Mobile Robots (AMR) and how hardware sensors connect to robotics software.",
    highlights: [
      "Explored Autonomous Mobile Robot (AMR) architecture and sensor fundamentals (LiDAR, ultrasonic sensors, IMU, and wheel encoders)",
      "Worked with embedded and single-board platforms including Arduino, ESP32, and Raspberry Pi",
      "Studied ROS 2 concepts, SLAM (Simultaneous Localization and Mapping), localization, and path-planning algorithms (A* and Dijkstra)",
      "Explored introductory computer vision workflows using OpenCV",
    ],
    tags: [
      "Autonomous Mobile Robots",
      "ROS 2",
      "SLAM",
      "LiDAR & Ultrasonic",
      "Arduino · ESP32 · Raspberry Pi",
      "A* & Dijkstra",
      "OpenCV",
    ],
  },
  {
    id: "ecell-iitb",
    role: "Campus Ambassador",
    organization: "E-Cell, IIT Bombay",
    period: "June 2026 – November 2026",
    type: "leadership",
    accent: "#FFAD57",
    summary:
      "Campus outreach role sharing E-Cell IIT Bombay entrepreneurship initiatives, workshops, and competitions with fellow students.",
    highlights: [
      "Coordinated campus awareness and student participation for entrepreneurship programs",
      "Connected interested student builders with startup resources and events",
    ],
    tags: ["E-Cell IIT Bombay", "Campus Outreach", "Entrepreneurship"],
  },
  {
    id: "leed-kumaraguru",
    role: "Member",
    organization: "LEED Kumaraguru",
    period: "November 2025 – Present",
    type: "community",
    accent: "#FF79C6",
    summary:
      "Student member participating in campus entrepreneurship and product-building activities at Kumaraguru.",
    highlights: [
      "Collaborating with fellow students on project ideas, prototypes, and campus innovation events",
    ],
    tags: ["LEED Kumaraguru", "Student Member", "Campus Innovation"],
  },
  {
    id: "ksi",
    role: "Student",
    organization: "Kumaraguru School of Innovation",
    period: "September 2025 – Present",
    type: "community",
    accent: "#8B35D5",
    summary:
      "Participating in hands-on engineering learning, prototyping, and interdisciplinary student projects.",
    highlights: [
      "Exploring practical problem-solving across software and hardware prototypes",
    ],
    tags: ["Kumaraguru School of Innovation", "Hands-On Learning", "Prototyping"],
  },
];

export const RESUME_TXT = `JASHAN PRATUL
Computer Science Engineering Student | Software Developer | AI Enthusiast
Coimbatore, India | ${PROFILE.email}
GitHub: https://github.com/jashan-pratul
LinkedIn: https://www.linkedin.com/in/jashan-pratul-9bb8a12b1/
X: https://x.com/JashanPratul

INTRODUCTION
${PROFILE.intro}

EDUCATION
Kumaraguru College of Technology, Coimbatore, India
Bachelor of Engineering in Computer Science Engineering (September 2025 – September 2029)

PROJECTS
1. ReproPack — Local-First Diagnostic Event Recorder (Chrome Extension)
   - Repo: https://github.com/jashan-pratul/ReproPack
   - Web: https://repropack.vercel.app/
   - Chrome Web Store: https://chromewebstore.google.com/detail/repropack/fmdemocakcbjgppjeipgabbgbafbkaaa
   - Manifest V3 extension (TypeScript, Vite, Vitest) for recording, filtering, heuristic redacting, and exporting diagnostic events locally using chrome.storage.session.

2. AdaptEd — Error-Aware Adaptive Learning Prototype
   - Repo: https://github.com/jashan-pratul/AdaptEd-MVP
   - Live: https://adapted-igtv8sofj-jashanpratuls-projects.vercel.app/
   - Next.js + TypeScript + Google Gemini API + Zod application that analyzes learner mistakes, generates adapted explanations, and runs up to 3 targeted reassessment rounds.

3. Root Cause AI — Incident Log & Dependency Analyzer
   - Live: https://root-causeai.vercel.app/ (Private repository)
   - FastAPI + Next.js application combining deterministic log/dependency-graph analysis with optional Gemini-generated investigation hypotheses.

4. Penguin Machine Learning — Palmer Penguins EDA & Classification
   - Repo: https://github.com/jashan-pratul/Penguin-Machine-Learning
   - Jupyter notebooks (Python, Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn) covering EDA, preprocessing, encoding, and Logistic Regression species classification.

5. Park Pulse (Slotify) — Smart Parking Web App & ESP32 Sensor Prototype
   - Repo: https://github.com/jashan-pratul/Decentralised-Smart-Parking-System
   - Node.js, Express, MongoDB, and React + Vite app paired with ESP32/NodeMCU ultrasonic & IR obstacle sensor sketches.

6. JARVIS Mini — Voice-Driven AI Assistant PWA
   - Repo: https://github.com/jashan-pratul/jarvis-mini
   - Live: https://jarvis-mini-eta.vercel.app
   - React + TypeScript + Three.js + Express + SQLite + Gemini API personal assistant experiment.

EXPERIENCE & CAMPUS INVOLVEMENT
- Intellekt Genie — Intern (June 2026 – July 2026)
  Explored Autonomous Mobile Robots (AMR), LiDAR, ultrasonic sensors, IMU, encoders, Arduino, ESP32, Raspberry Pi, ROS 2, SLAM, A* & Dijkstra path planning, and OpenCV.
- E-Cell, IIT Bombay — Campus Ambassador (June 2026 – November 2026)
- LEED Kumaraguru — Member (November 2025 – Present)
- Kumaraguru School of Innovation — Student (September 2025 – Present)
`;

/* ============================================================================
 * Backward-compatible exports preserved so existing unused components
 * in src/components/cards/* continue to typecheck cleanly.
 * ========================================================================== */
export type CardId = "hero" | "focus" | "metrics" | "visualizer" | "terminal" | "sandbox" | "telemetry";
export type Span = 4 | 5 | 6 | 7 | 8 | 12;
export const SPAN_CLASS: Record<Span, string> = {
  4: "md:col-span-1 lg:col-span-4",
  5: "md:col-span-1 lg:col-span-5",
  6: "md:col-span-2 lg:col-span-6",
  7: "md:col-span-1 lg:col-span-7",
  8: "md:col-span-2 lg:col-span-8",
  12: "md:col-span-2 lg:col-span-12",
};
export type MetricId = "cf" | "gh" | "cs50" | "intern" | "esummit" | "ship" | "auto" | "sec" | "perf" | "deploy";
export interface PersonaConfig {
  id: Persona;
  label: string;
  accent: string;
  headline: string;
  bio: string;
  chips: string[];
  layout: { id: CardId; span: Span }[];
  metricOrder: MetricId[];
  terminalGreeting: string;
}
export const PERSONAS: Record<Persona, PersonaConfig> = {
  recruiter: {
    id: "recruiter",
    label: "Recruiter",
    accent: "#36D9E8",
    headline: PROFILE.positioning,
    bio: PROFILE.intro,
    chips: ["BE CSE @ KCT ('25–'29)", "TypeScript · Python", "React · Next.js"],
    layout: [],
    metricOrder: [],
    terminalGreeting: "",
  },
  founder: {
    id: "founder",
    label: "Founder",
    accent: "#E84CA8",
    headline: PROFILE.positioning,
    bio: PROFILE.intro,
    chips: [],
    layout: [],
    metricOrder: [],
    terminalGreeting: "",
  },
  engineer: {
    id: "engineer",
    label: "Engineer",
    accent: "#8B35D5",
    headline: PROFILE.positioning,
    bio: PROFILE.intro,
    chips: [],
    layout: [],
    metricOrder: [],
    terminalGreeting: "",
  },
};
export const SKILLS: { group: string; items: { name: string; level: number }[] }[] = [];
export type ProjectId = "fullstack" | "automation" | "security";
export interface Project {
  id: ProjectId;
  name: string;
  category: string;
  stack: string[];
  description: Record<Persona, string>;
  highlights: Record<Persona, string[]>;
  workload: {
    queriesPerRequest: number;
    cacheHitRatio: number;
    computeMs: number;
    externalMs: number;
    externalRatio: number;
    externalLabel: string;
    externalCostPerCall: number;
  };
}
export const PROJECTS: Project[] = [];
export const EXPERIENCE = [{ role: "Intern", org: "Intellekt Genie", detail: TIMELINE[1].summary }];
