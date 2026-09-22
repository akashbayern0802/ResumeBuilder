import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, JobDescription, TailoringResult, TailoredBulletDiff, LLMConfig, LLMProviderType, AtsAnalysisResult } from '../types/resume';

export function getProviderApiKey(provider: LLMProviderType): string {
  if (provider === 'offline') return '';
  return (
    localStorage.getItem(`RESUME_${provider.toUpperCase()}_API_KEY`) ||
    localStorage.getItem('RESUME_LLM_API_KEY') ||
    ''
  );
}

export function setProviderApiKey(provider: LLMProviderType, key: string): void {
  if (provider === 'offline') return;
  localStorage.setItem(`RESUME_${provider.toUpperCase()}_API_KEY`, key.trim());
  localStorage.setItem('RESUME_LLM_API_KEY', key.trim());
}

export function getProviderModel(provider: LLMProviderType): string {
  const saved = localStorage.getItem(`RESUME_${provider.toUpperCase()}_MODEL`);
  if (saved) return saved;
  switch (provider) {
    case 'gemini': return 'gemini-2.5-flash';
    case 'openai': return 'gpt-4o-mini';
    case 'anthropic': return 'claude-3-5-sonnet-latest';
    case 'groq': return 'llama-3.3-70b-versatile';
    case 'ollama': return 'llama3.2';
    case 'bedrock': return 'gpt-5.6-luna';
    default: return 'offline';
  }
}

export function setProviderModel(provider: LLMProviderType, model: string): void {
  localStorage.setItem(`RESUME_${provider.toUpperCase()}_MODEL`, model);
  localStorage.setItem('RESUME_LLM_MODEL', model);
}

export function getProviderDisplayName(provider: LLMProviderType): string {
  switch (provider) {
    case 'openai': return 'OpenAI (GPT)';
    case 'anthropic': return 'Anthropic Claude';
    case 'gemini': return 'Google Gemini';
    case 'groq': return 'Groq Cloud';
    case 'ollama': return 'Local Ollama';
    case 'bedrock': return 'Amazon Bedrock (Mantle)';
    case 'offline': return 'Built-in Offline';
    default: return provider;
  }
}

export function getBedrockProject(): string {
  return localStorage.getItem('RESUME_BEDROCK_PROJECT') || 'default';
}

export function setBedrockProject(project: string): void {
  localStorage.setItem('RESUME_BEDROCK_PROJECT', (project || 'default').trim());
}

export function getBedrockEndpoint(): string {
  return localStorage.getItem('RESUME_BEDROCK_ENDPOINT') || 'https://bedrock-mantle.us-east-1.api.aws';
}

export function setBedrockEndpoint(endpoint: string): void {
  localStorage.setItem('RESUME_BEDROCK_ENDPOINT', endpoint.trim());
}

export function resolveBedrockBaseUrl(rawUrl?: string): string {
  const custom = (rawUrl || getBedrockEndpoint() || 'https://bedrock-mantle.us-east-1.api.aws').trim().replace(/\/+$/, '');
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
  if (isLocalHost && custom.includes('bedrock-mantle.us-east-1.api.aws')) {
    return '/api/bedrock-mantle';
  }
  return custom;
}

export function isBedrockClaudeModel(modelName?: string): boolean {
  if (!modelName) return false;
  const m = modelName.toLowerCase();
  return m.includes('claude') || m.startsWith('anthropic');
}

