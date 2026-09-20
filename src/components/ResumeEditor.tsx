import React, { useState } from 'react';
import { ResumeData, WorkExperience, Education, Project, SkillCategory } from '../types/resume';
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
  Award
} from 'lucide-react';
import { extractTextFromFile, parseExtractedTextToResume } from '../services/documentParser';

interface Props {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
  onOptimizeBullet: (experienceId: string, bulletIndex: number) => void;
  onOptimizeSummary: () => void;
}

type TabType = 'contact' | 'summary' | 'experience' | 'skills' | 'certifications' | 'education' | 'projects';

export const ResumeEditor: React.FC<Props> = ({
  resume,
  onChange,
  onOptimizeBullet,
  onOptimizeSummary
}) => {
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

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter(ed => ed.id !== id)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto p-1.5 gap-1 text-xs">
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
          <span>Education</span>
        </button>

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
      <div className="p-5 max-h-[600px] overflow-y-auto">
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
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => handleUpdateProject(proj.id, 'name', e.target.value)}
                    placeholder="Project Name"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex-1"
                  />
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
  );
};

