# OmniPitchAI: Comprehensive Product Documentation

## 1. Executive Summary & Product Vision
**OmniPitchAI** is an elite, autonomous AI pipeline engineered to bridge the gap between complex engineering infrastructure and strategic executive narratives. By directly ingesting raw technical architectures (ZIP repositories, Markdown docs, PDFs), the platform utilizes a highly specialized multi-agent LangGraph backend to synthesize "code into consulting." 

The core vision is to eliminate the manual overhead of translating technical achievements into high-value business outcomes. OmniPitchAI acts as a virtual McKinsey consultant, directly analyzing technical schemas and producing boardroom-ready, deeply categorized, and aesthetically tailored `.pptx` slides instantaneously.

---

## 2. Core Features Breakdown

### 2.1. Zero-Prompt Data Ingestion Engine
Unlike standard LLM chatbots, OmniPitchAI uses a **Zero-Prompt Engine** to minimize user friction. The user simply drags and drops a raw repository (`.zip`), markdown documentation (`.md`), or `.pdf` file. 
- **Auto-Parsing:** The backend unzips, decodes standard files, processes images natively (converting to Base64), and completely strips non-essential MacOS artifacts.
- **Support for Multi-Modal:** The parser accommodates visual architectures natively side-by-side with text using vision models (GPT-4o).

### 2.2. Multi-Agent Swarm (LangGraph Backed)
The brain of the platform is built on LangGraph, operating as a stateful graph of specialized agents rather than a single linear prompt. 
- **Agent Roles:** Functions include strictly extracting parsing details, hunting for Return on Investment (ROI) business value, assembling the exact strategic narrative, and heavily formatting the presentation structure.
- **State Integrity:** LangGraph streams the progressive state to the frontend, allowing users an over-the-shoulder view of what the AI is analyzing at any given moment.

### 2.3. Persona-Tailored Strategy & Routing
OmniPitchAI does not believe in "one size fits all" presentations. 
- **User Personas:** Each user specifies their Persona at login (e.g., Executive, Engineer, Sales Leader, Founder). 
- **Output Alignment:** The platform explicitly routes all AI generations to optimize for that exact specific role. An Engineer's presentation focuses on system reliability, whereas a Sales Leader's focuses on scale, MRR, and conversion mechanics.

### 2.4. Smart Layout Engine & Theming
The presentation output avoids the "wall of text" trap. OmniPitchAI controls exact layout mapping within the Python `pptx` generation pipeline.
- **Dynamic Slide Layouts:** Slide layouts mapped intelligently to content. 
  - *Flowchart Layouts* for logic mapping.
  - *Key Metric Callouts* for ROI data points.
  - *Standard Bullet Layouts* for narrative pacing.
- **Premium Aesthetics:** Direct color science applied to output. Choices include: 
  - *Google / Startup* (Playful but sharp)
  - *Apple Monochrome* (Clean, minimalist)
  - *Cyberpunk / Hacker* (Neon green, matrix themes)
  - *Dark Corporate / Aisynch Labs* (Professional, striking edge)

### 2.5. Enterprise-Grade Tone Consistency (Pinecone RAG)
To ensure output doesn't sound like generic AI, the Narrative Node performs a real-time Retrieval-Augmented Generation (RAG) using a **Pinecone Vector Database** (Text-embedding-3-small).
- **Tone Alignment:** The integration fetches premium enterprise terminology (e.g., TOGAF, ITIL terminology) and brand guidelines dynamically based on the company's specified requirements.

### 2.6. Complete White-Labeled Output
Once the slide deck finishes, all resulting PPTX deliverables are completely scrubbed of any "OmniPitchAI" or "AI" branding. It looks, feels, and acts as if an internal strategy consultant built it manually.

---

## 3. High-Level System Architecture

The project operates universally under a decoupled, scalable structure.

### 3.1. Frontend Ecosystem
- **Core:** React with Vite packaging.
- **Language:** Fully typed in TypeScript for strict prop/state integrity.
- **Styling:** Vanilla Tailwind CSS paired heavily with Framer Motion for premium micro-animations and route transitions.
- **Components:** Modularized significantly into `Workspace`, `Wizard`, and standalone components like `ExecutionStepper`.

