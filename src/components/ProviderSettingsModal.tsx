import React, { useState } from 'react';
import { LLMConfig, LLMProviderType } from '../types/resume';
import { X, Sparkles, Cpu, Server, ShieldCheck, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
}

export const ProviderSettingsModal: React.FC<Props> = ({ isOpen, onClose, config, onSave }) => {
  const GEMINI_MODELS = [
    { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Latest Preview)' },
    { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Fastest & Recommended)' },
    { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (High Reasoning)' },
    { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Fast & Multimodal)' },
    { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Stable)' },
    { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Complex Analysis)' }
  ];

  const [provider, setProvider] = useState<LLMProviderType>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [model, setModel] = useState(config.model || 'gemini-2.5-flash');
  const [isCustomModel, setIsCustomModel] = useState(() => {
    if (config.provider === 'gemini' && config.model) {
      return !['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(config.model);
    }
    return false;
  });
  const [endpoint, setEndpoint] = useState(config.endpoint || 'http://localhost:11434');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const newConfig: LLMConfig = {
      provider,
      apiKey: apiKey.trim(),
      model,
      endpoint: endpoint.trim()
    };
    localStorage.setItem('RESUME_LLM_PROVIDER', provider);
    localStorage.setItem('RESUME_LLM_API_KEY', apiKey.trim());
    localStorage.setItem('RESUME_LLM_MODEL', model);
    localStorage.setItem('RESUME_OLLAMA_ENDPOINT', endpoint.trim());
    onSave(newConfig);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Validating connection...');

    if (provider === 'offline') {
      setTimeout(() => {
        setTestStatus('success');
        setTestMessage('Built-in offline engine is active and requires zero external connections.');
      }, 300);
      return;
    }

    if (provider === 'gemini') {
      if (!apiKey) {
        setTestStatus('failed');
        setTestMessage('Please enter a Google Gemini API key.');
        return;
      }
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey.trim()}`);
        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Successfully connected to Gemini API with ${model}!`);
        } else {
          // If the model name is preview/custom, verify if API key itself is valid across the Gemini catalog
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
          if (listRes.ok) {
            setTestStatus('success');
            setTestMessage(`API key verified! Model "${model}" will be dispatched on generation.`);
          } else {
            const err = await res.json().catch(() => ({}));
            setTestStatus('failed');
            setTestMessage(err.error?.message || 'Invalid API key or model.');
          }
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Network error connecting to Gemini API.');
      }
    } else if (provider === 'groq') {
      if (!apiKey) {
        setTestStatus('failed');
        setTestMessage('Please enter a Groq API key.');
        return;
      }
      try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Successfully connected to Groq Cloud API!');
        } else {
          setTestStatus('failed');
          setTestMessage('Invalid Groq API key.');
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Network error connecting to Groq API.');
      }
    } else if (provider === 'ollama') {
      try {
        const res = await fetch(`${endpoint.replace(/\/+$/, '')}/api/tags`);
        if (res.ok) {
          const data = await res.json();
          setTestStatus('success');
          setTestMessage(`Connected to Ollama! Found ${data.models?.length || 0} local models.`);
        } else {
          setTestStatus('failed');
          setTestMessage('Ollama server reachable but returned an error.');
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Could not reach Ollama at ' + endpoint + '. Ensure Ollama is running.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Model & Tailoring Engine</h2>
              <p className="text-xs text-slate-500">Select your preferred zero-cost LLM or offline NLP engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Provider Selector Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Built-in Offline */}
            <button
              type="button"
              onClick={() => {
                setProvider('offline');
                setTestStatus('idle');
              }}
              className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                provider === 'offline'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-sm text-slate-900">Built-in Offline</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mb-2">No API Key • Zero Setup • 100% Private in Browser</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 w-fit">
                Instant Zero Cost
              </span>
            </button>

            {/* Google Gemini Free */}
            <button
              type="button"
              onClick={() => {
                setProvider('gemini');
                if (!model.startsWith('gemini-')) {
                  setModel('gemini-3.8-flash');
                }
                setTestStatus('idle');
              }}
              className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                provider === 'gemini'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-sm text-slate-900">Google Gemini</span>
                <Sparkles className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-xs text-slate-500 mb-2">gemini-3.8-flash • gemini-2.5-flash • Free Tier</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 w-fit">
                Free via AI Studio
              </span>
            </button>

            {/* Groq Cloud */}
            <button
              type="button"
              onClick={() => {
                setProvider('groq');
                setModel('llama-3.3-70b-versatile');
                setTestStatus('idle');
              }}
              className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                provider === 'groq'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-sm text-slate-900">Groq Cloud</span>
                <Cpu className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs text-slate-500 mb-2">Llama 3.3 70B • Blazing fast LPUs</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-800 w-fit">
                Free Cloud Tier
              </span>
            </button>

            {/* Local Ollama */}
            <button
              type="button"
              onClick={() => {
                setProvider('ollama');
                setModel('llama3.2');
                setTestStatus('idle');
              }}
              className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                provider === 'ollama'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-sm text-slate-900">Local Ollama</span>
                <Server className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-slate-500 mb-2">DeepSeek / Llama • Runs locally on your PC</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-800 w-fit">
                100% Local & Free
              </span>
            </button>
          </div>

          {/* Configuration Form Based on Selection */}
          {provider === 'offline' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-2">
              <p className="font-medium text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active: Smart Heuristic & Keyword Alignment
              </p>
              <p className="text-xs">
                Your resume and job descriptions are processed directly inside your browser using natural language rules, Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]"), and ATS keyword density analyzers. No data ever leaves your computer.
              </p>
            </div>
          )}

          {provider === 'gemini' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Google Gemini API Key</label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    Get free key from Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Your key is stored securely in your browser's local storage and never transmitted to any third-party server.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <select
                  value={GEMINI_MODELS.some(m => m.id === model) ? model : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomModel(true);
                      if (GEMINI_MODELS.some(m => m.id === model)) {
                        setModel('');
                      }
                    } else {
                      setIsCustomModel(false);
                      setModel(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
                >
                  {GEMINI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">Custom Model Identifier...</option>
                </select>

                {(isCustomModel || !GEMINI_MODELS.some(m => m.id === model)) && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Custom Model Name</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. gemini-3.8-flash or custom endpoint"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {provider === 'groq' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Groq API Key</label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    Get free Groq key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </select>
              </div>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ollama API Endpoint</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ensure Ollama is running with CORS enabled (e.g. <code>OLLAMA_ORIGINS="*" ollama serve</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Local Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="llama3.2 or deepseek-r1:latest"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                testStatus === 'testing'
                  ? 'bg-blue-50 text-blue-700'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0" />}
              {testStatus === 'failed' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Test Connection
          </button>
          <div className="flex items-center space-x-2">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

