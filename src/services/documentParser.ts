import { ResumeData, WorkExperience, Education } from '../types/resume';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs worker to local Vite bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Common resume section keywords for structural segmentation
 */
const KNOWN_RESUME_SECTION_HEADERS = [
  'summary', 'profile', 'professional summary', 'executive summary', 'career summary', 'about me',
  'skills', 'technical skills', 'core competencies', 'areas of excellence', 'area of excellence', 'domain expertise',
  'experience', 'work experience', 'professional experience', 'employment history', 'previous experience',
  'education', 'academic background', 'academic history', 'qualifications',
  'certifications', 'licenses & certifications', 'certificates', 'professional certifications',
  'key achievements', 'achievements', 'accomplishments', 'notable accomplishments', 'key accomplishments',
  'projects', 'key projects', 'notable projects'
];

/**
 * Extract raw text from a PDF file using pdfjs-dist with section-aware column handling
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;
    let fullText = '';

    const extractSingleColumnText = (columnItems: Array<{ str: string; x: number; y: number }>) => {
      const sorted = [...columnItems].sort((a, b) => {
        if (Math.abs(b.y - a.y) < 5) return a.x - b.x;
        return b.y - a.y; // Top to bottom
      });

      let res = '';
      let lastY: number | null = null;
      for (const item of sorted) {
        if (lastY !== null && Math.abs(lastY - item.y) > 6) {
          res += '\n';
        } else if (lastY !== null) {
          res += ' ';
        }
        res += item.str;
        lastY = item.y;
      }
      return res;
    };

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width || 600;

      // Extract valid items with spatial positions
      const items = (content.items as any[])
        .filter(it => it && typeof it.str === 'string' && it.str.trim().length > 0)
        .map(it => ({
          str: it.str.trim(),
          x: it.transform ? it.transform[4] : 0,
          y: it.transform ? it.transform[5] : 0
        }));

      if (items.length === 0) continue;

      const midX = pageWidth * 0.48;

      // Detect known section headers on this page
      const headers = items.filter(it => {
        const clean = it.str.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        return it.x < 120 && KNOWN_RESUME_SECTION_HEADERS.includes(clean);
      });

      headers.sort((a, b) => b.y - a.y); // Sort headers top to bottom

      // If headers exist on both left and right columns, it's a true multi-column page layout
      const hasRightHeaders = headers.some(h => h.x >= midX);
      if (hasRightHeaders || headers.length === 0) {
        const rightItems = items.filter(it => it.x >= midX);
        const isFullTwoColumn = rightItems.length > items.length * 0.25;

        if (isFullTwoColumn) {
          fullText += extractSingleColumnText(items.filter(it => it.x < midX)) + '\n\n';
          fullText += extractSingleColumnText(items.filter(it => it.x >= midX)) + '\n\n';
        } else {
          fullText += extractSingleColumnText(items) + '\n\n';
        }
        continue;
      }

      // Stacked section layout: process sections vertically
      let pageText = '';
      const firstHeaderY = headers[0].y;
      const preHeaderItems = items.filter(it => it.y > firstHeaderY);
      if (preHeaderItems.length > 0) {
        pageText += extractSingleColumnText(preHeaderItems) + '\n';
      }

      for (let i = 0; i < headers.length; i++) {
        const currentH = headers[i];
        const nextH = headers[i + 1];
        const topY = currentH.y;
        const bottomY = nextH ? nextH.y : -Infinity;

        const secItems = items.filter(it => it.y <= topY && it.y > bottomY);
        pageText += '\n' + currentH.str + '\n';

        const contentItems = secItems.filter(it => it !== currentH && (currentH.y - it.y) > 4);
        const rightInSec = contentItems.filter(it => it.x >= midX);
        const leftInSec = contentItems.filter(it => it.x < midX);

        // If this specific section has multi-column content (e.g. 2-column Certifications or Achievements)
        if (rightInSec.length >= 2 && leftInSec.length >= 2) {
          pageText += extractSingleColumnText(leftInSec) + '\n';
          pageText += extractSingleColumnText(rightInSec) + '\n';
        } else {
          pageText += extractSingleColumnText(contentItems) + '\n';
        }
      }

      fullText += pageText + '\n\n';
    }

    if (!fullText.trim()) {
      throw new Error('No selectable text found in this PDF. It may be a scanned image.');
    }

    return fullText.trim();
  } catch (err: any) {
    console.error('PDF extraction failed:', err);
    throw new Error(`Failed to parse PDF: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Extract raw text from a DOCX file using mammoth
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extract text from any uploaded file based on its extension
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }
  if (ext === 'docx') {
    return extractTextFromDocx(file);
  }
  return file.text();
}

/**
 * Smart parsing of plain extracted text into a structured ResumeData object
 */