### 3.2. Backend Ecosystem
- **Core Framework:** FastAPI serving RESTful routes synchronously and kicking off background thread processing for AI tasks.
- **Database:** SQLAlchemy (SQLite/PostgreSQL) handling purely the state of User Authentications and specific Persona details.
- **Memory Store:** Heavy reliance on global dictionaries acting as an in-memory job status tracker to power the rapid frontend polling.

---

## 4. Deep Dive: Agentic Workflow Pipeline (LangGraph)

The backend execution operates a strict 4-step Directed Acyclic Graph.

### **Node 1: `CodeParser_Node`**
- **Action:** Ingests the entirety of the raw document dump or code repo zip.
- **Output:** Produces an `ArchitectureSummary` via GPT-4o structured output. Strips out all syntax formatting to locate simply the tech stack, data flow, architecture, schema, and core features.

### **Node 2: `BusinessValue_Node`**
- **Action:** Takes the technical architecture and heavily transforms it via a specialized "McKinsey Partner" system prompt.
- **Output:** Produces a strictly typed `BusinessOutcomes` array highlighting operational efficiencies, market advantage, and direct technical ROI. It accounts for user explicitly specified requested sections and overarching duration.

### **Node 3: `Narrative_Node`**
- **Action:** The master orchestrator. Takes the outputs of Parser and BusinessValue, runs a localized semantic query on Pinecone for precise nomenclature, and maps the entire narrative pacing.
- **Output:** Maps a `Narrative` object containing multiple `Slide` objects. Each slide decides its own fate (choosing between a standard bullet, a metric callout, or an architecture flowchart).

### **Node 4: `Formatting_Node`**
- **Action:** An isolated safety fallback node. Validates that the LangGraph outputs map directly to a flawlessly assembled standard JSON file compatible with the custom `pptx_generator` logic.
- **Fallback Logic:** If format validations fail, LangGraph executes a loop right back to the formatter specifically to correct syntax anomalies without re-running the entire expensive LLM inference pipeline.

---

## 5. Detailed User Core Flows

### 5.1 Onboarding & Persona Injection
1. The user logs in and defines their core metadata.
2. They are forced to select a persona. This dictates the lens through which every single generation prompt will evaluate raw technical data going forward.

### 5.2. Generation Wizard Flow
Located in `FormWizard.tsx`, the system walks the user through explicitly structured intent.
- **Step 1:** Define the core topic/idea alongside Target Audience parameters (e.g., Angel Investors vs. Internal Teams).
- **Step 2:** Define precision metrics (Slide Duration targets) and Tone (Professional, Visionary, Technical, Story-Driven).
- **Step 3:** Drop any required markdown, codebase zips, and explicit manual instructions (e.g., "Make sure you talk about the AWS migration").

### 5.3. Live Generation & "Over the Shoulder" UI
- When generated, `routes.py` runs `execute_graph_pipeline` as a background FastAPI task.
- The frontend `CentralCanvas.tsx` polls `/api/status` every 2 seconds.
- The UI triggers dynamic visual state updates directly tied to which LangGraph node is firing in real-time (`Parsing Architecture` -> `Extracting Business Value` -> `Structuring Narrative`).

### 5.4. Custom PPTX Export Logic
Once processing hits the finish line, `utils/pptx_generator.py` fires. 
- Parses the generated `theme_vibe` and injects localized exact RGB constraints directly into system memory. 
- Iterates over the requested Layout structures constructing literal shapes (rectangles for flowcharts, giant text boundaries for metrics).
- Creates a purely generic slide file dumped to a temporary directory for immediate `downloadUrl` serving.

---

## 6. Technical Stack & Environment Requirements

**Frontend Details:**
- `package.json` relies fully on Node 18+ architecture. 
- Libraries heavily depend on `react-dropzone` for file management and `lucide-react` for explicit, clean iconography.

**Backend Details:**
- Python 3.10+ required.
- Uses `python-pptx` for extensive presentation XML creation.
- Uses `langchain`/`langgraph` exclusively with `gpt-4o`.
- Integrates `pinecone` client alongside `langchain_openai` embeddings module (using `text-embedding-3-small`).

**Environment Variables Required:**
```ini
OPENAI_API_KEY=sk-proj-xxxx...
PINECONE_API_KEY=pcsk-xxxx...
```

*Architected to fundamentally disrupt the presentation preparation process for elite professionals.*
