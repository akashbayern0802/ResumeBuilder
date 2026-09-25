import React, { useRef, useState, useEffect } from 'react';
import { LLMConfig, ResumeTemplate, ResumeData, LLMProviderType } from '../types/resume';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from '../data/samples';
import { exportResumeToMarkdown, downloadFile, extractTextFromFile, parseExtractedTextToResume } from '../services/documentParser';
import { getProviderApiKey } from '../services/llmService';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Upload,
  Layers,
  Settings,
  Briefcase,
  Bot,
  Zap,
  Cpu,
  Server,
  ShieldCheck,
  ChevronDown,
  Check,
  Cloud,
  CreditCard
} from 'lucide-react';

interface Props {
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  llmConfig: LLMConfig;
  onOpenSettings: () => void;
  onQuickSelectProvider?: (provider: LLMProviderType) => void;
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  onLoadJobDescription: (title: string, company: string, text: string) => void;
  onOpenJdModal: () => void;
  onOpenResumeModal: () => void;
  onOpenSubscriptions: () => void;
  onPrint: () => void;
  isDownloadingPdf?: boolean;
}

export const Header: React.FC<Props> = ({
  template,
  onTemplateChange,
  llmConfig,
  onOpenSettings,
  onQuickSelectProvider,
  resume,
  onResumeChange,
  onLoadJobDescription,
  onOpenJdModal,
  onOpenResumeModal,
  onOpenSubscriptions,
  onPrint,
  isDownloadingPdf
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProviderInfo = (p: LLMProviderType, modelName: string) => {
    const hasKey = p === 'offline' || p === 'ollama' || Boolean(getProviderApiKey(p));
    switch (p) {
      case 'anthropic':
        return {
          name: 'Claude',
          detail: hasKey ? modelName.replace('-latest', '').replace('claude-', '') : 'No Key (Offline Fallback)',
          icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
          badgeColor: hasKey ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-900 bg-amber-100 border-amber-300'
        };
      case 'openai':
        return {
          name: 'GPT',
          detail: hasKey ? modelName : 'No Key (Offline Fallback)',
          icon: <Bot className="w-3.5 h-3.5 text-emerald-600" />,
          badgeColor: hasKey ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-amber-900 bg-amber-100 border-amber-300'
        };
      case 'gemini':
        return {
          name: 'Gemini',
          detail: hasKey ? modelName.replace('gemini-', '') : 'No Key (Offline Fallback)',
          icon: <Sparkles className="w-3.5 h-3.5 text-primary-600" />,
          badgeColor: hasKey ? 'text-primary-800 bg-primary-50 border-primary-200' : 'text-amber-900 bg-amber-100 border-amber-300'
        };
      case 'groq':
        return {
          name: 'Groq',
          detail: hasKey ? 'LPU Cloud' : 'No Key (Offline Fallback)',
          icon: <Cpu className="w-3.5 h-3.5 text-orange-600" />,
          badgeColor: hasKey ? 'text-orange-800 bg-orange-50 border-orange-200' : 'text-amber-900 bg-amber-100 border-amber-300'
        };
      case 'ollama':
        return {
          name: 'Ollama',
          detail: 'Local',
          icon: <Server className="w-3.5 h-3.5 text-purple-600" />,
          badgeColor: 'text-purple-800 bg-purple-50 border-purple-200'
        };
      case 'bedrock':
        return {
          name: 'Bedrock',
          detail: hasKey ? modelName : 'No Key (Offline Fallback)',
          icon: <Cloud className="w-3.5 h-3.5 text-orange-600" />,
          badgeColor: hasKey ? 'text-orange-900 bg-orange-50 border-orange-200' : 'text-amber-900 bg-amber-100 border-amber-300'
        };
      default:
        return {
          name: 'Offline NLP',
          detail: 'Zero Cost',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
          badgeColor: 'text-slate-800 bg-slate-50 border-slate-200'
        };
    }
  };

  const currentProviderInfo = getProviderInfo(llmConfig.provider, llmConfig.model);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        onResumeChange(parsed);
      } else {
        const text = await extractTextFromFile(file);
        const parsedResume = parseExtractedTextToResume(text, file.name);
        onResumeChange(parsedResume);
      }
    } catch (err: any) {
      alert(`Could not parse file "${file.name}": ${err.message || 'Unknown error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportJson = () => {
    downloadFile(JSON.stringify(resume, null, 2), `${resume.fullName.replace(/\s+/g, '_')}_Resume.json`, 'application/json');
  };

  const handleExportMarkdown = () => {
    const md = exportResumeToMarkdown(resume);
    downloadFile(md, `${resume.fullName.replace(/\s+/g, '_')}_Resume.md`, 'text/markdown');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ResumeAlign</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                  ATS Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Tailor your resume to any Job Description with AI</p>
            </div>
          </div>

          {/* Quick Preset Pickers */}
          <div className="hidden md:flex items-center gap-2">
            {/* Sample Resume Dropdown */}
            <div className="flex items-center text-xs bg-slate-100/80 rounded-lg p-1 border border-slate-200/80">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Sample:
              </span>
              <button
                type="button"
                onClick={() => onResumeChange(SAMPLE_RESUMES.akash_bhattacharya)}
                className="px-2 py-1 rounded hover:bg-white text-indigo-700 font-bold transition-colors"
                title="Load Akash Bhattacharya (Product / Project Manager) Resume"
              >
                Akash (Lead PM)
              </button>
              <button
                type="button"
                onClick={() => onResumeChange(SAMPLE_RESUMES.software_engineer)}
                className="px-2 py-1 rounded hover:bg-white text-slate-700 font-medium transition-colors"
                title="Load Full Stack Engineer Sample"
              >
                Full Stack
              </button>
            </div>

            {/* Sample Job Description Dropdown */}
            <div className="flex items-center text-xs bg-slate-100/80 rounded-lg p-1 border border-slate-200/80">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Target JD:
              </span>
              <button
                type="button"
                onClick={() => {
                  const jd = SAMPLE_JOB_DESCRIPTIONS.director_fintech_product;
                  onLoadJobDescription(jd.title, jd.company, jd.text);
                }}
                className="px-2 py-1 rounded hover:bg-white text-indigo-700 font-bold transition-colors"
                title="Load Director / Lead Product Manager - FinTech & Banking"
              >
                FinTech PM
              </button>
              <button
                type="button"
                onClick={() => {
                  const jd = SAMPLE_JOB_DESCRIPTIONS.senior_fullstack_cloud;
                  onLoadJobDescription(jd.title, jd.company, jd.text);
                }}
                className="px-2 py-1 rounded hover:bg-white text-slate-700 font-medium transition-colors"
              >
                Cloud Eng
              </button>
            </div>
          </div>

          {/* Right Actions: AI Provider Badge, Template, Export */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Provider Quick Switcher & Settings */}
            <div className="relative" ref={engineDropdownRef}>
              <button
                type="button"
                onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-2xs ${currentProviderInfo.badgeColor} hover:brightness-95`}
                title="Switch AI engine or configure API keys"
              >
                {currentProviderInfo.icon}
                <span className="hidden sm:inline font-normal text-slate-500">AI:</span>
                <span className="font-bold">{currentProviderInfo.name}</span>
                <span className="hidden md:inline text-[10px] opacity-75 font-mono">({currentProviderInfo.detail})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ml-0.5 ${isEngineDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEngineDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Select AI Engine</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEngineDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Configure
                    </button>
                  </div>

                  <div className="py-1">
                    {/* Anthropic Claude */}
                    {(() => {
                      const hasAnthropicKey = Boolean(getProviderApiKey('anthropic'));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectProvider?.('anthropic');
                            setIsEngineDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-amber-50 text-amber-600">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">Anthropic Claude</span>
                                {hasAnthropicKey ? (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Live API</span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">No Key (Fallback)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">Claude 3.5 Sonnet, 3.7, Haiku</div>
                            </div>
                          </div>
                          {llmConfig.provider === 'anthropic' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })()}

                    {/* OpenAI GPT */}
                    {(() => {
                      const hasOpenAiKey = Boolean(getProviderApiKey('openai'));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectProvider?.('openai');
                            setIsEngineDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">OpenAI (GPT)</span>
                                {hasOpenAiKey ? (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Live API</span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">No Key (Fallback)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">gpt-4o-mini, gpt-4o, o3-mini</div>
                            </div>
                          </div>
                          {llmConfig.provider === 'openai' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })()}

                    {/* Google Gemini */}
                    {(() => {
                      const hasGeminiKey = Boolean(getProviderApiKey('gemini'));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectProvider?.('gemini');
                            setIsEngineDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-blue-50 text-primary-600">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">Google Gemini</span>
                                {hasGeminiKey ? (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Live API</span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">No Key (Fallback)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">gemini-2.5-flash, gemini-3.8</div>
                            </div>
                          </div>
                          {llmConfig.provider === 'gemini' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })()}

                    {/* Groq Cloud */}
                    {(() => {
                      const hasGroqKey = Boolean(getProviderApiKey('groq'));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectProvider?.('groq');
                            setIsEngineDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-orange-50 text-orange-600">
                              <Cpu className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">Groq Cloud</span>
                                {hasGroqKey ? (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Live API</span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">No Key (Fallback)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">Llama 3.3 70B (High-Speed LPU)</div>
                            </div>
                          </div>
                          {llmConfig.provider === 'groq' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })()}

                    {/* Local Ollama */}
                    <button
                      type="button"
                      onClick={() => {
                        onQuickSelectProvider?.('ollama');
                        setIsEngineDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-purple-50 text-purple-600">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">Local Ollama</span>
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Local</span>
                          </div>
                          <div className="text-[10px] text-slate-400">DeepSeek / Llama3 (100% Local)</div>
                        </div>
                      </div>
                      {llmConfig.provider === 'ollama' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>

                    {/* Amazon Bedrock Mantle */}
                    {(() => {
                      const hasBedrockKey = Boolean(getProviderApiKey('bedrock'));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectProvider?.('bedrock');
                            setIsEngineDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-orange-50 text-orange-600">
                              <Cloud className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">Bedrock (Mantle)</span>
                                {hasBedrockKey ? (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Live API</span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">No Key (Fallback)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">GPT-5.6 • Claude Opus 5 • Dual Protocol</div>
                            </div>
                          </div>
                          {llmConfig.provider === 'bedrock' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })()}

                    {/* Built-in Offline */}
                    <button
                      type="button"
                      onClick={() => {
                        onQuickSelectProvider?.('offline');
                        setIsEngineDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">Built-in Offline</span>
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">100% Free</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Zero Cost • Heuristics • Private</div>
                        </div>
                      </div>
                      {llmConfig.provider === 'offline' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-2 bg-slate-50/70 rounded-b-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEngineDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Configure Keys & Models...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Template Selector */}
            <div className="hidden lg:flex items-center">
              <select
                value={template}
                onChange={(e) => onTemplateChange(e.target.value as ResumeTemplate)}
                className="text-xs bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium shadow-2xs"
              >
                <option value="naukri">🇮🇳 Naukri & Indian Corporate ATS</option>
                <option value="executive">👔 Executive Two-Column (Consulting)</option>
                <option value="harvard">🏛️ Harvard ATS (Classic)</option>
                <option value="modern">💼 Modern Professional</option>
                <option value="wallstreet">📈 Wall Street / Banking (WSO)</option>
                <option value="tech">⚡ Silicon Valley Tech</option>
                <option value="minimalist">📄 Minimalist Clean</option>
              </select>
            </div>

            {/* Resume Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.json,.md"
              className="hidden"
            />
            <button
              type="button"
              onClick={onOpenResumeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Upload or paste your resume in PDF, DOCX, TXT, or JSON format"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Resume</span>
            </button>

            {/* Upload or Paste Job Description Button */}
            <button
              type="button"
              onClick={onOpenJdModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Upload or paste your target Job Description (PDF, DOCX, TXT)"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Upload / Paste JD</span>
            </button>

            {/* Subscription Tracker */}
            <button
              type="button"
              onClick={onOpenSubscriptions}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 hover:text-fuchsia-800 bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Manage monthly subscriptions"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscriptions</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>MD</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              {/* Direct PDF Download CTA */}
              <button
                type="button"
                onClick={onPrint}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                title="Download ATS-compliant PDF directly to your device"
              >
                {isDownloadingPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

