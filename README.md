# 🚀 OmniPitchAI
### **Architecture to Executive Narrative. Instantly.**

OmniPitchAI is an elite, autonomous AI pipeline designed to translate raw technical architectures, codebases, and engineering documentation into highly strategic, executive-ready presentation decks. 

Built with a multi-agent **LangGraph** backend and a premium **React** frontend, OmniPitchAI doesn't just summarize—it consults.

---

## ✨ Key Features

- **📂 Zero-Prompt Engine**: Drag and drop a repository ZIP or raw Markdown documentation. No complex prompting required.
- **🧠 Multi-Agent Swarm**: A sophisticated LangGraph pipeline where specialized agents analyze technical complexity, extract ROI/Business Value, and architect a 5-7 slide narrative.
- **🎨 Dynamic Executive Theming**: Native support for premium aesthetics including *Google*, *Apple Monochrome*, *Cyberpunk*, and *Dark Corporate*.
- **📊 Smart Layout Engine**: The system automatically generates horizontal Flowcharts, Key Metric callouts, and strategic bullet points—never just plain text.
- **⚡ Real-time Progression**: Watch the AI agents work in real-time through a live streaming progress tracker with node-by-node updates.
- **👤 Persona-Tailored Strategy**: Tailor the output for specific stakeholders (e.g., CEO, CTO, VC, CFO) to ensure the message resonates with the target audience.
- **🛡️ White-Labeled Output**: Guaranteed professional output with no mentions of "AI" or "OmniPitchAI" in the final deck—it belongs to your organization.

---

## 🛠️ Technical Stack

### **Frontend**
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Orchestration**: [LangGraph](https://www.langchain.com/langgraph) & [LangChain](https://www.langchain.com/)
- **Model**: [GPT-4o](https://openai.com/index/gpt-4o-api/) (Structured Outputs)
- **Vector DB**: [Pinecone](https://www.pinecone.io/) (for Enterprise branding guidelines)
- **Generation**: `python-pptx` with custom RGB Theme Mapping & Typography Enforcement

---

## 📐 Architecture Overview

The system operates as a stateful graph:

```mermaid
graph TD
    Start((Start)) --> Parser[CodeParser Node]
    Parser -->|Context| BValue[BusinessValue Node]
    BValue -->|Strategic Gains| Narrative[Narrative Node]
    Narrative -->|Slide Map| Formatting[Formatting Node]
    Formatting -->|JSON| PPTX[PPTX Generator]
    PPTX --> End((Download Deck))
    
    subgraph "LangGraph Agent Swarm"
    Parser
    BValue
    Narrative
    Formatting
    end
```

---

## 🚀 Getting Started

### **Prerequisites**
- Python 3.9+
- Node.js 18+
- An OpenAI API key
- A `SECRET_KEY` for auth
- Pinecone API key is optional but recommended for retrieval-enhanced narrative context

### **1. Clone and enter the project**
```bash
git clone <your-repo-url>
cd omnipitchai
```

### **2. Start the backend**
Open a terminal in `/backend`:
```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create the backend env file
cp .env.example .env
```

Update `backend/.env` with at least:
```ini
OPENAI_API_KEY=your_openai_key_here
SECRET_KEY=replace_me_with_a_long_random_string
DATABASE_URL=postgres://user:pass@host:port/dbname?sslmode=require
DB_CA_CERT_PATH=ca.pem
DB_CONNECTION_LIMIT=20
PINECONE_API_KEY=your_pinecone_key_here
```

Then run the API:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`.
Swagger docs will be available at `http://localhost:8000/docs`.

### **3. Start the frontend**
Open a second terminal in `/frontend`:
```bash
cd frontend

# Install Node dependencies
npm install

# Optional: only needed if your backend is not on localhost:8000
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### **4. Run the app**
1. Start the backend on port `8000`
2. Start the frontend on port `5173`
3. Open `http://localhost:5173`
4. Register or log in
5. Upload your source files and generate a deck

---

## 📋 Environment Variables

Backend variables in `backend/.env`:

```ini
OPENAI_API_KEY=sk-proj-...
SECRET_KEY=replace_me
DATABASE_URL=postgres://user:pass@host:port/dbname?sslmode=require
DB_CA_CERT_PATH=ca.pem
DB_CONNECTION_LIMIT=20
PINECONE_API_KEY=pcsk_...
```

Frontend variables in `frontend/.env.local`:

```ini
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🤝 Contributing

This project is a high-performance demonstration of Agentic Workflows. If you'd like to contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

### **Designed by Hisham Moizuddin**
*Translating raw complexity into strategic clarity.*