export const BEDROCK_MANTLE_MODELS = [
  // OpenAI Models on Bedrock Mantle
  { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna (1M context, High Efficiency)', category: 'OpenAI GPT' },
  { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra (1M context, Balanced Intelligence)', category: 'OpenAI GPT' },
  { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol (1M context, Flagship Frontier)', category: 'OpenAI GPT' },
  { id: 'gpt-5.5', label: 'GPT-5.5 (272K context)', category: 'OpenAI GPT' },
  // Anthropic Claude Models on Bedrock Mantle
  { id: 'anthropic.claude-haiku-4-5', label: 'Claude Haiku 4.5 (anthropic.claude-haiku-4-5)', category: 'Anthropic Claude' },
  { id: 'claude-opus-5', label: 'Claude Opus 5 (1M context, 128K max output)', category: 'Anthropic Claude' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 (1M context, 128K max output)', category: 'Anthropic Claude' },
  { id: 'claude-fable-5', label: 'Claude Fable 5 (1M context, 128K max output)', category: 'Anthropic Claude' },
  { id: 'claude-opus-4.8', label: 'Claude Opus 4.8 (1M context, 128K max output)', category: 'Anthropic Claude' }
];

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: (localStorage.getItem('RESUME_LLM_PROVIDER') as LLMProviderType) || 'offline',
  model: localStorage.getItem('RESUME_LLM_MODEL') || 'gemini-2.5-flash',
  apiKey: localStorage.getItem('RESUME_LLM_API_KEY') || '',
  endpoint: localStorage.getItem('RESUME_OLLAMA_ENDPOINT') || 'http://localhost:11434',
  project: localStorage.getItem('RESUME_BEDROCK_PROJECT') || 'default'
};

/**
 * Heuristic bullet point enhancer for offline zero-cost usage.
 * Infused with Indian corporate, FinTech, Banking, and Consulting market benchmarks.
 * Uses Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].
 */
function heuristicTailorBullets(
  resume: ResumeData,
  missingKeywords: string[]
): TailoredBulletDiff[] {
  const diffs: TailoredBulletDiff[] = [];
  let kwIdx = 0;

  resume.experience.forEach(exp => {
    exp.bullets.forEach((bullet, bIdx) => {
      const assignedKeywords: string[] = [];
      if (kwIdx < missingKeywords.length) {
        assignedKeywords.push(missingKeywords[kwIdx++]);
      }

      let enhanced = bullet.trim();
      let reasoning = 'Refined for Indian corporate ATS impact using Google\'s XYZ formula.';

      // Strengthen weak starters with Indian corporate leadership & consulting verbs
      const weakMap: Record<string, string> = {
        'worked on': 'Spearheaded end-to-end design and delivery of',
        'helped': 'Governed cross-functional squads across global time zones to deliver',
        'assisted': 'Co-led enterprise implementation and scaled',
        'responsible for': 'Orchestrated strategic execution and governance for',
        'participated in': 'Accelerated go-to-market velocity by driving',
        'developed': 'Architected, engineered, and scaled',
        'built': 'Designed and launched enterprise-grade',
        'handled': 'Steered operational governance and optimization of'
      };

      for (const [weak, strong] of Object.entries(weakMap)) {
        if (enhanced.toLowerCase().startsWith(weak)) {
          enhanced = strong + enhanced.slice(weak.length);
          reasoning = 'Replaced passive verb with high-impact leadership action verb.';
          break;
        }
      }

      // Add missing keywords organically
      if (assignedKeywords.length > 0) {
        const kw = assignedKeywords[0];
        if (!enhanced.toLowerCase().includes(kw.toLowerCase())) {
          if (enhanced.endsWith('.')) {
            enhanced = enhanced.slice(0, -1);
          }
          enhanced += `, leveraging ${kw.toUpperCase()} to streamline governance and architectural compliance.`;
          reasoning += ` Integrated critical keyword "${kw}".`;
        }
      }

      // Contextual Indian & global corporate metrics (FinTech, Banking, Consulting)
      const hasMetric = /(\b\d+(\.\d+)?%|[₹\$]|\b(cr|crore|lakh|lac|inr|rs)\b|\b\d+\s*\+)/i.test(enhanced);
      if (!hasMetric) {
        const lowerBullet = enhanced.toLowerCase();
        if (/payment|upi|card|bank|transaction|fintech|pos|merchant/i.test(lowerBullet)) {
          enhanced += ' resulting in 32% faster transaction settlement, scaling to 10M+ daily volume with 99.98% uptime.';
          reasoning += ' Added FinTech/Banking scale metric (settlement speed & high-concurrency uptime).';
        } else if (/cost|revenue|budget|financ|profit|sale|p&l/i.test(lowerBullet)) {
          enhanced += ' generating ₹15 Cr in annualized business value while trimming operational overhead by 22%.';
          reasoning += ' Added Indian financial impact metric (₹15 Cr annualized value).';
        } else {
          enhanced += ' boosting cross-functional squad productivity by 28% and cutting time-to-market by 3 weeks.';
          reasoning += ' Added operational efficiency and sprint velocity metric.';
        }
      }

      diffs.push({
        experienceId: exp.id,
        bulletIndex: bIdx,
        originalBullet: bullet,
        suggestedBullet: enhanced,
        reasoning,
        incorporatedKeywords: assignedKeywords,
        accepted: false
      });
    });
  });

  return diffs;
}

/**
 * Heuristic summary generator tailored for Indian corporate hiring & GCCs
 */
function heuristicTailorSummary(
  resume: ResumeData,
  jd: JobDescription,
  matchedKeywords: string[]
): string {
  const topSkills = matchedKeywords.slice(0, 5).join(', ');
  const expPrefix = resume.totalExperience ? `Senior leader with ${resume.totalExperience} of distinguished experience` : `Accomplished ${jd.title || resume.title}`;
  return `${expPrefix} driving high-impact product transformation, consulting engagements, and enterprise modernization across IT, Banking, and FinTech ecosystems. Proven mastery in ${topSkills || 'strategic product management and cross-functional leadership'}. Track record of steering multi-million/₹ Cr portfolios, managing distributed onshore-offshore delivery squads, and delivering mission-critical platforms aligned with regulatory standards (RBI/NPCI/ISO) at ${jd.company || 'tier-1 corporate organizations'}.`;
}

function formatFallbackReason(providerName: string, err: any): string {
  const msg = (err?.message || String(err) || 'Service request failed').trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes('quota') ||
    lower.includes('credit') ||
    lower.includes('balance') ||
    lower.includes('billing') ||
    lower.includes('insufficient_quota') ||
    lower.includes('exceeded your current quota') ||
    lower.includes('resource_exhausted') ||
    lower.includes('402') ||
    lower.includes('payment') ||
    lower.includes('plans & billing')
  ) {
    return `Unavailability of API Credits / Quota: Your ${providerName} account has exhausted its usage credits or exceeded quota (${msg}). The application safely fell back to the offline engine.`;
  }

  if (
    lower.includes('unauthorized') ||
    lower.includes('invalid api key') ||
    lower.includes('incorrect api key') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('authentication')
  ) {
    return `API Key Authentication Failed: ${providerName} rejected the configured API key (${msg}). Switched to offline engine.`;
  }

  if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many requests')) {
    return `API Rate Limit Reached: ${providerName} request rate limit exceeded (${msg}). Switched to offline engine.`;
  }

  return `${providerName} API Unavailable: ${msg}. Switched to offline engine.`;
}

/**
 * Main Tailoring Service executing either offline NLP, Gemini, Groq, or Ollama
 * Configured specifically for the Indian job market ecosystem (Naukri, IIMJobs, LinkedIn India).
 */
export async function tailorResumeWithAI(
  resume: ResumeData,
  jobDescription: JobDescription,
  atsAnalysis: AtsAnalysisResult,
  config: LLMConfig
): Promise<TailoringResult> {
  // If provider is offline or API key is missing for cloud providers, use the offline engine
  if (config.provider === 'offline' || (!config.apiKey && config.provider !== 'ollama')) {
    const diffs = heuristicTailorBullets(resume, atsAnalysis.missingCriticalKeywords);
    const tailoredSummary = heuristicTailorSummary(resume, jobDescription, atsAnalysis.matchedKeywords);
    const recommendedSkillsToAdd = atsAnalysis.missingCriticalKeywords.slice(0, 8);

    const fallbackReason = config.provider === 'offline'
      ? 'Built-in offline engine selected (100% private, zero network calls).'
      : `Unavailability of API Key: No API key is currently configured for ${getProviderDisplayName(config.provider)}. Switched automatically to the offline heuristic engine.`;

    return {
      tailoredSummary,
      bulletDiffs: diffs,
      recommendedSkillsToAdd,
      interviewTips: [
        `Prepare to articulate your experience with ${atsAnalysis.missingCriticalKeywords.slice(0, 3).join(', ')} in the context of Indian scale & regulatory compliance (e.g., RBI / NPCI guidelines).`,
        `Be ready to walk through your stakeholder governance framework for managing cross-functional onshore-offshore teams at ${resume.experience[0]?.company || 'your current organization'}.`,
        `Quantify your business impact during leadership discussions: emphasize portfolio size, revenue impact in ₹ Cr / $M, and squad velocity.`
      ],
      engineUsed: {
        provider: 'offline',
        model: 'heuristic',
        isLive: false,
        fallbackReason,
        requestedProvider: config.provider !== 'offline' ? config.provider : undefined
      }
    };
  }

  const indianContextPrompt = `You are an elite executive resume consultant and ATS strategist specializing in the Indian corporate, tech, consulting, and banking ecosystems (Naukri.com, IIMJobs, Instahyre, LinkedIn India, Darwinbox, Taleo).
Tailor this candidate's resume to match the target Job Description while maintaining 100% authenticity and factual grounding.

INDIAN JOB MARKET CONVENTIONS:
1. Rewrite EACH experience bullet point to follow Google's XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".
2. Adopt Indian and global corporate scale metrics:
   - Use ₹ INR / Crores (Cr) / Lakhs (L) for domestic, banking, or fintech impact (e.g., "₹25 Cr AUM/revenue", "10M+ daily UPI transactions"), or $ USD for international client engagements.
   - Highlight cross-functional governance across global time zones (onshore-offshore), delivery team scale ("led 20+ member product & engineering squad"), and P&L responsibility.
   - Emphasize adherence to regulatory standards (RBI directives, NPCI/UPI guidelines, DPDP Act 2023, ISO/PCI-DSS) where relevant.
3. Organically weave in missing critical keywords without keyword stuffing.
4. Rewrite the Professional Summary to position the candidate as a top-tier industry leader for this specific role.
5. Provide actionable interview tips targeting Indian corporate leadership and technical panels.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Text:
${jobDescription.rawText}

CURRENT RESUME:
Title: ${resume.title}
Total Experience: ${resume.totalExperience || '10+ Years'}
Summary: ${resume.summary}
Work Experience:
${JSON.stringify(resume.experience.map(e => ({ id: e.id, role: e.role, company: e.company, bullets: e.bullets })), null, 2)}
Missing Critical Keywords: ${atsAnalysis.missingCriticalKeywords.join(', ')}

Output STRICT JSON with this exact schema:
{
  "tailoredSummary": "string",
  "bulletDiffs": [
    {
      "experienceId": "string",
      "bulletIndex": 0,
      "originalBullet": "string",
      "suggestedBullet": "string",
      "reasoning": "string",
      "incorporatedKeywords": ["string"]
    }
  ],
  "recommendedSkillsToAdd": ["string"],
  "interviewTips": ["string"]
}`;

  // --- GOOGLE GEMINI FREE TIER ---
  if (config.provider === 'gemini') {
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey!);
      const model = genAI.getGenerativeModel({
        model: config.model || 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const response = await model.generateContent(indianContextPrompt);
      const text = response.response.text();
      const parsed: TailoringResult = JSON.parse(text);
      return {
        ...parsed,
        engineUsed: {
          provider: 'gemini',
          model: config.model || 'gemini-2.5-flash',
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('Google Gemini', err),
          requestedProvider: 'gemini'
        }
      };
    }
  }

  // --- GROQ CLOUD FREE TIER ---
  if (config.provider === 'groq') {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an executive resume consultant specializing in Indian tech, consulting, and banking markets. Output strictly valid JSON matching the schema.'
            },
            {
              role: 'user',
              content: indianContextPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      return {
        ...parsed,
        engineUsed: {
          provider: 'groq',
          model: config.model || 'llama-3.3-70b-versatile',
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('Groq call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('Groq Cloud', err),
          requestedProvider: 'groq'
        }
      };
    }
  }

  // --- LOCAL OLLAMA (100% Free & Private) ---
  if (config.provider === 'ollama') {
    try {
      const endpoint = (config.endpoint || 'http://localhost:11434').replace(/\/+$/, '');
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model || 'llama3.2',
          prompt: indianContextPrompt,
          format: 'json',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama connection error: ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.response);
      return {
        ...parsed,
        engineUsed: {
          provider: 'ollama',
          model: config.model || 'llama3.2',
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('Ollama call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('Local Ollama', err),
          requestedProvider: 'ollama'
        }
      };
    }
  }

  // --- OPENAI (GPT-4o, GPT-4o-mini, o3-mini, o1) ---
  if (config.provider === 'openai') {
    try {
      const isReasoningModel = /^(o1|o3)/i.test(config.model || '');
      const requestBody: Record<string, any> = {
        model: config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an executive resume consultant specializing in Indian tech, consulting, and banking markets. Output strictly valid JSON matching the schema.'
          },
          {
            role: 'user',
            content: indianContextPrompt
          }
        ]
      };

      if (isReasoningModel) {
        requestBody.max_completion_tokens = 4096;
      } else {
        requestBody.temperature = 0.2;
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content?.trim() || '';
      if (content.startsWith('```')) {
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      } else {
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          content = content.substring(startIdx, endIdx + 1);
        }
      }
      const parsed = JSON.parse(content);
      return {
        ...parsed,
        engineUsed: {
          provider: 'openai',
          model: config.model || 'gpt-4o-mini',
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('OpenAI call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('OpenAI GPT', err),
          requestedProvider: 'openai'
        }
      };
    }
  }

  // --- ANTHROPIC CLAUDE (Claude 3.5 Sonnet, Haiku, Opus, 3.7 Sonnet) ---
  if (config.provider === 'anthropic') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-5-sonnet-latest',
          max_tokens: 4096,
          system: 'You are an executive resume consultant specializing in Indian tech, consulting, and banking markets. Output strictly valid JSON matching the requested schema with no markdown wrapping or surrounding commentary.',
          messages: [
            {
              role: 'user',
              content: indianContextPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      let text = data.content?.[0]?.text?.trim() || '';
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      } else {
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          text = text.substring(startIdx, endIdx + 1);
        }
      }
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        engineUsed: {
          provider: 'anthropic',
          model: config.model || 'claude-3-5-sonnet-latest',
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('Anthropic call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('Anthropic Claude', err),
          requestedProvider: 'anthropic'
        }
      };
    }
  }

  // --- AMAZON BEDROCK (MANTLE) - GPT-5.6 & CLAUDE MODELS ---
  if (config.provider === 'bedrock') {
    try {
      const isClaude = isBedrockClaudeModel(config.model);
      const targetBase = resolveBedrockBaseUrl(config.endpoint);
      const projectHeader = config.project || getBedrockProject() || 'default';

      let text = '';

      if (!isClaude) {
        // OpenAI Chat Completions endpoint on Bedrock Mantle
        // OpenAI protocol uses Authorization: Bearer <key>
        const response = await fetch(`${targetBase}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey || ''}`,
            'OpenAI-Project': projectHeader
          },
          body: JSON.stringify({
            model: config.model || 'gpt-5.6-luna',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are an executive resume consultant specializing in Indian tech, consulting, and banking markets. Output strictly valid JSON matching the schema.'
              },
              {
                role: 'user',
                content: indianContextPrompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Bedrock Mantle OpenAI error: ${response.statusText}`);
        }

        const data = await response.json();
        text = data.choices?.[0]?.message?.content || '';
      } else {
        // Anthropic Messages endpoint on Bedrock Mantle
        // IMPORTANT: AWS Bedrock Mantle requires ONLY 'x-api-key'. Do NOT include 'Authorization'!
        const response = await fetch(`${targetBase}/anthropic/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: config.model || 'anthropic.claude-haiku-4-5',
            max_tokens: 4096,
            system: 'You are an executive resume consultant specializing in Indian tech, consulting, and banking markets. Output strictly valid JSON matching the requested schema with no markdown wrapping or surrounding commentary.',
            messages: [
              {
                role: 'user',
                content: indianContextPrompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Bedrock Mantle Anthropic error: ${response.statusText}`);
        }

        const data = await response.json();
        text = data.content?.[0]?.text?.trim() || '';
      }

      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      } else {
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          text = text.substring(startIdx, endIdx + 1);
        }
      }
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        engineUsed: {
          provider: 'bedrock',
          model: config.model || (!isClaude ? 'gpt-5.6-luna' : 'anthropic.claude-haiku-4-5'),
          isLive: true
        }
      };
    } catch (err: any) {
      console.warn('Amazon Bedrock (Mantle) call failed, falling back to offline engine:', err);
      const fallback = await tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
      return {
        ...fallback,
        engineUsed: {
          provider: 'offline',
          model: 'heuristic',
          isLive: false,
          fallbackReason: formatFallbackReason('Amazon Bedrock (Mantle)', err),
          requestedProvider: 'bedrock'
        }
      };
    }
  }

  const diffs = heuristicTailorBullets(resume, atsAnalysis.missingCriticalKeywords);
  const tailoredSummary = heuristicTailorSummary(resume, jobDescription, atsAnalysis.matchedKeywords);
  return {
    tailoredSummary,
    bulletDiffs: diffs,
    recommendedSkillsToAdd: atsAnalysis.missingCriticalKeywords.slice(0, 8),
    engineUsed: {
      provider: 'offline',
      model: 'heuristic',
      isLive: false,
      fallbackReason: 'Built-in offline engine used.'
    }
  };
}
