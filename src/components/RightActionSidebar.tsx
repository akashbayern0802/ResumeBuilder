import React from 'react';
import { ResumeData, ResumeTemplate } from '../types/resume';
import { exportResumeToMarkdown, downloadFile } from '../services/documentParser';
import {
  Printer,
  FileCheck,
  FileText,
  Palette,
  ArrowUpDown,
  Database,
  Upload,
  Briefcase,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sliders,
  Code
} from 'lucide-react';

export interface RightActionSidebarProps {
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
  onOpenPdfPreview: () => void;
  onOpenDesign: () => void;
  onOpenRearrange: () => void;
  onOpenSavedResumes?: () => void;
  onOpenResumeModal: () => void;
  onOpenJdModal: () => void;
  onOpenSubscriptions: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const RightActionSidebar: React.FC<RightActionSidebarProps> = ({
  resume,
  onResumeChange,
  template,
  onTemplateChange,
  onDownloadPdf,
  isDownloadingPdf = false,
  onOpenPdfPreview,
  onOpenDesign,
  onOpenRearrange,
  onOpenSavedResumes,
  onOpenResumeModal,
  onOpenJdModal,
  onOpenSubscriptions,
  isOpen,
  onToggleOpen
}) => {

  const is2PageFit = Boolean(resume.design?.fitTwoPages || resume.design?.fontSize === 'compact');

  const handleToggleFitTwoPages = () => {
    const nextVal = !is2PageFit;
    onResumeChange({
      ...resume,
      design: {
        ...resume.design,
        fitTwoPages: nextVal,
        fontSize: nextVal ? 'compact' : 'normal',
        lineSpacing: nextVal ? 'tight' : 'normal',
        fontFamily: resume.design?.fontFamily || 'roboto',
        primaryColor: resume.design?.primaryColor || '#0f172a',
        showPhoto: resume.design?.showPhoto ?? false
      }
    });
  };

  const handleExportJson = () => {
    downloadFile(
      JSON.stringify(resume, null, 2),
      `${(resume.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.json`,
      'application/json'
    );
  };

  const handleExportMarkdown = () => {
    const md = exportResumeToMarkdown(resume);
    downloadFile(
      md,
      `${(resume.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.md`,
      'text/markdown'
    );
  };

  // If collapsed: show a slim icon-only floating dock/rail on the right
  if (!isOpen) {
    return (
      <aside
        className="no-print hidden lg:flex flex-col items-center bg-white border-l border-slate-200 py-3 px-1.5 shadow-xs sticky top-20 h-[calc(100vh-6rem)] w-14 shrink-0 transition-all z-20"
        aria-label="Quick Actions Rail"
      >
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-2 mb-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Expand Right Sidebar Panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-8 border-t border-slate-200 my-1" />

        <div className="flex flex-col items-center gap-2 mt-1">
          {/* Download PDF */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            title="Download PDF"
          >
            {isDownloadingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
          </button>

          {/* Preview PDF */}
          <button
            type="button"
            onClick={onOpenPdfPreview}
            className="p-2.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
            title="Preview Multi-page PDF"
          >
            <FileCheck className="w-4 h-4" />
          </button>

          {/* 2-Page Fit */}
          <button
            type="button"
            onClick={handleToggleFitTwoPages}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              is2PageFit
                ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
            }`}
            title={is2PageFit ? '2-Page Fit: Active' : 'Enable 2-Page Fit'}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Design */}
          <button
            type="button"
            onClick={onOpenDesign}
            className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Design & Typography"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Rearrange */}
          <button
            type="button"
            onClick={onOpenRearrange}
            className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Rearrange Sections"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          <div className="w-8 border-t border-slate-200 my-1" />

          {/* SQLite DB */}
          {onOpenSavedResumes && (
            <button
              type="button"
              onClick={onOpenSavedResumes}
              className="p-2.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
              title="SQLite Database (Saved Resumes)"
            >
              <Database className="w-4 h-4" />
            </button>
          )}

          {/* Upload Resume */}
          <button
            type="button"
            onClick={onOpenResumeModal}
            className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Upload Resume"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Subscriptions */}
          <button
            type="button"
            onClick={onOpenSubscriptions}
            className="p-2.5 rounded-xl text-fuchsia-700 hover:bg-fuchsia-50 transition-all cursor-pointer"
            title="Subscription Tracker"
          >
            <CreditCard className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="no-print bg-white border-l border-slate-200 shadow-sm sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto w-80 shrink-0 flex flex-col z-20 select-none custom-scrollbar"
      aria-label="Action Sidebar"
    >
      {/* Top Header of Sidebar */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">Studio Actions</h3>
            <p className="text-[10px] text-slate-500">Document tools & exports</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="Collapse Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* GROUP 1: Primary Output & Export */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Export & Print
            </span>
          </div>

          {/* Download PDF Primary CTA */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 group"
          >
            {isDownloadingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {/* Preview Multi-page PDF */}
          <button
            type="button"
            onClick={onOpenPdfPreview}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Page PDF Preview</span>
          </button>

          {/* Quick MD & JSON Export Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Download clean Markdown formatted resume"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export MD</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Download JSON structured resume"
            >
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
          </div>
        </section>

        {/* GROUP 2: Template & Formatting */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Format & Template
          </span>

          {/* Template Select Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">
              ATS Resume Style
            </label>
            <select
              value={template}
              onChange={(e) => onTemplateChange(e.target.value as ResumeTemplate)}
              className="w-full text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <option value="enhancv_timeline">✨ Enhancv Executive Timeline (2-Page)</option>
              <option value="graphical_metric">📊 Graphical Infographic & KPI Grid (2-Page)</option>
              <option value="naukri">🇮🇳 Naukri & Indian Corporate ATS</option>
              <option value="double_column">📐 Double-Column Executive (2-Page Fit)</option>
              <option value="double_line">📑 Double-Line Corporate ATS (2-Page Fit)</option>
              <option value="executive">👔 Executive Two-Column (Consulting)</option>
              <option value="harvard">🏛️ Harvard ATS (Classic)</option>
              <option value="modern">💼 Modern Professional</option>
              <option value="wallstreet">📈 Wall Street / Banking (WSO)</option>
              <option value="tech">⚡ Silicon Valley Tech</option>
              <option value="minimalist">📄 Minimalist Clean</option>
            </select>
          </div>

          {/* 2-Page Fit Toggle Switch Card */}
          <div
            onClick={handleToggleFitTwoPages}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              is2PageFit
                ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  is2PageFit ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>2-Page Fit</span>
                  {is2PageFit && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Auto-compact spacing</p>
              </div>
            </div>

            {/* Toggle visual */}
            <div
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                is2PageFit ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
            </div>
          </div>
        </section>

        {/* GROUP 3: Design & Section Arrangement */}
        <section className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Styling & Layout
          </span>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onOpenDesign}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Design & Typography</div>
                  <div className="text-[10px] text-slate-500">Fonts, sizes, colors, photo</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onOpenRearrange}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Rearrange Sections</div>
                  <div className="text-[10px] text-slate-500">Reorder & hide sections</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* GROUP 4: Database & Document Inputs */}
        <section className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Database & Files
          </span>

          <div className="space-y-1.5">
            {/* SQLite DB Saved Resumes */}
            {onOpenSavedResumes && (
              <button
                type="button"
                onClick={onOpenSavedResumes}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:text-slate-900 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/80 rounded-xl transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>SQLite Database</span>
                      <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                        Local DB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Save & load versions</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Upload Resume */}
            <button
              type="button"
              onClick={onOpenResumeModal}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-medium text-slate-700">Upload Resume</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">PDF, DOCX</span>
            </button>

            {/* Upload or Change JD */}
            <button
              type="button"
              onClick={onOpenJdModal}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">Upload / Paste JD</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Target Role</span>
            </button>

            {/* Subscription Tracker */}
            <button
              type="button"
              onClick={onOpenSubscriptions}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-3.5 h-3.5 text-fuchsia-600" />
                <span className="text-xs font-medium text-slate-700">Subscriptions</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Tracker</span>
            </button>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between">
        <span>ATS Ready • 100% Client-Side</span>
        <span className="font-mono text-[9px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">v2.5</span>
      </div>
    </aside>
  );
};