export function parseExtractedTextToResume(rawText: string, filename?: string): ResumeData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Section splitting map
  const SECTION_HEADERS: Record<string, string> = {
    summary: 'SUMMARY',
    'profile summary': 'SUMMARY',
    'professional summary': 'SUMMARY',
    'executive summary': 'SUMMARY',
    'career summary': 'SUMMARY',
    'about me': 'SUMMARY',
    profile: 'SUMMARY',
    'area of excellence': 'SKILLS',
    'areas of excellence': 'SKILLS',
    'technical skills': 'SKILLS',
    skills: 'SKILLS',
    'core competencies': 'SKILLS',
    'domain expertise': 'SKILLS',
    certifications: 'CERTIFICATIONS',
    'licenses & certifications': 'CERTIFICATIONS',
    certificates: 'CERTIFICATIONS',
    education: 'EDUCATION',
    'academic background': 'EDUCATION',
    'work experience': 'EXPERIENCE',
    'previous experience': 'EXPERIENCE',
    'professional experience': 'EXPERIENCE',
    'employment history': 'EXPERIENCE',
    experience: 'EXPERIENCE',
    'notable accomplishments across career': 'ACHIEVEMENTS',
    'key achievements': 'ACHIEVEMENTS',
    achievements: 'ACHIEVEMENTS',
    accomplishments: 'ACHIEVEMENTS',
    'notable accomplishments': 'ACHIEVEMENTS',
    projects: 'PROJECTS',
    'key projects': 'PROJECTS'
  };

  const sections: { name: string; content: string[] }[] = [];
  let currentSection = { name: 'HEADER', content: [] as string[] };

  lines.forEach(line => {
    const cleanHeader = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (SECTION_HEADERS[cleanHeader] && line.length < 40) {
      sections.push(currentSection);
      currentSection = { name: SECTION_HEADERS[cleanHeader], content: [] };
    } else {
      currentSection.content.push(line);
    }
  });
  sections.push(currentSection);

  // 1. Identify Candidate Full Name & Title
  let detectedName = '';
  let detectedTitle = '';
  let detectedLocation = '';
  let detectedPreferredLocations = '';

  const headerSec = sections.find(s => s.name === 'HEADER') || { content: [] };
  const hLines = headerSec.content;
  const nonNameKeywords = ['profile', 'summary', 'area', 'excellence', 'experience', 'education', 'skills', 'curriculum', 'resume', 'contact', 'manager', 'lead', 'analyst', 'engineer'];

  // Detect Full Name
  for (const line of hLines) {
    const clean = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = clean.split(/\s+/);
    const lower = clean.toLowerCase();

    if (words.length >= 2 && words.length <= 4 && !nonNameKeywords.some(kw => lower.includes(kw))) {
      if (line === line.toUpperCase() && line.length > 5) {
        // Format ALL CAPS to Title Case
        detectedName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      } else if (!detectedName && /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)) {
        detectedName = line;
      }
    }
  }

  if (!detectedName && hLines[0] && !nonNameKeywords.some(kw => hLines[0].toLowerCase().includes(kw))) {
    const words = hLines[0].replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    detectedName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // Detect Subtitle / Title & Location from Header
  const titleParts: string[] = [];
  for (let i = 0; i < hLines.length; i++) {
    const l = hLines[i];
    if (l === detectedName || l.toUpperCase() === (detectedName || '').toUpperCase()) continue;
    if (l.includes('@') || /linkedin|github|portfolio|\+\d/i.test(l)) continue;

    if (/current location|looking for|location/i.test(l)) {
      const locClean = l.replace(/^current location\s*[-–:]\s*/i, '').trim();
      if (locClean.toLowerCase().includes('looking for')) {
        const parts = locClean.split(/,\s*looking for/i);
        detectedLocation = parts[0]?.trim() || locClean;
        detectedPreferredLocations = 'Looking for ' + (parts[1]?.trim() || '');
      } else {
        detectedLocation = locClean;
      }
      continue;
    }

    if (titleParts.length < 2 && l.length < 120 && !/^\d+/.test(l)) {
      titleParts.push(l);
    }
  }

  if (titleParts.length > 0) {
    // Join wrapped hyphenated words like "High-" + "Performing" -> "High-Performing"
    detectedTitle = titleParts.join(' ').replace(/-\s+/g, '-').trim();
  }

  // Default structure
  const resume: ResumeData = {
    id: `resume-${Date.now()}`,
    fullName: detectedName || (filename ? filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Akash Bhattacharya'),
    title: detectedTitle || 'Product Manager | Scalable Delivery Platforms',
    email: '',
    phone: '',
    location: detectedLocation || 'Kolkata/Bengaluru, INDIA',
    preferredLocations: detectedPreferredLocations || undefined,
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  };

  // Find Contact Information
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) resume.email = emailMatch[0];

  // Support single phone, dual phone (e.g. +91-8169243895/9163392836 or +91-8169243895 | 9163392836)
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\d{10}(?:\s*[\/|]\s*(?:\+?\d{1,3}[-.\s]?)?\d{10})?/);
  if (phoneMatch) resume.phone = phoneMatch[0];

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  if (linkedinMatch) {
    resume.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  // 2. Process SUMMARY
  const summarySec = sections.find(s => s.name === 'SUMMARY');
  if (summarySec) {
    resume.summary = summarySec.content.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 3. Process SKILLS (Categorized)
  const skillSec = sections.find(s => s.name === 'SKILLS');
  if (skillSec) {
    let currentCategory: { id: string; categoryName: string; skills: string[] } | null = null;
    let pendingLine = '';

    for (const l of skillSec.content) {
      if (pendingLine) {
        pendingLine += ' ' + l;
        const openP = (pendingLine.match(/\(/g) || []).length;
        const closeP = (pendingLine.match(/\)/g) || []).length;
        if (openP <= closeP) {
          if (currentCategory) {
            const parts = pendingLine.split(/,\s*/).map(p => p.trim()).filter(Boolean);
            currentCategory.skills.push(...parts);
          }
          pendingLine = '';
        }
        continue;
      }

      const openCount = (l.match(/\(/g) || []).length;
      const closeCount = (l.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        pendingLine = l;
        continue;
      }

      // Check if line is a category header
      const isCategory = !l.includes(',') && !l.includes('(') && !l.includes(')') && l.length < 50;
      if (isCategory) {
        if (currentCategory && currentCategory.skills.length > 0) {
          resume.skills.push(currentCategory);
        }
        currentCategory = {
          id: `sk-${resume.skills.length}`,
          categoryName: l,
          skills: []
        };
      } else if (currentCategory) {
        const parts = l.split(/,\s*/).map(p => p.trim()).filter(Boolean);
        currentCategory.skills.push(...parts);
      } else {
        currentCategory = {
          id: 'sk-0',
          categoryName: 'Core Competencies',
          skills: l.split(/,\s*/).map(p => p.trim()).filter(Boolean)
        };
      }
    }

    if (pendingLine && currentCategory) {
      const parts = pendingLine.split(/,\s*/).map(p => p.trim()).filter(Boolean);
      currentCategory.skills.push(...parts);
    }

    if (currentCategory && currentCategory.skills.length > 0) {
      resume.skills.push(currentCategory);
    }
  }

  // 4. Process WORK EXPERIENCE
  const expSections = sections.filter(s => s.name === 'EXPERIENCE');
  const allExpLines = expSections.flatMap(s => s.content);
  const expEntries: WorkExperience[] = [];
  let currentExp: WorkExperience | null = null;

  // Regex for dates at start of role:
  // "03/2025 - Present Lead Product Manager" or "07/2021 - 02/2025 Product Owner" or "2019 - 2021 Senior Product Manager"
  const dateRoleRegex = /^(?:since\s+)?((?:(?:0?[1-9]|1[0-2])\/\d{4}|[A-Za-z]{3}['’]?\d{2,4}|\d{4})\s*[-–—to]+\s*(?:(?:0?[1-9]|1[0-2])\/\d{4}|[A-Za-z]{3}['’]?\d{2,4}|\d{4}|present|current|till date))\s*(.*)$/i;
  const legacyRoleRegex = /(?:since\s+)?([A-Za-z]{3}['’]\d{2}(?:\s*[-–]\s*(?:[A-Za-z]{3}['’]\d{2}|present))?)\s+with\s+([^,]+)(?:,\s*([^a]+?))?\s+as\s+(.+)/i;

  for (let i = 0; i < allExpLines.length; i++) {
    const line = allExpLines[i];
    const match = line.match(dateRoleRegex);
    const legacyMatch = line.match(legacyRoleRegex);

    if (legacyMatch) {
      if (currentExp) expEntries.push(currentExp);
      const dates = legacyMatch[1].trim();
      const company = legacyMatch[2].trim();
      const location = legacyMatch[3]?.trim() || '';
      const role = legacyMatch[4]?.replace(/key result areas:?/i, '').trim();

      currentExp = {
        id: `exp-${Date.now()}-${expEntries.length}`,
        role: role || 'Product Manager',
        company: company || 'Company',
        location,
        startDate: dates.split(/[-–—]/)[0]?.trim() || dates,
        endDate: dates.toLowerCase().includes('present') ? 'Present' : (dates.split(/[-–—]/)[1]?.trim() || ''),
        current: dates.toLowerCase().includes('present') || dates.toLowerCase().includes('since'),
        bullets: []
      };
    } else if (match) {
      if (currentExp) expEntries.push(currentExp);
      const dates = match[1].trim();
      let role = match[2]?.trim() || '';
      let company = '';

      // The next line may be the company name if it's not a bullet or new date
      if (i + 1 < allExpLines.length && !allExpLines[i + 1].startsWith('•') && !allExpLines[i + 1].startsWith('-') && !allExpLines[i + 1].match(dateRoleRegex)) {
        company = allExpLines[i + 1];
        i++; // Consume company line
      }

      // Check if role contains " | " or " - " splitting role and company
      if (!company && role.includes(' | ')) {
        const parts = role.split(' | ');
        role = parts[0].trim();
        company = parts[1].trim();
      }

      currentExp = {
        id: `exp-${Date.now()}-${expEntries.length}`,
        role: role || 'Product Manager',
        company: company || 'Company',
        startDate: dates.split(/[-–—]/)[0]?.trim() || dates,
        endDate: dates.toLowerCase().includes('present') ? 'Present' : (dates.split(/[-–—]/)[1]?.trim() || ''),
        current: dates.toLowerCase().includes('present'),
        bullets: []
      };
    } else if (currentExp) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim();
        if (cleanBullet.length > 5) {
          currentExp.bullets.push(cleanBullet);
        }
      } else if (currentExp.bullets.length > 0) {
        // Wrapped bullet line from previous item
        currentExp.bullets[currentExp.bullets.length - 1] += ' ' + line;
      }
    }
  }

  if (currentExp) {
    expEntries.push(currentExp);
  }

  if (expEntries.length > 0) {
    resume.experience = expEntries;
  }

  // 5. Process EDUCATION
  const eduSec = sections.find(s => s.name === 'EDUCATION');
  if (eduSec) {
    const eduList: Education[] = [];
    let curEdu: Partial<Education> | null = null;

    for (let i = 0; i < eduSec.content.length; i++) {
      const line = eduSec.content[i];
      const dateMatch = line.match(/^(\d{4}\s*[-–—]\s*\d{4}|\d{4})\s*(.*)$/);

      if (dateMatch) {
        if (curEdu && curEdu.degree) {
          eduList.push(curEdu as Education);
        }
        const gradDate = dateMatch[1].trim();
        const degree = dateMatch[2]?.trim() || 'Degree';
        let institution = 'Premier Institute';

        if (i + 1 < eduSec.content.length && !eduSec.content[i + 1].match(/^(\d{4}\s*[-–—]\s*\d{4}|\d{4})/)) {
          institution = eduSec.content[i + 1].trim();
          i++;
        }

        curEdu = {
          id: `edu-${Date.now()}-${eduList.length}`,
          degree,
          institution,
          graduationDate: gradDate
        };
      } else if (/master|b\.tech|bachelor|mba|degree|phd|b\.s\.|m\.s\.|b\.e/i.test(line)) {
        if (curEdu && curEdu.degree) {
          eduList.push(curEdu as Education);
        }
        curEdu = {
          id: `edu-${Date.now()}-${eduList.length}`,
          degree: line,
          institution: 'Premier Institute',
          graduationDate: line.match(/\b(19\d\d|20\d\d)\b/)?.[0] || '2015'
        };
      } else if (curEdu) {
        if (!curEdu.institution || curEdu.institution === 'Premier Institute') {
          curEdu.institution = line;
        }
      }
    }

    if (curEdu && curEdu.degree) {
      eduList.push(curEdu as Education);
    }

    if (eduList.length > 0) {
      resume.education = eduList;
    }
  }

  // 6. Process CERTIFICATIONS
  const certSec = sections.find(s => s.name === 'CERTIFICATIONS');
  if (certSec) {
    const certList: string[] = [];
    let curCert = '';

    for (const line of certSec.content) {
      const clean = line.replace(/^[•\-*\d.]\s*/, '').trim();
      // If line is wrapped fragment like "(CIPSP)" or continuation
      if (line.startsWith('(') || clean.toLowerCase().startsWith('services and retail')) {
        curCert += ' ' + clean;
      } else {
        if (curCert && curCert.length > 5) {
          certList.push(curCert);
        }
        curCert = clean;
      }
    }

    if (curCert && curCert.length > 5) {
      certList.push(curCert);
    }

    if (certList.length > 0) {
      resume.certifications = certList;
    }
  }

  // 7. Process KEY ACHIEVEMENTS (Populate Projects & Attach to Experience)
  const achSec = sections.find(s => s.name === 'ACHIEVEMENTS');
  if (achSec) {
    const achievements: { company: string; text: string }[] = [];
    let curAch: { company: string; text: string } | null = null;

    for (const line of achSec.content) {
      const match = line.match(/^([A-Za-z0-9\s]+):\s*(.*)$/);
      if (match) {
        if (curAch) achievements.push(curAch);
        curAch = { company: match[1].trim(), text: match[2].trim() };
      } else if (curAch) {
        curAch.text += ' ' + line;
      } else {
        const clean = line.replace(/^[•\-*\d.]\s*/, '').trim();
        if (clean.length > 15) {
          achievements.push({ company: 'Key Milestone', text: clean });
        }
      }
    }

    if (curAch) achievements.push(curAch);

    // Populate achievements and projects list
    const defaultIcons: ('trophy' | 'award' | 'barchart' | 'trending' | 'gem' | 'rocket' | 'target')[] = [
      'award', 'barchart', 'trending', 'gem', 'rocket', 'target', 'trophy'
    ];

    resume.achievements = achievements.map((ach, idx) => ({
      id: `ach-${Date.now()}-${idx}`,
      title: `${ach.company}`,
      description: ach.text,
      icon: defaultIcons[idx % defaultIcons.length]
    }));

    resume.projects = achievements.map((ach, idx) => ({
      id: `proj-${Date.now()}-${idx}`,
      name: `${ach.company} Milestone`,
      description: ach.text,
      technologies: [],
      bullets: [ach.text],
      icon: defaultIcons[idx % defaultIcons.length]
    }));

    // Attach achievements to matching company experience bullets as key highlights
    if (resume.experience.length > 0) {
      resume.experience = resume.experience.map(exp => {
        const matched = achievements.filter(ach =>
          ach.company && exp.company.toLowerCase().includes(ach.company.toLowerCase())
        );
        if (matched.length > 0) {
          return {
            ...exp,
            bullets: [...exp.bullets, ...matched.map(m => `Key Achievement: ${m.text}`)]
          };
        }
        return exp;
      });
    }
  }

  return resume;
}

