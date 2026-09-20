# ResumeAlign: AI-Powered Indian Job Market Resume Tailor & ATS Optimizer

A full-featured, zero-cost interactive dashboard built to tailor professional resumes against target Job Descriptions (JDs), optimize for ATS algorithms (Naukri RMS, Darwinbox, Keka, Zoho Recruit, Taleo, Workday), and export high-resolution PDFs.

---

## 🤖 Where is the LLM Logic and Prompting Located?

In this project, there is **no external static `.md` prompt file**; instead, the LLM system instructions, few-shot schemas, and domain benchmarks are dynamically assembled in code:

### 1. Primary LLM Engine: [`src/services/llmService.ts`](./src/services/llmService.ts)
- **Indian Job Market Prompt**:
  Contains the detailed system prompt provided to Google Gemini (`gemini-2.5-flash`), Groq Cloud (`llama-3.3-70b-versatile`), and local Ollama (`llama3.2`).
  - Enforces Google's XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
  - Enforces Indian corporate designations (AVP, VP, Director, Practice Head, Delivery Manager, Principal Consultant).
  - Enforces realistic metric scales (₹ INR, Crores, Lakhs, UPI transaction volume, onshore-offshore governance).
- **Offline Fallback Engine**:
  `heuristicTailorBullets()` runs entirely in the browser without any API keys or internet connection, applying domain-specific metric injection and verb strengthening.

### 2. Resume Data & Samples: [`src/data/samples.ts`](./src/data/samples.ts)
- Stores the structured data for **Akash Bhattacharya**'s 12+ year profile (PwC AC, Accenture, Yes Bank, ICICI Bank, Lodha Group, Cognizant, IIT Bombay, CBAP, PMP, CSPO, SAFe) and sample Job Descriptions (Director FinTech Product, Cloud Architect).

### 3. Markdown Import & Export: [`src/services/documentParser.ts`](./src/services/documentParser.ts)
- **`exportResumeToMarkdown(resume)`**: Generates a standard Markdown (`.md`) representation of the resume. Accessible in the dashboard header via the **MD** button.
- **`extractTextFromFile(file)`**: Reads uploaded `.md`, `.txt`, `.pdf`, `.docx`, or `.json` files and parses them into structured resume objects.

### 4. Real-Time ATS Scoring Engine: [`src/services/atsAnalyzer.ts`](./src/services/atsAnalyzer.ts)
- Computes matching keywords, missing critical competencies, metric density (recognizing ₹, Rs, INR, Cr, Lakh, BPS, AUM, GMV), and action verb strength.

---

## 🎨 Available Resume Formats (7 Templates)

Configured in [`src/components/ResumePreview.tsx`](./src/components/ResumePreview.tsx):
1. **🇮🇳 Naukri & Indian Corporate ATS**: Single-column, 100% parseable standard for Naukri RMS and Darwinbox.
2. **👔 Executive Two-Column**: Consulting and Big 4 style with strategic split layout.
3. **🏛️ Harvard ATS**: Classic academic & management consulting standard.
4. **💼 Modern Professional**: Contemporary indigo accents.
5. **📈 Wall Street / Banking**: High-density finance/investment banking layout.
6. **⚡ Silicon Valley Tech**: Tech-stack tags and milestones.
7. **📄 Minimalist Clean**: Pure monochrome ATS formatting.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Dashboard is served at **http://localhost:3000/**.

