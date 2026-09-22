export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface ResumeData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
  skills: SkillCategory[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications?: string[];
  totalExperience?: string;
  preferredLocations?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  rawText: string;
  extractedKeywords: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniorityLevel?: string;
}

export interface KeywordMatch {
  keyword: string;
  category: 'technical' | 'soft' | 'tool' | 'domain';
  foundInResume: boolean;
  frequencyInJob: number;
  frequencyInResume: number;
  importance: 'high' | 'medium' | 'low';
}

export interface AtsAnalysisResult {
  overallScore: number; // 0 - 100
  keywordMatchScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  metricScore: number; // 0 - 100 (density of quantifiable numbers/metrics)
  actionVerbScore: number; // 0 - 100 (strength of action verbs)
  matchedKeywords: string[];
  missingCriticalKeywords: string[];
  missingNiceToHaveKeywords: string[];
  allKeywordMatches: KeywordMatch[];
  suggestions: string[];
  detectedSeniority: string;
}

export interface TailoredBulletDiff {
  originalBullet: string;
  suggestedBullet: string;
  experienceId: string;
  bulletIndex: number;
  reasoning: string;
  incorporatedKeywords: string[];
  accepted?: boolean;
}

export interface TailoringResult {
  tailoredSummary?: string;
  bulletDiffs: TailoredBulletDiff[];
  recommendedSkillsToAdd: string[];
  interviewTips?: string[];
  engineUsed?: {
    provider: LLMProviderType;
    model?: string;
    isLive: boolean;
    fallbackReason?: string;
    requestedProvider?: LLMProviderType;
  };
}

export type LLMProviderType = 'offline' | 'gemini' | 'groq' | 'ollama' | 'openai' | 'anthropic' | 'bedrock';

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  model: string;
  endpoint?: string; // For Ollama / Bedrock Mantle custom base URL
  project?: string; // For Bedrock Mantle OpenAI-Project header (defaults to "default")
}

export type ResumeTemplate = 'naukri' | 'harvard' | 'modern' | 'executive' | 'wallstreet' | 'tech' | 'minimalist';

