import { ResumeData, WorkExperience, Education } from '../types/resume';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs worker to local Vite bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extract raw text from a PDF file using pdfjs-dist
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

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width || 600;

      // Extract valid items with spatial positions
      const items = (content.items as any[])
        .filter(it => it && typeof it.str === 'string' && it.str.trim().length > 0)
        .map(it => ({
          str: it.str,
          x: it.transform ? it.transform[4] : 0,
          y: it.transform ? it.transform[5] : 0
        }));

      if (items.length === 0) continue;

      const midX = pageWidth * 0.45;
      const leftItems = items.filter(it => it.x < midX);
      const rightItems = items.filter(it => it.x >= midX);

      // If both columns contain significant items (> 20%), process columns separately
      const isMultiColumn = leftItems.length > items.length * 0.2 && rightItems.length > items.length * 0.2;

      const sortByYThenX = (a: any, b: any) => {
        if (Math.abs(b.y - a.y) < 5) return a.x - b.x;
        return b.y - a.y; // Higher Y coordinate is higher up on the page
      };

      if (isMultiColumn) {
        leftItems.sort(sortByYThenX);
        rightItems.sort(sortByYThenX);

        const buildColumnText = (col: typeof items) => {
          let colText = '';
          let lastY: number | null = null;
          for (const item of col) {
            if (lastY !== null && Math.abs(lastY - item.y) > 6) {
              colText += '\n';
            } else if (lastY !== null) {
              colText += ' ';
            }
            colText += item.str;
            lastY = item.y;
          }
          return colText;
        };

        fullText += buildColumnText(leftItems) + '\n\n' + buildColumnText(rightItems) + '\n\n';
      } else {
        items.sort(sortByYThenX);
        let pageText = '';
        let lastY: number | null = null;
        for (const item of items) {
          if (lastY !== null && Math.abs(lastY - item.y) > 6) {
            pageText += '\n';
          } else if (lastY !== null) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.y;
        }
        fullText += pageText + '\n\n';
      }
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
  // Default to text (txt, md, json, etc.)
  return file.text();
}

/**
 * Smart parsing of plain extracted text into a structured ResumeData object
 */
/**
 * Smart parsing of plain extracted text into a structured ResumeData object
 */
