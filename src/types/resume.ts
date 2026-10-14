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

export type AchievementIconType =
  | 'trophy'
  | 'award'
  | 'barchart'
  | 'trending'
  | 'gem'
  | 'rocket'
  | 'target'
  | 'star'
  | 'sparkles'
  | 'briefcase'
  | 'globe'
  | 'zap'
  | 'shield'
  | 'check';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon?: AchievementIconType;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: string[];
  icon?: AchievementIconType;
}

export interface CustomSection {
  id: string;
  title: string;
  icon?: AchievementIconType;
  items: CustomSectionItem[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  bullets: string[];
  icon?: AchievementIconType;
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export type ResumeSectionId =
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | string;

export type FontFamilyType =
  | 'lato'
  | 'raleway'
  | 'bitter'
  | 'exo2'
  | 'chivo'
  | 'tinos'
  | 'montserrat'
  | 'oswald'
  | 'volkhov'
  | 'gelasio'
  | 'inter'
  | 'roboto'
  | 'merriweather'
  | 'garamond'
  | 'sans';

export interface ResumeDesignSettings {
  fontFamily: FontFamilyType;
  fontSize: 'compact' | 'normal' | 'relaxed';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
  primaryColor?: string;
  showPhoto?: boolean;
  fitTwoPages?: boolean;
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
  photoUrl?: string;
  summary: string;
  skills: SkillCategory[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications?: string[];
  achievements?: AchievementItem[];
  customSections?: CustomSection[];
  totalExperience?: string;
  preferredLocations?: string;
  sectionOrder?: ResumeSectionId[];
  hiddenSections?: ResumeSectionId[];
  design?: ResumeDesignSettings;
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

export type LLMProviderType = 'offline' | 'gemini' | 'vertex' | 'groq' | 'ollama' | 'openai' | 'anthropic' | 'bedrock';

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  model: string;
  endpoint?: string; // For Ollama / Bedrock Mantle / Vertex custom base URL
  project?: string; // For Bedrock Mantle / Google Cloud Vertex project ID
  location?: string; // For Google Cloud Vertex AI region/location (e.g. us-central1)
}

export type ResumeTemplate =
  | 'enhancv_timeline'
  | 'graphical_metric'
  | 'naukri'
  | 'double_column'
  | 'double_line'
  | 'executive'
  | 'harvard'
  | 'modern'
  | 'wallstreet'
  | 'tech'
  | 'minimalist';


