import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeSectionId, WorkExperience, Education, AchievementItem } from '../types/resume';
import {
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  FileText,
  Briefcase,
  Wrench,
  GraduationCap,
  Award,
  FolderGit2,
  GripVertical,
  Trophy,
  ChevronDown,
  ChevronUp,
  Layers,
  ListOrdered
} from 'lucide-react';
import { renderAchievementIcon } from './IconPicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
}

interface SectionMeta {
  id: ResumeSectionId;
  label: string;
  description: string;
  icon: React.ReactNode;
  itemCount: number;
}

export const DEFAULT_SECTION_ORDER: ResumeSectionId[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'certifications',
  'projects',
  'achievements'
];

export const RearrangeSectionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  resume,
  onChange
}) => {
  const allSectionIds = [
    ...DEFAULT_SECTION_ORDER,
    ...(resume.customSections || []).map(cs => cs.id)
  ];
  const initialOrder = resume.sectionOrder && resume.sectionOrder.length > 0
    ? Array.from(new Set([...resume.sectionOrder, ...allSectionIds]))
    : allSectionIds;

  const currentHidden = resume.hiddenSections || [];

  const [activeTab, setActiveTab] = useState<'sections' | 'experience' | 'other'>('sections');
  const [order, setOrder] = useState<ResumeSectionId[]>(initialOrder);
  const [hidden, setHidden] = useState<ResumeSectionId[]>(currentHidden);
  const [experiences, setExperiences] = useState<WorkExperience[]>(resume.experience || []);
  const [education, setEducation] = useState<Education[]>(resume.education || []);
  const [certifications, setCertifications] = useState<string[]>(resume.certifications || []);
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    (resume.achievements && resume.achievements.length > 0)
      ? resume.achievements
      : (resume.projects && resume.projects.length > 0 && resume.projects.some(p => p.name.includes('Milestone') || p.name.includes('PwC') || p.name.includes('Accenture') || p.name.includes('Lodha') || p.name.includes('ICICI')))
        ? resume.projects.map((p, idx) => ({
            id: p.id || `ach-${idx}`,
            title: p.name.replace(/ Milestone$/i, ''),
            description: p.description || p.bullets?.[0] || '',
            icon: p.icon || 'trophy'
          }))
        : []
  );
  const [expandedExpIds, setExpandedExpIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setOrder(initialOrder);
      setHidden(currentHidden);
      setExperiences(resume.experience || []);
      setEducation(resume.education || []);
      setCertifications(resume.certifications || []);
      setAchievements(
        (resume.achievements && resume.achievements.length > 0)
          ? resume.achievements
          : (resume.projects && resume.projects.length > 0 && resume.projects.some(p => p.name.includes('Milestone') || p.name.includes('PwC') || p.name.includes('Accenture') || p.name.includes('Lodha') || p.name.includes('ICICI')))
            ? resume.projects.map((p, idx) => ({
                id: p.id || `ach-${idx}`,
                title: p.name.replace(/ Milestone$/i, ''),
                description: p.description || p.bullets?.[0] || '',
                icon: p.icon || 'trophy'
              }))
            : []
      );
    }
  }, [isOpen, resume]);

  if (!isOpen) return null;

  const sectionDetails: Record<string, SectionMeta> = {
    summary: {
      id: 'summary',
      label: 'Executive Profile Summary',
      description: 'Career overview, key value proposition, and leadership scope',
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      itemCount: resume.summary ? 1 : 0
    },
    skills: {
      id: 'skills',
      label: 'Key Competencies & Technical Skills',
      description: 'Domain competencies, tools, methods & tech stack',
      icon: <Wrench className="w-4 h-4 text-emerald-500" />,
      itemCount: resume.skills ? resume.skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0) : 0
    },
    experience: {
      id: 'experience',
      label: 'Professional Experience',
      description: 'Chronological career history, achievements & quantified metrics',
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
      itemCount: experiences.length
    },
    education: {
      id: 'education',
      label: 'Education & Academic Credentials',
      description: 'Degrees, institutions, honors, and graduation dates',
      icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
      itemCount: education.length
    },
    certifications: {
      id: 'certifications',
      label: 'Certifications & Credentials',
      description: 'Industry credentials, licenses, and verified accreditations',
      icon: <Award className="w-4 h-4 text-purple-500" />,
      itemCount: certifications.length
    },
    projects: {
      id: 'projects',
      label: 'Projects & Key Deliverables',
      description: 'Key strategic initiatives, open-source or enterprise solutions',
      icon: <FolderGit2 className="w-4 h-4 text-rose-500" />,
      itemCount: resume.projects ? resume.projects.length : 0
    },
    achievements: {
      id: 'achievements',
      label: 'Key Achievements & Milestones',
      description: 'Awards, high-impact business metrics, and leadership recognitions',
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      itemCount: achievements.length
    }
  };

  // Add custom sections dynamically
  if (resume.customSections) {
    resume.customSections.forEach(cs => {
      sectionDetails[cs.id] = {
        id: cs.id,
        label: cs.title,
        description: 'Custom added section with milestone items',
        icon: renderAchievementIcon(cs.icon || 'sparkles', "w-4 h-4 text-indigo-500"),
        itemCount: cs.items?.length || 0
      };
    });
  }

  // --- Reordering Handlers for Section Hierarchy ---
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  const toggleVisibility = (id: ResumeSectionId) => {
    if (hidden.includes(id)) {
      setHidden(hidden.filter(item => item !== id));
    } else {
      setHidden([...hidden, id]);
    }
  };

  // --- Reordering Handlers for Experiences & Bullets ---
  const handleMoveExp = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;
    const newExps = [...experiences];
    const temp = newExps[index];
    newExps[index] = newExps[targetIdx];
    newExps[targetIdx] = temp;
    setExperiences(newExps);
  };

  const handleMoveBullet = (expId: string, bIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? bIdx - 1 : bIdx + 1;
    setExperiences(experiences.map(e => {
      if (e.id === expId) {
        if (targetIdx < 0 || targetIdx >= e.bullets.length) return e;
        const newBullets = [...e.bullets];
        const temp = newBullets[bIdx];
        newBullets[bIdx] = newBullets[targetIdx];
        newBullets[targetIdx] = temp;
        return { ...e, bullets: newBullets };
      }
      return e;
    }));
  };

  // --- Reordering Handlers for Other Subsections ---
  const handleMoveEdu = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= education.length) return;
    const newEdu = [...education];
    const temp = newEdu[index];
    newEdu[index] = newEdu[targetIdx];
    newEdu[targetIdx] = temp;
    setEducation(newEdu);
  };

  const handleMoveCert = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= certifications.length) return;
    const newCerts = [...certifications];
    const temp = newCerts[index];
    newCerts[index] = newCerts[targetIdx];
    newCerts[targetIdx] = temp;
    setCertifications(newCerts);
  };

  const handleMoveAch = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= achievements.length) return;
    const newAchs = [...achievements];
    const temp = newAchs[index];
    newAchs[index] = newAchs[targetIdx];
    newAchs[targetIdx] = temp;
    setAchievements(newAchs);
  };

  const handleReset = () => {
    if (activeTab === 'sections') {
      setOrder(DEFAULT_SECTION_ORDER);
      setHidden([]);
    } else {
      setExperiences(resume.experience || []);
      setEducation(resume.education || []);
      setCertifications(resume.certifications || []);
      setAchievements(resume.achievements || []);
    }
  };

  const handleApply = () => {
    onChange({
      ...resume,
      sectionOrder: order,
      hiddenSections: hidden,
      experience: experiences,
      education: education,
      certifications: certifications,
      achievements: achievements
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Rearrange Resume & Subsections</h2>
              <p className="text-xs text-slate-500">Reorder top-level sections, work history, bullet points, and credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Section Hierarchy ({order.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'experience'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Positions & Bullets ({experiences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('other')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'other'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Education & Other Subsections</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          
          {/* TAB 1: SECTION HIERARCHY */}
          {activeTab === 'sections' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 mb-2">
                Use the arrows to reorder sections. The top-most section appears right after your header on the resume.
              </p>

              {order.map((secId, idx) => {
                const meta = sectionDetails[secId] || {
                  id: secId,
                  label: secId,
                  description: '',
                  icon: <FileText className="w-4 h-4 text-slate-500" />,
                  itemCount: 0
                };
                const isHidden = hidden.includes(secId);

                return (
                  <div
                    key={secId}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isHidden
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${isHidden ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {meta.label}
                          </span>
                          {meta.itemCount > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                              {meta.itemCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{meta.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleVisibility(secId)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isHidden
                            ? 'text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
                            : 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                        }`}
                        title={isHidden ? 'Show section' : 'Hide section on resume'}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={idx === order.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: WORK EXPERIENCES & BULLETS */}
          {activeTab === 'experience' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Reorder companies with the arrows. Click on any company card to expand its bullet points and rearrange them.
              </p>

              {experiences.map((exp, expIdx) => {
                const isExpanded = expandedExpIds[exp.id] ?? true;
                return (
                  <div
                    key={exp.id}
                    className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Position Bar */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border-b border-slate-100 gap-2">
                      <div
                        onClick={() => setExpandedExpIds({ ...expandedExpIds, [exp.id]: !isExpanded })}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
                          #{expIdx + 1}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {exp.role || 'Job Title'} at {exp.company || 'Company'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveExp(expIdx, 'up')}
                          disabled={expIdx === 0}
                          className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200/60 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Move company up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExp(expIdx, 'down')}
                          disabled={expIdx === experiences.length - 1}
                          className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200/60 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Move company down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bullets Sub-list */}
                    {isExpanded && (
                      <div className="p-3 bg-white space-y-2">
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                          Bullet Points ({exp.bullets?.length || 0})
                        </div>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="text-slate-400 font-bold mt-0.5">•</span>
                              <span className="text-slate-700 leading-relaxed text-[11px] line-clamp-2">
                                {bullet}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveBullet(exp.id, bIdx, 'up')}
                                disabled={bIdx === 0}
                                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                title="Move bullet up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveBullet(exp.id, bIdx, 'down')}
                                disabled={bIdx === exp.bullets.length - 1}
                                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                title="Move bullet down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: OTHER SUBSECTIONS */}
          {activeTab === 'other' && (
            <div className="space-y-6">
              
              {/* Education */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Education ({education.length})</h3>
                </div>
                {education.map((edu, eduIdx) => (
                  <div
                    key={edu.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="text-xs font-bold text-slate-900 truncate">{edu.degree}</div>
                      <div className="text-[11px] text-slate-500 truncate">{edu.institution} • {edu.graduationDate}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveEdu(eduIdx, 'up')}
                        disabled={eduIdx === 0}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move education up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveEdu(eduIdx, 'down')}
                        disabled={eduIdx === education.length - 1}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move education down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Certifications ({certifications.length})</h3>
                </div>
                {certifications.map((cert, certIdx) => (
                  <div
                    key={certIdx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs"
                  >
                    <span className="text-xs font-semibold text-slate-800 truncate mr-2">{cert}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveCert(certIdx, 'up')}
                        disabled={certIdx === 0}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move cert up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCert(certIdx, 'down')}
                        disabled={certIdx === certifications.length - 1}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Move cert down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Achievements */}
              {achievements.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Achievements ({achievements.length})</h3>
                  </div>
                  {achievements.map((ach, achIdx) => (
                    <div
                      key={ach.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="text-xs font-bold text-slate-900 truncate">{ach.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{ach.description}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveAch(achIdx, 'up')}
                          disabled={achIdx === 0}
                          className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Move achievement up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAch(achIdx, 'down')}
                          disabled={achIdx === achievements.length - 1}
                          className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Move achievement down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {activeTab === 'sections' ? 'Sections' : 'Current Tab'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
