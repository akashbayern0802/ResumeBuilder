import { ResumeData, JobDescription, AtsAnalysisResult, KeywordMatch } from '../types/resume';

// Comprehensive technical, industry, and Indian corporate keywords library
const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'react native', 'next.js', 'vue', 'vue.js', 'angular', 'svelte', 'node.js', 'express', 'nestjs', 'fastapi',
  'django', 'flask', 'spring boot', 'graphql', 'restful api', 'rest api', 'grpc', 'webhooks', 'websockets',
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'circleci', 'helm', 'argocd',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'sqlite', 'snowflake', 'bigquery',
  'kafka', 'rabbitmq', 'sqs', 'sns', 'event-driven', 'microservices', 'monolith', 'serverless', 'lambda',
  'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'machine learning', 'deep learning', 'nlp', 'llm', 'rag', 'generative ai', 'hugging face', 'langchain', 'vector database',
  'tailwind css', 'tailwind', 'bootstrap', 'sass', 'css3', 'html5', 'webpack', 'vite',
  'agile', 'scrum', 'kanban', 'jira', 'confluence', 'git', 'github', 'gitlab', 'tdd', 'unit testing',
  'system design', 'distributed systems', 'scalability', 'high availability', 'fault tolerance', 'performance optimization', 'security', 'oauth2', 'jwt', 'iam',
  // Indian Banking, FinTech & Digital Payments ecosystem
  'upi', 'npci', 'imps', 'neft', 'rtgs', 'bbps', 'nach', 'ncmc', 'tokenization', 'pos', 'merchant acquiring',
  'prepaid cards', 'digital wallets', 'core banking', 'finacle', 'flexcube', 'open banking', 'account aggregator',
  'kyc', 'aml', 'pci-dss', 'iso 8583', 'iso 20022', 'dpdp act', 'rbi guidelines', 'sebi', 'cbs', 'payment gateway',
  // IT Consulting, GCC & Enterprise Delivery
  'consulting', 'business analysis', 'cbap', 'pmp', 'cspo', 'safe agile', 'scrum master', 'product management',
  'product strategy', 'rfp', 'rfi', 'brd', 'srs', 'fsd', 'vendor management', 'client governance', 'p&l',
  'stakeholder management', 'onshore-offshore', 'global capability center', 'gcc', 'itil', 'six sigma',
  'tableau', 'power bi', 'sql', 'azure devops', 'delta lake', 'databricks'
];

const SOFT_SKILLS = [
  'leadership', 'mentoring', 'communication', 'collaboration', 'cross-functional', 'problem-solving',
  'ownership', 'adaptability', 'critical thinking', 'project management', 'stakeholder management', 'strategic thinking',
  'client relationship', 'executive presence', 'governance', 'negotiation'
];

const STRONG_ACTION_VERBS = [
  'architected', 'engineered', 'spearheaded', 'designed', 'developed', 'deployed', 'optimized',
  'orchestrated', 'implemented', 'accelerated', 'transformed', 'built', 'scaled', 'automated',
  'reduced', 'increased', 'eliminated', 'boosted', 'generated', 'modernized', 'authored', 'mentored',
  'led', 'negotiated', 'streamlined', 'delivered', 'established', 'formulated', 'pioneered', 'governed'
];

const WEAK_VERBS = ['assisted', 'helped', 'worked on', 'participated', 'handled', 'responsible for', 'involved in'];

// Enhanced metric regex: supports INR (₹, Rs, INR, Cr, Crore, Lakh, Lac), USD ($), percentages, and volume units
const METRIC_REGEX = /(\b\d+(\.\d+)?%|\b\d+[xX]\b|[₹\$]\s*\d+([,\.]\d+)?\s*(cr(ores?)?|l(akhs?|acs?)?|[kKmMbB])?\b|\b(rs\.?|inr)\s*\d+([,\.]\d+)?\s*(cr(ores?)?|l(akhs?|acs?)?|[kKmMbB])?\b|\b\d+([,\.]\d+)?\s*(cr(ores?)?|l(akhs?|acs?)?|bps|aum|gmv|mau|dau|tps)\b|\b\d+([kKmMbB])?\+?(\s*(users|requests|customers|clients|dollars|rupees|inr|crore|crores|lakh|lakhs|million|billion|thousand|ms|seconds|minutes|hours|days|percent|latency|throughput|events))\b|\b\d+\s*\+)/i;

