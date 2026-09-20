import React, { useRef, useState } from 'react';
import { ResumeData } from '../types/resume';
import { extractTextFromFile, parseExtractedTextToResume } from '../services/documentParser';
import { X, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resume: ResumeData) => void;
}

export const ResumeUploadModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rawText, setRawText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        onSave(parsed);
        setSuccessMessage(`Successfully imported JSON resume: ${file.name}`);
        setTimeout(onClose, 800);
      } else {
        const text = await extractTextFromFile(file);
        setRawText(text);
        const parsed = parseExtractedTextToResume(text, file.name);
        onSave(parsed);
        setSuccessMessage(`Successfully extracted ${text.split('\n').length} lines from ${file.name}!`);
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to read file. Please ensure it has selectable text or try pasting below.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleParsePastedText = () => {
    if (!rawText.trim()) {
      setErrorMessage('Please paste your resume text first.');
      return;
    }
    try {
      const parsed = parseExtractedTextToResume(rawText);
      onSave(parsed);
      setSuccessMessage('Successfully parsed and imported your resume!');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing text.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload or Import Resume</h2>
              <p className="text-xs text-slate-500">Upload your existing resume in PDF, DOCX, TXT, or JSON format</p>
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
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleProcessFile(file);
            }}
            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.json,application/json,.md"
            className="hidden"
          />

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
              isDragOver
                ? 'border-primary-600 bg-primary-50'
                : 'border-slate-300 hover:border-primary-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="p-3 rounded-full bg-white shadow-xs text-primary-600">
              <UploadCloud className={`w-7 h-7 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-800">
                {isUploading ? 'Extracting Resume Data from PDF...' : 'Click to Browse or Drag & Drop Resume File'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Text (.txt)</strong>, or <strong>JSON</strong>
              </p>
            </div>
          </div>

          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or paste resume text directly
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Raw Text Fallback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Resume Text (Optional fallback)
              </label>
              <span className="text-[11px] text-slate-400">
                {rawText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your resume contents here (experience, skills, summary, education)..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-mono leading-relaxed resize-y"
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
            onClick={handleParsePastedText}
            disabled={!rawText.trim() || isUploading}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Parse & Load Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};

