# ResumeAlign: AI-Powered Indian Job Market Resume Tailor & ATS Optimizer

A full-featured, zero-cost interactive dashboard built to tailor professional resumes against target Job Descriptions (JDs), optimize for ATS algorithms (Naukri RMS, Darwinbox, Keka, Zoho Recruit, Taleo, Workday), and export high-resolution PDFs.

---

## 🤖 Where is the LLM Logic and Prompting Located?

In this project, there is **no external static `.md` prompt file**; instead, the LLM system instructions, few-shot schemas, and domain benchmarks are dynamically assembled in code:

### 1. Primary LLM Engine: [`src/services/llmService.ts`](./src/services/llmService.ts)
- **Indian Job Market Prompt**:
  Contains the detailed system prompt provided to Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`, `gpt-4o`, `o3-mini`), Anthropic Claude (`claude-3-5-sonnet`, `claude-3-opus`, `claude-3-5-haiku`), Groq Cloud (`llama-3.3-70b-versatile`), and local Ollama (`llama3.2`).
  - Enforces Google's XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
  - Enforces Indian corporate designations (AVP, VP, Director, Practice Head, Delivery Manager, Principal Consultant).
  - Enforces realistic metric scales (₹ INR, Crores, Lakhs, UPI transaction volume, onshore-offshore governance).
- **Supported Providers**:
  - **Built-in Offline**: 100% private, instant heuristic engine running locally in the browser with no API key.
  - **Google Gemini**: Free tier via Google AI Studio (`gemini-2.5-flash`, `gemini-3.8-flash`).
  - **OpenAI (GPT)**: Direct API integration (`gpt-4o-mini`, `gpt-4o`, `o3-mini`).
  - **Anthropic (Claude)**: Direct API integration with browser-direct access (`claude-3-5-sonnet`, `claude-3-opus`, `claude-3-5-haiku`).
  - **Groq Cloud**: Free high-speed LPU inference (`llama-3.3-70b-versatile`).
  - **Local Ollama**: 100% private local LLMs (`llama3.2`, `deepseek-r1`).
- **Offline Fallback Engine**:
  `heuristicTailorBullets()` runs entirely in the browser if API keys are absent or network errors occur, ensuring zero downtime.

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

---

## 🛠️ PowerShell Git Commands (Push & Sync)

Use these commands directly in your Windows PowerShell terminal to stage, commit, and push updates to GitHub:

### 1. Standard Push Workflow (Daily Use)

```powershell
# Step 1: Check what has changed
git status

# Step 2: Stage all modified and newly created files
git add .

# Step 3: Commit staged changes with a descriptive message
git commit -m "Your commit message here"

# Step 4: Push commits to GitHub
git push origin main
```

### 2. Quick One-Liner (Stage, Commit & Push)

```powershell
git add . ; git commit -m "Update ResumeBuilder features" ; git push origin main
```

### 3. If `'git'` is Not Recognized in PowerShell

If PowerShell throws an error that `git` is not found, load Git into your active PowerShell session:

```powershell
# Temporarily add Git to the current PowerShell environment
$env:Path += ";C:\Program Files\Git\cmd"

# Verify Git is accessible
git --version
```

*(Alternatively, use the full path directly: `& "C:\Program Files\Git\cmd\git.exe" push origin main`)*

### 4. Useful Day-to-Day Git Commands

```powershell
# Pull down changes from GitHub
git pull origin main

# View recent commit history
git log --oneline -n 5

# Check configured remote repositories
git remote -v

# Discard unstaged changes to a specific file
git restore <file-name>

# Undo the last commit while keeping your file edits
git reset --soft HEAD~1
```

### 5. First-Time Repository Setup (Reference)

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/akashbayern0802/ResumeBuilder.git
git push -u origin main
```

