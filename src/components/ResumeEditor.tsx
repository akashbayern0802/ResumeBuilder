import React, { useState, useRef, useEffect } from 'react';
import {
  ResumeData,
  WorkExperience,
  Education,
  Project,
  SkillCategory,
  AchievementItem,
  CustomSection,
  CustomSectionItem,
  AchievementIconType
} from '../types/resume';
import {
  User,
  Briefcase,
  Wrench,
  GraduationCap,
  FolderGit2,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Award,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  Palette,
  Trophy,
  Globe,
  BookOpen,
  Users
} from 'lucide-react';
import { extractTextFromFile, parseExtractedTextToResume } from '../services/documentParser';
import { IconPicker, renderAchievementIcon } from './IconPicker';

interface Props {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
  onOptimizeBullet: (experienceId: string, bulletIndex: number) => void;
  onOptimizeSummary: () => void;
  onOpenRearrange?: () => void;
  onOpenDesign?: () => void;
}

type TabType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'skills'
  | 'certifications'
  | 'education'
  | 'projects'
  | 'achievements'
  | string;

export const ResumeEditor: React.FC<Props> = ({
  resume,
  onChange,
  onOptimizeBullet,
  onOptimizeSummary,
  onOpenRearrange,
  onOpenDesign
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('experience');
  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});
  const [expandedExp, setExpandedExp] = useState<{ [expId: string]: boolean }>({
    [resume.experience[0]?.id || '']: true
  });

  const uploadResumeRef = React.useRef<HTMLInputElement>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        onChange(parsed);
      } else {
        const text = await extractTextFromFile(file);
        const parsedResume = parseExtractedTextToResume(text, file.name);
        onChange(parsedResume);
      }
    } catch (err: any) {
      alert(`Could not parse uploaded resume file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsParsingResume(false);
      if (uploadResumeRef.current) uploadResumeRef.current.value = '';
    }
  };

  // Contact change
  const handleContactChange = (field: keyof ResumeData, value: string) => {
    onChange({ ...resume, [field]: value });
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      role: 'Software Engineer',
      company: 'Company Name',
      location: 'City, State',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      bullets: ['Led development of core features using modern frameworks and best practices.']
    };
    onChange({
      ...resume,
      experience: [newExp, ...resume.experience]
    });
    setExpandedExp({ ...expandedExp, [newExp.id]: true });
  };

  const handleUpdateExp = (id: string, field: keyof WorkExperience, val: any) => {
    onChange({
      ...resume,
      experience: resume.experience.map(e => e.id === id ? { ...e, [field]: val } : e)
    });
  };

  const handleDeleteExp = (id: string) => {
    onChange({
      ...resume,
      experience: resume.experience.filter(e => e.id !== id)
    });
  };

  const handleAddBullet = (expId: string) => {
    onChange({
      ...resume,
      experience: resume.experience.map(e => {
        if (e.id === expId) {
          return {
            ...e,
            bullets: [...e.bullets, 'Engineered new scalable capability resulting in measurable improvement.']
          };
        }
        return e;
      })
    });
  };

  const handleUpdateBullet = (expId: string, bIndex: number, text: string) => {
    onChange({
      ...resume,
      experience: resume.experience.map(e => {
        if (e.id === expId) {
          const newBullets = [...e.bullets];
          newBullets[bIndex] = text;
          return { ...e, bullets: newBullets };
        }
        return e;
      })
    });
  };

  const handleDeleteBullet = (expId: string, bIndex: number) => {
    onChange({
      ...resume,
      experience: resume.experience.map(e => {
        if (e.id === expId) {
          return {
            ...e,
            bullets: e.bullets.filter((_, i) => i !== bIndex)
          };
        }
        return e;
      })
    });
  };

  // Skills handlers
  const handleAddSkillToCat = (catId: string) => {
    const skillName = (newSkillInput[catId] || '').trim();
    if (!skillName) return;

    onChange({
      ...resume,
      skills: resume.skills.map(cat => {
        if (cat.id === catId && !cat.skills.includes(skillName)) {
          return { ...cat, skills: [...cat.skills, skillName] };
        }
        return cat;
      })
    });
    setNewSkillInput({ ...newSkillInput, [catId]: '' });
  };

  const handleRemoveSkill = (catId: string, skillName: string) => {
    onChange({
      ...resume,
      skills: resume.skills.map(cat => {
        if (cat.id === catId) {
          return { ...cat, skills: cat.skills.filter(s => s !== skillName) };
        }
        return cat;
      })
    });
  };

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `sk-${Date.now()}`,
      categoryName: 'New Skill Category',
      skills: []
    };
    onChange({
      ...resume,
      skills: [...resume.skills, newCat]
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: 'Project Name',
      description: 'Brief project overview',
      technologies: ['TypeScript', 'React'],
      bullets: ['Built full-stack application and deployed to production.']
    };
    onChange({
      ...resume,
      projects: [...resume.projects, newProj]
    });
  };

  const handleUpdateProject = (id: string, field: keyof Project, val: any) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => p.id === id ? { ...p, [field]: val } : p)
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter(p => p.id !== id)
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Computer Science',
      institution: 'University Name',
      location: 'City, State',
      graduationDate: '2023-05'
    };
    onChange({
      ...resume,
      education: [...resume.education, newEdu]
    });
  };

  const handleUpdateEducation = (id: string, field: keyof Education, val: any) => {
    onChange({
      ...resume,
      education: resume.education.map(ed => ed.id === id ? { ...ed, [field]: val } : ed)
    });
  };

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const addSectionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addSectionDropdownRef.current && !addSectionDropdownRef.current.contains(e.target as Node)) {
        setIsAddSectionOpen(false);
      }
    };
    if (isAddSectionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddSectionOpen]);

  // Compute effective achievements list (syncs with parsed project milestones if achievements is not yet explicitly set)
  const effectiveAchievements: AchievementItem[] = (resume.achievements && resume.achievements.length > 0)
    ? resume.achievements
    : (resume.projects && resume.projects.length > 0 && resume.projects.some(p => p.name.includes('Milestone') || p.name.includes('PwC') || p.name.includes('Accenture') || p.name.includes('Lodha') || p.name.includes('ICICI')))
      ? resume.projects.map((p, idx) => {
          const defaultIcons: AchievementIconType[] = ['award', 'barchart', 'trending', 'gem', 'rocket', 'target', 'trophy'];
          return {
            id: p.id || `ach-${idx}`,
            title: p.name.replace(/ Milestone$/i, ''),
            description: p.description || p.bullets?.[0] || '',
            icon: p.icon || defaultIcons[idx % defaultIcons.length]
          };
        })
      : [];

  // Achievements handlers
  const handleAddAchievement = () => {
    const newAch: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: 'Company / Award Name',
      description: 'Highlight key quantifiable milestone, annual award, or client transformation deliverable...',
      icon: 'trophy'
    };
    onChange({
      ...resume,
      achievements: [...effectiveAchievements, newAch]
    });
  };

  const handleUpdateAchievement = (id: string, field: keyof AchievementItem, val: any) => {
    onChange({
      ...resume,
      achievements: effectiveAchievements.map(a => a.id === id ? { ...a, [field]: val } : a)
    });
  };

  const handleDeleteAchievement = (id: string) => {
    onChange({
      ...resume,
      achievements: effectiveAchievements.filter(a => a.id !== id)
    });
  };

  // Custom Section handlers
  const handleAddCustomSection = (title: string, icon: AchievementIconType = 'sparkles') => {
    const newSec: CustomSection = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Custom Section',
      icon,
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'New Entry / Milestone',
          subtitle: 'Organization / Issuer',
          description: 'Details and impact of this entry...',
          icon: 'check'
        }
      ]
    };
    const currentSecs = resume.customSections || [];
    const currentOrder = resume.sectionOrder || [
      'summary',
      'skills',
      'experience',
      'education',
      'certifications',
      'projects',
      'achievements'
    ];
    onChange({
      ...resume,
      customSections: [...currentSecs, newSec],
      sectionOrder: [...currentOrder, newSec.id]
    });
    setActiveTab(newSec.id);
    setIsAddSectionOpen(false);
    setIsCustomInputOpen(false);
    setCustomSectionTitle('');
  };

  const handleUpdateCustomSection = (secId: string, field: keyof CustomSection, val: any) => {
    const currentSecs = resume.customSections || [];
    onChange({
      ...resume,
      customSections: currentSecs.map(s => s.id === secId ? { ...s, [field]: val } : s)
    });
  };

  const handleDeleteCustomSection = (secId: string) => {
    const currentSecs = resume.customSections || [];
    const currentOrder = resume.sectionOrder || [];
    onChange({
      ...resume,
      customSections: currentSecs.filter(s => s.id !== secId),
      sectionOrder: currentOrder.filter(id => id !== secId)
    });
    setActiveTab('experience');
  };

  const handleAddCustomItem = (secId: string) => {
    const currentSecs = resume.customSections || [];
    const newItem: CustomSectionItem = {
      id: `item-${Date.now()}`,
      title: 'New Entry',
      subtitle: '',
      description: '',
      icon: 'check'
    };
    onChange({
      ...resume,
      customSections: currentSecs.map(s => s.id === secId ? {
        ...s,
        items: [...s.items, newItem]
      } : s)
    });
  };

  const handleUpdateCustomItem = (secId: string, itemId: string, field: keyof CustomSectionItem, val: any) => {
    const currentSecs = resume.customSections || [];
    onChange({
      ...resume,
      customSections: currentSecs.map(s => s.id === secId ? {
        ...s,
        items: s.items.map(it => it.id === itemId ? { ...it, [field]: val } : it)
      } : s)
    });
  };

  const handleDeleteCustomItem = (secId: string, itemId: string) => {
    const currentSecs = resume.customSections || [];
    onChange({
      ...resume,
      customSections: currentSecs.map(s => s.id === secId ? {
        ...s,
        items: s.items.filter(it => it.id !== itemId)
      } : s)
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter(ed => ed.id !== id)
    });
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-2 sm:p-6 flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-150" : "flex flex-col"}>
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden w-full ${isFullscreen ? 'max-w-6xl h-[94vh] shadow-2xl' : ''}`}>
        {/* Editor Studio Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Resume Editor</span>
            {isFullscreen && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                Full Screen Studio Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenRearrange && (
              <button
                type="button"
                onClick={onOpenRearrange}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
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
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Customize fonts & styles"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Design & Font</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(f => !f)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen Studio"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto p-1.5 gap-1 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'experience'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({resume.experience.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'skills'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Skills ({resume.skills.reduce((acc, c) => acc + c.skills.length, 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'certifications'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certifications ({(resume.certifications || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({resume.projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'education'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({resume.education.length})</span>
        </button>

        {/* KEY ACHIEVEMENTS TAB */}
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-white text-amber-900 shadow-xs font-semibold border border-amber-200'
              : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Achievements ({effectiveAchievements.length})</span>
        </button>

        {/* DYNAMIC CUSTOM SECTIONS TABS */}
        {resume.customSections?.map(cs => (
          <button
            key={cs.id}
            type="button"
            onClick={() => setActiveTab(cs.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === cs.id
                ? 'bg-white text-indigo-900 shadow-xs font-semibold border border-indigo-200'
                : 'text-slate-600 hover:text-indigo-800 hover:bg-indigo-50/50'
            }`}
          >
            {renderAchievementIcon(cs.icon || 'sparkles', "w-3.5 h-3.5 shrink-0")}
            <span>{cs.title} ({cs.items?.length || 0})</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'contact'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal Info</span>
        </button>

        {/* + ADD SECTION DROPDOWN BUTTON */}
        <div className="relative inline-block ml-1" ref={addSectionDropdownRef}>
          <button
            type="button"
            onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title="Add a new section to your resume"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>

          {isAddSectionOpen && (
            <div className="absolute left-0 mt-1 z-50 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-100 mb-1">
                Add Section to Resume
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('achievements');
                    if (effectiveAchievements.length === 0) {
                      handleAddAchievement();
                    }
                    setIsAddSectionOpen(false);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50/70 text-left transition-colors cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Key Achievements & Milestones</div>
                    <div className="text-[10.5px] text-slate-500">Awards, recognitions, and major business metrics with custom icons</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCustomSection('Languages & Fluency', 'globe')}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-cyan-50/70 text-left transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Languages & Fluency</div>
                    <div className="text-[10.5px] text-slate-500">Multilingual proficiency (English, Hindi, German, etc.)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCustomSection('Publications & Patents', 'sparkles')}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-indigo-50/70 text-left transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Publications & Patents</div>
                    <div className="text-[10.5px] text-slate-500">Research papers, journals, articles, or patents</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCustomSection('Volunteer & Community', 'sparkles')}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-emerald-50/70 text-left transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Volunteer & Community Leadership</div>
                    <div className="text-[10.5px] text-slate-500">Mentorship, non-profit initiatives, or leadership work</div>
                  </div>
                </button>

                {/* CUSTOM SECTION INLINE CREATOR */}
                {isCustomInputOpen ? (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 mt-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Section Name</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customSectionTitle}
                        onChange={(e) => setCustomSectionTitle(e.target.value)}
                        placeholder="e.g. Speaking & Conferences"
                        className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customSectionTitle.trim()) {
                            handleAddCustomSection(customSectionTitle);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSectionTitle.trim()) {
                            handleAddCustomSection(customSectionTitle);
                          }
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustomInputOpen(true)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-left text-slate-700 font-semibold transition-colors cursor-pointer border-t border-slate-100 mt-1"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <span>Create Custom Section...</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload Resume File shortcut */}
        <input
          type="file"
          ref={uploadResumeRef}
          onChange={handleResumeFileUpload}
          accept=".pdf,.docx,.txt,.json,.md"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => uploadResumeRef.current?.click()}
          disabled={isParsingResume}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Upload Resume File (PDF, DOCX, TXT)"
        >
          <UploadCloud className={`w-3.5 h-3.5 ${isParsingResume ? 'animate-bounce' : ''}`} />
          <span>{isParsingResume ? 'Parsing...' : 'Upload File'}</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className={`p-5 overflow-y-auto ${isFullscreen ? 'flex-1 min-h-0' : 'max-h-[600px]'}`}>
        {/* TAB 1: WORK EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Tailor bullet points to mirror target JD action verbs & metrics
              </span>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {resume.experience.map((exp) => {
              const isExpanded = expandedExp[exp.id] ?? true;
              return (
                <div
                  key={exp.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3 transition-all"
                >
                  {/* Position Header Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      onClick={() => setExpandedExp({ ...expandedExp, [exp.id]: !isExpanded })}
                      className="flex items-center gap-2 cursor-pointer flex-1 font-semibold text-xs text-slate-900"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      <span>{exp.role || 'Role'} at {exp.company || 'Company'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteExp(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Position Inputs */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/80">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdateExp(exp.id, 'role', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExp(exp.id, 'company', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dates</label>
                          <input
                            type="text"
                            value={`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`}
                            onChange={(e) => {
                              const parts = e.target.value.split('-');
                              handleUpdateExp(exp.id, 'startDate', parts[0]?.trim() || '');
                              handleUpdateExp(exp.id, 'endDate', parts[1]?.trim() || '');
                            }}
                            placeholder="2022-01 - Present"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={(e) => handleUpdateExp(exp.id, 'location', e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Bullet points list */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-bold text-slate-500">
                            Experience Bullet Points (Accomplished [X] by [Y])
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddBullet(exp.id)}
                            className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Bullet
                          </button>
                        </div>

                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 group">
                            <span className="text-slate-400 font-bold text-xs mt-2">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                              className="flex-1 p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 leading-relaxed resize-y"
                            />
                            <div className="flex flex-col gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => onOptimizeBullet(exp.id, bIdx)}
                                className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-800 transition-colors"
                                title="Tailor this bullet with AI"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBullet(exp.id, bIdx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="Delete bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Organize hard skills, libraries, databases, and domain tools
              </span>
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {resume.skills.map((cat) => (
              <div key={cat.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cat.categoryName}
                    onChange={(e) => {
                      const newSkills = resume.skills.map(c => c.id === cat.id ? { ...c, categoryName: e.target.value } : c);
                      onChange({ ...resume, skills: newSkills });
                    }}
                    className="font-bold text-xs text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none px-1 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...resume, skills: resume.skills.filter(c => c.id !== cat.id) });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Skill badges */}
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-2xs group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(cat.id, skill)}
                        className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput[cat.id] || ''}
                    onChange={(e) => setNewSkillInput({ ...newSkillInput, [cat.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillToCat(cat.id);
                      }
                    }}
                    placeholder="Type skill and press Enter..."
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToCat(cat.id)}
                    className="px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Professional certifications and industry credentials (e.g. CBAP, PMP, CSPO, SAFe)
              </span>
              <button
                type="button"
                onClick={() => {
                  const newCert = prompt('Enter certification title (e.g. Project Management Professional (PMP)):');
                  if (newCert?.trim()) {
                    onChange({
                      ...resume,
                      certifications: [...(resume.certifications || []), newCert.trim()]
                    });
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="space-y-2">
              {(resume.certifications || []).map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{cert}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...resume,
                        certifications: resume.certifications?.filter((_, i) => i !== index)
                      });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROFESSIONAL SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Targeted 2-4 sentence executive overview aligning your experience to the JD
              </span>
              <button
                type="button"
                onClick={onOptimizeSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tailor Summary with AI</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={resume.summary}
              onChange={(e) => onChange({ ...resume, summary: e.target.value })}
              placeholder="Results-oriented senior engineer with 6+ years of expertise..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 leading-relaxed resize-y"
            />
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Highlight open-source work, architectural side projects, or client demos
              </span>
              <button
                type="button"
                onClick={handleAddProject}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {resume.projects.map((proj) => (
              <div key={proj.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <IconPicker
                      value={proj.icon || 'trophy'}
                      onChange={(icon) => handleUpdateProject(proj.id, 'icon', icon)}
                      title="Choose Project Icon"
                    />
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleUpdateProject(proj.id, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => handleUpdateProject(proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Link / GitHub</label>
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => handleUpdateProject(proj.id, 'link', e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={proj.bullets[0] || ''}
                  onChange={(e) => handleUpdateProject(proj.id, 'bullets', [e.target.value])}
                  placeholder="Key accomplishments and performance metrics achieved in this project..."
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Degree, alma mater, and graduation details</span>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {resume.education.map((edu) => (
              <div key={edu.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Degree (e.g. B.S. in Computer Science)"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">University / Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Graduation Date</label>
                    <input
                      type="text"
                      value={edu.graduationDate}
                      onChange={(e) => handleUpdateEducation(edu.id, 'graduationDate', e.target.value)}
                      placeholder="e.g. 2021-05"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: KEY ACHIEVEMENTS & MILESTONES */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Highlight major quantifiable career milestones, promotions, and leadership awards with custom icons
              </span>
              <button
                type="button"
                onClick={handleAddAchievement}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Achievement</span>
              </button>
            </div>

            {effectiveAchievements.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-slate-800">No Key Achievements Yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                  Add major career milestones (e.g. "Won Ace Award", "Scaled 120M Monthly Volume", "Reduced lead time by 80%").
                </p>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 shadow-2xs cursor-pointer"
                >
                  + Add First Achievement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {effectiveAchievements.map((ach) => (
                  <div key={ach.id} className="border border-amber-200/80 rounded-xl p-3.5 bg-amber-50/20 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <IconPicker
                          value={ach.icon || 'trophy'}
                          onChange={(icon) => handleUpdateAchievement(ach.id, 'icon', icon)}
                          title="Pick Achievement Icon"
                        />
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => handleUpdateAchievement(ach.id, 'title', e.target.value)}
                          placeholder="Organization / Company / Award Title (e.g. PwC, ICICI Bank, Accenture)"
                          className="font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete Achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Milestone Description & Metrics</label>
                      <textarea
                        rows={2}
                        value={ach.description}
                        onChange={(e) => handleUpdateAchievement(ach.id, 'description', e.target.value)}
                        placeholder="e.g. Awarded Business Services Delivery Annual Award for championing customer-first transformation..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC CUSTOM SECTIONS PANES */}
        {resume.customSections?.map((cs) => {
          if (activeTab !== cs.id) return null;
          return (
            <div key={cs.id} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 flex-1">
                  <IconPicker
                    value={cs.icon || 'sparkles'}
                    onChange={(icon) => handleUpdateCustomSection(cs.id, 'icon', icon)}
                    title="Section Icon"
                  />
                  <input
                    type="text"
                    value={cs.title}
                    onChange={(e) => handleUpdateCustomSection(cs.id, 'title', e.target.value)}
                    placeholder="Section Title"
                    className="font-bold text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1 max-w-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddCustomItem(cs.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomSection(cs.id)}
                    className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Delete this entire section"
                  >
                    Delete Section
                  </button>
                </div>
              </div>

              {cs.items.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">No entries in this section yet.</p>
                  <button
                    type="button"
                    onClick={() => handleAddCustomItem(cs.id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    + Add First Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cs.items.map((it) => (
                    <div key={it.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <IconPicker
                            value={it.icon || 'check'}
                            onChange={(icon) => handleUpdateCustomItem(cs.id, it.id, 'icon', icon)}
                            title="Item Icon"
                          />
                          <input
                            type="text"
                            value={it.title}
                            onChange={(e) => handleUpdateCustomItem(cs.id, it.id, 'title', e.target.value)}
                            placeholder="Title / Honor / Item (e.g. English, Patent #1234, Keynote Speaker)"
                            className="font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomItem(cs.id, it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Organization / Subtitle</label>
                          <input
                            type="text"
                            value={it.subtitle || ''}
                            onChange={(e) => handleUpdateCustomItem(cs.id, it.id, 'subtitle', e.target.value)}
                            placeholder="e.g. Native / Professional Fluency or IEEE Conference"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date / Year</label>
                          <input
                            type="text"
                            value={it.date || ''}
                            onChange={(e) => handleUpdateCustomItem(cs.id, it.id, 'date', e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={it.description || ''}
                        onChange={(e) => handleUpdateCustomItem(cs.id, it.id, 'description', e.target.value)}
                        placeholder="Description or key takeaways..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* TAB 6: CONTACT DETAILS */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                value={resume.fullName}
                onChange={(e) => handleContactChange('fullName', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Professional Title</label>
              <input
                type="text"
                value={resume.title}
                onChange={(e) => handleContactChange('title', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                value={resume.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Phone</label>
              <input
                type="text"
                value={resume.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Location</label>
              <input
                type="text"
                value={resume.location}
                onChange={(e) => handleContactChange('location', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Total Experience (Years)</label>
              <input
                type="text"
                value={resume.totalExperience || ''}
                onChange={(e) => handleContactChange('totalExperience', e.target.value)}
                placeholder="e.g. 12+ Years"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Preferred Locations</label>
              <input
                type="text"
                value={resume.preferredLocations || ''}
                onChange={(e) => handleContactChange('preferredLocations', e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Pune, Hyderabad (Open to Hybrid / Remote)"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={resume.linkedin || ''}
                onChange={(e) => handleContactChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">GitHub Profile</label>
              <input
                type="text"
                value={resume.github || ''}
                onChange={(e) => handleContactChange('github', e.target.value)}
                placeholder="github.com/username"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Portfolio / Website</label>
              <input
                type="text"
                value={resume.website || ''}
                onChange={(e) => handleContactChange('website', e.target.value)}
                placeholder="https://mysite.com"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

