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
  portraitUrl: "/images/jashan-portrait.jpg",
  portraitOriginalUrl: "/images/Stylized Monochrome Portrait with Orange Accents (2).png",
  codeforcesHandle: "jashan-pratul",
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
    index: "01",
    title: "Web development",
    description: "Building web apps with TypeScript, React, Next.js, Node.js and Python backends.",
  },
  {
    index: "02",
    title: "AI and machine learning",
    description: "Using the Gemini API with structured outputs, and learning machine learning basics in Python.",
  },
  {
    index: "03",
    title: "Developer tools",
    description: "Making small tools that make debugging clearer, like a local-first browser extension and a log analyzer.",
  },
  {
    index: "04",
    title: "Building products",
    description: "Taking small, concrete problems from an idea to a deployed prototype, then improving it.",
  },
] as const;

export interface VerifiedProject {
  id: string;
  index: string;
  name: string;
  tagline: string;
  category: "AI Application" | "Developer Tool" | "Full-Stack & IoT" | "Machine Learning";
  accent: string;
  previewImage: string;
  xrayTitle: string;
  xraySourcePath: string;
  xrayCodeExcerpt: string;
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
    index: "01",
    name: "ReproPack",
    tagline: "Chrome extension for recording, filtering and exporting debugging events, with sensitive data redacted locally",
    category: "Developer Tool",
    accent: "#FF5500",
    previewImage: "/images/projects/repropack-preview.svg",
    xrayTitle: "Redaction and the event buffer",
    xraySourcePath: "public/manifest.json · src/background/service-worker.ts",
    xrayCodeExcerpt: `// public/manifest.json (ReproPack v0.3.0)
{
  "manifest_version": 3,
  "name": "ReproPack",
  "version": "0.3.0",
  "description": "100% local-first, zero-cloud Manifest V3 bug reproduction and telemetry recorder",
  "action": { "default_popup": "popup.html" },
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "permissions": ["storage"]
}`,
    flow: [
      "Event Dispatched to Extension",
      "Bounded Ring Buffer (1,000 max)",
      "Regex Token & PII Scrubbing",
      "Inspector & JSON Blob Export",
    ],
    whatItDoes:
      "A Manifest V3 Chrome extension (v0.3.0) with a companion website. It keeps recent debugging events in a bounded local buffer, masks tokens and personal data, and exports the session as JSON for bug reports.",
    whyBuilt:
      "Reproducing a frontend bug usually means copying console errors and payloads out of DevTools and stripping tokens by hand before sharing them. This tool turns that into a single step.",
    whatIImplemented: [
      "Built the Manifest V3 background service worker and popup/full-tab inspector in TypeScript and Vite, requesting only the Chrome `storage` permission.",
      "Implemented a bounded in-memory ring buffer (up to 1,000 events with FIFO eviction and 24-hour expiration) checkpointed to `chrome.storage.session`.",
      "Added regex-based client-side scrubbing for common sensitive patterns (Bearer tokens, JWTs, API keys, emails, and query parameters like `token` or `password`).",
      "Built severity filtering (`Error`, `Warn`, `Info`, `Debug`), text search, payload inspection, client-side JSON Blob export, and a 194-test Vitest unit test suite, plus the companion web playground (`repropack.vercel.app`).",
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
    index: "02",
    name: "AdaptEd",
    tagline: "A learning prototype that works out why a student got an answer wrong, then re-explains and re-checks",
    category: "AI Application",
    accent: "#38BDF8",
    previewImage: "/images/projects/adapted-preview.svg",
    xrayTitle: "Response schema and reassessment rounds",
    xraySourcePath: "lib/schema.ts · app/api/analyze/route.ts",
    xrayCodeExcerpt: `// lib/schema.ts (AdaptEd-MVP)
export const analysisSchema = z.object({
  difficultyType: z.enum([
    'Vocabulary difficulty',
    'Conceptual misunderstanding',
    'Sequential/process difficulty',
    'Information overload',
    'Persistent misconception'
  ]),
  confidence: z.number().min(0).max(100),
  diagnosis: z.string(),
  evidence: z.array(z.string()).min(1).max(3),
  strategy: z.string(),
  representation: z.enum([
    'Simplified Text',
    'Visual / Structured Explanation',
    'Example / Analogy-Based Explanation'
  ]),
  adaptedExplanation: z.string(),
  nextQuestion: z.string(),
  whyItChanged: z.string(),
  masteryStatus: z.enum(['mastered', 'continue', 'needs_support'])
});`,
    flow: [
      "Concept, Question & Answer",
      "Zod Validation (/api/analyze)",
      "Gemini Diagnosis & Strategy",
      "Adapted Explanation + Reassessment",
    ],
    whatItDoes:
      "A web app where a learner answers a question about a concept. It identifies the likely kind of mistake, explains the idea in a different way, and asks a follow-up question to check understanding.",
    whyBuilt:
      "Practice tools often mark an answer wrong, or just make the next question easier, without addressing why the mistake happened. For example, adding the tops and bottoms of fractions: 1/2 + 1/4 = 2/6.",
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
    index: "03",
    name: "Root Cause AI",
    tagline: "Incident log and service dependency analyzer",
    category: "AI Application",
    accent: "#FF5500",
    previewImage: "/images/projects/rootcause-preview.svg",
    xrayTitle: "Ranking logic and dependency walk",
    xraySourcePath: "main.py · graph.py · api.py",
    xrayCodeExcerpt: `# main.py (RootCause AI — Deterministic Baseline)
ordered_logs = sorted(logs, key=timestamp_key)
counts = Counter(log["service"] for log in ordered_logs)

candidates = sorted(
    ordered_logs,
    key=lambda log: (
        str(log["severity"]).upper() == "CRITICAL",
        counts[log["service"]],
        -timestamp_key(log) if timestamp_key(log) != float("inf") else float("-inf"),
    ),
    reverse=True,
)
root_service = candidates[0]["service"]

# Walk dependency graph in reverse (dependent -> required)
downstream = set()
changed = True
while changed:
    changed = False
    for service, required_services in dependencies.items():
        if service not in downstream and any(
            req == root_service or req in downstream for req in required_services
        ):
            downstream.add(service)
            changed = True`,
    flow: [
      "JSON Logs + Dependency Map",
      "FastAPI Deterministic Ranking",
      "Reverse Graph Impact Walk",
      "Optional Gemini Hypothesis",
    ],
    whatItDoes:
      "A debugging dashboard. Given error logs and a map of which services depend on which, it highlights the most likely root-cause service, lists the services that could be affected downstream, and suggests checks to run.",
    whyBuilt:
      "Built to explore how simple, predictable rules over logs and a dependency graph can sit alongside an AI-generated hypothesis, without treating the AI output as the truth.",
    whatIImplemented: [
      "Built a Python FastAPI backend (`api.py`, `main.py`, `graph.py`, `pdf_report.py`) and a Next.js frontend dashboard.",
      "Implemented a deterministic baseline that validates ISO-8601 log entries (`CRITICAL`, `ERROR`, `WARNING`, `INFO`), ranks candidate services by severity, frequency, and earliest timestamp, and walks the dependency graph in reverse to list potentially impacted downstream services.",
      "Added an optional server-side Google Gemini (`gemini-3.1-flash-lite`) step that generates a labeled hypothesis and diagnostic checklist, while returning `ai_status: 'unavailable'` if Gemini is unconfigured so the deterministic analysis still succeeds.",
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
    index: "04",
    name: "Penguin Machine Learning",
    tagline: "Exploring, cleaning and classifying the Palmer Penguins dataset in Jupyter notebooks",
    category: "Machine Learning",
    accent: "#10B981",
    previewImage: "/images/projects/penguin-preview.svg",
    xrayTitle: "Notebook workflow and features",
    xraySourcePath: "Penguin_EDA.ipynb · Penguin_Preprocessing.ipynb · Penguin_Machine_Learning.ipynb",
    xrayCodeExcerpt: `# eda_penguins.py / Penguin_Machine_Learning.ipynb
# Dataset: penguins_size.xlsx -> penguins_preprocessed.xlsx
features = [
    "culmen_length_mm", "culmen_depth_mm",
    "flipper_length_mm", "body_mass_g",
    "island", "sex"
]
target = "species"  # Adelie | Chinstrap | Gentoo

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y_encoded, test_size=0.2, random_state=42
)
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
# Evaluated via accuracy_score, confusion_matrix, classification_report`,
    flow: [
      "Palmer Penguins Raw Dataset",
      "EDA & Missing-Value Cleaning",
      "Label & One-Hot Encoding",
      "Logistic Regression Evaluation",
    ],
    whatItDoes:
      "Three Jupyter notebooks that explore the Palmer Penguins dataset, clean and encode it, and train a model to predict penguin species (Adelie, Chinstrap or Gentoo).",
    whyBuilt:
      "Built to practise the main steps of a tabular machine learning project: cleaning messy data, plotting distributions, encoding categories and evaluating a baseline classifier.",
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
    index: "05",
    name: "Park Pulse (Slotify)",
    tagline: "Smart parking web app with an ESP32 sensor prototype",
    category: "Full-Stack & IoT",
    accent: "#F59E0B",
    previewImage: "/images/projects/parkpulse-preview.svg",
    xrayTitle: "Sensor sketch and availability endpoint",
    xraySourcePath: "hardware/esp32_kct_slot_monitor/esp32_kct_slot_monitor.ino · src/server.js",
    xrayCodeExcerpt: `// hardware/esp32_kct_slot_monitor/esp32_kct_slot_monitor.ino
// Venue: KCT | Slot: KCT-A1 | Hardware ID: KCT-SENSOR-01
// HC-SR04 Pins: TRIG -> GPIO 5, ECHO -> GPIO 18 (3.3V divider)
const float BLOCKED_DISTANCE_CM = 100.0;

// Distance rule:
// distance <= 100.0 cm -> sensorBlocked = true  -> slot unavailable
// distance >  100.0 cm -> sensorBlocked = false -> slot available
// POST /api/slots/hardware/KCT-SENSOR-01/availability
// Body: { "sensorBlocked": true }`,
    flow: [
      "ESP32 / NodeMCU Sensor Sketch",
      "HTTP Slot Availability Update",
      "Express + MongoDB Atlas API",
      "React + Vite Booking Frontend",
    ],
    whatItDoes:
      "A parking booking web app (Node.js, Express, MongoDB, React) paired with Arduino sketches that let an ESP32 or NodeMCU board report whether a campus parking bay (KCT-A1) is free.",
    whyBuilt:
      "Built to learn how a physical distance sensor wired to a microcontroller can update real slot availability in a database and a booking interface.",
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
    index: "06",
    name: "JARVIS Mini",
    tagline: "Voice and text assistant web app with a 3D reactor and a local command parser",
    category: "AI Application",
    accent: "#38BDF8",
    previewImage: "/images/projects/jarvis-preview.svg",
    xrayTitle: "Math evaluator and reactor states",
    xraySourcePath: "src/utils/mathEval.ts · src/components/Reactor/ · server/services/geminiService.ts",
    xrayCodeExcerpt: `// src/utils/mathEval.ts — Safe Recursive-Descent Expression Evaluator
// Grammar:
//   Expr   := Term (('+' | '-') Term)*
//   Term   := Power (('*' | '/' | '%') Power)*
//   Power  := Unary ('^' Power)?
//   Unary  := ('+' | '-' | 'sqrt') Unary | Primary
//   Primary:= NUMBER | '(' Expr ')'
// Evaluates spoken & typed arithmetic locally in 0ms without eval()`,
    flow: [
      "Voice / Text Input",
      "Local Math & Command Parser",
      "Express + SQLite + Gemini SSE",
      "Three.js 3D / 2D Reactor UI",
    ],
    whatItDoes:
      "A Progressive Web App assistant experiment with a 3D reactor visual, browser speech recognition and speech output, a local math and command parser, and streamed Gemini chat replies from a server.",
    whyBuilt:
      "Built to experiment with combining the Web Speech API, 3D graphics with react-three-fiber, SQLite storage and streaming LLM responses in one app.",
    whatIImplemented: [
      "Built a React 19 + TypeScript + Vite frontend with a Three.js / `@react-three/fiber` 3D reactor (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `ERROR` states) and a 2D SVG fallback for weaker GPUs.",
      "Implemented push-to-talk Web Speech API hooks and a recursive-descent mathematical evaluator (`mathEval.ts` without `eval`).",
      "Built an Express 5 + `better-sqlite3` backend with `@google/genai` (`gemini-2.5-flash`) Server-Sent Events streaming.",
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

export interface HonestSkillItem {
  name: string;
  context: string;
  relatedProjects: string[];
}

export interface HonestSkillCategory {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  accent: string;
  items: HonestSkillItem[];
}

export const HONEST_SKILLS: HonestSkillCategory[] = [
  {
    id: "used",
    index: "01",
    title: "Used in my projects",
    subtitle: "Technologies I have written code with in the projects above",
    accent: "#FF5500",
    items: [
      {
        name: "TypeScript & JavaScript",
        context: "ReproPack, AdaptEd, JARVIS Mini, Park Pulse",
        relatedProjects: ["repropack", "adapted", "jarvis-mini", "park-pulse", "rootcause-ai"],
      },
      {
        name: "Python",
        context: "Root Cause AI (FastAPI) & Penguin ML notebooks",
        relatedProjects: ["rootcause-ai", "penguin-ml"],
      },
      {
        name: "React, Next.js & Vite",
        context: "Web frontends across my projects",
        relatedProjects: ["repropack", "adapted", "rootcause-ai", "park-pulse", "jarvis-mini"],
      },
      {
        name: "HTML, CSS & Tailwind CSS",
        context: "Responsive UI styling and layouts",
        relatedProjects: ["repropack", "adapted", "park-pulse", "jarvis-mini"],
      },
      {
        name: "Node.js & Express",
        context: "Park Pulse REST API & JARVIS Mini server",
        relatedProjects: ["park-pulse", "jarvis-mini"],
      },
      {
        name: "Google Gemini API & Zod",
        context: "Structured LLM outputs & schema validation",
        relatedProjects: ["adapted", "rootcause-ai", "jarvis-mini"],
      },
      {
        name: "MongoDB (Mongoose) & SQLite",
        context: "Park Pulse & JARVIS Mini persistence",
        relatedProjects: ["park-pulse", "jarvis-mini"],
      },
      {
        name: "Chrome Extensions (Manifest V3)",
        context: "ReproPack service worker & session storage",
        relatedProjects: ["repropack"],
      },
      {
        name: "Git & GitHub",
        context: "Version control and project documentation",
        relatedProjects: ["repropack", "adapted", "penguin-ml", "park-pulse", "jarvis-mini"],
      },
    ],
  },
  {
    id: "familiar",
    index: "02",
    title: "Familiar with",
    subtitle: "Used in coursework, notebooks or smaller features",
    accent: "#38BDF8",
    items: [
      {
        name: "C",
        context: "Undergraduate programming coursework & pointers",
        relatedProjects: [],
      },
      {
        name: "Pandas, NumPy, Matplotlib & Seaborn",
        context: "Exploratory data analysis in Penguin ML",
        relatedProjects: ["penguin-ml", "rootcause-ai"],
      },
      {
        name: "Scikit-learn & Jupyter Notebook",
        context: "Data preprocessing & Logistic Regression",
        relatedProjects: ["penguin-ml"],
      },
      {
        name: "FastAPI & NetworkX",
        context: "Root Cause AI backend & dependency graphs",
        relatedProjects: ["rootcause-ai"],
      },
      {
        name: "Three.js & @react-three/fiber",
        context: "3D reactor scene in JARVIS Mini",
        relatedProjects: ["jarvis-mini"],
      },
      {
        name: "Vitest & Python unittest",
        context: "Unit tests in ReproPack & Root Cause AI",
        relatedProjects: ["repropack", "rootcause-ai"],
      },
    ],
  },
  {
    id: "learning",
    index: "03",
    title: "Currently learning",
    subtitle: "Computer science topics I am studying right now",
    accent: "#10B981",
    items: [
      {
        name: "Data Structures & Algorithms",
        context: "Arrays, linked lists, stacks, queues, trees, recursion, sorting, and basic graph search (BFS, DFS, Dijkstra, A*)",
        relatedProjects: ["rootcause-ai", "jarvis-mini"],
      },
      {
        name: "Backend Architecture & API Design",
        context: "Input validation, error handling, authentication, and database schema design",
        relatedProjects: ["adapted", "rootcause-ai", "park-pulse"],
      },
      {
        name: "Machine Learning Fundamentals",
        context: "Feature engineering, model evaluation metrics, and classification workflows",
        relatedProjects: ["penguin-ml"],
      },
    ],
  },
  {
    id: "explored",
    index: "04",
    title: "Explored",
    subtitle: "Hardware and robotics topics from my internship and prototypes",
    accent: "#F59E0B",
    items: [
      {
        name: "Arduino, ESP32 & NodeMCU (ESP8266)",
        context: "KCT parking sensor sketches & serial debugging",
        relatedProjects: ["park-pulse"],
      },
      {
        name: "HC-SR04 Ultrasonic & IR Sensors",
        context: "Distance threshold & obstacle detection",
        relatedProjects: ["park-pulse"],
      },
      {
        name: "Raspberry Pi",
        context: "Linux edge compute & sensor interfacing exploration",
        relatedProjects: [],
      },
      {
        name: "ROS 2, SLAM & Autonomous Navigation Concepts",
        context: "Explored during Intellekt Genie internship",
        relatedProjects: [],
      },
      {
        name: "LiDAR, IMU, Encoders & OpenCV",
        context: "Sensor & computer-vision exploration during internship",
        relatedProjects: [],
      },
    ],
  },
];

export interface TimelineEntry {
  id: string;
  index: string;
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
    index: "01",
    role: "Bachelor of Engineering in Computer Science Engineering",
    organization: "Kumaraguru College of Technology, Coimbatore",
    period: "September 2025 – September 2029",
    type: "education",
    accent: "#FF5500",
    summary:
      "Learning core computer science while building and documenting my own software and AI projects.",
    highlights: [
      "Coursework in programming (C, Python), discrete mathematics, and data structures",
      "Applying what I learn in class by building and documenting projects on GitHub",
    ],
    tags: ["BE Computer Science Engineering", "2025–2029", "Coimbatore"],
  },
  {
    id: "intellekt-genie",
    index: "02",
    role: "Intern",
    organization: "Intellekt Genie",
    period: "June 2026 – July 2026",
    type: "internship",
    accent: "#38BDF8",
    summary:
      "A short internship learning about autonomous mobile robots and how hardware sensors connect to robotics software.",
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
    index: "03",
    role: "Campus Ambassador",
    organization: "E-Cell, IIT Bombay",
    period: "June 2026 – November 2026",
    type: "leadership",
    accent: "#F59E0B",
    summary:
      "Sharing E-Cell IIT Bombay's entrepreneurship programs, workshops and competitions with students on campus.",
    highlights: [
      "Coordinated campus awareness and student participation for entrepreneurship programs",
      "Connected interested student builders with startup resources and events",
    ],
    tags: ["E-Cell IIT Bombay", "Campus Outreach", "Entrepreneurship"],
  },
  {
    id: "leed-kumaraguru",
    index: "04",
    role: "Member",
    organization: "LEED Kumaraguru",
    period: "November 2025 – Present",
    type: "community",
    accent: "#10B981",
    summary:
      "Student member taking part in entrepreneurship and product-building activities on campus.",
    highlights: [
      "Collaborating with fellow students on project ideas, prototypes, and campus innovation events",
    ],
    tags: ["LEED Kumaraguru", "Student Member", "Campus Innovation"],
  },
  {
    id: "ksi",
    index: "05",
    role: "Student",
    organization: "Kumaraguru School of Innovation",
    period: "September 2025 – Present",
    type: "community",
    accent: "#38BDF8",
    summary:
      "Hands-on engineering learning, prototyping and student projects.",
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
    accent: "#FF5500",
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
    accent: "#38BDF8",
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
    accent: "#10B981",
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
