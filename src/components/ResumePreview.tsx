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
  ZoomOut,
  Mail,
  Phone,
  MapPin,
  Trophy,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { renderAchievementIcon } from './IconPicker';

const LinkedInIcon = ({ className = "w-3 h-3 text-amber-700 shrink-0" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.74a1.59 1.59 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.59 1.59 0 0 0-1.6-1.6Z" />
  </svg>
);

const cleanBulletText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^[\s\t]*[•\-*▪▸–—\uF0B7\u25CF\u25AA\u25BA\u2022\u25E6]\s*/, '')
    .trim();
};

export function partitionResumeContent(resume: ResumeData, is2PageFit: boolean) {
  const experiences = resume.experience || [];
  const totalBullets = experiences.reduce((sum, e) => sum + (e.bullets?.length || 0), 0);
  const projectsCount = (resume.achievements?.length || 0) + (resume.projects?.length || 0) + (resume.customSections?.length || 0);
  const certsCount = resume.certifications?.length || 0;

  // Detect if resume spans 2 distinct A4 pages
  const isMultiPage = Boolean(
    is2PageFit ||
    experiences.length >= 3 ||
    totalBullets >= 10 ||
    (experiences.length >= 2 && (projectsCount >= 2 || certsCount >= 4))
  );

  if (!isMultiPage || experiences.length <= 1) {
    return {
      isMultiPage: false,
      p1Exp: experiences,
      p2Exp: [] as typeof experiences
    };
  }

  // Balance experiences between Page 1 and Page 2
  // Page 1 holds Header, Summary, Skills, and top experiences
  // Page 2 holds remaining experiences, Education, Certifications, Key Achievements
  let splitIndex = 3;
  if (experiences.length === 2) {
    splitIndex = 1;
  } else if (experiences.length === 3) {
    const top2Bullets = (experiences[0]?.bullets?.length || 0) + (experiences[1]?.bullets?.length || 0);
    splitIndex = top2Bullets >= 10 ? 2 : 3;
  } else {
    // 4 or more experiences: top 2 or 3 on Page 1
    const top3Bullets = (experiences[0]?.bullets?.length || 0) + (experiences[1]?.bullets?.length || 0) + (experiences[2]?.bullets?.length || 0);
    splitIndex = top3Bullets > 18 ? 2 : 3;
  }

  splitIndex = Math.min(splitIndex, experiences.length - 1);
  splitIndex = Math.max(1, splitIndex);

  return {
    isMultiPage: true,
    p1Exp: experiences.slice(0, splitIndex),
    p2Exp: experiences.slice(splitIndex)
  };
}

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
    .filter(b => b.length > 0 && !/^[\s\t•\-*▪▸–—\uF0B7\u25CF\u25AA\u25BA\u2022]+$/.test(b));

  if (valid.length === 0) return null;

  return (
    <ul
      className={`${bulletSpacing} ${fontSizeClass} ${className}`}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {valid.map((b, i) => (
        <li
          key={i}
          className={`text-slate-800 ${textClassName} ${bulletClassName}`}
          style={{
            paddingLeft: '1.1em',
            textIndent: '-1.1em',
            lineHeight: '1.45',
            wordBreak: 'break-word'
          }}
        >
          <span style={{ fontWeight: 700, marginRight: '0.35em', color: '#374151' }}>•</span>
          {b}
        </li>
      ))}
    </ul>
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
  const [previewZoom, setPreviewZoom] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1440) {
      return 85;
    }
    return 100;
  });

  const templatesList: { id: ResumeTemplate; label: string; icon: string }[] = [
    { id: 'enhancv_timeline', label: 'Enhancv Timeline', icon: '✨' },
    { id: 'graphical_metric', label: 'Graphical KPI Grid', icon: '📊' },
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

  const partition = partitionResumeContent(resume, is2PageFit);

  const SheetBoundaryDivider: React.FC<{ pageNumber: number }> = ({ pageNumber }) => (
    <div
      className="no-print my-6 flex items-center justify-center gap-3 w-[800px] select-none"
      data-html2canvas-ignore="true"
    >
      <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
      <span className="px-3.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-2xs">
        📄 Page {pageNumber} of 2 (A4 Sheet Boundary)
      </span>
      <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
    </div>
  );

  const SheetFooter: React.FC<{ pageText: string }> = ({ pageText }) => (
    <div className="pt-2 mt-auto border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center select-none">
      <span>{resume.fullName || 'Candidate'} • Curriculum Vitae</span>
      <span>{pageText}</span>
    </div>
  );

  const renderSharedAchievements = (options?: { headerClass?: string; borderStyle?: React.CSSProperties; titlePrefix?: React.ReactNode; cardStyle?: string }) => {
    const achList = (resume.achievements && resume.achievements.length > 0)
      ? resume.achievements
      : (resume.projects && resume.projects.length > 0)
        ? resume.projects.map((p, idx) => {
            const defaultIcons = ['award', 'barchart', 'trending', 'gem', 'rocket', 'trophy'] as const;
            return {
              id: p.id,
              title: p.name.replace(/ Milestone$/i, ''),
              description: p.description || p.bullets?.[0] || '',
              icon: p.icon || defaultIcons[idx % defaultIcons.length]
            };
          })
        : [];
    if (achList.length === 0) return null;
    return (
      <section className={sectionMargin}>
        <div className={options?.headerClass || "border-b border-slate-900 pb-1 mb-2"} style={options?.borderStyle}>
          <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
            {options?.titlePrefix || <Trophy className="w-3.5 h-3.5 text-amber-600" />}
            Key Achievements & Strategic Milestones
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {achList.map((ach) => (
            <div key={ach.id} className={options?.cardStyle || "p-2 rounded bg-slate-50 border border-slate-200/80 flex items-start gap-2"}>
              {renderAchievementIcon(ach.icon, "w-4 h-4 text-amber-600 shrink-0 mt-0.5")}
              <div className="text-[11px] leading-snug text-slate-800">
                <strong className="text-slate-950 font-bold">{ach.title}: </strong>
                <span>{ach.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSharedCustomSections = (options?: { headerClass?: string; borderStyle?: React.CSSProperties }) => {
    if (!resume.customSections || resume.customSections.length === 0) return null;
    return (
      <>
        {resume.customSections.map((cs) => {
          if ((resume.hiddenSections || []).includes(cs.id)) return null;
          return (
            <section key={cs.id} className={sectionMargin}>
              <div className={options?.headerClass || "border-b border-slate-900 pb-1 mb-2"} style={options?.borderStyle}>
                <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                  {renderAchievementIcon(cs.icon || 'sparkles', "w-3.5 h-3.5 text-indigo-600")}
                  {cs.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {cs.items.map((it) => (
                  <div key={it.id} className="p-2 rounded bg-slate-50 border border-slate-200/80">
                    <div className="flex items-baseline gap-1.5">
                      {renderAchievementIcon(it.icon || 'check', "w-3 h-3 text-indigo-600 shrink-0")}
                      <span className="font-bold text-slate-950 text-[11px]">{it.title}</span>
                      {it.subtitle && <span className="text-[10px] text-indigo-700 font-semibold">— {it.subtitle}</span>}
                      {it.date && <span className="text-[10px] text-slate-400 italic ml-auto">{it.date}</span>}
                    </div>
                    {it.description && (
                      <p className="text-[10.5px] text-slate-700 mt-0.5 leading-snug pl-4.5">{it.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </>
    );
  };

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

      {/* Paper Container - Uses w-fit mx-auto so the left margin is NEVER negative or clipped */}
      <div className="bg-slate-200/60 p-2 sm:p-5 rounded-2xl overflow-x-auto w-full flex justify-center">
        <div
          className="w-fit mx-auto transition-transform duration-150"
          style={{
            transform: previewZoom !== 100 ? `scale(${previewZoom / 100})` : undefined,
            transformOrigin: 'top center',
            marginBottom: previewZoom < 100 ? `${-((100 - previewZoom) / 100) * (partition.isMultiPage ? 2350 : 1150)}px` : undefined
          }}
        >
        {/* ============================================================ */}
        {/* FORMAT: ENHANCV EXECUTIVE TIMELINE (MATCHING USER PDF)       */}
        {/* ============================================================ */}
        {template === 'enhancv_timeline' && (() => {
          const renderEnhancvHeader = (isContinuation = false) => {
            if (isContinuation) {
              return (
                <div className={`border-b-2 border-slate-900 ${is2PageFit ? 'pb-1 mb-2' : 'pb-1.5 mb-2.5'} flex justify-between items-baseline text-xs text-slate-600`}>
                  <div>
                    <span className="font-extrabold text-slate-950 uppercase tracking-wider text-sm">{resume.fullName || 'Candidate Name'}</span>
                    <span className="font-semibold text-amber-700 ml-2">— Professional Experience & Credentials (Contd.)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Page 2 of 2</span>
                </div>
              );
            }

            const initials = (resume.fullName || 'AB')
              .split(' ')
              .map(w => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('');

            return (
              <header className={`${is2PageFit ? 'mb-2.5' : 'mb-3.5'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Candidate Name in Bold Navy */}
                    <h1 className={`${is2PageFit ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-black text-slate-950 tracking-tight uppercase leading-none`}>
                      {resume.fullName || 'Akash Bhattacharya'}
                    </h1>

                    {/* Subtitle in Warm Amber / Rust Orange */}
                    <p className="text-xs sm:text-[13px] font-bold text-amber-700 tracking-wide mt-1 leading-snug">
                      {resume.title || 'Product Manager | Digital Products | Scalable Delivery Platforms | High-Performing Teams'}
                    </p>

                    {/* Contact details row with icons */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-800 font-medium mt-1.5">
                      {resume.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{resume.phone}</span>
                        </span>
                      )}
                      {resume.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{resume.email}</span>
                        </span>
                      )}
                      {resume.linkedin && (
                        <span className="flex items-center gap-1">
                          <LinkedInIcon className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{resume.linkedin.replace(/^https?:\/\//, '')}</span>
                        </span>
                      )}
                    </div>

                    {/* Location row with map pin icon */}
                    {(resume.location || resume.preferredLocations) && (
                      <div className="flex items-center gap-1 text-[10.5px] text-slate-700 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>
                          Current Location - {resume.location || 'Kolkata/Bengaluru, INDIA'}
                          {resume.preferredLocations ? ` , ${resume.preferredLocations}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Circular Candidate Photo / Avatar (Enhancv Top-Right Badge) */}
                  <div className="shrink-0">
                    {resume.photoUrl ? (
                      <img
                        src={resume.photoUrl}
                        alt={resume.fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-900 text-amber-500 font-bold text-xl flex items-center justify-center border-2 border-amber-600/40 shadow-sm">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              </header>
            );
          };

          const renderEnhancvSummary = () => (
            resume.summary ? (
              <section className={`${is2PageFit ? 'mb-2' : 'mb-3'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1">
                  SUMMARY
                </h2>
                <p className={`${getFontSizeClass()} text-slate-850 leading-relaxed text-justify`}>
                  {resume.summary}
                </p>
              </section>
            ) : null
          );

          const renderEnhancvSkills = () => (
            resume.skills && resume.skills.length > 0 ? (
              <section className={`${is2PageFit ? 'mb-2.5' : 'mb-3.5'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5">
                  SKILLS
                </h2>
                <div className="space-y-1.5">
                  {resume.skills.map((cat) => (
                    <div key={cat.id} className="text-xs">
                      <span className="font-bold text-amber-700 block mb-0.5">{cat.categoryName}</span>
                      <p className="text-slate-800 leading-snug">
                        {cat.skills.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderEnhancvExperience = (exps: typeof resume.experience, isContinuation = false) => (
            exps && exps.length > 0 ? (
              <section className={`${is2PageFit ? 'mb-2.5' : 'mb-3.5'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-950 pb-0.5 mb-2.5">
                  EXPERIENCE {isContinuation ? '(Contd.)' : ''}
                </h2>
                <div className="space-y-3">
                  {exps.map((exp) => (
                    <div key={exp.id} className="flex gap-2.5 sm:gap-3 text-xs">
                      {/* Left Date + Dot Column */}
                      <div className="w-32 sm:w-36 shrink-0 flex items-start justify-between gap-1 pt-0.5">
                        <span className="font-bold text-slate-950 text-[11px] whitespace-nowrap">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                        <span className="text-slate-950 font-black text-sm leading-none shrink-0">•</span>
                      </div>
                      {/* Right Role + Company + Bullets Column */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-950 text-xs">
                          {exp.role}
                        </div>
                        <div className="font-bold text-amber-700 text-xs mb-1">
                          {exp.company}
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderEnhancvEducation = () => (
            resume.education && resume.education.length > 0 ? (
              <section className={`${is2PageFit ? 'mb-2.5' : 'mb-3'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-950 pb-0.5 mb-2">
                  EDUCATION
                </h2>
                <div className="space-y-2">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="flex gap-2.5 sm:gap-3 text-xs">
                      <div className="w-32 sm:w-36 shrink-0 flex items-start justify-between gap-1 pt-0.5">
                        <span className="font-bold text-slate-950 text-[11px] whitespace-nowrap">
                          {edu.graduationDate}
                        </span>
                        <span className="text-slate-950 font-black text-sm leading-none shrink-0">•</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-950 text-xs">{edu.degree}</div>
                        <div className="font-bold text-amber-700 text-xs">{edu.institution}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderEnhancvCertifications = () => (
            resume.certifications && resume.certifications.length > 0 ? (
              <section className={`${is2PageFit ? 'mb-2.5' : 'mb-3'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-950 pb-0.5 mb-2">
                  CERTIFICATIONS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {resume.certifications.map((cert, idx) => (
                    <div key={idx} className="leading-snug">
                      <span className="font-bold text-slate-950 block text-[11px] sm:text-xs">{cert}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderEnhancvAchievements = () => {
            const achList = (resume.achievements && resume.achievements.length > 0)
              ? resume.achievements
              : (resume.projects && resume.projects.length > 0)
                ? resume.projects.map((p, idx) => {
                    const defaultIcons = ['award', 'barchart', 'trending', 'gem', 'rocket', 'trophy'] as const;
                    return {
                      id: p.id,
                      title: p.name.replace(/ Milestone$/i, ''),
                      description: p.description || p.bullets?.[0] || '',
                      icon: p.icon || defaultIcons[idx % defaultIcons.length]
                    };
                  })
                : [];

            if (achList.length === 0) return null;

            return (
              <section className={`${is2PageFit ? 'mb-2' : 'mb-2.5'}`}>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-950 pb-0.5 mb-2">
                  KEY ACHIEVEMENTS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {achList.map((ach) => (
                    <div key={ach.id} className="flex items-start gap-2 p-2 rounded bg-slate-50 border border-slate-200/80">
                      {renderAchievementIcon(ach.icon, "w-4 h-4 text-amber-600 shrink-0 mt-0.5")}
                      <div className="text-[11px] leading-snug text-slate-800">
                        <strong className="text-slate-950 font-bold">{ach.title}: </strong>
                        <span>{ach.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          };

          const renderEnhancvCustomSections = () => {
            if (!resume.customSections || resume.customSections.length === 0) return null;
            return (
              <>
                {resume.customSections.map((cs) => {
                  if ((resume.hiddenSections || []).includes(cs.id)) return null;
                  return (
                    <section key={cs.id} className={`${is2PageFit ? 'mb-2' : 'mb-2.5'}`}>
                      <div className="flex items-center gap-1.5 border-b border-slate-950 pb-0.5 mb-2">
                        {renderAchievementIcon(cs.icon || 'sparkles', "w-3.5 h-3.5 text-amber-600 shrink-0")}
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                          {cs.title}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {cs.items.map((it) => (
                          <div key={it.id} className="p-2 rounded bg-slate-50 border border-slate-200/80">
                            <div className="flex items-baseline gap-1.5">
                              {renderAchievementIcon(it.icon || 'check', "w-3 h-3 text-amber-600 shrink-0")}
                              <span className="font-bold text-slate-950 text-[11px]">{it.title}</span>
                              {it.subtitle && <span className="text-[10px] text-amber-700 font-semibold">— {it.subtitle}</span>}
                              {it.date && <span className="text-[10px] text-slate-400 italic ml-auto">{it.date}</span>}
                            </div>
                            {it.description && (
                              <p className="text-[10.5px] text-slate-700 mt-0.5 leading-snug pl-4.5">{it.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            );
          };

          return (
            <div
              id="resume-printable-area"
              data-fit-two-pages={is2PageFit ? 'true' : 'false'}
              className="flex flex-col items-center w-full"
            >
              {partition.isMultiPage ? (
                <>
                  {/* SHEET 1 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderEnhancvHeader(false)}
                    {renderEnhancvSummary()}
                    {renderEnhancvSkills()}
                    {renderEnhancvExperience(partition.p1Exp, false)}
                    <SheetFooter pageText="Page 1 of 2" />
                  </div>

                  {/* VISUAL A4 SHEET BOUNDARY */}
                  <SheetBoundaryDivider pageNumber={2} />

                  {/* SHEET 2 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderEnhancvHeader(true)}
                    {renderEnhancvExperience(partition.p2Exp, true)}
                    {renderEnhancvEducation()}
                    {renderEnhancvCertifications()}
                    {renderEnhancvAchievements()}
                    {renderEnhancvCustomSections()}
                    <SheetFooter pageText="Page 2 of 2" />
                  </div>
                </>
              ) : (
                /* SINGLE SHEET */
                <div
                  className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                  style={{ fontFamily: getFontFamily() }}
                >
                  {renderEnhancvHeader(false)}
                  {renderEnhancvSummary()}
                  {renderEnhancvSkills()}
                  {renderEnhancvExperience(resume.experience, false)}
                  {renderEnhancvEducation()}
                  {renderEnhancvCertifications()}
                  {renderEnhancvAchievements()}
                  {renderEnhancvCustomSections()}
                  <SheetFooter pageText="Page 1 of 1" />
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* FORMAT: GRAPHICAL INFOGRAPHIC & KPI GRID (2-PAGE FIT)        */}
        {/* ============================================================ */}
        {template === 'graphical_metric' && (() => {
          const renderGraphicalHeader = (isContinuation = false) => {
            if (isContinuation) {
              return (
                <div className="bg-slate-900 text-white rounded-lg px-4 py-2 mb-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase tracking-wider text-sm">{resume.fullName || 'Candidate Name'}</span>
                    <span className="text-amber-400 font-semibold">• Executive CV (Contd.)</span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">Page 2 of 2</span>
                </div>
              );
            }

            return (
              <header className="mb-3">
                {/* Dark Executive Hero Card */}
                <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                        {resume.fullName || 'Candidate Name'}
                      </h1>
                      <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide mt-0.5">
                        {resume.title || 'Product Manager | Enterprise Platforms'}
                      </p>
                    </div>

                    {/* Contact Badges */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {resume.phone && (
                        <span className="flex items-center gap-1 bg-slate-800/90 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{resume.phone}</span>
                        </span>
                      )}
                      {resume.email && (
                        <span className="flex items-center gap-1 bg-slate-800/90 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>{resume.email}</span>
                        </span>
                      )}
                      {resume.location && (
                        <span className="flex items-center gap-1 bg-slate-800/90 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{resume.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Graphical KPI Metric Stat Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                      <div className="text-amber-400 font-black text-sm flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>13+ Years</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Product Leadership</div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                      <div className="text-blue-400 font-black text-sm flex items-center justify-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Tier-1 BFSI</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Core Banking & Risk</div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                      <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>120M+ Vol</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Platform Throughput</div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                      <div className="text-purple-400 font-black text-sm flex items-center justify-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>IIT Bombay</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">SJMSOM MBA Alum</div>
                    </div>
                  </div>
                </div>
              </header>
            );
          };

          const renderGraphicalSummary = () => (
            resume.summary ? (
              <section className="mb-3">
                <div className="bg-indigo-50/60 border-l-4 border-indigo-600 rounded-r-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-950 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Executive Value Proposition</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {resume.summary}
                  </p>
                </div>
              </section>
            ) : null
          );

          const renderGraphicalSkills = () => (
            resume.skills && resume.skills.length > 0 ? (
              <section className="mb-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Core Technical & Strategic Capabilities
                  </h2>
                </div>
                <div className="space-y-2">
                  {resume.skills.map((cat) => (
                    <div key={cat.id} className="text-xs">
                      <span className="font-bold text-indigo-900 block mb-1">{cat.categoryName}</span>
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderGraphicalTimeline = (exps: typeof resume.experience) => (
            exps && exps.length > 0 ? (
              <section className="mb-4">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-3">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Professional Experience History
                  </h2>
                </div>
                <div className="space-y-4 pt-1 ml-1">
                  {exps.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-indigo-600 pl-3.5 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[6px] top-1" />
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                        <div>
                          <span className="font-bold text-xs text-slate-950">{exp.role}</span>
                          <span className="text-xs font-bold text-indigo-700"> @ {exp.company}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location ? `| ${exp.location}` : ''}
                        </span>
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <div className="mt-1">
                          <BulletList bullets={exp.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderGraphicalEducation = () => (
            resume.education && resume.education.length > 0 ? (
              <section className="mb-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Education & Credentials
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-950">{edu.degree}</div>
                      <div className="text-indigo-700 font-semibold">{edu.institution}</div>
                      <div className="text-[10.5px] text-slate-500 italic mt-0.5">{edu.graduationDate}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderGraphicalCertifications = () => (
            resume.certifications && resume.certifications.length > 0 ? (
              <section className="mb-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Professional Certifications
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {resume.certifications.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-900 text-[11px]">{c}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderGraphicalAchievements = () => {
            const achList = (resume.achievements && resume.achievements.length > 0)
              ? resume.achievements
              : (resume.projects && resume.projects.length > 0)
                ? resume.projects.map((p, idx) => {
                    const defaultIcons = ['award', 'barchart', 'trending', 'gem', 'rocket', 'trophy'] as const;
                    return {
                      id: p.id,
                      title: p.name.replace(/ Milestone$/i, ''),
                      description: p.description || p.bullets?.[0] || '',
                      icon: p.icon || defaultIcons[idx % defaultIcons.length]
                    };
                  })
                : [];

            if (achList.length === 0) return null;

            return (
              <section className="mb-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2.5">
                  <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Key Strategic Deliverables & Milestone Achievements
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {achList.map((ach) => (
                    <div key={ach.id} className="border-l-4 border-indigo-600 bg-indigo-50/40 p-2 rounded-r border border-slate-200 flex items-start gap-2">
                      {renderAchievementIcon(ach.icon, "w-4 h-4 text-indigo-600 shrink-0 mt-0.5")}
                      <div>
                        <span className="font-bold text-slate-950 block">{ach.title}</span>
                        <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          };

          const renderGraphicalCustomSections = () => {
            if (!resume.customSections || resume.customSections.length === 0) return null;
            return (
              <>
                {resume.customSections.map((cs) => {
                  if ((resume.hiddenSections || []).includes(cs.id)) return null;
                  return (
                    <section key={cs.id} className="mb-3">
                      <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2.5">
                        {renderAchievementIcon(cs.icon || 'sparkles', "w-3.5 h-3.5 text-indigo-600 shrink-0")}
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                          {cs.title}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {cs.items.map((it) => (
                          <div key={it.id} className="border-l-4 border-indigo-600 bg-indigo-50/40 p-2 rounded-r border border-slate-200">
                            <div className="flex items-baseline gap-1.5">
                              {renderAchievementIcon(it.icon || 'check', "w-3 h-3 text-indigo-600 shrink-0")}
                              <span className="font-bold text-slate-950 text-[11px]">{it.title}</span>
                              {it.subtitle && <span className="text-[10px] text-indigo-700 font-semibold">— {it.subtitle}</span>}
                              {it.date && <span className="text-[10px] text-slate-400 italic ml-auto">{it.date}</span>}
                            </div>
                            {it.description && (
                              <p className="text-[10.5px] text-slate-700 mt-0.5 leading-snug pl-4.5">{it.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            );
          };

          return (
            <div
              id="resume-printable-area"
              data-fit-two-pages={is2PageFit ? 'true' : 'false'}
              className="flex flex-col items-center w-full"
            >
              {partition.isMultiPage ? (
                <>
                  {/* SHEET 1 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderGraphicalHeader(false)}
                    {renderGraphicalSummary()}
                    {renderGraphicalSkills()}
                    {renderGraphicalTimeline(partition.p1Exp)}
                    <SheetFooter pageText="Page 1 of 2" />
                  </div>

                  {/* VISUAL A4 SHEET BOUNDARY */}
                  <SheetBoundaryDivider pageNumber={2} />

                  {/* SHEET 2 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderGraphicalHeader(true)}
                    {renderGraphicalTimeline(partition.p2Exp)}
                    {renderGraphicalEducation()}
                    {renderGraphicalCertifications()}
                    {renderGraphicalAchievements()}
                    {renderGraphicalCustomSections()}
                    <SheetFooter pageText="Page 2 of 2" />
                  </div>
                </>
              ) : (
                /* SINGLE SHEET */
                <div
                  className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                  style={{ fontFamily: getFontFamily() }}
                >
                  {renderGraphicalHeader(false)}
                  {renderGraphicalSummary()}
                  {renderGraphicalSkills()}
                  {renderGraphicalTimeline(resume.experience)}
                  {renderGraphicalEducation()}
                  {renderGraphicalCertifications()}
                  {renderGraphicalAchievements()}
                  {renderGraphicalCustomSections()}
                  <SheetFooter pageText="Page 1 of 1" />
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* FORMAT 0: NAUKRI & INDIAN CORPORATE ATS STANDARD             */}
        {/* ============================================================ */}
        {template === 'naukri' && (() => {
          const renderNaukriHeader = (isContinuation = false) => {
            if (isContinuation) {
              return (
                <div className={`border-b-2 ${is2PageFit ? 'pb-1 mb-2' : 'pb-1.5 mb-2.5'} flex justify-between items-baseline text-xs text-slate-600`} style={{ borderColor: primaryColor }}>
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">{resume.fullName || 'Candidate Name'}</span>
                    <span className="text-slate-600 font-medium ml-2">— {resume.title || 'Curriculum Vitae'} (Contd.)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Page 2 of 2</span>
                </div>
              );
            }

            return (
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
            );
          };

          const renderNaukriSection = (secId: ResumeSectionId, expSubset?: typeof resume.experience) => {
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

            if (secId === 'experience') {
              const exps = expSubset !== undefined ? expSubset : (resume.experience || []);
              if (exps.length === 0) return null;
              return (
                <section key={`experience-${exps[0]?.id || 'list'}`} className={sectionMargin}>
                  <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1.5' : 'border-b-2 pb-1 mb-2.5'}`} style={{ borderColor: primaryColor }}>
                    <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                      Professional Experience {expSubset && expSubset !== resume.experience && expSubset[0] !== resume.experience[0] ? '(Contd.)' : ''}
                    </h2>
                  </div>
                  <div className={jobSpacing}>
                    {exps.map((exp) => (
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
                <section key="certifications" className={sectionMargin}>
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
                <section key="projects" className={sectionMargin}>
                  <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                    <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                      Key Strategic Deliverables & Achievements
                    </h2>
                  </div>
                  <div className={jobSpacing}>
                    {resume.projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex items-baseline justify-between gap-1 break-inside-avoid">
                          <span className={`font-bold ${getFontSizeClass()} text-slate-950`}>{proj.name}</span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-xs text-slate-600 italic">({proj.technologies.join(', ')})</span>
                          )}
                        </div>
                        {proj.description && proj.description !== proj.name && (
                          <p className={`${getFontSizeClass()} text-slate-700 mt-0.5`}>{proj.description}</p>
                        )}
                        {proj.bullets && proj.bullets.length > 0 && (
                          <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (secId === 'achievements') {
              const achList = (resume.achievements && resume.achievements.length > 0)
                ? resume.achievements
                : (resume.projects && resume.projects.length > 0)
                  ? resume.projects.map((p, idx) => {
                      const defaultIcons = ['award', 'barchart', 'trending', 'gem', 'rocket', 'trophy'] as const;
                      return {
                        id: p.id,
                        title: p.name.replace(/ Milestone$/i, ''),
                        description: p.description || p.bullets?.[0] || '',
                        icon: p.icon || defaultIcons[idx % defaultIcons.length]
                      };
                    })
                  : [];
              if (achList.length === 0) return null;
              return (
                <section key="achievements" className={sectionMargin}>
                  <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                    <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      Key Achievements & Strategic Milestones
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {achList.map((ach) => (
                      <div key={ach.id} className="p-2 rounded bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                        {renderAchievementIcon(ach.icon, "w-4 h-4 text-amber-600 shrink-0 mt-0.5")}
                        <div className="text-[11px] leading-snug text-slate-800">
                          <strong className="text-slate-950 font-bold">{ach.title}: </strong>
                          <span>{ach.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // Custom Sections
            const customSec = resume.customSections?.find(cs => cs.id === secId);
            if (customSec) {
              return (
                <section key={customSec.id} className={sectionMargin}>
                  <div className={`${is2PageFit ? 'border-b-2 pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                    <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[13px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                      {renderAchievementIcon(customSec.icon || 'sparkles', "w-3.5 h-3.5 text-indigo-600")}
                      {customSec.title}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {customSec.items.map((it) => (
                      <div key={it.id} className="p-2 rounded bg-slate-50 border border-slate-200/80">
                        <div className="flex items-baseline gap-1.5">
                          {renderAchievementIcon(it.icon || 'check', "w-3 h-3 text-indigo-600 shrink-0")}
                          <span className="font-bold text-slate-950 text-[11px]">{it.title}</span>
                          {it.subtitle && <span className="text-[10px] text-indigo-700 font-semibold">— {it.subtitle}</span>}
                          {it.date && <span className="text-[10px] text-slate-400 italic ml-auto">{it.date}</span>}
                        </div>
                        {it.description && (
                          <p className="text-[10.5px] text-slate-700 mt-0.5 leading-snug pl-4.5">{it.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            return null;
          };

          return (
            <div
              id="resume-printable-area"
              data-fit-two-pages={is2PageFit ? 'true' : 'false'}
              className="flex flex-col items-center w-full"
            >
              {partition.isMultiPage ? (
                <>
                  {/* SHEET 1 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderNaukriHeader(false)}
                    {renderNaukriSection('summary')}
                    {renderNaukriSection('skills')}
                    {renderNaukriSection('experience', partition.p1Exp)}
                    <SheetFooter pageText="Page 1 of 2" />
                  </div>

                  {/* VISUAL A4 SHEET BOUNDARY */}
                  <SheetBoundaryDivider pageNumber={2} />

                  {/* SHEET 2 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderNaukriHeader(true)}
                    {renderNaukriSection('experience', partition.p2Exp)}
                    {renderNaukriSection('education')}
                    {renderNaukriSection('certifications')}
                    {renderNaukriSection('projects')}
                    {renderNaukriSection('achievements')}
                    {resume.customSections?.map(cs => renderNaukriSection(cs.id))}
                    <SheetFooter pageText="Page 2 of 2" />
                  </div>
                </>
              ) : (
                /* SINGLE SHEET */
                <div
                  className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${containerPadding} text-slate-900 leading-normal`}
                  style={{ fontFamily: getFontFamily() }}
                >
                  {renderNaukriHeader(false)}
                  {(resume.sectionOrder && resume.sectionOrder.length > 0
                    ? Array.from(new Set([...resume.sectionOrder, 'achievements', ...(resume.customSections || []).map(cs => cs.id)]))
                    : (['summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', ...(resume.customSections || []).map(cs => cs.id)] as ResumeSectionId[])
                  ).map((secId) => renderNaukriSection(secId))}
                  <SheetFooter pageText="Page 1 of 1" />
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* FORMAT: DOUBLE-COLUMN EXECUTIVE (GUARANTEED 2-PAGE FIT)      */}
        {/* ============================================================ */}
        {template === 'double_column' && (() => {
          const renderDoubleColHeader = (isContinuation = false) => {
            if (isContinuation) {
              return (
                <header className={`border-b-4 border-double ${is2PageFit ? 'pb-1.5 mb-2' : 'pb-2 mb-3'} flex justify-between items-baseline`} style={{ borderColor: primaryColor }}>
                  <div>
                    <span className="font-black text-slate-950 tracking-tight uppercase text-lg" style={{ color: primaryColor }}>
                      {resume.fullName || 'Candidate Name'}
                    </span>
                    <span className="text-slate-600 font-semibold ml-2 text-xs">— {resume.title || 'Curriculum Vitae'} (Contd.)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Page 2 of 2</span>
                </header>
              );
            }

            return (
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
            );
          };

          const renderSkillsSidebar = () => (
            resume.skills && resume.skills.length > 0 ? (
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
            ) : null
          );

          const renderEducationSidebar = () => (
            resume.education && resume.education.length > 0 ? (
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
            ) : null
          );

          const renderCertificationsSidebar = () => (
            resume.certifications && resume.certifications.length > 0 ? (
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
            ) : null
          );

          const renderMetadataSidebar = () => (
            (resume.totalExperience || resume.preferredLocations) ? (
              <div className={`p-2 bg-slate-50 rounded-lg border border-slate-200 ${is2PageFit ? 'text-[10.5px]' : 'text-[11.5px]'} space-y-0.5 break-inside-avoid`}>
                {resume.totalExperience && (
                  <div><strong className="text-slate-900">Total Exp:</strong> {resume.totalExperience}</div>
                )}
                {resume.preferredLocations && (
                  <div><strong className="text-slate-900">Preferred Locations:</strong> {resume.preferredLocations}</div>
                )}
              </div>
            ) : null
          );

          const renderExpTrack = (exps: typeof resume.experience) => (
            exps && exps.length > 0 ? (
              <section>
                <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1.5' : 'border-b-2 pb-1 mb-2.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal flex items-center gap-1.5`}>
                    <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                    Professional Career History {exps !== resume.experience && exps[0] !== resume.experience[0] ? '(Contd.)' : ''}
                  </h2>
                </div>
                <div className={is2PageFit ? 'space-y-2' : 'space-y-3.5'}>
                  {exps.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 break-inside-avoid">
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
            ) : null
          );

          const renderProjectsTrack = () => (
            resume.projects && resume.projects.length > 0 ? (
              <section className="pt-1">
                <div className={`${is2PageFit ? 'border-b pb-0.5 mb-1' : 'border-b-2 pb-1 mb-2'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Key Strategic Deliverables & Projects
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className={is2PageFit ? 'text-[11px]' : 'text-[12px]'}>
                      <div className="flex items-baseline justify-between break-inside-avoid">
                        <span className="font-bold text-slate-950">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-[10.5px] text-slate-500 italic">({proj.technologies.join(', ')})</span>
                        )}
                      </div>
                      {proj.description && proj.description !== proj.name && (
                        <p className="text-slate-700 mt-0.5">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          return (
            <div
              id="resume-printable-area"
              data-fit-two-pages={is2PageFit ? 'true' : 'false'}
              className="flex flex-col items-center w-full"
            >
              {partition.isMultiPage ? (
                <>
                  {/* SHEET 1 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-5 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderDoubleColHeader(false)}
                    <div className={`grid grid-cols-1 md:grid-cols-12 ${is2PageFit ? 'gap-4' : 'gap-5'} items-start`}>
                      <div className={`md:col-span-4 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
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
                        {renderSkillsSidebar()}
                      </div>
                      <div className={`md:col-span-8 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                        {renderExpTrack(partition.p1Exp)}
                      </div>
                    </div>
                    <SheetFooter pageText="Page 1 of 2" />
                  </div>

                  {/* VISUAL A4 SHEET BOUNDARY */}
                  <SheetBoundaryDivider pageNumber={2} />

                  {/* SHEET 2 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-5 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderDoubleColHeader(true)}
                    <div className={`grid grid-cols-1 md:grid-cols-12 ${is2PageFit ? 'gap-4' : 'gap-5'} items-start`}>
                      <div className={`md:col-span-4 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                        {renderEducationSidebar()}
                        {renderCertificationsSidebar()}
                        {renderMetadataSidebar()}
                      </div>
                      <div className={`md:col-span-8 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                        {renderExpTrack(partition.p2Exp)}
                        {renderProjectsTrack()}
                        {renderSharedAchievements()}
                        {renderSharedCustomSections()}
                      </div>
                    </div>
                    <SheetFooter pageText="Page 2 of 2" />
                  </div>
                </>
              ) : (
                /* SINGLE SHEET */
                <div
                  className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-5 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                  style={{ fontFamily: getFontFamily() }}
                >
                  {renderDoubleColHeader(false)}
                  <div className={`grid grid-cols-1 md:grid-cols-12 ${is2PageFit ? 'gap-4' : 'gap-5'} items-start`}>
                    <div className={`md:col-span-4 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
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
                      {renderSkillsSidebar()}
                      {renderEducationSidebar()}
                      {renderCertificationsSidebar()}
                      {renderMetadataSidebar()}
                    </div>
                    <div className={`md:col-span-8 ${is2PageFit ? 'space-y-2.5' : 'space-y-4'}`}>
                      {renderExpTrack(resume.experience)}
                      {renderProjectsTrack()}
                      {renderSharedAchievements()}
                      {renderSharedCustomSections()}
                    </div>
                  </div>
                  <SheetFooter pageText="Page 1 of 1" />
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* FORMAT: DOUBLE-LINE CORPORATE ATS (2-PAGE FIT)               */}
        {/* ============================================================ */}
        {template === 'double_line' && (() => {
          const renderDoubleLineHeader = (isContinuation = false) => {
            if (isContinuation) {
              return (
                <header className={`border-b-4 border-double ${is2PageFit ? 'pb-1.5 mb-2' : 'pb-2 mb-3'} flex justify-between items-baseline`} style={{ borderColor: primaryColor }}>
                  <div>
                    <span className="font-black text-slate-950 tracking-tight uppercase text-lg" style={{ color: primaryColor }}>
                      {resume.fullName || 'Candidate Name'}
                    </span>
                    <span className="text-slate-600 font-semibold ml-2 text-xs">— {resume.title || 'Curriculum Vitae'} (Contd.)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Page 2 of 2</span>
                </header>
              );
            }

            return (
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
            );
          };

          const renderSummary = () => (
            resume.summary ? (
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
            ) : null
          );

          const renderSkills = () => (
            resume.skills && resume.skills.length > 0 ? (
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
            ) : null
          );

          const renderExperience = (exps: typeof resume.experience) => (
            exps && exps.length > 0 ? (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-2'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Professional Experience {exps !== resume.experience && exps[0] !== resume.experience[0] ? '(Contd.)' : ''}
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {exps.map((exp) => (
                    <div key={exp.id}>
                      <div className="border-b border-slate-200 pb-0.5 mb-0.5 break-inside-avoid">
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
            ) : null
          );

          const renderEducation = () => (
            resume.education && resume.education.length > 0 ? (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Education & Credentials
                  </h2>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${getFontSizeClass()}`}>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-slate-300 pl-2 break-inside-avoid">
                      <div className="font-bold text-slate-950">{edu.degree}</div>
                      <div className="text-slate-800">{edu.institution}</div>
                      <div className="text-[10.5px] text-slate-500 italic">{edu.graduationDate} {edu.gpa ? `(${edu.gpa})` : ''}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderCertifications = () => (
            resume.certifications && resume.certifications.length > 0 ? (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Certifications & Accreditations
                  </h2>
                </div>
                <div className={`flex flex-wrap gap-1 ${getFontSizeClass()}`}>
                  {resume.certifications.map((cert, i) => (
                    <span key={i} className={`bg-slate-50 text-slate-800 border border-slate-200 ${is2PageFit ? 'px-1.5 py-0.2' : 'px-2 py-0.5'} rounded font-medium break-inside-avoid`}>
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            ) : null
          );

          const renderProjects = () => (
            resume.projects && resume.projects.length > 0 ? (
              <section className={sectionMargin}>
                <div className={`border-b-2 border-t-2 ${is2PageFit ? 'py-0.5 mb-1' : 'py-0.5 mb-1.5'}`} style={{ borderColor: primaryColor }}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-[12px]'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Key Strategic Deliverables & Projects
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className={is2PageFit ? 'text-[11px]' : 'text-[12px]'}>
                      <div className="flex items-baseline justify-between break-inside-avoid">
                        <span className="font-bold text-slate-950">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-[10.5px] text-slate-500 italic">({proj.technologies.join(', ')})</span>
                        )}
                      </div>
                      {proj.description && proj.description !== proj.name && (
                        <p className="text-slate-700 mt-0.5">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          );

          return (
            <div
              id="resume-printable-area"
              data-fit-two-pages={is2PageFit ? 'true' : 'false'}
              className="flex flex-col items-center w-full"
            >
              {partition.isMultiPage ? (
                <>
                  {/* SHEET 1 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderDoubleLineHeader(false)}
                    {renderSummary()}
                    {renderSkills()}
                    {renderExperience(partition.p1Exp)}
                    <SheetFooter pageText="Page 1 of 2" />
                  </div>

                  {/* VISUAL A4 SHEET BOUNDARY */}
                  <SheetBoundaryDivider pageNumber={2} />

                  {/* SHEET 2 */}
                  <div
                    className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {renderDoubleLineHeader(true)}
                    {renderExperience(partition.p2Exp)}
                    {renderEducation()}
                    {renderCertifications()}
                    {renderProjects()}
                    {renderSharedAchievements()}
                    {renderSharedCustomSections()}
                    <SheetFooter pageText="Page 2 of 2" />
                  </div>
                </>
              ) : (
                /* SINGLE SHEET */
                <div
                  className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-9'} text-slate-900 leading-normal`}
                  style={{ fontFamily: getFontFamily() }}
                >
                  {renderDoubleLineHeader(false)}
                  {renderSummary()}
                  {renderSkills()}
                  {renderExperience(resume.experience)}
                  {renderEducation()}
                  {renderCertifications()}
                  {renderProjects()}
                  {renderSharedAchievements()}
                  {renderSharedCustomSections()}
                  <SheetFooter pageText="Page 1 of 1" />
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* FORMAT 1: EXECUTIVE TWO-COLUMN (CONSULTING & BIG 4)          */}
        {/* ============================================================ */}
        {template === 'executive' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-4 sm:p-6 leading-snug' : 'p-6 sm:p-10 leading-relaxed'} text-slate-900 font-sans`}
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

            {/* Key Strategic Deliverables & Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <section className="mt-3">
                <div className={`border-b-2 border-slate-900 ${is2PageFit ? 'pb-0.5 mb-2' : 'pb-1 mb-3'} flex items-center gap-1.5`}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-normal">
                    Key Strategic Deliverables & Projects
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <span className="font-bold text-slate-950">{proj.name}</span>
                      {proj.description && proj.description !== proj.name && (
                        <p className="text-slate-700 mt-0.5">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {renderSharedAchievements()}
            {renderSharedCustomSections()}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 2: MODERN PROFESSIONAL (INDIGO ACCENT)                */}
        {/* ============================================================ */}
        {template === 'modern' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 font-sans leading-normal`}
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
                  <BulletList bullets={resume.certifications} bulletSpacing="space-y-1" fontSizeClass="text-xs text-slate-700" />
                </section>
              )}
            </div>

            {renderSharedAchievements()}
            {renderSharedCustomSections()}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 3: WALL STREET / FINANCE (COMPACT WSO)                */}
        {/* ============================================================ */}
        {template === 'wallstreet' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${is2PageFit ? 'p-4 sm:p-6' : 'p-6 sm:p-10'} text-slate-950 font-serif leading-tight`}
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

            {/* Projects & Deliverables */}
            {resume.projects && resume.projects.length > 0 && (
              <section className="mb-3">
                <div className="border-b border-slate-900 pb-1 mb-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-950 leading-normal">
                    Key Projects & Deliverables
                  </h2>
                </div>
                <div className="space-y-2 text-xs">
                  {resume.projects.map(proj => (
                    <div key={proj.id}>
                      <div className="flex justify-between font-bold">
                        <span>{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="font-normal italic">({proj.technologies.join(', ')})</span>
                        )}
                      </div>
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing="mt-0.5 space-y-0.5" fontSizeClass="text-xs text-slate-900" />
                      )}
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

            {renderSharedAchievements()}
            {renderSharedCustomSections()}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 4: SILICON VALLEY TECH                                */}
        {/* ============================================================ */}
        {template === 'tech' && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 font-sans leading-normal`}
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

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <section className="mb-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  // Projects & Deliverables
                </h2>
                <div className="space-y-3">
                  {resume.projects.map(proj => (
                    <div key={proj.id} className="border-l-2 border-slate-200 pl-3">
                      <div className="text-xs font-bold text-slate-900">
                        {proj.name} {proj.technologies && proj.technologies.length > 0 && <span className="font-mono text-primary-600 font-normal">[{proj.technologies.join(', ')}]</span>}
                      </div>
                      {proj.description && proj.description !== proj.name && (
                        <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing="mt-1 space-y-1" fontSizeClass="text-xs text-slate-700" />
                      )}
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

            {renderSharedAchievements()}
            {renderSharedCustomSections()}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORMAT 5: HARVARD ATS CLASSIC & MINIMALIST                    */}
        {/* ============================================================ */}
        {(template === 'harvard' || template === 'minimalist') && (
          <div
            id="resume-printable-area"
            data-fit-two-pages={is2PageFit ? 'true' : 'false'}
            className={`pdf-page resume-paper bg-white shadow-xl rounded-sm w-[800px] min-w-[800px] mx-auto min-h-[1100px] ${containerPadding} text-slate-900 leading-normal ${
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

            {/* Projects & Deliverables */}
            {resume.projects && resume.projects.length > 0 && (
              <section className={sectionMargin}>
                <div className={`border-b border-slate-400 ${is2PageFit ? 'pb-0.5 mb-1' : 'pb-1 mb-2'}`}>
                  <h2 className={`${is2PageFit ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-950 leading-normal`}>
                    Key Strategic Deliverables & Projects
                  </h2>
                </div>
                <div className={jobSpacing}>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className={getFontSizeClass()}>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-slate-950">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-slate-600 text-[11px] italic">({proj.technologies.join(', ')})</span>
                        )}
                      </div>
                      {proj.description && proj.description !== proj.name && (
                        <p className="text-slate-800 mt-0.5">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} bulletSpacing={bulletSpacing} fontSizeClass={getFontSizeClass()} />
                      )}
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
              <section className={sectionMargin}>
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

            {renderSharedAchievements()}
            {renderSharedCustomSections()}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