export function parseExtractedTextToResume(rawText: string, filename?: string): ResumeData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Identify Candidate Full Name
  let detectedName = '';
  const nonNameKeywords = ['profile', 'summary', 'area', 'excellence', 'experience', 'education', 'skills', 'curriculum', 'resume', 'contact'];

  for (const line of lines) {
    const clean = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = clean.split(/\s+/);
    const lower = clean.toLowerCase();

    // Check for ALL CAPS 2-3 word name, or title line without keywords
    if (words.length >= 2 && words.length <= 4) {
      if (!nonNameKeywords.some(kw => lower.includes(kw))) {
        if (line === line.toUpperCase() && line.length > 5) {
          detectedName = line.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          break;
        } else if (!detectedName && /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)) {
          detectedName = line;
        }
      }
    }
  }

  if (!detectedName && lines[0] && !nonNameKeywords.some(kw => lines[0].toLowerCase().includes(kw))) {
    detectedName = lines[0];
  }

  // Default structure
  const resume: ResumeData = {
    id: `resume-${Date.now()}`,
    fullName: detectedName || (filename ? filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Akash Bhattacharya'),
    title: 'Product / Project Manager | Strategy & Consulting',
    email: '',
    phone: '',
    location: '',
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

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?91[\s-]?\d{10}/);
  if (phoneMatch) resume.phone = phoneMatch[0];

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  if (linkedinMatch) resume.linkedin = linkedinMatch[0];

  // Section splitting
  const SECTION_HEADERS: Record<string, string> = {
    summary: 'SUMMARY',
    'profile summary': 'SUMMARY',
    'professional summary': 'SUMMARY',
    profile: 'SUMMARY',
    'area of excellence': 'SKILLS_EXCELLENCE',
    'areas of excellence': 'SKILLS_EXCELLENCE',
    'technical skills': 'SKILLS_TECH',
    skills: 'SKILLS_TECH',
    'core competencies': 'SKILLS_EXCELLENCE',
    certifications: 'CERTIFICATIONS',
    education: 'EDUCATION',
    'work experience': 'EXPERIENCE',
    'previous experience': 'EXPERIENCE',
    experience: 'EXPERIENCE',
    'notable accomplishments across career': 'ACCOMPLISHMENTS',
    accomplishments: 'ACCOMPLISHMENTS',
    projects: 'PROJECTS'
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

  // Process parsed sections
  const excellenceSkills: string[] = [];
  const techSkills: string[] = [];
  const accomplishmentsList: { companyTag: string; text: string }[] = [];

  sections.forEach(sec => {
    if (sec.name === 'SUMMARY') {
      resume.summary = sec.content.join(' ');
    } else if (sec.name === 'SKILLS_EXCELLENCE') {
      sec.content.forEach(line => {
        const parts = line.split(/[:,•|;\t]/).flatMap(p => p.split(',')).map(s => s.trim()).filter(Boolean);
        excellenceSkills.push(...parts);
      });
    } else if (sec.name === 'SKILLS_TECH') {
      sec.content.forEach(line => {
        const parts = line.split(/[:,•|;\t]/).flatMap(p => p.split(',')).map(s => s.trim()).filter(Boolean);
        techSkills.push(...parts);
      });
    } else if (sec.name === 'CERTIFICATIONS') {
      sec.content.forEach(line => {
        const clean = line.replace(/^[•\-*\d.]\s*/, '').trim();
        if (clean.length > 5) {
          resume.certifications = resume.certifications || [];
          resume.certifications.push(clean);
        }
      });
    } else if (sec.name === 'EDUCATION') {
      const eduList: Education[] = [];
      let currentEdu: Partial<Education> | null = null;

      sec.content.forEach(line => {
        const clean = line.replace(/^[•\-*\d.]\s*/, '').trim();
        if (/master|b\.tech|bachelor|mba|degree|phd|b\.s\.|m\.s\./i.test(clean)) {
          if (currentEdu && currentEdu.degree) {
            eduList.push(currentEdu as Education);
          }
          currentEdu = {
            id: `edu-${Date.now()}-${eduList.length}`,
            degree: clean,
            institution: 'Premier Institute',
            graduationDate: clean.match(/\b(19\d\d|20\d\d)\b/)?.[0] || '2015'
          };
        } else if (currentEdu) {
          if (!currentEdu.institution || currentEdu.institution === 'Premier Institute') {
            currentEdu.institution = clean;
          }
        }
      });
      const trailingEdu = currentEdu as Partial<Education> | null;
      if (trailingEdu && trailingEdu.degree) {
        eduList.push(trailingEdu as Education);
      }
      if (eduList.length > 0) {
        resume.education = eduList;
      }
    } else if (sec.name === 'ACCOMPLISHMENTS') {
      let currentTag = '';
      sec.content.forEach(line => {
        const tagMatch = line.match(/^\(([^)]+)\):?/);
        if (tagMatch) {
          currentTag = tagMatch[1].trim();
        } else {
          const clean = line.replace(/^[•\-*\d.]\s*/, '').trim();
          if (clean.length > 15) {
            accomplishmentsList.push({ companyTag: currentTag, text: clean });
          }
        }
      });
    } else if (sec.name === 'EXPERIENCE') {
      const expEntries: WorkExperience[] = [];
      let currentExp: WorkExperience | null = null;

      // Match patterns like: "Since Mar'25 with PwC AC , Bangalore / Kolkata as Product Manager/ Owner"
      // or "Jul'21-Feb'25 with Accenture Solutions , Bangalore / Kolkata as Product Owner"
      const roleRegex = /(?:since\s+)?([A-Za-z]{3}['’]\d{2}(?:\s*[-–]\s*(?:[A-Za-z]{3}['’]\d{2}|present))?)\s+with\s+([^,]+)(?:,\s*([^a]+?))?\s+as\s+(.+)/i;

      sec.content.forEach(line => {
        const match = line.match(roleRegex);
        if (match) {
          if (currentExp && currentExp.bullets.length > 0) {
            expEntries.push(currentExp);
          }
          const dates = match[1].trim();
          const company = match[2].trim();
          const location = match[3]?.trim() || '';
          const role = match[4]?.replace(/key result areas:?/i, '').trim();

          currentExp = {
            id: `exp-${Date.now()}-${expEntries.length}`,
            role: role || 'Product Manager',
            company: company || 'Company',
            location,
            startDate: dates.split(/[-–]/)[0]?.trim() || dates,
            endDate: dates.includes('-') || dates.includes('–') ? dates.split(/[-–]/)[1]?.trim() : 'Present',
            current: dates.toLowerCase().includes('since') || dates.toLowerCase().includes('present'),
            bullets: []
          };
        } else {
          // Check standard bullet or line
          const isHeaderIndicator = /key result areas:?/i.test(line);
          if (!isHeaderIndicator && currentExp) {
            const cleanBullet = line.replace(/^[•\-*\d.]\s*/, '').trim();
            if (cleanBullet.length > 15) {
              currentExp.bullets.push(cleanBullet);
            }
          }
        }
      });

      if (currentExp && (currentExp as WorkExperience).bullets.length > 0) {
        expEntries.push(currentExp);
      }

      if (expEntries.length > 0) {
        resume.experience = expEntries;
      }
    }
  });

  // Assign accomplishments to experiences if matched by company name
  if (accomplishmentsList.length > 0 && resume.experience.length > 0) {
    resume.experience = resume.experience.map(exp => {
      const matched = accomplishmentsList.filter(acc => 
        acc.companyTag && exp.company.toLowerCase().includes(acc.companyTag.toLowerCase())
      );
      if (matched.length > 0) {
        return {
          ...exp,
          bullets: [...exp.bullets, ...matched.map(m => `Notable Achievement: ${m.text}`)]
        };
      }
      return exp;
    });
  }

  // Construct structured skill categories
  if (excellenceSkills.length > 0) {
    resume.skills.push({
      id: `sk-exc-${Date.now()}`,
      categoryName: 'Areas of Excellence',
      skills: Array.from(new Set(excellenceSkills)).filter(s => s.length > 2 && s.length < 40)
    });
  }

  if (techSkills.length > 0) {
    resume.skills.push({
      id: `sk-tech-${Date.now()}`,
      categoryName: 'Technical & Analytics Tools',
      skills: Array.from(new Set(techSkills)).filter(s => s.length > 1 && s.length < 40)
    });
  }

  // If title was found in target assignments or header
  const titleMatch = rawText.match(/targeting assignments as\s+([^;\n]+)/i);
  if (titleMatch) {
    resume.title = titleMatch[1].trim();
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
