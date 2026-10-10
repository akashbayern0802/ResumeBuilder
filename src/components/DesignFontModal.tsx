import React, { useState, useRef } from 'react';
import { ResumeData, ResumeDesignSettings } from '../types/resume';
import {
  X,
  Check,
  Type,
  Palette,
  AlignLeft,
  Camera,
  Trash2,
  Upload,
  RotateCcw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
}

const DEFAULT_DESIGN: ResumeDesignSettings = {
  fontFamily: 'inter',
  fontSize: 'normal',
  lineSpacing: 'normal',
  primaryColor: '#0f172a',
  showPhoto: false
};

const COLOR_PRESETS = [
  { name: 'Slate Black', value: '#0f172a', bgClass: 'bg-slate-900' },
  { name: 'Executive Navy', value: '#1e3a8a', bgClass: 'bg-blue-900' },
  { name: 'Modern Indigo', value: '#4338ca', bgClass: 'bg-indigo-700' },
  { name: 'Emerald Forest', value: '#065f46', bgClass: 'bg-emerald-800' },
  { name: 'Deep Burgundy', value: '#831843', bgClass: 'bg-pink-900' },
  { name: 'Charcoal Minimal', value: '#27272a', bgClass: 'bg-zinc-800' }
];

const FONT_OPTIONS: { id: ResumeDesignSettings['fontFamily']; label: string; sample: string; cssFamily: string }[] = [
  { id: 'inter', label: 'Inter (Modern ATS Standard)', sample: 'Clean, legible, and engineered for high scan precision', cssFamily: "'Inter', sans-serif" },
  { id: 'roboto', label: 'Roboto (Clean Tech)', sample: 'Crisp geometric clarity favored by tech & engineering recruiters', cssFamily: "'Roboto', sans-serif" },
  { id: 'merriweather', label: 'Merriweather (Executive Serif)', sample: 'Distinguished editorial elegance for management & consulting', cssFamily: "'Merriweather', serif" },
  { id: 'garamond', label: 'Garamond (Ivy League Classical)', sample: 'Timeless literary sophistication for legal, academia & finance', cssFamily: "'Garamond', serif" },
  { id: 'sans', label: 'System Clean (Fast Native)', sample: 'Universal high-contrast native OS sans-serif', cssFamily: "system-ui, sans-serif" }
];

export const DesignFontModal: React.FC<Props> = ({
  isOpen,
  onClose,
  resume,
  onChange
}) => {
  const currentDesign = resume.design || DEFAULT_DESIGN;

  const [design, setDesign] = useState<ResumeDesignSettings>(currentDesign);
  const [photoUrl, setPhotoUrl] = useState<string>(resume.photoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPhotoUrl(url);
      setDesign(d => ({ ...d, showPhoto: true }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setDesign(d => ({ ...d, showPhoto: false }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApply = () => {
    onChange({
      ...resume,
      photoUrl: photoUrl || undefined,
      design
    });
    onClose();
  };

  const handleReset = () => {
    setDesign(DEFAULT_DESIGN);
    setPhotoUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Design & Typography Settings</h2>
              <p className="text-xs text-slate-500">Fine-tune fonts, sizing, colors, and candidate photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
          
          {/* 1. Typography / Font Family */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-500" />
              Font Family
            </label>
            <div className="space-y-2">
              {FONT_OPTIONS.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setDesign(d => ({ ...d, fontFamily: f.id }))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    design.fontFamily === f.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900" style={{ fontFamily: f.cssFamily }}>
                        {f.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: f.cssFamily }}>
                      {f.sample}
                    </p>
                  </div>
                  {design.fontFamily === f.id && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Font Size & Page Fit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-indigo-500" />
              Font Size & Page Density
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'compact', label: 'Compact (12px)', desc: 'Maximizes content per page' },
                { id: 'normal', label: 'Balanced (13px)', desc: 'Standard 2-page sweet spot' },
                { id: 'relaxed', label: 'Spacious (14px)', desc: 'Larger text & relaxed flow' }
              ].map((sizeOpt) => (
                <button
                  key={sizeOpt.id}
                  type="button"
                  onClick={() => setDesign(d => ({ ...d, fontSize: sizeOpt.id as any }))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    design.fontSize === sizeOpt.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{sizeOpt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{sizeOpt.desc}</div>
                </button>
              ))}
            </div>

            {/* Quick 2-Page Fit Preset */}
            <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  Auto-Fit to Exactly 2 Pages
                </span>
                <p className="text-[11px] text-indigo-800/80 mt-0.5">
                  Automatically calibrates font size and compact spacing so your complete career history ends cleanly on Page 2.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDesign(d => ({ ...d, fontSize: 'compact', lineSpacing: 'tight', fitTwoPages: true }))}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                Apply 2-Page Fit
              </button>
            </div>
          </div>

          {/* 3. Primary Accent Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              Header Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setDesign(d => ({ ...d, primaryColor: color.value }))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    design.primaryColor === color.value
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${color.bgClass}`} />
                  <span className="text-slate-800">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Candidate Profile Photo (Enhancv Style) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Candidate Photo (Optional)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!design.showPhoto}
                  onChange={(e) => setDesign(d => ({ ...d, showPhoto: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {photoUrl ? (
                  <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Recommended: Square professional headshot (JPG or PNG)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
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
              <span>Save Design</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
