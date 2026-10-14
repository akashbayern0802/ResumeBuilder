import { useState, useMemo } from 'react';
import { ResumeData, JobDescription, ResumeTemplate, LLMConfig, LLMProviderType, TailoredBulletDiff, TailoringResult } from './types/resume';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from './data/samples';
import { analyzeAtsMatch } from './services/atsAnalyzer';
import { tailorResumeWithAI, DEFAULT_LLM_CONFIG, getProviderApiKey, getProviderModel } from './services/llmService';
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
import { SubscriptionTrackerModal } from './components/SubscriptionTrackerModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { RearrangeSectionsModal } from './components/RearrangeSectionsModal';
import { DesignFontModal } from './components/DesignFontModal';
import { SavedResumesModal } from './components/SavedResumesModal';
import { RightActionSidebar } from './components/RightActionSidebar';
import { Eye, Edit3, Briefcase, Sparkles, UploadCloud, AlertTriangle, Download, Sliders } from 'lucide-react';
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
    const savedProvider = (localStorage.getItem('RESUME_LLM_PROVIDER') as LLMProviderType) || DEFAULT_LLM_CONFIG.provider;
    const savedKey = getProviderApiKey(savedProvider);
    const savedModel = getProviderModel(savedProvider);
    const savedEndpoint = savedProvider === 'bedrock'
      ? (localStorage.getItem('RESUME_BEDROCK_ENDPOINT') || 'https://bedrock-mantle.us-east-1.api.aws')
      : (localStorage.getItem('RESUME_OLLAMA_ENDPOINT') || DEFAULT_LLM_CONFIG.endpoint);
    const savedProject = savedProvider === 'bedrock'
      ? (localStorage.getItem('RESUME_BEDROCK_PROJECT') || 'default')
      : (savedProvider === 'vertex'
        ? (localStorage.getItem('RESUME_VERTEX_PROJECT') || '')
        : undefined);
    const savedLocation = savedProvider === 'vertex'
      ? (localStorage.getItem('RESUME_VERTEX_LOCATION') || 'us-central1')
      : undefined;
    return { provider: savedProvider, apiKey: savedKey, model: savedModel, endpoint: savedEndpoint, project: savedProject, location: savedLocation };
  });

  const handleQuickSelectProvider = (newProvider: LLMProviderType) => {
    const key = getProviderApiKey(newProvider);
    const model = getProviderModel(newProvider);
    const endpoint = newProvider === 'bedrock'
      ? (localStorage.getItem('RESUME_BEDROCK_ENDPOINT') || 'https://bedrock-mantle.us-east-1.api.aws')
      : (localStorage.getItem('RESUME_OLLAMA_ENDPOINT') || DEFAULT_LLM_CONFIG.endpoint);
    const project = newProvider === 'bedrock'
      ? (localStorage.getItem('RESUME_BEDROCK_PROJECT') || 'default')
      : (newProvider === 'vertex'
        ? (localStorage.getItem('RESUME_VERTEX_PROJECT') || '')
        : undefined);
    const location = newProvider === 'vertex'
      ? (localStorage.getItem('RESUME_VERTEX_LOCATION') || 'us-central1')
      : undefined;
    const newConfig: LLMConfig = {
      provider: newProvider,
      apiKey: key,
      model,
      endpoint,
      project,
      location
    };
    localStorage.setItem('RESUME_LLM_PROVIDER', newProvider);
    localStorage.setItem('RESUME_LLM_API_KEY', key);
    localStorage.setItem('RESUME_LLM_MODEL', model);
    setLlmConfig(newConfig);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringResult, setTailoringResult] = useState<TailoringResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [workspaceView, setWorkspaceView] = useState<'split' | 'editor' | 'preview'>('split');
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isRearrangeOpen, setIsRearrangeOpen] = useState(false);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isSavedResumesOpen, setIsSavedResumesOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

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
        onQuickSelectProvider={handleQuickSelectProvider}
        resume={resume}
        onResumeChange={setResume}
        onLoadJobDescription={handleLoadJobDescription}
        onOpenJdModal={() => setIsJdModalOpen(true)}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)}
        onOpenSavedResumes={() => setIsSavedResumesOpen(true)}
        onPrint={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />

      {/* Main Dashboard Layout */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 space-y-4">
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
            {llmConfig.provider !== 'offline' && llmConfig.provider !== 'ollama' && !llmConfig.apiKey && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 font-medium bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-xl border border-amber-300/30 transition-colors"
                title="Your selected cloud provider has no API key. Click to configure key or offline engine will be used."
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Fallback Active</span>
              </button>
            )}
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

        {/* Main Workspace Layout with Dedicated Right Action Sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
          {/* Central Workspace Area: Toolbar + Editor/Preview */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Enhancv Style Studio Action Toolbar */}
            <div className="no-print bg-white border border-slate-200 shadow-2xs rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
                    {resume.fullName || 'Candidate Resume'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-saved
                  </span>
                </div>

                {/* Layout Mode Switcher */}
                <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
                  <button
                    type="button"
                    onClick={() => setWorkspaceView('split')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      workspaceView === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Side-by-side Editor & Live Document"
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceView('editor')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      workspaceView === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Full-Width Expanded Editor Studio"
                  >
                    Full Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceView('preview')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      workspaceView === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Full Document Sheet Preview"
                  >
                    Full Preview
                  </button>
                </div>
              </div>

              {/* Toolbar Right: Quick Sidebar Toggle & Download */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
                    isRightSidebarOpen
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                  title="Toggle Right Action Sidebar"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">{isRightSidebarOpen ? 'Hide Studio' : 'Studio Tools'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  title="Download ATS-compliant PDF directly to your device"
                >
                  {isDownloadingPdf ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Workspace Layout Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT PANE: Target JD + ATS Scorecard + Interactive Editor */}
              {workspaceView !== 'preview' && (
                <div className={`${workspaceView === 'editor' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-6 no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                  {/* 1. Target Job Description Pane */}
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
                    llmConfig={llmConfig}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />

                  {/* 3. Resume Editor Pane */}
                  <ResumeEditor
                    resume={resume}
                    onChange={setResume}
                    onOptimizeBullet={handleOptimizeSingleBullet}
                    onOptimizeSummary={handleOptimizeSummary}
                    onOpenRearrange={() => setIsRearrangeOpen(true)}
                    onOpenDesign={() => setIsDesignOpen(true)}
                  />
                </div>
              )}

              {/* RIGHT PANE: Live ATS Resume Preview */}
              {workspaceView !== 'editor' && (
                <div className={`${workspaceView === 'preview' ? 'lg:col-span-12 flex justify-center' : 'lg:col-span-7 sticky top-20'} ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'} min-w-0`}>
                  <ResumePreview
                    resume={resume}
                    template={template}
                    onTemplateChange={setTemplate}
                    onDownloadPdf={handleDownloadPdf}
                    onOpenPdfPreview={() => setIsPdfPreviewOpen(true)}
                    onOpenRearrange={() => setIsRearrangeOpen(true)}
                    onOpenDesign={() => setIsDesignOpen(true)}
                    onResumeChange={setResume}
                    isDownloadingPdf={isDownloadingPdf}
                  />
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED RIGHT ACTION SIDEBAR */}
          <RightActionSidebar
            resume={resume}
            onResumeChange={setResume}
            template={template}
            onTemplateChange={setTemplate}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
            onOpenPdfPreview={() => setIsPdfPreviewOpen(true)}
            onOpenDesign={() => setIsDesignOpen(true)}
            onOpenRearrange={() => setIsRearrangeOpen(true)}
            onOpenSavedResumes={() => setIsSavedResumesOpen(true)}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onOpenJdModal={() => setIsJdModalOpen(true)}
            onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)}
            isOpen={isRightSidebarOpen}
            onToggleOpen={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          />
        </div>
      </main>

      {/* Settings Modal (LLM Selection: Gemini, Groq, Ollama, Offline, Claude, OpenAI) */}
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
        llmConfig={llmConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SubscriptionTrackerModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* Enhancv-Style Modals */}
      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        printableElementId="resume-printable-area"
        documentTitle={resume.fullName || 'Resume'}
      />

      <RearrangeSectionsModal
        isOpen={isRearrangeOpen}
        onClose={() => setIsRearrangeOpen(false)}
        resume={resume}
        onChange={setResume}
      />

      <DesignFontModal
        isOpen={isDesignOpen}
        onClose={() => setIsDesignOpen(false)}
        resume={resume}
        onChange={setResume}
      />

      {/* Local SQLite Resume Store Modal */}
      <SavedResumesModal
        isOpen={isSavedResumesOpen}
        onClose={() => setIsSavedResumesOpen(false)}
        currentResume={resume}
        currentTemplate={template}
        onLoadResume={(loadedResume, loadedTemplate) => {
          setResume(loadedResume);
          if (loadedTemplate) setTemplate(loadedTemplate);
        }}
      />
    </div>
  );
}

export default App;
