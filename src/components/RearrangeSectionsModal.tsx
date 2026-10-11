import React, { useState } from 'react';
import { ResumeData, ResumeSectionId } from '../types/resume';
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
  Trophy
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

  const [order, setOrder] = useState<ResumeSectionId[]>(initialOrder);
  const [hidden, setHidden] = useState<ResumeSectionId[]>(currentHidden);

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
      itemCount: resume.experience ? resume.experience.length : 0
    },
    education: {
      id: 'education',
      label: 'Education & Academic Credentials',
      description: 'Degrees, institutions, honors, and graduation dates',
      icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
      itemCount: resume.education ? resume.education.length : 0
    },
    certifications: {
      id: 'certifications',
      label: 'Certifications & Credentials',
      description: 'Industry credentials, licenses, and verified accreditations',
      icon: <Award className="w-4 h-4 text-purple-500" />,
      itemCount: resume.certifications ? resume.certifications.length : 0
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
      itemCount: resume.achievements ? resume.achievements.length : (resume.projects ? resume.projects.length : 0)
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

  const handleReset = () => {
    setOrder(DEFAULT_SECTION_ORDER);
    setHidden([]);
  };

  const handleApply = () => {
    onChange({
      ...resume,
      sectionOrder: order,
      hiddenSections: hidden
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Rearrange Resume Sections</h2>
              <p className="text-xs text-slate-500">Change section hierarchy or hide optional sections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of sections */}
        <div className="p-6 space-y-2.5 overflow-y-auto max-h-[60vh]">
          <p className="text-xs text-slate-500 mb-3">
            Use the arrows to reorder sections. The top-most section appears right after your header info on the resume.
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard ATS</span>
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
              <span>Apply Order</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
