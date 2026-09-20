import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, JobDescription, TailoringResult, TailoredBulletDiff, LLMConfig, AtsAnalysisResult } from '../types/resume';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'offline',
  model: 'gemini-2.5-flash',
  apiKey: localStorage.getItem('RESUME_LLM_API_KEY') || '',
  endpoint: localStorage.getItem('RESUME_OLLAMA_ENDPOINT') || 'http://localhost:11434'
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

    return {
      tailoredSummary,
      bulletDiffs: diffs,
      recommendedSkillsToAdd,
      interviewTips: [
        `Prepare to articulate your experience with ${atsAnalysis.missingCriticalKeywords.slice(0, 3).join(', ')} in the context of Indian scale & regulatory compliance (e.g., RBI / NPCI guidelines).`,
        `Be ready to walk through your stakeholder governance framework for managing cross-functional onshore-offshore teams at ${resume.experience[0]?.company || 'your current organization'}.`,
        `Quantify your business impact during leadership discussions: emphasize portfolio size, revenue impact in ₹ Cr / $M, and squad velocity.`
      ]
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
      return parsed;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to offline engine:', err);
      return tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
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
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (err) {
      console.warn('Groq call failed, falling back to offline engine:', err);
      return tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
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
      return JSON.parse(data.response);
    } catch (err) {
      console.warn('Ollama call failed, falling back to offline engine:', err);
      return tailorResumeWithAI(resume, jobDescription, atsAnalysis, { ...config, provider: 'offline' });
    }
  }

  return heuristicTailorBullets(resume, atsAnalysis.missingCriticalKeywords) as any;
}