/**
 * Extracts searchable text representation of a resume
 */
export function getResumeSearchableText(resume: ResumeData): string {
  const parts: string[] = [
    resume.title,
    resume.summary,
    resume.totalExperience || '',
    resume.preferredLocations || '',
    ...resume.skills.flatMap(s => [s.categoryName, ...s.skills]),
    ...resume.experience.flatMap(e => [e.role, e.company, ...e.bullets]),
    ...resume.education.flatMap(ed => [ed.degree, ed.institution, ed.honors || '']),
    ...resume.projects.flatMap(p => [p.name, p.description, ...p.technologies, ...p.bullets]),
    ...(resume.certifications || [])
  ];
  return parts.join(' ').toLowerCase();
}

/**
 * Extracts key phrases, technologies, and terms from raw Job Description text
 */
export function extractKeywordsFromJD(jdText: string): {
  allKeywords: { keyword: string; category: 'technical' | 'soft' | 'tool' | 'domain'; count: number }[];
  detectedSeniority: string;
} {
  const lowerJD = jdText.toLowerCase();
  const keywordMap = new Map<string, { category: 'technical' | 'soft' | 'tool' | 'domain'; count: number }>();

  // Check technical keywords
  TECH_KEYWORDS.forEach(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerJD.match(regex);
    if (matches && matches.length > 0) {
      keywordMap.set(kw, { category: 'technical', count: matches.length });
    }
  });

  // Check soft skills
  SOFT_SKILLS.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerJD.match(regex);
    if (matches && matches.length > 0) {
      keywordMap.set(skill, { category: 'soft', count: matches.length });
    }
  });

  // Check custom capitalized / highlighted terms in JD
  const lines = jdText.split('\n');
  lines.forEach(line => {
    if (line.includes('•') || line.includes('-') || line.includes('*') || line.toLowerCase().includes('requirement') || line.toLowerCase().includes('qualif')) {
      const tokens = line.replace(/[^a-zA-Z0-9+#.\s-]/g, ' ').split(/\s+/);
      tokens.forEach(token => {
        const clean = token.trim().toLowerCase();
        if (clean.length > 2 && !keywordMap.has(clean) && TECH_KEYWORDS.includes(clean)) {
          keywordMap.set(clean, { category: 'technical', count: 1 });
        }
      });
    }
  });

  // Determine seniority with Indian and global designations
  let detectedSeniority = 'Mid-Level';
  if (/\b(director|vp|vice president|avp|head of|practice head|partner|associate director)\b/i.test(jdText)) {
    detectedSeniority = 'Director / Executive (AVP/VP)';
  } else if (/\b(principal|staff|lead consultant|delivery manager|engagement manager|architect)\b/i.test(jdText)) {
    detectedSeniority = 'Principal / Lead / Manager';
  } else if (/\b(senior|sr\.?|lead)\b/i.test(jdText)) {
    detectedSeniority = 'Senior Professional';
  } else if (/\b(junior|entry|associate|intern|new grad|trainee)\b/i.test(jdText)) {
    detectedSeniority = 'Junior / Associate';
  }

  const allKeywords = Array.from(keywordMap.entries())
    .map(([keyword, data]) => ({ keyword, ...data }))
    .sort((a, b) => b.count - a.count);

  return { allKeywords, detectedSeniority };
}

/**
 * Computes ATS alignment score and detailed breakdown
 */
export function analyzeAtsMatch(resume: ResumeData, jobDescription: JobDescription): AtsAnalysisResult {
  const resumeText = getResumeSearchableText(resume);
  const { allKeywords, detectedSeniority } = extractKeywordsFromJD(jobDescription.rawText);

  const keywordMatches: KeywordMatch[] = [];
  const matchedKeywords: string[] = [];
  const missingCritical: string[] = [];
  const missingNiceToHave: string[] = [];

  allKeywords.forEach(kw => {
    const escaped = kw.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    const found = regex.test(resumeText);
    
    // Count occurrences in resume
    const matchOccurrences = resumeText.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
    const freqInResume = matchOccurrences ? matchOccurrences.length : 0;

    const importance = kw.count >= 2 || kw.category === 'technical' ? 'high' : 'medium';

    keywordMatches.push({
      keyword: kw.keyword,
      category: kw.category,
      foundInResume: found,
      frequencyInJob: kw.count,
      frequencyInResume: freqInResume,
      importance
    });

    if (found) {
      matchedKeywords.push(kw.keyword);
    } else {
      if (importance === 'high') {
        missingCritical.push(kw.keyword);
      } else {
        missingNiceToHave.push(kw.keyword);
      }
    }
  });

  // Calculate Keyword Match Score (0 - 100)
  const totalKeywords = allKeywords.length;
  const keywordScore = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 70;

  // Calculate Action Verb Score
  const allBullets = [
    ...resume.experience.flatMap(e => e.bullets),
    ...resume.projects.flatMap(p => p.bullets)
  ];

  let strongVerbCount = 0;
  let weakVerbCount = 0;
  let metricCount = 0;

  allBullets.forEach(bullet => {
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (STRONG_ACTION_VERBS.some(v => firstWord === v || bullet.toLowerCase().startsWith(v))) {
      strongVerbCount++;
    }
    if (WEAK_VERBS.some(v => bullet.toLowerCase().includes(v))) {
      weakVerbCount++;
    }
    if (METRIC_REGEX.test(bullet)) {
      metricCount++;
    }
  });

  const actionVerbScore = allBullets.length > 0 
    ? Math.min(100, Math.round(((strongVerbCount * 1.2 - weakVerbCount * 0.5) / allBullets.length) * 100))
    : 60;

  // Calculate Metric / Quantifiable Impact Score
  const metricScore = allBullets.length > 0 
    ? Math.min(100, Math.round((metricCount / allBullets.length) * 100))
    : 50;

  // Experience relevance score
  const hasRelevantTitle = resume.title.toLowerCase().split(' ').some(word => 
    word.length > 3 && jobDescription.title.toLowerCase().includes(word)
  );
  const experienceScore = Math.min(100, Math.round((keywordScore * 0.6) + (hasRelevantTitle ? 30 : 15) + (resume.experience.length >= 2 ? 10 : 0)));

  // Weighted overall ATS score
  // 45% Keyword Match, 25% Experience Relevance, 15% Quantifiable Metrics, 15% Action Verbs
  const overallScore = Math.min(100, Math.max(10, Math.round(
    keywordScore * 0.45 +
    experienceScore * 0.25 +
    metricScore * 0.15 +
    actionVerbScore * 0.15
  )));

  // Construct constructive suggestions
  const suggestions: string[] = [];
  if (missingCritical.length > 0) {
    suggestions.push(`Integrate critical missing technologies: ${missingCritical.slice(0, 4).join(', ')}`);
  }
  if (metricScore < 60) {
    suggestions.push('Add more measurable metrics and numbers (e.g. "% performance gain", "$ saved", "user counts") to your experience bullet points.');
  }
  if (actionVerbScore < 70) {
    suggestions.push('Strengthen bullet points with decisive action verbs (e.g. Architected, Spearheaded, Optimized, Engineered).');
  }
  if (!hasRelevantTitle) {
    suggestions.push(`Align your headline/title ("${resume.title}") closer to the target job title ("${jobDescription.title}").`);
  }
  if (overallScore >= 85) {
    suggestions.push('Excellent ATS alignment! Your resume closely reflects the technical stack and seniority expectations.');
  }

  return {
    overallScore,
    keywordMatchScore: Math.max(0, keywordScore),
    experienceScore: Math.max(0, experienceScore),
    metricScore: Math.max(0, metricScore),
    actionVerbScore: Math.max(0, Math.max(10, actionVerbScore)),
    matchedKeywords,
    missingCriticalKeywords: missingCritical,
    missingNiceToHaveKeywords: missingNiceToHave,
    allKeywordMatches: keywordMatches,
    suggestions,
    detectedSeniority
  };
}

