import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeTemplate } from '../types/resume';
import { sqliteService, SavedResumeMetadata } from '../services/sqliteService';
import {
  Database,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Clock,
  Briefcase,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  currentTemplate: ResumeTemplate;
  onLoadResume: (resume: ResumeData, template?: ResumeTemplate) => void;
}

export const SavedResumesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentResume,
  currentTemplate,
  onLoadResume
}) => {
  const [resumes, setResumes] = useState<SavedResumeMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  const fetchResumes = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const list = await sqliteService.listResumes();
      setResumes(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to local SQLite database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResumes();
      setSaveTitle(
        currentResume.title
          ? `${currentResume.fullName || 'Candidate'} - ${currentResume.title}`
          : `${currentResume.fullName || 'Resume'} (Version ${new Date().toLocaleDateString()})`
      );
      setSaveSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, currentResume]);

  if (!isOpen) return null;

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await sqliteService.createResume({
        title: saveTitle.trim(),
        resumeData: currentResume,
        template: currentTemplate
      });
      setSaveSuccessMsg(`Saved "${saveTitle.trim()}" to local SQLite database!`);
      await fetchResumes();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving to SQLite');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (meta: SavedResumeMetadata) => {
    setIsLoading(true);
    try {
      const full = await sqliteService.getResume(meta.id);
      if (full && full.resumeData) {
        setActiveResumeId(meta.id);
        onLoadResume(full.resumeData, full.template);
        setSaveSuccessMsg(`Loaded "${meta.title}"! Switching to editor...`);
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMsg('Could not read resume content from SQLite');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from SQLite?`)) {
      return;
    }
    try {
      await sqliteService.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (activeResumeId === id) setActiveResumeId(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete resume');
    }
  };

  const handleDuplicate = async (meta: SavedResumeMetadata) => {
    try {
      const full = await sqliteService.getResume(meta.id);
      if (full && full.resumeData) {
        await sqliteService.createResume({
          title: `${meta.title} (Copy)`,
          resumeData: full.resumeData,
          template: full.template
        });
        await fetchResumes();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to duplicate resume');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Local SQLite Resume Store</h2>
                <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  data/resumes.db
                </span>
              </div>
              <p className="text-xs text-slate-500">Save, manage, and switch between your tailored resumes locally</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccessMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section: Save Current Resume */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-indigo-600" />
              Save Active Resume to SQLite
            </h3>
            <form onSubmit={handleSaveCurrent} className="flex gap-2">
              <input
                type="text"
                value={saveTitle}
                onChange={e => setSaveTitle(e.target.value)}
                placeholder="Resume version title (e.g. Akash - FinTech Director v2)"
                className="flex-1 px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <button
                type="submit"
                disabled={isSaving || !saveTitle.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Save Version</span>
              </button>
            </form>
          </div>

          {/* Section: List of Resumes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                Saved Resumes in Database ({resumes.length})
              </h3>
              <button
                type="button"
                onClick={fetchResumes}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {isLoading && resumes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Reading SQLite database...</span>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No resumes saved in SQLite yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the box above to save your first resume version into <code className="bg-slate-100 px-1 py-0.5 rounded">data/resumes.db</code></p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resumes.map(meta => (
                  <div
                    key={meta.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      activeResumeId === meta.id
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-300'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {meta.title}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {meta.template}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{meta.candidate_name || 'Candidate'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{meta.target_role || 'Professional'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(meta.updated_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoad(meta)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Load this resume into editor"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(meta)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate resume"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(meta.id, meta.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>File: <code className="font-mono text-slate-700">ResumeBuilder/data/resumes.db</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

