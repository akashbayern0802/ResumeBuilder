import React, { useRef } from 'react';
import { LLMConfig, ResumeTemplate, ResumeData } from '../types/resume';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from '../data/samples';
import { exportResumeToMarkdown, downloadFile, extractTextFromFile, parseExtractedTextToResume } from '../services/documentParser';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Upload,
  Layers,
  Settings,
  Briefcase
} from 'lucide-react';

interface Props {
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  llmConfig: LLMConfig;
  onOpenSettings: () => void;
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  onLoadJobDescription: (title: string, company: string, text: string) => void;
  onOpenJdModal: () => void;
  onOpenResumeModal: () => void;
  onPrint: () => void;
  isDownloadingPdf?: boolean;
}

export const Header: React.FC<Props> = ({
  template,
  onTemplateChange,
  llmConfig,
  onOpenSettings,
  resume,
  onResumeChange,
  onLoadJobDescription,
  onOpenJdModal,
  onOpenResumeModal,
  onPrint,
  isDownloadingPdf
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        onResumeChange(parsed);
      } else {
        const text = await extractTextFromFile(file);
        const parsedResume = parseExtractedTextToResume(text, file.name);
        onResumeChange(parsedResume);
      }
    } catch (err: any) {
      alert(`Could not parse file "${file.name}": ${err.message || 'Unknown error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportJson = () => {
    downloadFile(JSON.stringify(resume, null, 2), `${resume.fullName.replace(/\s+/g, '_')}_Resume.json`, 'application/json');
  };

  const handleExportMarkdown = () => {
    const md = exportResumeToMarkdown(resume);
    downloadFile(md, `${resume.fullName.replace(/\s+/g, '_')}_Resume.md`, 'text/markdown');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ResumeAlign</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                  ATS Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Tailor your resume to any Job Description with AI</p>
            </div>
          </div>

          {/* Quick Preset Pickers */}
          <div className="hidden md:flex items-center gap-2">
            {/* Sample Resume Dropdown */}
            <div className="flex items-center text-xs bg-slate-100/80 rounded-lg p-1 border border-slate-200/80">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Sample:
              </span>
              <button
                type="button"
                onClick={() => onResumeChange(SAMPLE_RESUMES.akash_bhattacharya)}
                className="px-2 py-1 rounded hover:bg-white text-indigo-700 font-bold transition-colors"
                title="Load Akash Bhattacharya (Product / Project Manager) Resume"
              >
                Akash (Lead PM)
              </button>
              <button
                type="button"
                onClick={() => onResumeChange(SAMPLE_RESUMES.software_engineer)}
                className="px-2 py-1 rounded hover:bg-white text-slate-700 font-medium transition-colors"
                title="Load Full Stack Engineer Sample"
              >
                Full Stack
              </button>
            </div>

            {/* Sample Job Description Dropdown */}
            <div className="flex items-center text-xs bg-slate-100/80 rounded-lg p-1 border border-slate-200/80">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Target JD:
              </span>
              <button
                type="button"
                onClick={() => {
                  const jd = SAMPLE_JOB_DESCRIPTIONS.director_fintech_product;
                  onLoadJobDescription(jd.title, jd.company, jd.text);
                }}
                className="px-2 py-1 rounded hover:bg-white text-indigo-700 font-bold transition-colors"
                title="Load Director / Lead Product Manager - FinTech & Banking"
              >
                FinTech PM
              </button>
              <button
                type="button"
                onClick={() => {
                  const jd = SAMPLE_JOB_DESCRIPTIONS.senior_fullstack_cloud;
                  onLoadJobDescription(jd.title, jd.company, jd.text);
                }}
                className="px-2 py-1 rounded hover:bg-white text-slate-700 font-medium transition-colors"
              >
                Cloud Eng
              </button>
            </div>
          </div>

          {/* Right Actions: AI Provider Badge, Template, Export */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Provider Config Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span className="hidden sm:inline">AI Engine:</span>
              <span className="font-semibold capitalize text-primary-700">{llmConfig.provider}</span>
              <Settings className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Template Selector */}
            <div className="hidden lg:flex items-center">
              <select
                value={template}
                onChange={(e) => onTemplateChange(e.target.value as ResumeTemplate)}
                className="text-xs bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium shadow-2xs"
              >
                <option value="naukri">🇮🇳 Naukri & Indian Corporate ATS</option>
                <option value="executive">👔 Executive Two-Column (Consulting)</option>
                <option value="harvard">🏛️ Harvard ATS (Classic)</option>
                <option value="modern">💼 Modern Professional</option>
                <option value="wallstreet">📈 Wall Street / Banking (WSO)</option>
                <option value="tech">⚡ Silicon Valley Tech</option>
                <option value="minimalist">📄 Minimalist Clean</option>
              </select>
            </div>

            {/* Resume Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.json,.md"
              className="hidden"
            />
            <button
              type="button"
              onClick={onOpenResumeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Upload or paste your resume in PDF, DOCX, TXT, or JSON format"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Resume</span>
            </button>

            {/* Upload or Paste Job Description Button */}
            <button
              type="button"
              onClick={onOpenJdModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Upload or paste your target Job Description (PDF, DOCX, TXT)"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Upload / Paste JD</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>MD</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              {/* Direct PDF Download CTA */}
              <button
                type="button"
                onClick={onPrint}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                title="Download ATS-compliant PDF directly to your device"
              >
                {isDownloadingPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

