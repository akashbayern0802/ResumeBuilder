import React, { useState } from 'react';
import { LLMConfig, LLMProviderType } from '../types/resume';
import { X, Sparkles, Cpu, Server, ShieldCheck, ExternalLink, Check, AlertCircle, Bot, Zap, Cloud } from 'lucide-react';
import {
  getProviderApiKey,
  setProviderApiKey,
  getProviderModel,
  setProviderModel,
  BEDROCK_MANTLE_MODELS,
  getBedrockProject,
  setBedrockProject,
  getBedrockEndpoint,
  setBedrockEndpoint,
  resolveBedrockBaseUrl,
  isBedrockClaudeModel
} from '../services/llmService';

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

  const OPENAI_MODELS = [
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Fast, Efficient & Affordable)' },
    { id: 'gpt-4o', label: 'gpt-4o (High Intelligence & Multimodal Flagship)' },
    { id: 'o3-mini', label: 'o3-mini (Advanced STEM & Coding Reasoning)' },
    { id: 'o1', label: 'o1 (Full Reasoning Frontier Model)' },
    { id: 'o1-mini', label: 'o1-mini (Fast STEM Reasoning Model)' },
    { id: 'gpt-4-turbo', label: 'gpt-4-turbo (Legacy Frontier)' }
  ];

  const ANTHROPIC_MODELS = [
    { id: 'claude-3-5-sonnet-latest', label: 'claude-3-5-sonnet-latest (Recommended & Exceptional)' },
    { id: 'claude-3-7-sonnet-latest', label: 'claude-3-7-sonnet-latest (Latest Hybrid Reasoning)' },
    { id: 'claude-3-5-haiku-latest', label: 'claude-3-5-haiku-latest (Blazing Fast & Lightweight)' },
    { id: 'claude-3-opus-latest', label: 'claude-3-opus-latest (Maximum Depth & Opus Analysis)' },
    { id: 'claude-3-opus-20240229', label: 'claude-3-opus-20240229 (Opus Pinned Release)' }
  ];

  const [provider, setProvider] = useState<LLMProviderType>(config.provider);
  const [apiKey, setApiKey] = useState(() => config.apiKey || getProviderApiKey(config.provider));
  const [model, setModel] = useState(() => config.model || getProviderModel(config.provider));
  const [bedrockProject, setBedrockProjectState] = useState(() => config.project || getBedrockProject() || 'default');
  const [isCustomModel, setIsCustomModel] = useState(() => {
    if (config.provider === 'gemini' && config.model) {
      return !GEMINI_MODELS.some(m => m.id === config.model);
    }
    if (config.provider === 'openai' && config.model) {
      return !OPENAI_MODELS.some(m => m.id === config.model);
    }
    if (config.provider === 'anthropic' && config.model) {
      return !ANTHROPIC_MODELS.some(m => m.id === config.model);
    }
    if (config.provider === 'bedrock' && config.model) {
      return !BEDROCK_MANTLE_MODELS.some(m => m.id === config.model);
    }
    return false;
  });
  const [endpoint, setEndpoint] = useState(() => {
    if (config.provider === 'bedrock') {
      return config.endpoint || getBedrockEndpoint();
    }
    return config.endpoint || 'http://localhost:11434';
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSelectProvider = (newProvider: LLMProviderType) => {
    if (provider !== 'offline') {
      setProviderApiKey(provider, apiKey.trim());
      setProviderModel(provider, model.trim());
      if (provider === 'bedrock') {
        setBedrockProject(bedrockProject);
        setBedrockEndpoint(endpoint);
      }
    }
    setProvider(newProvider);
    setTestStatus('idle');
    setTestMessage('');

    if (newProvider === 'offline') {
      setApiKey('');
      setModel('offline');
      setIsCustomModel(false);
      return;
    }

    const nextKey = getProviderApiKey(newProvider);
    const nextModel = getProviderModel(newProvider);
    setApiKey(nextKey);
    setModel(nextModel);

    if (newProvider === 'gemini') {
      setIsCustomModel(!GEMINI_MODELS.some(m => m.id === nextModel));
    } else if (newProvider === 'openai') {
      setIsCustomModel(!OPENAI_MODELS.some(m => m.id === nextModel));
    } else if (newProvider === 'anthropic') {
      setIsCustomModel(!ANTHROPIC_MODELS.some(m => m.id === nextModel));
    } else if (newProvider === 'bedrock') {
      setIsCustomModel(!BEDROCK_MANTLE_MODELS.some(m => m.id === nextModel));
      setEndpoint(getBedrockEndpoint());
    } else {
      setIsCustomModel(false);
    }
  };

  const handleSave = () => {
    if (provider !== 'offline') {
      setProviderApiKey(provider, apiKey.trim());
      setProviderModel(provider, model.trim());
    }
    if (provider === 'bedrock') {
      setBedrockProject(bedrockProject);
      setBedrockEndpoint(endpoint);
    }
    const newConfig: LLMConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      endpoint: endpoint.trim(),
      project: bedrockProject.trim()
    };
    localStorage.setItem('RESUME_LLM_PROVIDER', provider);
    localStorage.setItem('RESUME_LLM_API_KEY', apiKey.trim());
    localStorage.setItem('RESUME_LLM_MODEL', model.trim());
    localStorage.setItem('RESUME_OLLAMA_ENDPOINT', endpoint.trim());
    localStorage.setItem('RESUME_BEDROCK_PROJECT', bedrockProject.trim());
    localStorage.setItem('RESUME_BEDROCK_ENDPOINT', endpoint.trim());
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
      if (!apiKey.trim()) {
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
            setTestMessage(err.error?.message || 'Invalid Gemini API key or model.');
          }
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Network error connecting to Gemini API.');
      }
    } else if (provider === 'groq') {
      if (!apiKey.trim()) {
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
    } else if (provider === 'openai') {
      if (!apiKey.trim()) {
        setTestStatus('failed');
        setTestMessage('Please enter an OpenAI API key.');
        return;
      }
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Successfully connected to OpenAI API! Model: ${model}`);
        } else {
          const err = await res.json().catch(() => ({}));
          setTestStatus('failed');
          setTestMessage(err.error?.message || 'Invalid OpenAI API key.');
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Network error connecting to OpenAI API.');
      }
    } else if (provider === 'anthropic') {
      if (!apiKey.trim()) {
        setTestStatus('failed');
        setTestMessage('Please enter an Anthropic API key.');
        return;
      }
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model || 'claude-3-5-sonnet-latest',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say OK' }]
          })
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Successfully connected to Anthropic Claude API! Model: ${model}`);
        } else {
          const err = await res.json().catch(() => ({}));
          setTestStatus('failed');
          setTestMessage(err.error?.message || 'Invalid Anthropic API key or credit balance exceeded.');
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage('Network error connecting to Anthropic API.');
      }
    } else if (provider === 'bedrock') {
      if (!apiKey.trim()) {
        setTestStatus('failed');
        setTestMessage('Please enter your Amazon Bedrock API key.');
        return;
      }
      try {
        const isClaude = isBedrockClaudeModel(model);
        const targetBase = resolveBedrockBaseUrl(endpoint);
        const projectHeader = bedrockProject.trim() || 'default';

        if (!isClaude) {
          const res = await fetch(`${targetBase}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey.trim()}`,
              'OpenAI-Project': projectHeader
            },
            body: JSON.stringify({
              model: model || 'gpt-5.6-luna',
              max_completion_tokens: 5,
              messages: [{ role: 'user', content: 'Say OK' }]
            })
          });
          if (res.ok) {
            setTestStatus('success');
            setTestMessage(`Successfully connected to Bedrock Mantle OpenAI endpoint! Model: ${model}`);
          } else {
            const err = await res.json().catch(() => ({}));
            setTestStatus('failed');
            setTestMessage(err.error?.message || `Bedrock Mantle returned HTTP ${res.status}: ${res.statusText}`);
          }
        } else {
          // IMPORTANT: AWS Bedrock Mantle requires ONLY 'x-api-key'. Do NOT include 'Authorization'!
          const res = await fetch(`${targetBase}/anthropic/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey.trim(),
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: model || 'anthropic.claude-haiku-4-5',
              max_tokens: 5,
              messages: [{ role: 'user', content: 'Say OK' }]
            })
          });
          if (res.ok) {
            setTestStatus('success');
            setTestMessage(`Successfully connected to Bedrock Mantle Anthropic endpoint! Model: ${model}`);
          } else {
            const err = await res.json().catch(() => ({}));
            setTestStatus('failed');
            setTestMessage(err.error?.message || `Bedrock Mantle returned HTTP ${res.status}: ${res.statusText}`);
          }
        }
      } catch (err: any) {
        setTestStatus('failed');
        setTestMessage(`Connection failed: ${err.message || 'Network error'}. Ensure local Vite server is running for CORS proxy.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-slate-200 flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Model & Tailoring Engine</h2>
              <p className="text-xs text-slate-500">Select your preferred zero-cost LLM, cloud AI, or offline NLP engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body — scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Provider Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Built-in Offline */}
            <button
              type="button"
              onClick={() => handleSelectProvider('offline')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'offline'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Built-in Offline</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">No API Key • Zero Setup • 100% Private in Browser</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 w-fit">
                Zero Cost
              </span>
            </button>

            {/* Google Gemini Free */}
            <button
              type="button"
              onClick={() => handleSelectProvider('gemini')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'gemini'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Google Gemini</span>
                <Sparkles className="w-4 h-4 text-primary-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">gemini-2.5-flash • gemini-3.8 • Free Tier</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 w-fit">
                Free via AI Studio
              </span>
            </button>

            {/* OpenAI (GPT) */}
            <button
              type="button"
              onClick={() => handleSelectProvider('openai')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'openai'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">OpenAI (GPT)</span>
                <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">gpt-4o-mini • gpt-4o • o3-mini • o1</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 w-fit">
                OpenAI API
              </span>
            </button>

            {/* Anthropic Claude */}
            <button
              type="button"
              onClick={() => handleSelectProvider('anthropic')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'anthropic'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Anthropic Claude</span>
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">Sonnet 3.5 • Claude 3.7 • Haiku</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 w-fit">
                Claude 3.5 / 3.7
              </span>
            </button>

            {/* Groq Cloud */}
            <button
              type="button"
              onClick={() => handleSelectProvider('groq')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'groq'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Groq Cloud</span>
                <Cpu className="w-4 h-4 text-orange-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">Llama 3.3 70B • Blazing fast LPUs</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-800 w-fit">
                Free Cloud Tier
              </span>
            </button>

            {/* Local Ollama */}
            <button
              type="button"
              onClick={() => handleSelectProvider('ollama')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'ollama'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Local Ollama</span>
                <Server className="w-4 h-4 text-purple-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">DeepSeek / Llama • Runs locally on PC</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-800 w-fit">
                100% Local Free
              </span>
            </button>

            {/* Amazon Bedrock Mantle */}
            <button
              type="button"
              onClick={() => handleSelectProvider('bedrock')}
              className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                provider === 'bedrock'
                  ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-xs text-slate-900">Bedrock (Mantle)</span>
                <Cloud className="w-4 h-4 text-orange-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">GPT-5.6 • Claude Opus 5 • Dual Protocol</p>
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-800 w-fit">
                AWS Bedrock
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

          {provider === 'openai' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">OpenAI API Key</label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    Get API key from OpenAI <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored securely in local browser storage. Requests are sent directly to OpenAI's API.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <select
                  value={OPENAI_MODELS.some(m => m.id === model) ? model : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomModel(true);
                      if (OPENAI_MODELS.some(m => m.id === model)) {
                        setModel('');
                      }
                    } else {
                      setIsCustomModel(false);
                      setModel(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
                >
                  {OPENAI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">Custom Model Identifier...</option>
                </select>

                {(isCustomModel || !OPENAI_MODELS.some(m => m.id === model)) && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Custom Model Name</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. gpt-4o or gpt-4o-mini"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {provider === 'anthropic' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Anthropic Claude API Key</label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    Get API key from Anthropic Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored securely in local browser storage. Connects directly using client-side direct browser access.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <select
                  value={ANTHROPIC_MODELS.some(m => m.id === model) ? model : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomModel(true);
                      if (ANTHROPIC_MODELS.some(m => m.id === model)) {
                        setModel('');
                      }
                    } else {
                      setIsCustomModel(false);
                      setModel(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
                >
                  {ANTHROPIC_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">Custom Model Identifier...</option>
                </select>

                {(isCustomModel || !ANTHROPIC_MODELS.some(m => m.id === model)) && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Custom Model Name</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. claude-3-opus-latest or claude-3-5-sonnet-latest"
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

          {provider === 'bedrock' && (
            <div className="space-y-4">
              {/* Endpoint Base URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Bedrock Mantle Endpoint Base URL</label>
                  <span className="text-[10px] text-orange-700 font-mono font-semibold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">AWS us-east-1</span>
                </div>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://bedrock-mantle.us-east-1.api.aws"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When running locally, requests route via Vite proxy (<code className="bg-slate-100 px-1 py-0.5 rounded">/api/bedrock-mantle</code>) to prevent browser CORS restrictions.
                </p>
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Amazon Bedrock API Key / Bearer Token</label>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="bedrock-api-..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored securely in your local browser storage. Passed as <code className="bg-slate-100 px-1 py-0.5 rounded">x-api-key</code> for Claude models or <code className="bg-slate-100 px-1 py-0.5 rounded">Authorization: Bearer</code> for GPT models.
                </p>
              </div>

              {/* Project Scope Header */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Scope (OpenAI-Project Header)</label>
                <input
                  type="text"
                  value={bedrockProject}
                  onChange={(e) => setBedrockProjectState(e.target.value)}
                  placeholder="default"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Dispatched as the <code className="bg-slate-100 px-1 py-0.5 rounded">OpenAI-Project</code> header for GPT models (defaults to <code className="bg-slate-100 px-1 py-0.5 rounded">default</code>).
                </p>
              </div>

              {/* Model Selection with optgroups */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Selection</label>
                <select
                  value={BEDROCK_MANTLE_MODELS.some(m => m.id === model) ? model : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomModel(true);
                      if (BEDROCK_MANTLE_MODELS.some(m => m.id === model)) {
                        setModel('');
                      }
                    } else {
                      setIsCustomModel(false);
                      setModel(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
                >
                  <optgroup label="OpenAI GPT Models (via /v1/chat/completions)">
                    {BEDROCK_MANTLE_MODELS.filter(m => m.category === 'OpenAI GPT').map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Anthropic Claude Models (via /anthropic/v1/messages)">
                    {BEDROCK_MANTLE_MODELS.filter(m => m.category === 'Anthropic Claude').map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </optgroup>
                  <option value="custom">Custom Model ID...</option>
                </select>

                {(isCustomModel || !BEDROCK_MANTLE_MODELS.some(m => m.id === model)) && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Custom Model Name / ID</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. gpt-5.6-luna or claude-opus-5"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                  </div>
                )}
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 rounded-b-2xl">
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

