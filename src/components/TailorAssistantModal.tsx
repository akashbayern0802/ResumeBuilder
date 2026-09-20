import React, { useState } from 'react';
import { TailoringResult, TailoredBulletDiff } from '../types/resume';
import { X, Check, CheckCheck, Sparkles, ArrowRight, Lightbulb, Plus, Tag } from 'lucide-react';
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
}

export const TailorAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tailoringResult,
  isLoading,
  onApplyBulletDiff,
  onApplyAllBullets,
  onApplySummary,
  onAddSkill
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
              <p className="text-xs text-slate-500">
                Review tailored bullet points, targeted summary, and incorporated keywords
              </p>
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
                Analyzing Job Description & Tailoring Experience...
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Aligning keywords, crafting action-oriented XYZ bullet points, and maximizing ATS match score.
              </p>
            </div>
          ) : tailoringResult ? (
            <>
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

