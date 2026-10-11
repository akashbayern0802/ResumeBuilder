import React, { useState } from 'react';
import { ResumeData, ResumeTemplate, ResumeSectionId } from '../types/resume';
import {
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  FileText,
  Download,
  FileCheck,
  Palette,
  ArrowUpDown,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const cleanBulletText = (text: string) => {
  return text.replace(/^[•\-*▪▸–—]\s*/, '').trim();
};

interface BulletListProps {
  bullets: string[];
  className?: string;
  bulletSpacing?: string;
  fontSizeClass?: string;
  bulletClassName?: string;
  textClassName?: string;
}

export const BulletList: React.FC<BulletListProps> = ({
  bullets,
  className = '',
  bulletSpacing = 'space-y-1',
  fontSizeClass = '',
  bulletClassName = '',
  textClassName = ''
}) => {
  const valid = (bullets || [])
    .map(cleanBulletText)
    .filter(b => b.length > 0);

  if (valid.length === 0) return null;

  return (
    <div className={`${bulletSpacing} ${fontSizeClass} ${className}`}>
      {valid.map((b, i) => (
        <div key={i} className="flex items-start gap-2 break-inside-avoid text-slate-800">
          <span className={`select-none text-slate-700 font-bold shrink-0 leading-[1.35] text-[10px] sm:text-[11px] ${bulletClassName}`}>•</span>
          <span className={`flex-1 leading-normal text-slate-800 text-justify ${textClassName}`}>{b}</span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  resume: ResumeData;
  template: ResumeTemplate;
  onTemplateChange?: (template: ResumeTemplate) => void;
  onDownloadPdf?: () => void;
  onOpenPdfPreview?: () => void;
  onOpenRearrange?: () => void;
  onOpenDesign?: () => void;
  onResumeChange?: (resume: ResumeData) => void;
  isDownloadingPdf?: boolean;
}

export const ResumePreview: React.FC<Props> = ({
  resume,
  template,
  onTemplateChange,
  onDownloadPdf,
  onOpenPdfPreview,
  onOpenRearrange,
  onOpenDesign,
  onResumeChange,
  isDownloadingPdf
}) => {
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  const templatesList: { id: ResumeTemplate; label: string; icon: string }[] = [
    { id: 'naukri', label: 'Naukri & Indian ATS', icon: '🇮🇳' },
    { id: 'double_column', label: 'Double-Column (2-Page)', icon: '📐' },
    { id: 'double_line', label: 'Double-Line ATS (2-Page)', icon: '📑' },
    { id: 'executive', label: 'Executive 2-Col', icon: '👔' },
    { id: 'harvard', label: 'Harvard ATS', icon: '🏛️' },
    { id: 'modern', label: 'Modern Indigo', icon: '💼' },
    { id: 'wallstreet', label: 'Wall Street', icon: '📈' },
    { id: 'tech', label: 'Silicon Valley', icon: '⚡' },
    { id: 'minimalist', label: 'Minimalist', icon: '📄' }
  ];

  // Design tokens derived from resume.design
  const design = resume.design;
  const is2PageFit = Boolean(design?.fitTwoPages || design?.fontSize === 'compact');

  const handleToggleFitTwoPages = () => {
    if (!onResumeChange) return;
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

  const getFontFamily = () => {
    switch (design?.fontFamily) {
      case 'roboto': return "'Roboto', sans-serif";
      case 'merriweather': return "'Merriweather', serif";
      case 'garamond': return "'Garamond', Georgia, serif";
      case 'sans': return "system-ui, -apple-system, sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  const getFontSizeClass = () => {
    if (is2PageFit) {
      return 'text-[11px] sm:text-[11.5px] leading-snug';
    }
    switch (design?.fontSize) {
      case 'compact': return 'text-[12px] leading-normal';
      case 'relaxed': return 'text-[14px] leading-relaxed';
      default: return 'text-[13px] leading-normal';
    }
  };

  // Dynamic layout tokens for 2-page fit compaction without giant empty gaps
  const containerPadding = is2PageFit ? 'p-4 sm:p-5' : 'p-6 sm:p-8';
  const headerMargin = is2PageFit ? 'border-b-2 pb-1 mb-2' : 'border-b-2 pb-2.5 mb-3';
  const sectionMargin = is2PageFit ? 'mb-2' : 'mb-3';
  const jobSpacing = is2PageFit ? 'space-y-1.5' : 'space-y-2.5';
  const bulletSpacing = is2PageFit ? 'mt-0.5 space-y-0.5' : 'mt-1 space-y-1';

  const primaryColor = design?.primaryColor || '#0f172a';
  const showPhoto = Boolean(design?.showPhoto && resume.photoUrl);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Quick Studio Bar: Templates + Rearrange + Design + PDF Preview + Download */}
      <div className="no-print bg-white border border-slate-200 shadow-2xs rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 text-xs w-full max-w-[850px]">
        {/* Left: Templates */}
        {onTemplateChange && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-slate-400 font-semibold px-1 text-[11px] uppercase tracking-wider">Format:</span>
            {templatesList.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTemplateChange(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  template === t.id
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right: Quick Studio Tools */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          {onResumeChange && (
            <button
              type="button"
              onClick={handleToggleFitTwoPages}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                is2PageFit
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-500'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300'
              }`}
              title="Automatically tightens margins, fonts, and padding to fit resume inside 2 pages"
            >
              <span>⚡ {is2PageFit ? '2-Page Fit: ON' : '2-Page Fit'}</span>
            </button>
          )}

          {onOpenRearrange && (
            <button
              type="button"
              onClick={onOpenRearrange}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Rearrange section order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rearrange</span>
            </button>
          )}

          {onOpenDesign && (
            <button
              type="button"
              onClick={onOpenDesign}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Customize fonts, sizing & photo"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>Design & Font</span>
            </button>
          )}

          {onOpenPdfPreview && (
            <button
              type="button"
              onClick={onOpenPdfPreview}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Preview exact multi-page PDF before downloading"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Preview PDF</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              title="Download PDF directly to your device"
            >
              {isDownloadingPdf ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingPdf ? 'Generating...' : 'Download'}</span>
            </button>
          )}

          {/* Zoom controls to fit any screen without clipping */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200 ml-1">
            <button
              type="button"
              onClick={() => setPreviewZoom(z => Math.max(60, z - 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewZoom(100)}
              className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Reset zoom to 100%"
            >
              {previewZoom}%
            </button>
            <button
              type="button"
              onClick={() => setPreviewZoom(z => Math.min(130, z + 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewZoom(prev => prev === 80 ? 100 : 80)}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${previewZoom === 80 ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}`}
              title="Fit preview to pane width"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Paper Container - Uses mx-auto to never clip the left margin in narrow panes */}
      <div className="bg-slate-200/60 p-2 sm:p-5 rounded-2xl overflow-x-auto w-full flex flex-col items-center">
        <div
          className="transition-transform duration-150 origin-top w-full flex justify-center"
          style={{
            transform: previewZoom !== 100 ? `scale(${previewZoom / 100})` : undefined,
            marginBottom: previewZoom < 100 ? `${-((100 - previewZoom) / 100) * 1100}px` : undefined
          }}
        >
        {/* ============================================================ */}
        {/* FORMAT 0: NAUKRI & INDIAN CORPORATE ATS STANDARD             */}
        {/* ============================================================ */}
        {template === 'naukri' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 leading-normal`}
            style={{ fontFamily: getFontFamily() }}
          >
            {/* Header: Authority & Immediate Recruiter Metadata */}
            <header className={headerMargin} style={{ borderColor: primaryColor }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex-1">
                  <h1 className={`${is2PageFit ? 'text-2xl sm:text-3xl mb-0.5' : 'text-3xl sm:text-4xl mb-1'} font-black text-slate-950 tracking-tight uppercase`} style={{ color: primaryColor }}>
                    {resume.fullName || 'Candidate Name'}
                  </h1>
                  <p className={`${getFontSizeClass()} font-bold text-slate-800 tracking-wide uppercase ${is2PageFit ? 'mb-1' : 'mb-2'}`}>
                    {resume.title || 'Product / Project Manager | Strategy & Consulting'}
                  </p>

                  {/* Contact info */}
                  <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-0.5 ${getFontSizeClass()} text-slate-700 font-medium ${is2PageFit ? 'mb-1' : 'mb-2'}`}>
                    {resume.email && <span>{resume.email}</span>}
                    {resume.phone && <span>• {resume.phone}</span>}
                    {resume.location && <span>• {resume.location}</span>}
                    {resume.linkedin && <span>• {resume.linkedin.replace(/^https?:\/\//, '')}</span>}
                  </div>

                  {/* Indian Recruiter Metadata (Total Exp, Preferred Locations) */}
                  {(resume.totalExperience || resume.preferredLocations) && (
                    <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 ${is2PageFit ? 'pt-1.5 mt-0.5' : 'pt-2 mt-1'} border-t border-slate-200`}>
                      {resume.totalExperience && (
                        <span
                          style={{ display: 'inline-block', lineHeight: '1.3', padding: is2PageFit ? '2px 8px' : '3px 10px', borderRadius: '4px' }}
                          className={`bg-slate-100 text-slate-900 border border-slate-300 font-bold ${is2PageFit ? 'text-[10px]' : 'text-[11px]'}`}
                        >
                          Experience: <strong className="text-slate-950 font-black">{resume.totalExperience}</strong>
                        </span>
                      )}
                      {resume.preferredLocations && (
                        <span
                          style={{ display: 'inline-block', lineHeight: '1.3', padding: is2PageFit ? '2px 8px' : '3px 10px', borderRadius: '4px' }}
                          className={`bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium ${is2PageFit ? 'text-[10px]' : 'text-[11px]'}`}
                        >
                          <span className="font-semibold text-indigo-700">Preferred Locations: </span>
                          <span className="text-slate-800">{resume.preferredLocations}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Candidate Photo (Enhancv Style) */}
                {showPhoto && (
                  <div className={`${is2PageFit ? 'w-20 h-20' : 'w-24 h-24'} rounded-full border-2 border-slate-300 overflow-hidden shadow-md shrink-0`}>
                    <img src={resume.photoUrl} alt={resume.fullName} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </header>

            {/* Dynamic Ordered Sections (Rearrangeable) */}
            {(resume.sectionOrder && resume.sectionOrder.length > 0
              ? resume.sectionOrder
              : (['summary', 'skills', 'experience', 'education', 'certifications', 'projects'] as ResumeSectionId[])
            ).map((secId) => {
              if ((resume.hiddenSections || []).includes(secId)) return null;

              if (secId === 'summary' && resume.summary) {
                return (
                  <section key="summary" className={sectionMargin}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Executive Profile Summary
                      </h2>
                    </div>
                    <p className={`${getFontSizeClass()} text-slate-800 leading-relaxed text-justify`}>
                      {resume.summary}
                    </p>
                  </section>
                );
              }

              if (secId === 'skills' && resume.skills && resume.skills.length > 0) {
                return (
                  <section key="skills" className={sectionMargin}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Key Competencies & Technical Capabilities
                      </h2>
                    </div>
                    <div className={`${is2PageFit ? 'space-y-1' : 'space-y-1.5'} ${getFontSizeClass()}`}>
                      {resume.skills.map((cat) => (
                        <div key={cat.id} className="leading-snug">
                          <span className="font-bold text-slate-950">{cat.categoryName}: </span>
                          <span className="text-slate-800">{cat.skills.join(' • ')}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (secId === 'experience' && resume.experience && resume.experience.length > 0) {
                return (
                  <section key="experience" className={sectionMargin}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1.5' : 'border-b-2 pb-1 mb-2.5'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Professional Experience
                      </h2>
                    </div>
                    <div className={jobSpacing}>
                      {resume.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 break-inside-avoid">
                            <div>
                              <span className={`font-bold ${getFontSizeClass()} text-slate-950`}>{exp.role}</span>
                              <span className={`${getFontSizeClass()} font-semibold text-slate-800`}> | {exp.company}</span>
                            </div>
                            <div className={`${getFontSizeClass()} text-slate-600 font-semibold italic shrink-0`}>
                              {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                              {exp.location ? ` (${exp.location})` : ''}
                            </div>
                          </div>

                          <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (secId === 'education' && resume.education && resume.education.length > 0) {
                return (
                  <section key="education" className={sectionMargin}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Education & Academic Credentials
                      </h2>
                    </div>
                    <div className={is2PageFit ? 'space-y-1' : 'space-y-1.5'}>
                      {resume.education.map((edu) => (
                        <div key={edu.id} className={`flex items-baseline justify-between ${getFontSizeClass()} break-inside-avoid`}>
                          <div>
                            <span className="font-bold text-slate-950">{edu.degree}</span>
                            <span className="text-slate-800"> — {edu.institution}</span>
                            {edu.gpa && <span className="text-slate-600 font-medium"> ({edu.gpa})</span>}
                          </div>
                          <div className="text-slate-600 font-semibold italic shrink-0">
                            {edu.graduationDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (secId === 'certifications' && resume.certifications && resume.certifications.length > 0) {
                return (
                  <section key="certifications" className={`${sectionMargin} break-inside-avoid`}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Professional Certifications & Credentials
                      </h2>
                    </div>
                    <div className={`flex flex-wrap gap-1.5 ${getFontSizeClass()}`}>
                      {resume.certifications.map((cert, i) => (
                        <span
                          key={i}
                          style={{ display: 'inline-block', lineHeight: '1.3', padding: is2PageFit ? '2px 6px' : '3px 8px', borderRadius: '4px' }}
                          className={`bg-slate-100 text-slate-800 border border-slate-200 font-medium ${getFontSizeClass()} break-inside-avoid`}
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              }

              if (secId === 'projects' && resume.projects && resume.projects.length > 0) {
                return (
                  <section key="projects" className={`${sectionMargin} break-inside-avoid`}>
                    <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Projects & Strategic Deliverables
                      </h2>
                    </div>
                    <div className={jobSpacing}>
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className="break-inside-avoid">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className={`font-bold ${getFontSizeClass()} text-slate-950`}>{proj.name}</span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-xs text-slate-600 italic">({proj.technologies.join(', ')})</span>
                            )}
                          </div>
                          <p className={`${getFontSizeClass()} text-slate-700 mt-0.5`}>{proj.description}</p>
                          {proj.bullets && proj.bullets.length > 0 && (
                            <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT: DOUBLE-COLUMN EXECUTIVE (GUARANTEED 2-PAGE FIT)      */}
        {/* ============================================================ */}
        {template === 'double_column' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-5 sm:p-6' : 'p-6 sm:p-10'} text-slate-900 leading-normal`}
            style={{ fontFamily: getFontFamily() }}
          >
            {/* Header: Full-Width Clean Double-Border Header */}
            <header className={`border-b-4 border-double ${is2PageFit ? 'pb-2 mb-2.5' : 'pb-3 mb-4'}`} style={{ borderColor: primaryColor }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex-1">
                  <h1 className={`${is2PageFit ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'} font-black text-slate-950 tracking-tight uppercase mb-0.5`} style={{ color: primaryColor }}>
                    {resume.fullName || 'Candidate Name'}
                  </h1>
                  <p className={`${getFontSizeClass()} font-bold text-slate-800 tracking-wide uppercase mb-1`}>
                    {resume.title || 'Product / Project Manager | Strategy & Consulting'}
                  </p>
                  <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-0.5 ${getFontSizeClass()} text-slate-600 font-medium`}>
                    {resume.email && <span>{resume.email}</span>}
                    {resume.phone && <span>• {resume.phone}</span>}
                    {resume.location && <span>• {resume.location}</span>}
                    {resume.linkedin && <span>• {resume.linkedin.replace(/^https?:\/\//, '')}</span>}
                  </div>
                </div>

                {showPhoto && (
                  <div className={`${is2PageFit ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 border-slate-300 overflow-hidden shadow-sm shrink-0`}>
                    <img src={resume.photoUrl} alt={resume.fullName} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </header>

            {/* 2-Column Split Body: Left 35% Sidebar, Right 65% Main Track */}
            <div className={`grid grid-cols-1 md:grid-cols-12 ${is2PageFit ? 'gap-4' : 'gap-5'} items-start`}>
              {/* LEFT SIDEBAR (md:col-span-4): Compact parallel track */}
              <div className={`md:col-span-4 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                {/* Executive Summary */}
                {resume.summary && (
                  <div className="break-inside-avoid">
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        Executive Profile
                      </h2>
                    </div>
                    <p className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} text-slate-800 leading-snug text-justify`}>
                      {resume.summary}
                    </p>
                  </div>
                )}

                {/* Key Competencies (Compact Tags) */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className="break-inside-avoid">
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                        <Wrench className="w-3.5 h-3.5 text-slate-700" />
                        Key Competencies
                      </h2>
                    </div>
                    <div className={is2PageFit ? 'space-y-1.5' : 'space-y-2'}>
                      {resume.skills.map((cat) => (
                        <div key={cat.id} className={is2PageFit ? 'text-[11px]' : 'text-[11.5px]'}>
                          <span className="font-bold text-slate-900 block mb-0.5">{cat.categoryName}</span>
                          <div className="flex flex-wrap gap-1">
                            {cat.skills.map((sk, idx) => (
                              <span
                                key={idx}
                                className={`bg-slate-100 text-slate-800 border border-slate-200/80 ${is2PageFit ? 'px-1 py-0.2 text-[10px]' : 'px-1.5 py-0.5 text-[11px]'} rounded font-medium`}
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                  <div className="break-inside-avoid">
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                        <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                        Education
                      </h2>
                    </div>
                    <div className={`${is2PageFit ? 'space-y-1.5 text-[11px]' : 'space-y-2 text-[12px]'}`}>
                      {resume.education.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-slate-300 pl-2">
                          <div className="font-bold text-slate-950">{edu.degree}</div>
                          <div className="text-slate-800">{edu.institution}</div>
                          <div className="text-[10.5px] text-slate-500 italic">
                            {edu.graduationDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resume.certifications && resume.certifications.length > 0 && (
                  <div className="break-inside-avoid">
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                        <Award className="w-3.5 h-3.5 text-slate-700" />
                        Certifications
                      </h2>
                    </div>
                    <div className={`${is2PageFit ? 'space-y-0.5 text-[10.5px]' : 'space-y-1 text-[11.5px]'} text-slate-800`}>
                      {resume.certifications.map((cert, i) => (
                        <div key={i} className="flex items-start gap-1 leading-snug">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Details */}
                {(resume.totalExperience || resume.preferredLocations) && (
                  <div className={`p-2 bg-slate-50 rounded-lg border border-slate-200 ${is2PageFit ? 'text-[10.5px]' : 'text-[11.5px]'} space-y-0.5 break-inside-avoid`}>
                    {resume.totalExperience && (
                      <div><strong className="text-slate-900">Total Exp:</strong> {resume.totalExperience}</div>
                    )}
                    {resume.preferredLocations && (
                      <div><strong className="text-slate-900">Preferred Locations:</strong> {resume.preferredLocations}</div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT MAIN TRACK (md:col-span-8): Professional Experience & Projects */}
              <div className={`md:col-span-8 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                {/* Professional Experience */}
                {resume.experience && resume.experience.length > 0 && (
                  <section>
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1.5' : 'border-b-2 pb-1 mb-2.5'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                        <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                        Professional Career History
                      </h2>
                    </div>
                    <div className={is2PageFit ? 'space-y-2' : 'space-y-3.5'}>
                      {resume.experience.map((exp) => (
                        <div key={exp.id} className="break-inside-avoid">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                            <div>
                              <span className={`font-bold ${is2PageFit ? 'text-[11.5px]' : 'text-[12.5px]'} text-slate-950`}>{exp.role}</span>
                              <span className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-semibold text-slate-800`}> | {exp.company}</span>
                            </div>
                            <div className={`${is2PageFit ? 'text-[10.5px]' : 'text-[11.5px]'} text-slate-600 font-medium italic shrink-0`}>
                              {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location ? `(${exp.location})` : ''}
                            </div>
                          </div>
                          <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects & Deliverables */}
                {resume.projects && resume.projects.length > 0 && (
                  <section className="break-inside-avoid pt-1">
                    <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                      <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                        Key Strategic Deliverables & Projects
                      </h2>
                    </div>
                    <div className={jobSpacing}>
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className={`break-inside-avoid ${is2PageFit ? 'text-[11px]' : 'text-[12px]'}`}>
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-950">{proj.name}</span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-[10.5px] text-slate-500 italic">({proj.technologies.join(', ')})</span>
                            )}
                          </div>
                          <p className="text-slate-700 mt-0.5">{proj.description}</p>
                          {proj.bullets && proj.bullets.length > 0 && (
                            <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT: DOUBLE-LINE CORPORATE ATS (2-PAGE FIT)               */}
        {/* ============================================================ */}
        {template === 'double_line' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
            style={{ fontFamily: getFontFamily() }}
          >
            {/* Double-Line Top Authority Header */}
            <header className={`border-b-4 border-double ${is2PageFit ? 'pb-2 mb-2' : 'pb-3 mb-4'} text-center`} style={{ borderColor: primaryColor }}>
              <h1 className={`${is2PageFit ? 'text-2xl sm:text-3xl' : 'text-3xl'} font-black text-slate-950 tracking-tight uppercase mb-0.5`} style={{ color: primaryColor }}>
                {resume.fullName || 'Candidate Name'}
              </h1>
              <p className={`${getFontSizeClass()} font-bold text-slate-800 tracking-wider uppercase mb-1`}>
                {resume.title || 'Product / Project Manager | Strategy & Consulting'}
              </p>
              <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 ${getFontSizeClass()} text-slate-700 font-medium`}>
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>• {resume.phone}</span>}
                {resume.location && <span>• {resume.location}</span>}
                {resume.linkedin && <span>• {resume.linkedin.replace(/^https?:\/\//, '')}</span>}
                {resume.totalExperience && <span>• <strong>Exp: {resume.totalExperience}</strong></span>}
              </div>
            </header>

            {/* Executive Summary */}
            {resume.summary && (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Executive Profile Summary
                  </h2>
                </div>
                <p className={`${getFontSizeClass()} text-slate-800 leading-snug text-justify`}>
                  {resume.summary}
                </p>
              </section>
            )}

            {/* Key Competencies: 2-Column Compact Grid */}
            {resume.skills && resume.skills.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Core Competencies & Technical Skills
                  </h2>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 ${getFontSizeClass()}`}>
                  {resume.skills.map((cat) => (
                    <div key={cat.id} className="leading-snug">
                      <strong className="text-slate-950">{cat.categoryName}: </strong>
                      <span className="text-slate-800">{cat.skills.join(' • ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Experience: Structured Double-Line Header */}
            {resume.experience && resume.experience.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-2'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Professional Experience
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      {/* Double-Line Experience Header */}
                      <div className="border-b border-slate-200 pb-0.5 mb-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className={`font-bold ${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} text-slate-950`}>{exp.role}</span>
                          <span className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold text-slate-800`}>{exp.company}</span>
                        </div>
                        <div className={`flex justify-between items-baseline ${is2PageFit ? 'text-[10.5px]' : 'text-[11.5px]'} text-slate-600 italic`}>
                          <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                          <span>{exp.location || ''}</span>
                        </div>
                      </div>

                      <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Academic Credentials & Education */}
            {resume.education && resume.education.length > 0 && (
              <section className={`${sectionMargin} break-inside-avoid`}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Education & Credentials
                  </h2>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${getFontSizeClass()}`}>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-slate-300 pl-2">
                      <div className="font-bold text-slate-950">{edu.degree}</div>
                      <div className="text-slate-800">{edu.institution}</div>
                      <div className="text-[10.5px] text-slate-500 italic">{edu.graduationDate} {edu.gpa ? `(${edu.gpa})` : ''}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications: Compact horizontal stream */}
            {resume.certifications && resume.certifications.length > 0 && (
              <section className={`${sectionMargin} break-inside-avoid`}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Certifications & Accreditations
                  </h2>
                </div>
                <div className={`flex flex-wrap gap-1 ${getFontSizeClass()}`}>
                  {resume.certifications.map((cert, i) => (
                    <span key={i} className={`bg-slate-50 text-slate-800 border border-slate-200 ${is2PageFit ? 'px-1.5 py-0.2' : 'px-2 py-0.5'} rounded font-medium`}>
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 1: EXECUTIVE TWO-COLUMN (CONSULTING & BIG 4)          */}
        {/* ============================================================ */}
        {template === 'executive' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-4 sm:p-6 leading-snug' : 'p-6 sm:p-10 leading-relaxed'} text-slate-900 font-sans`}
            style={{ fontSize: is2PageFit ? '9pt' : '10pt' }}
          >
            {/* Top Header */}
            <header className={`border-b-2 border-slate-900 ${is2PageFit ? 'pb-2 mb-2.5' : 'pb-3 mb-4'}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h1 className={`${is2PageFit ? 'text-2xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-black text-slate-950 tracking-tight uppercase`}>
                    {resume.fullName}
                  </h1>
                  <p className={`${getFontSizeClass()} font-semibold text-slate-700 mt-0.5`}>
                    {resume.title}
                  </p>
                </div>
                <div className={`${getFontSizeClass()} text-slate-600 text-left sm:text-right space-y-0.5 shrink-0`}>
                  {resume.totalExperience && (
                    <div className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] mb-1">
                      Total Exp: {resume.totalExperience}
                    </div>
                  )}
                  {resume.email && <div>{resume.email}</div>}
                  {resume.phone && <div>{resume.phone}</div>}
                  {resume.location && <div>{resume.location}</div>}
                </div>
              </div>
            </header>

            {/* Middle: 2-Column Split for Summary, Skills, Certifications & Education */}
            <div className={`grid grid-cols-1 md:grid-cols-12 ${is2PageFit ? 'gap-3 mb-3 pb-2.5' : 'gap-5 mb-5 pb-4'} border-b border-slate-200`}>
              {/* Left Column: Profile Summary, Technical Skills */}
              <div className={`md:col-span-7 ${is2PageFit ? 'space-y-2' : 'space-y-4'}`}>
                {resume.summary && (
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                        Profile Summary
                      </h2>
                    </div>
                    <p className={`${getFontSizeClass()} text-slate-700 leading-relaxed text-justify`}>
                      {resume.summary}
                    </p>
                  </div>
                )}

                {/* Technical Skills */}
                {resume.skills && resume.skills.length > 0 && (
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                        Technical & Analytics Tools
                      </h2>
                    </div>
                    <div className={`space-y-1 ${getFontSizeClass()}`}>
                      {resume.skills.map(cat => (
                        <div key={cat.id} className="leading-snug">
                          <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                          <span className="text-slate-700">{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Areas of Excellence, Certifications, Education */}
              <div className={`md:col-span-5 ${is2PageFit ? 'space-y-2' : 'space-y-4'}`}>
                {/* Certifications */}
                {resume.certifications && resume.certifications.length > 0 && (
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                        Certifications
                      </h2>
                    </div>
                    <ul className={`space-y-0.5 ${getFontSizeClass()} text-slate-700`}>
                      {resume.certifications.map((cert, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                        Education
                      </h2>
                    </div>
                    <div className={`space-y-1.5 ${getFontSizeClass()}`}>
                      {resume.education.map(edu => (
                        <div key={edu.id}>
                          <div className="font-bold text-slate-900">{edu.degree}</div>
                          <div className="text-slate-700">{edu.institution}</div>
                          <div className="text-[10.5px] text-slate-500 italic">
                            {edu.graduationDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Chronological Work Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <section>
                <div className={`border-b-2 border-slate-900 ${is2PageFit ? 'pb-0.5 mb-2' : 'pb-1 mb-3'} flex items-center gap-1.5`}>
                  <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                    Work Experience
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.experience.map(exp => (
                    <div key={exp.id}>
                      <div className={`flex items-baseline justify-between bg-slate-50 ${is2PageFit ? 'px-2 py-0.5' : 'px-2 py-1'} rounded border border-slate-100`}>
                        <div>
                          <span className={`font-bold ${getFontSizeClass()} text-slate-950`}>{exp.role}</span>
                          <span className={`${getFontSizeClass()} text-slate-700 font-semibold`}> — {exp.company}</span>
                        </div>
                        <div className={`${getFontSizeClass()} text-slate-600 font-medium italic shrink-0`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          {exp.location ? ` | ${exp.location}` : ''}
                        </div>
                      </div>

                      <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 2: MODERN PROFESSIONAL (INDIGO ACCENT)                */}
        {/* ============================================================ */}
        {template === 'modern' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 font-sans leading-normal`}
            style={{ fontSize: is2PageFit ? '9.5pt' : '10.5pt' }}
          >
            {/* Header with modern indigo pill */}
            <header className="pb-4 mb-5 border-b-2 border-indigo-600">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {resume.fullName}
                  </h1>
                  <p className="text-sm font-bold text-indigo-700 tracking-wide mt-0.5">
                    {resume.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 font-medium sm:justify-end items-center">
                  {resume.totalExperience && (
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px]">
                      {resume.totalExperience} Exp
                    </span>
                  )}
                  {resume.email && <span>{resume.email}</span>}
                  {resume.phone && <span>• {resume.phone}</span>}
                  {resume.location && <span>• {resume.location}</span>}
                </div>
              </div>
            </header>

            {/* Professional Summary */}
            {resume.summary && (
              <section className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-l-4 border-indigo-600 pl-2.5 mb-2">
                  Executive Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {resume.summary}
                </p>
              </section>
            )}

            {/* Work Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <section className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-l-4 border-indigo-600 pl-2.5 mb-3">
                  Professional Experience
                </h2>
                <div className="space-y-4">
                  {resume.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-950">{exp.role}</span>
                          <span className="text-xs text-indigo-700 font-semibold"> @ {exp.company}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium shrink-0">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          {exp.location ? ` | ${exp.location}` : ''}
                        </span>
                      </div>
                      <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills as Modern Chips */}
            {resume.skills && resume.skills.length > 0 && (
              <section className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-l-4 border-indigo-600 pl-2.5 mb-2">
                  Skills & Core Competencies
                </h2>
                <div className="space-y-2 text-xs">
                  {resume.skills.map(cat => (
                    <div key={cat.id}>
                      <span className="font-bold text-slate-900 text-xs mr-2">{cat.categoryName}:</span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {cat.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resume.education && resume.education.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-l-4 border-indigo-600 pl-2.5 mb-2">
                    Education
                  </h2>
                  <div className="space-y-2 text-xs">
                    {resume.education.map(edu => (
                      <div key={edu.id}>
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-slate-700">{edu.institution} ({edu.graduationDate})</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.certifications && resume.certifications.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-l-4 border-indigo-600 pl-2.5 mb-2">
                    Certifications
                  </h2>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                    {resume.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 3: WALL STREET / FINANCE (COMPACT WSO)                */}
        {/* ============================================================ */}
        {template === 'wallstreet' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-10'} text-slate-950 font-serif leading-tight`}
            style={{ fontSize: is2PageFit ? '9pt' : '10pt' }}
          >
            {/* Header: Centered, High Density */}
            <header className="text-center pb-2 mb-3 border-b-2 border-slate-950">
              <h1 className="text-2xl font-bold tracking-wider uppercase">{resume.fullName}</h1>
              <p className="text-xs font-semibold text-slate-800 tracking-wide mt-0.5 uppercase">{resume.title}</p>
              <div className="text-[11px] text-slate-700 mt-1">
                {resume.totalExperience && <span className="font-bold text-slate-900">[{resume.totalExperience}] </span>}
                {resume.email} | {resume.phone} | {resume.location}
              </div>
            </header>

            {/* Summary */}
            {resume.summary && (
              <section className="mb-3">
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Professional Summary
                  </h2>
                </div>
                <p className="text-xs leading-relaxed text-justify">{resume.summary}</p>
              </section>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <section className="mb-3">
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Professional Experience
                  </h2>
                </div>
                <div className="space-y-3">
                  {resume.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold">{exp.company}</span>
                        <span className="italic">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs italic text-slate-800">
                        <span>{exp.role}</span>
                        <span>{exp.location}</span>
                      </div>
                      <BulletList bullets={exp.bullets} bulletSpacing="mt-1 space-y-0.5" fontSizeClass="text-xs text-slate-900" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills & Certifications */}
            {resume.skills && resume.skills.length > 0 && (
              <section className="mb-3">
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Skills & Areas of Expertise
                  </h2>
                </div>
                <div className="space-y-1 text-xs">
                  {resume.skills.map(cat => (
                    <div key={cat.id}>
                      <span className="font-bold">{cat.categoryName}: </span>
                      <span>{cat.skills.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <section className="mb-3">
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Education & Credentials
                  </h2>
                </div>
                <div className="space-y-1.5 text-xs">
                  {resume.education.map(edu => (
                    <div key={edu.id} className="flex justify-between">
                      <div>
                        <span className="font-bold">{edu.institution}</span> — {edu.degree}
                        {edu.gpa && <span> (GPA: {edu.gpa})</span>}
                      </div>
                      <span className="italic">{edu.graduationDate}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <section>
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Certifications
                  </h2>
                </div>
                <div className="text-xs text-slate-900">
                  {resume.certifications.join(' • ')}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 4: SILICON VALLEY TECH                                */}
        {/* ============================================================ */}
        {template === 'tech' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 font-sans leading-normal`}
            style={{ fontSize: is2PageFit ? '9pt' : '10pt' }}
          >
            {/* Tech Header */}
            <header className="border-b border-slate-200 pb-4 mb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                    {resume.fullName}
                  </h1>
                  <p className="text-xs font-mono text-primary-700 font-semibold mt-1">
                    &lt;{resume.title} /&gt;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-600 sm:justify-end">
                  {resume.email && <span className="bg-slate-100 px-2 py-0.5 rounded">{resume.email}</span>}
                  {resume.phone && <span className="bg-slate-100 px-2 py-0.5 rounded">{resume.phone}</span>}
                  {resume.location && <span className="bg-slate-100 px-2 py-0.5 rounded">{resume.location}</span>}
                </div>
              </div>
            </header>

            {/* Summary */}
            {resume.summary && (
              <section className="mb-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  // Professional Overview
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {resume.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <section className="mb-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  // Work Experience
                </h2>
                <div className="space-y-3.5">
                  {resume.experience.map(exp => (
                    <div key={exp.id} className="border-l-2 border-slate-200 pl-3">
                      <div className="flex items-baseline justify-between">
                        <div className="text-xs font-bold text-slate-900">
                          {exp.role} <span className="text-primary-600 font-normal">@ {exp.company}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <BulletList bullets={exp.bullets} bulletSpacing="mt-1 space-y-1" fontSizeClass="text-xs text-slate-700 leading-relaxed" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <section className="mb-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  // Tech Stack & Tooling
                </h2>
                <div className="space-y-1.5 text-xs">
                  {resume.skills.map(cat => (
                    <div key={cat.id} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-semibold text-slate-900 text-[11px] w-48 shrink-0">{cat.categoryName}:</span>
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10.5px] font-mono border border-slate-200/80">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education & Certs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resume.education && resume.education.length > 0 && (
                <section>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    // Education
                  </h2>
                  <div className="space-y-1 text-xs">
                    {resume.education.map(edu => (
                      <div key={edu.id}>
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-slate-600 text-[11px]">{edu.institution} ({edu.graduationDate})</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.certifications && resume.certifications.length > 0 && (
                <section>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    // Credentials
                  </h2>
                  <ul className="text-xs space-y-0.5 text-slate-700">
                    {resume.certifications.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 5: HARVARD ATS CLASSIC & MINIMALIST                    */}
        {/* ============================================================ */}
        {(template === 'harvard' || template === 'minimalist') && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 leading-normal ${
              template === 'harvard' ? 'font-serif' : 'font-sans'
            }`}
            style={{ fontSize: is2PageFit ? '9.5pt' : '10.5pt' }}
          >
            {/* Header */}
            <header className={`border-b border-slate-900 ${is2PageFit ? 'pb-2 mb-2' : 'pb-3 mb-4'} text-center`}>
              <h1 className={`${is2PageFit ? 'text-2xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-bold tracking-tight uppercase text-slate-950 mb-0.5`}>
                {resume.fullName || 'Your Name'}
              </h1>
              <p className={`${getFontSizeClass()} font-semibold text-slate-700 tracking-wide mb-1 uppercase`}>
                {resume.title || 'Professional Title'}
              </p>

              <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 ${getFontSizeClass()} text-slate-600 font-medium`}>
                {resume.totalExperience && <span className="font-bold text-slate-900">[{resume.totalExperience}]</span>}
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>• {resume.phone}</span>}
                {resume.location && <span>• {resume.location}</span>}
                {resume.linkedin && <span>• {resume.linkedin.replace(/^https?:\/\//, '')}</span>}
              </div>
            </header>

            {/* Professional Summary */}
            {resume.summary && (
              <section className={sectionMargin}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Professional Summary
                  </h2>
                </div>
                <p className={`${getFontSizeClass()} text-slate-800 leading-relaxed text-justify`}>
                  {resume.summary}
                </p>
              </section>
            )}

            {/* Technical Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Technical Skills & Proficiencies
                  </h2>
                </div>
                <div className={`space-y-0.5 ${getFontSizeClass()}`}>
                  {resume.skills.map((cat) => (
                    <div key={cat.id} className="leading-snug">
                      <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                      <span className="text-slate-800">{cat.skills.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Work Experience
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className={`font-bold ${getFontSizeClass()} text-slate-950`}>{exp.role}</span>
                          <span className={`${getFontSizeClass()} text-slate-800 font-semibold`}> | {exp.company}</span>
                        </div>
                        <div className={`${getFontSizeClass()} text-slate-600 font-medium italic shrink-0`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          {exp.location ? ` | ${exp.location}` : ''}
                        </div>
                      </div>

                      <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Education
                  </h2>
                </div>
                <div className="space-y-1">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className={`flex items-baseline justify-between ${getFontSizeClass()}`}>
                      <div>
                        <span className="font-bold text-slate-950">{edu.degree}</span>
                        <span className="text-slate-800"> – {edu.institution}</span>
                        {edu.gpa && <span className="text-slate-600 font-medium"> (GPA: {edu.gpa})</span>}
                      </div>
                      <div className="text-slate-600 italic font-medium shrink-0">
                        {edu.graduationDate}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <section className={`${sectionMargin} break-inside-avoid`}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Certifications & Credentials
                  </h2>
                </div>
                <div className={`${getFontSizeClass()} text-slate-800`}>
                  {resume.certifications.join(' • ')}
                </div>
              </section>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
