import { ResumeData, ResumeTemplate } from '../types/resume';

export interface SavedResumeMetadata {
  id: string;
  title: string;
  candidate_name: string;
  target_role: string;
  template: ResumeTemplate;
  created_at: string;
  updated_at: string;
}

export interface SavedResumeDetail extends SavedResumeMetadata {
  resumeData: ResumeData;
}

export const sqliteService = {
  /**
   * Fetch all saved resumes from the local SQLite database
   */
  async listResumes(): Promise<SavedResumeMetadata[]> {
    try {
      const res = await fetch('/api/resumes');
      if (!res.ok) {
        throw new Error(`Failed to list resumes: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('SQLite server endpoint unavailable, checking fallback', err);
      return [];
    }
  },

  /**
   * Fetch a specific resume by its SQLite ID
   */
  async getResume(id: string): Promise<SavedResumeDetail | null> {
    try {
      const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch resume: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching resume from SQLite:', err);
      return null;
    }
  },

  /**
   * Save a new resume into SQLite
   */
  async createResume(data: {
    title: string;
    resumeData: ResumeData;
    template?: ResumeTemplate;
  }): Promise<SavedResumeMetadata> {
    const res = await fetch('/api/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save resume into SQLite');
    }

    return await res.json();
  },

  /**
   * Update an existing resume in SQLite
   */
  async updateResume(
    id: string,
    data: {
      title?: string;
      resumeData?: ResumeData;
      template?: ResumeTemplate;
    }
  ): Promise<SavedResumeMetadata> {
    const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update resume in SQLite');
    }

    return await res.json();
  },

  /**
   * Delete a resume from SQLite
   */
  async deleteResume(id: string): Promise<boolean> {
    const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    return res.ok;
  }
};

