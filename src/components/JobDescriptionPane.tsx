import React, { useRef, useState } from 'react';
import { JobDescription, KeywordMatch } from '../types/resume';
import { SAMPLE_JOB_DESCRIPTIONS } from '../data/samples';
import { extractTextFromFile, parseExtractedTextToJobDescription } from '../services/documentParser';
import { Briefcase, Building, Check, X, Sparkles, UploadCloud } from 'lucide-react';

interface Props {
  jobDescription: JobDescription;
  onChange: (jd: JobDescription) => void;
  keywordMatches: KeywordMatch[];
}

export const JobDescriptionPane: React.FC<Props> = ({
  jobDescription,
  onChange,
  keywordMatches
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleLoadSample = (key: string) => {
    const sample = SAMPLE_JOB_DESCRIPTIONS[key];
    if (!sample) return;
    onChange({
      ...jobDescription,
      title: sample.title,
      company: sample.company,
      rawText: sample.text
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const text = await extractTextFromFile(file);
      const parsed = parseExtractedTextToJobDescription(text, file.name);
      onChange({
        ...jobDescription,
        title: parsed.title,
        company: parsed.company,
        rawText: parsed.text
      });
    } catch (err: any) {
      alert(`Could not extract Job Description from file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const matchedCount = keywordMatches.filter(k => k.foundInResume).length;
  const totalCount = keywordMatches.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
      {/* Title & Preset Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Target Job Description</h3>
        </div>

        {/* Load Sample Selector */}
        <select
          onChange={(e) => handleLoadSample(e.target.value)}
          defaultValue=""
          className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer"
        >
          <option value="" disabled>Load Sample JD...</option>
          <option value="senior_fullstack_cloud">Senior Full Stack Cloud Engineer</option>
          <option value="ml_rag_engineer">Staff AI / RAG Systems Engineer</option>
          <option value="frontend_tech_lead">Lead Frontend Engineer (React)</option>
        </select>
      </div>

      {/* Upload Job Description Drag & Drop Zone */}
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
        className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer flex items-center justify-center gap-3 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/60'
            : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <div className="p-2 rounded-lg bg-white shadow-2xs text-indigo-600">
          <UploadCloud className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <span>{isUploading ? 'Extracting text from file...' : 'Upload or Drop Job Description'}</span>
            <span className="text-[10px] font-normal text-slate-400">PDF, DOCX, TXT</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Click to select or drag and drop your JD file here
          </p>
        </div>
      </div>

      {/* Role & Company Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Target Job Title
          </label>
          <div className="relative">
            <input
              type="text"
              value={jobDescription.title}
              onChange={(e) => onChange({ ...jobDescription, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
            />
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Target Company
          </label>
          <div className="relative">
            <input
              type="text"
              value={jobDescription.company}
              onChange={(e) => onChange({ ...jobDescription, company: e.target.value })}
              placeholder="e.g. Google, Stripe, Startup"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
            />
            <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Raw JD Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Job Description Text
          </label>
          <span className="text-[11px] text-slate-400">
            {jobDescription.rawText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <textarea
          rows={6}
          value={jobDescription.rawText}
          onChange={(e) => onChange({ ...jobDescription, rawText: e.target.value })}
          placeholder="Or paste full Job Description text here..."
          className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 placeholder:text-slate-400 resize-y leading-relaxed font-mono"
        />
      </div>

      {/* Extracted Key Terms Status */}
      {totalCount > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              Detected JD Keywords ({matchedCount}/{totalCount} matched)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {keywordMatches.map((item) => (
              <span
                key={item.keyword}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  item.foundInResume
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 opacity-75'
                }`}
              >
                {item.foundInResume ? (
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                ) : (
                  <X className="w-2.5 h-2.5 text-slate-400" />
                )}
                <span>{item.keyword}</span>
                {item.frequencyInJob > 1 && (
                  <span className="text-[9px] px-1 bg-white/60 rounded font-semibold">
                    {item.frequencyInJob}x
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
