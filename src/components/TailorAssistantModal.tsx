import React, { useState } from 'react';
import { TailoringResult, TailoredBulletDiff, LLMConfig } from '../types/resume';
import { X, Check, CheckCheck, Sparkles, ArrowRight, Lightbulb, Plus, Tag, ShieldCheck, AlertTriangle, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tailoringResult: TailoringResult | null;
  isLoading: boolean;
  onApplyBulletDiff: (diff: TailoredBulletDiff) => void;
  onApplyAllBullets: (diffs: TailoredBulletDiff[]) => void;
  onApplySummary: (summary: string) => void;
  onAddSkill: (skill: string) => void;
  llmConfig?: LLMConfig;
  onOpenSettings?: () => void;
}

export const TailorAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tailoringResult,
  isLoading,
  onApplyBulletDiff,
  onApplyAllBullets,
  onApplySummary,
  onAddSkill,
  llmConfig,
  onOpenSettings
}) => {
  const [acceptedDiffs, setAcceptedDiffs] = useState<{ [key: string]: boolean }>({});
  const [summaryApplied, setSummaryApplied] = useState(false);

  if (!isOpen) return null;

  const handleAcceptSingle = (diff: TailoredBulletDiff, key: string) => {
    onApplyBulletDiff(diff);
    setAcceptedDiffs(prev => ({ ...prev, [key]: true }));
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  const handleAcceptAll = () => {
    if (!tailoringResult) return;
    onApplyAllBullets(tailoringResult.bulletDiffs);
    const allAccepted: { [key: string]: boolean } = {};
    tailoringResult.bulletDiffs.forEach((_, idx) => {
      allAccepted[`diff-${idx}`] = true;
    });
    setAcceptedDiffs(allAccepted);
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
  };

  const handleApplySummary = () => {
    if (!tailoringResult?.tailoredSummary) return;
    onApplySummary(tailoringResult.tailoredSummary);
    setSummaryApplied(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-primary-600 to-indigo-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Tailoring Assistant & Diff Reviewer</h2>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>Review tailored bullet points, targeted summary, and incorporated keywords</span>
                {llmConfig && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Engine: {llmConfig.provider === 'openai' ? 'OpenAI GPT' : llmConfig.provider === 'anthropic' ? 'Anthropic Claude' : llmConfig.provider === 'gemini' ? 'Google Gemini' : llmConfig.provider === 'groq' ? 'Groq' : llmConfig.provider === 'ollama' ? 'Ollama' : 'Built-in Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && tailoringResult && tailoringResult.bulletDiffs.length > 0 && (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Accept All Changes</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <div className="font-semibold text-sm text-slate-800">
                Tailoring Experience with {llmConfig?.provider === 'anthropic' ? `Claude (${llmConfig.model})` : llmConfig?.provider === 'openai' ? `OpenAI (${llmConfig.model})` : llmConfig?.provider === 'gemini' ? `Gemini (${llmConfig.model})` : llmConfig?.provider === 'groq' ? `Groq (${llmConfig.model})` : llmConfig?.provider === 'ollama' ? `Local Ollama (${llmConfig.model})` : 'Offline Heuristic Engine'}...
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Aligning keywords, crafting action-oriented XYZ bullet points, and maximizing ATS match score.
              </p>
            </div>
          ) : tailoringResult ? (
            <>
              {/* Engine Execution Status Banner */}
              {tailoringResult.engineUsed?.isLive ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <span className="font-bold text-emerald-900">
                        Live Cloud API Executed: {tailoringResult.engineUsed.provider === 'openai' ? 'OpenAI GPT' : tailoringResult.engineUsed.provider === 'anthropic' ? 'Anthropic Claude' : tailoringResult.engineUsed.provider.toUpperCase()}
                      </span>
                      <span className="text-emerald-700 ml-1.5 font-mono text-[11px]">
                        [{tailoringResult.engineUsed.model}]
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live API
                  </span>
                </div>
              ) : (() => {
                const requestedProvider = tailoringResult.engineUsed?.requestedProvider || (llmConfig?.provider !== 'offline' ? llmConfig?.provider : undefined);
                const isFallback = Boolean(requestedProvider && requestedProvider !== 'offline');
                const providerLabel = requestedProvider === 'anthropic' ? 'Anthropic Claude'
                  : requestedProvider === 'openai' ? 'OpenAI GPT'
                  : requestedProvider === 'gemini' ? 'Google Gemini'
                  : requestedProvider === 'groq' ? 'Groq Cloud'
                  : requestedProvider === 'ollama' ? 'Local Ollama'
                  : requestedProvider || 'Cloud API';

                if (isFallback) {
                  return (
                    <div className="flex flex-col p-4 rounded-xl bg-amber-50/95 border-l-4 border-l-amber-500 border border-amber-200 text-xs shadow-xs space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                          <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-800 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <span>Offline Heuristic Engine Used (Cloud AI Fallback Active)</span>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                            API Inactive / Fallback
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            Offline NLP Active
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/90 rounded-lg border border-amber-200/80 text-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Requested Provider:</span>
                          <span className="font-bold text-slate-900">{providerLabel}</span>
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold text-rose-800">Reason for Fallback: </span>
                          <span>
                            {tailoringResult.engineUsed?.fallbackReason ||
                              'Cloud API key or API usage credits were unavailable. The application safely fell back to the built-in offline engine so tailoring was not interrupted.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-0.5 text-[11px] text-amber-900/90">
                        <span>
                          💡 <em>Your tailored bullets and summary below were successfully generated locally using the offline Google XYZ engine (100% free & private).</em>
                        </span>
                        {onOpenSettings && (
                          <button
                            type="button"
                            onClick={onOpenSettings}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 transition-colors shadow-2xs shrink-0 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Configure API Key & Credits</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          Built-in Offline Engine Active (100% Free & Private)
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {tailoringResult.engineUsed?.fallbackReason || 'Generated locally inside your browser with Google XYZ formula & ATS keywords.'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300 self-start sm:self-center shrink-0">
                      Local Offline
                    </span>
                  </div>
                );
              })()}

              {/* SECTION 1: TAILORED SUMMARY */}
              {tailoringResult.tailoredSummary && (
                <div className="bg-gradient-to-br from-primary-50/50 to-indigo-50/30 border border-primary-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      Suggested Targeted Executive Summary
                    </span>
                    <button
                      type="button"
                      onClick={handleApplySummary}
                      disabled={summaryApplied}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                        summaryApplied
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-2xs'
                      }`}
                    >
                      {summaryApplied ? 'Applied ✓' : 'Apply to Summary'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {tailoringResult.tailoredSummary}
                  </p>
                </div>
              )}

              {/* SECTION 2: BULLET POINT DIFFS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Experience Bullet Point Transformations ({tailoringResult.bulletDiffs.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Google XYZ Formula: Accomplished [X] by [Y] with [Z]</span>
                </div>

                <div className="space-y-4">
                  {tailoringResult.bulletDiffs.map((diff, idx) => {
                    const key = `diff-${idx}`;
                    const isAccepted = acceptedDiffs[key];

                    return (
                      <div
                        key={key}
                        className={`border rounded-xl p-4 transition-all ${
                          isAccepted
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Side by side or before/after */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {/* Original */}
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Original Bullet
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {diff.originalBullet}
                            </p>
                          </div>

                          {/* Suggested Tailored */}
                          <div className="bg-primary-50/40 p-3 rounded-lg border border-primary-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary-600" />
                              ATS Tailored Bullet
                            </span>
                            <p className="text-xs text-slate-900 leading-relaxed font-medium">
                              {diff.suggestedBullet}
                            </p>
                          </div>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-500 italic">
                              {diff.reasoning}
                            </span>
                            {diff.incorporatedKeywords && diff.incorporatedKeywords.length > 0 && (
                              <div className="flex items-center gap-1">
                                {diff.incorporatedKeywords.map(kw => (
                                  <span
                                    key={kw}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold"
                                  >
                                    <Tag className="w-2.5 h-2.5" /> +{kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            {isAccepted ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs px-2 py-1 bg-emerald-50 rounded-md">
                                <Check className="w-3.5 h-3.5" /> Accepted
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAcceptSingle(diff, key)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>Accept Modification</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: RECOMMENDED SKILLS TO ADD */}
              {tailoringResult.recommendedSkillsToAdd && tailoringResult.recommendedSkillsToAdd.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-600" />
                      Recommended High-Impact Skills from JD
                    </span>
                    <span className="text-[10px] text-slate-400">Click to append to resume skills</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tailoringResult.recommendedSkillsToAdd.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => onAddSkill(skill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-primary-400 hover:text-primary-700 transition-all cursor-pointer"
                      >
                        <span>{skill}</span>
                        <Plus className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: INTERVIEW PREP TIPS */}
              {tailoringResult.interviewTips && tailoringResult.interviewTips.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Targeted Interview Preparation Insights
                  </span>
                  <ul className="space-y-1 text-xs text-amber-950">
                    {tailoringResult.interviewTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click &ldquo;Tailor with AI&rdquo; to generate customized bullet point transformations.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-400">
            All accepted changes update your live resume editor and preview instantly.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};

