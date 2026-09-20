import { useState, useMemo } from 'react';
import { ResumeData, JobDescription, ResumeTemplate, LLMConfig, TailoredBulletDiff, TailoringResult } from './types/resume';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from './data/samples';
import { analyzeAtsMatch } from './services/atsAnalyzer';
import { tailorResumeWithAI, DEFAULT_LLM_CONFIG } from './services/llmService';
import { exportElementToPdf } from './services/pdfExporter';
import { Header } from './components/Header';
import { AtsScoreCard } from './components/AtsScoreCard';
import { JobDescriptionPane } from './components/JobDescriptionPane';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
import { TailorAssistantModal } from './components/TailorAssistantModal';
import { JobDescriptionModal } from './components/JobDescriptionModal';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { Eye, Edit3, Briefcase, Sparkles, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // State
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUMES.akash_bhattacharya);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    id: 'jd-default',
    title: SAMPLE_JOB_DESCRIPTIONS.director_fintech_product.title,
    company: SAMPLE_JOB_DESCRIPTIONS.director_fintech_product.company,
    rawText: SAMPLE_JOB_DESCRIPTIONS.director_fintech_product.text,
    extractedKeywords: [],
    requiredSkills: [],
    niceToHaveSkills: []
  });

  const [template, setTemplate] = useState<ResumeTemplate>('naukri');
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(() => {
    const savedProvider = (localStorage.getItem('RESUME_LLM_PROVIDER') as any) || DEFAULT_LLM_CONFIG.provider;
    const savedKey = localStorage.getItem('RESUME_LLM_API_KEY') || '';
    const savedModel = localStorage.getItem('RESUME_LLM_MODEL') || DEFAULT_LLM_CONFIG.model;
    const savedEndpoint = localStorage.getItem('RESUME_OLLAMA_ENDPOINT') || DEFAULT_LLM_CONFIG.endpoint;
    return { provider: savedProvider, apiKey: savedKey, model: savedModel, endpoint: savedEndpoint };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringResult, setTailoringResult] = useState<TailoringResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Real-time ATS match analysis
  const atsAnalysis = useMemo(() => {
    return analyzeAtsMatch(resume, jobDescription);
  }, [resume, jobDescription]);

  // Handler: Add skill from missing keywords
  const handleAddSkill = (skill: string) => {
    const categories = [...resume.skills];
    if (categories.length > 0) {
      if (!categories[0].skills.includes(skill)) {
        categories[0] = {
          ...categories[0],
          skills: [...categories[0].skills, skill]
        };
        setResume({ ...resume, skills: categories });
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      setResume({
        ...resume,
        skills: [{ id: 'sk-new', categoryName: 'Core Competencies', skills: [skill] }]
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  // Handler: Full AI Tailoring process
  const handleRunFullTailor = async () => {
    setIsTailorModalOpen(true);
    setIsTailoring(true);
    try {
      const result = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, llmConfig);
      setTailoringResult(result);
    } catch (err) {
      console.error('Tailoring error:', err);
    } finally {
      setIsTailoring(false);
    }
  };

  // Single bullet optimization
  const handleOptimizeSingleBullet = async (_experienceId: string, _bulletIndex: number) => {
    setIsTailorModalOpen(true);
    setIsTailoring(true);
    try {
      const result = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, llmConfig);
      setTailoringResult(result);
    } finally {
      setIsTailoring(false);
    }
  };

  // Summary optimization
  const handleOptimizeSummary = async () => {
    setIsTailorModalOpen(true);
    setIsTailoring(true);
    try {
      const result = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, llmConfig);
      setTailoringResult(result);
    } finally {
      setIsTailoring(false);
    }
  };

  // Apply a single bullet diff to the resume
  const handleApplyBulletDiff = (diff: TailoredBulletDiff) => {
    setResume(prev => {
      const newExp = prev.experience.map(e => {
        if (e.id === diff.experienceId) {
          const newBullets = [...e.bullets];
          newBullets[diff.bulletIndex] = diff.suggestedBullet;
          return { ...e, bullets: newBullets };
        }
        return e;
      });
      return { ...prev, experience: newExp };
    });
  };

  // Apply all bullet diffs at once
  const handleApplyAllBullets = (diffs: TailoredBulletDiff[]) => {
    setResume(prev => {
      let updatedExperience = [...prev.experience];
      diffs.forEach(diff => {
        updatedExperience = updatedExperience.map(e => {
          if (e.id === diff.experienceId) {
            const newBullets = [...e.bullets];
            newBullets[diff.bulletIndex] = diff.suggestedBullet;
            return { ...e, bullets: newBullets };
          }
          return e;
        });
      });
      return { ...prev, experience: updatedExperience };
    });
  };

  // Apply summary change
  const handleApplySummary = (summaryText: string) => {
    setResume(prev => ({ ...prev, summary: summaryText }));
  };

  // Load sample job description
  const handleLoadJobDescription = (title: string, company: string, text: string) => {
    setJobDescription({
      ...jobDescription,
      title,
      company,
      rawText: text
    });
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const cleanName = (resume.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      await exportElementToPdf('resume-printable-area', `${cleanName}_Resume.pdf`);
    } catch (err) {
      console.error('PDF export error, falling back to window.print():', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Bar */}
      <Header
        template={template}
        onTemplateChange={setTemplate}
        llmConfig={llmConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        resume={resume}
        onResumeChange={setResume}
        onLoadJobDescription={handleLoadJobDescription}
        onOpenJdModal={() => setIsJdModalOpen(true)}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onPrint={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 space-y-4">
        {/* Prominent Active Job Target Banner */}
        <div className="no-print bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl text-indigo-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">Target Role:</span>
                <span className="font-bold text-sm sm:text-base text-white">{jobDescription.title || 'Untitled Role'}</span>
                {jobDescription.company && (
                  <span className="text-xs text-indigo-200 font-medium">@ {jobDescription.company}</span>
                )}
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                ATS Score: <strong className="text-emerald-400 font-bold">{atsAnalysis.overallScore}/100</strong> • {atsAnalysis.missingCriticalKeywords.length} missing keywords detected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsJdModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload / Change JD</span>
            </button>
            <button
              type="button"
              onClick={handleRunFullTailor}
              disabled={isTailoring}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailor Now</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden justify-center no-print">
          <div className="bg-slate-200 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                mobileTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor & ATS</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                mobileTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Resume Preview</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Left = Target JD + ATS Scorecard + Editor; Right = Live Resume Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE: Target JD + ATS Scorecard + Interactive Editor */}
          <div className={`lg:col-span-6 xl:col-span-5 space-y-6 no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            {/* 1. Target Job Description Pane (FIRST for logical workflow) */}
            <JobDescriptionPane
              jobDescription={jobDescription}
              onChange={setJobDescription}
              keywordMatches={atsAnalysis.allKeywordMatches}
            />

            {/* 2. ATS Score Card */}
            <AtsScoreCard
              analysis={atsAnalysis}
              onAddSkill={handleAddSkill}
              onOpenTailorModal={handleRunFullTailor}
              isTailoring={isTailoring}
            />

            {/* 3. Resume Editor Pane */}
            <ResumeEditor
              resume={resume}
              onChange={setResume}
              onOptimizeBullet={handleOptimizeSingleBullet}
              onOptimizeSummary={handleOptimizeSummary}
            />
          </div>

          {/* RIGHT PANE: Live ATS Resume Preview */}
          <div className={`lg:col-span-6 xl:col-span-7 sticky top-20 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
            <ResumePreview
              resume={resume}
              template={template}
              onTemplateChange={setTemplate}
              onDownloadPdf={handleDownloadPdf}
              isDownloadingPdf={isDownloadingPdf}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal (LLM Selection: Gemini, Groq, Ollama, Offline) */}
      <ProviderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={llmConfig}
        onSave={setLlmConfig}
      />

      {/* Job Description Dedicated Modal */}
      <JobDescriptionModal
        isOpen={isJdModalOpen}
        onClose={() => setIsJdModalOpen(false)}
        jobDescription={jobDescription}
        onSave={setJobDescription}
      />

      {/* Resume Dedicated Upload & Paste Modal */}
      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onSave={setResume}
      />

      {/* Tailor Assistant Diff Reviewer Modal */}
      <TailorAssistantModal
        isOpen={isTailorModalOpen}
        onClose={() => setIsTailorModalOpen(false)}
        tailoringResult={tailoringResult}
        isLoading={isTailoring}
        onApplyBulletDiff={handleApplyBulletDiff}
        onApplyAllBullets={handleApplyAllBullets}
        onApplySummary={handleApplySummary}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
}

export default App;