/**
 * Smart parsing of Job Description file into title, company, and body text
 */
export function parseExtractedTextToJobDescription(rawText: string, filename?: string): {
  title: string;
  company: string;
  text: string;
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let title = 'Target Role';
  let company = 'Target Company';

  if (filename) {
    const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    title = cleanName;
  }

  // Check top lines for Title / Company patterns
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (/job title|position|role:/i.test(line)) {
      title = line.replace(/job title|position|role:/i, '').trim();
    } else if (/company|organization:/i.test(line)) {
      company = line.replace(/company|organization:/i, '').trim();
    }
  }

  // If title was first line
  if (title === 'Target Role' && lines[0] && lines[0].length < 60) {
    title = lines[0];
  }

  return {
    title,
    company,
    text: rawText
  };
}

/**
 * Exports resume data to clean Markdown
 */
export function exportResumeToMarkdown(resume: ResumeData): string {
  let md = `# ${resume.fullName}\n`;
  md += `**${resume.title}**\n\n`;
  md += `${resume.email} | ${resume.phone} | ${resume.location}\n`;
  if (resume.linkedin) md += `LinkedIn: ${resume.linkedin} | `;
  if (resume.github) md += `GitHub: ${resume.github} | `;
  if (resume.website) md += `Portfolio: ${resume.website}\n`;
  md += `\n---\n\n`;

  if (resume.summary) {
    md += `## Professional Summary\n${resume.summary}\n\n`;
  }

  if (resume.skills && resume.skills.length > 0) {
    md += `## Technical Skills\n`;
    resume.skills.forEach(cat => {
      md += `- **${cat.categoryName}**: ${cat.skills.join(', ')}\n`;
    });
    md += `\n`;
  }

  if (resume.experience && resume.experience.length > 0) {
    md += `## Work Experience\n`;
    resume.experience.forEach(exp => {
      md += `### ${exp.role} – ${exp.company}\n`;
      md += `*${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}${exp.location ? ` | ${exp.location}` : ''}*\n\n`;
      exp.bullets.forEach(b => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    });
  }

  if (resume.projects && resume.projects.length > 0) {
    md += `## Projects\n`;
    resume.projects.forEach(proj => {
      md += `### ${proj.name}\n`;
      if (proj.technologies?.length > 0) {
        md += `*Technologies: ${proj.technologies.join(', ')}*\n\n`;
      }
      proj.bullets.forEach(b => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    });
  }

  if (resume.education && resume.education.length > 0) {
    md += `## Education\n`;
    resume.education.forEach(edu => {
      md += `### ${edu.degree} – ${edu.institution}\n`;
      md += `*Graduation: ${edu.graduationDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}*\n\n`;
    });
  }

  if (resume.certifications && resume.certifications.length > 0) {
    md += `## Certifications\n`;
    resume.certifications.forEach(cert => {
      md += `- ${cert}\n`;
    });
  }

  return md;
}

/**
 * Initiates download of a text file in browser
 */
export function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
