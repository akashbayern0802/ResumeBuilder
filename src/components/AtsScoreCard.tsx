import React from 'react';
import { AtsAnalysisResult, LLMConfig } from '../types/resume';
import { Sparkles, Plus, AlertTriangle, CheckCircle2, TrendingUp, Zap, Target } from 'lucide-react';

interface Props {
  analysis: AtsAnalysisResult;
  onAddSkill: (skill: string) => void;
  onOpenTailorModal: () => void;
  isTailoring: boolean;
  llmConfig?: LLMConfig;
  onOpenSettings?: () => void;
}

export const AtsScoreCard: React.FC<Props> = ({
  analysis,
  onAddSkill,
  onOpenTailorModal,
  isTailoring,
  llmConfig,
  onOpenSettings
}) => {
  const {
    overallScore,
    keywordMatchScore,
    experienceScore,
    metricScore,
    actionVerbScore,
    missingCriticalKeywords,
    missingNiceToHaveKeywords,
    suggestions,
    detectedSeniority
  } = analysis;

  // Determine color theme based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bgLight: 'bg-emerald-50' };
    if (score >= 65) return { stroke: '#0284c7', bg: 'bg-primary-600', text: 'text-primary-700', border: 'border-primary-200', bgLight: 'bg-primary-50' };
    if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', bgLight: 'bg-amber-50' };
    return { stroke: '#ef4444', bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', bgLight: 'bg-rose-50' };
  };

  const colors = getScoreColor(overallScore);

  // SVG Circular Gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-5">
      {/* Top Header: Score & Gauge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base tracking-tight">ATS Match Score</h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Level: {detectedSeniority}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time keyword & ATS algorithm alignment</p>
        </div>

        {/* Tailor CTA Button & Active Engine */}
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={onOpenTailorModal}
            disabled={isTailoring}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{isTailoring ? 'Optimizing...' : 'Tailor with AI'}</span>
          </button>
          {llmConfig && (
            (() => {
              const isMissingKey = Boolean(llmConfig.provider !== 'offline' && llmConfig.provider !== 'ollama' && !llmConfig.apiKey);
              const providerName = llmConfig.provider === 'openai' ? 'OpenAI GPT' : llmConfig.provider === 'anthropic' ? 'Claude' : llmConfig.provider === 'gemini' ? 'Gemini' : llmConfig.provider === 'groq' ? 'Groq' : llmConfig.provider === 'ollama' ? 'Ollama' : llmConfig.provider === 'bedrock' ? 'Bedrock' : 'Offline';

              if (isMissingKey) {
                return (
                  <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{providerName}: No Key (Offline Fallback)</span>
                    {onOpenSettings && (
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="underline font-bold text-amber-900 hover:text-amber-950 ml-0.5 cursor-pointer"
                      >
                        Add Key
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <span className="text-[10px] text-slate-400 font-medium">
                  via <span className="font-semibold text-slate-600">{providerName}</span>
                </span>
              );
            })()
          )}
        </div>
      </div>

      {/* Radial Score Gauge + Submetrics */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
        {/* Circle Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={colors.stroke}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 leading-none">{overallScore}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">OUT OF 100</span>
          </div>
        </div>

        {/* 4 Score Breakdown Bars */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Target className="w-3 h-3 text-primary-500" /> Keywords
              </span>
              <span className="font-semibold text-slate-800">{keywordMatchScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${keywordMatchScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-indigo-500" /> Relevance
              </span>
              <span className="font-semibold text-slate-800">{experienceScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${experienceScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Metrics Density
              </span>
              <span className="font-semibold text-slate-800">{metricScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${metricScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Action Verbs
              </span>
              <span className="font-semibold text-slate-800">{actionVerbScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${actionVerbScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Missing Critical Keywords Pill Cloud */}
      {missingCriticalKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Missing High-Priority Keywords ({missingCriticalKeywords.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to instantly add</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {missingCriticalKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onAddSkill(kw)}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
                title={`Click to add "${kw}" to Technical Skills`}
              >
                <span>{kw}</span>
                <Plus className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
              </button>
            ))}

            {missingNiceToHaveKeywords.slice(0, 4).map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onAddSkill(kw)}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                title={`Nice to have: Add "${kw}"`}
              >
                <span>{kw}</span>
                <Plus className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-700 block mb-1.5">Quick ATS Tips:</span>
          <ul className="space-y-1">
            {suggestions.slice(0, 3).map((sug, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="text-primary-600 font-bold">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

