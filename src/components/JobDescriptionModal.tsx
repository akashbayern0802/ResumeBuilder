import React, { useRef, useState } from 'react';
import { JobDescription } from '../types/resume';
import { extractTextFromFile, parseExtractedTextToJobDescription } from '../services/documentParser';
import { SAMPLE_JOB_DESCRIPTIONS } from '../data/samples';
import { X, UploadCloud, Briefcase, Building, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: JobDescription;
  onSave: (jd: JobDescription) => void;
}

export const JobDescriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  jobDescription,
  onSave
}) => {
  const [title, setTitle] = useState(jobDescription.title);
  const [company, setCompany] = useState(jobDescription.company);
  const [text, setText] = useState(jobDescription.rawText);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const extractedText = await extractTextFromFile(file);
      const parsed = parseExtractedTextToJobDescription(extractedText, file.name);
      setTitle(parsed.title);
      setCompany(parsed.company);
      setText(parsed.text);
    } catch (err: any) {
      alert(`Could not extract text: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleLoadPreset = (key: string) => {
    const sample = SAMPLE_JOB_DESCRIPTIONS[key];
    if (!sample) return;
    setTitle(sample.title);
    setCompany(sample.company);
    setText(sample.text);
  };

  const handleSave = () => {
    onSave({
      ...jobDescription,
      title: title.trim() || 'Target Role',
      company: company.trim() || 'Target Company',
      rawText: text.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload or Paste Job Description</h2>
              <p className="text-xs text-slate-500">Add the job requirements you want to match your resume against</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Preset buttons */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Quick Fill Sample JD:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadPreset('senior_fullstack_cloud')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cloud Engineer
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('ml_rag_engineer')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                AI / RAG
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('frontend_tech_lead')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Lead Frontend
              </button>
            </div>
          </div>

          {/* Drag and drop upload zone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <div className="p-2.5 rounded-full bg-white shadow-xs text-indigo-600">
              <UploadCloud className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-800">
                {isUploading ? 'Extracting text from document...' : 'Click to Browse or Drag & Drop Job Description File'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PDF, DOCX, TXT, or Markdown documents
              </p>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or paste text manually
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Job Title & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company</label>
              <div className="relative">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Stripe"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Full JD Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Job Description Requirements & Responsibilities
              </label>
              <span className="text-[11px] text-slate-400">
                {text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job description or job posting text here..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Match ATS</span>
          </button>
        </div>
      </div>
    </div>
  );
};

