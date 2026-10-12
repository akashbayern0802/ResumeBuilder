import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Plugin } from 'vite';

export function sqlitePlugin(): Plugin {
  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.resolve(dbDir, 'resumes.db');
  const db = new Database(dbPath);

  // Initialize SQLite table for saved resumes
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_resumes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      candidate_name TEXT,
      target_role TEXT,
      template TEXT DEFAULT 'naukri',
      content_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return {
    name: 'vite-sqlite-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Match /api/resumes endpoints
        if (url.startsWith('/api/resumes')) {
          res.setHeader('Content-Type', 'application/json');

          // Helper to parse JSON body
          const getBody = (): Promise<any> => {
            return new Promise((resolve, reject) => {
              let data = '';
              req.on('data', chunk => { data += chunk; });
              req.on('end', () => {
                try {
                  resolve(data ? JSON.parse(data) : {});
                } catch (e) {
                  reject(e);
                }
              });
              req.on('error', reject);
            });
          };

          try {
            // GET /api/resumes - List all saved resumes
            if (req.method === 'GET' && (url === '/api/resumes' || url === '/api/resumes/')) {
              const rows = db.prepare(`
                SELECT id, title, candidate_name, target_role, template, created_at, updated_at
                FROM saved_resumes
                ORDER BY updated_at DESC
              `).all();
              res.end(JSON.stringify(rows));
              return;
            }

            // GET /api/resumes/:id - Get specific resume with content
            const idMatch = url.match(/^\/api\/resumes\/([^/?#]+)$/);
            if (req.method === 'GET' && idMatch) {
              const id = idMatch[1];
              const row = db.prepare(`SELECT * FROM saved_resumes WHERE id = ?`).get(id) as any;
              if (!row) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Resume not found' }));
                return;
              }
              res.end(JSON.stringify({
                ...row,
                resumeData: JSON.parse(row.content_json)
              }));
              return;
            }

            // POST /api/resumes - Create new saved resume
            if (req.method === 'POST' && (url === '/api/resumes' || url === '/api/resumes/')) {
              const body = await getBody();
              const id = body.id || `resume_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const title = body.title || 'Untitled Resume';
              const candidateName = body.candidateName || body.resumeData?.fullName || 'Candidate';
              const targetRole = body.targetRole || body.resumeData?.title || 'Professional';
              const template = body.template || 'naukri';
              const contentJson = JSON.stringify(body.resumeData || {});
              const now = new Date().toISOString();

              db.prepare(`
                INSERT INTO saved_resumes (id, title, candidate_name, target_role, template, content_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `).run(id, title, candidateName, targetRole, template, contentJson, now, now);

              res.statusCode = 201;
              res.end(JSON.stringify({
                success: true,
                id,
                title,
                candidate_name: candidateName,
                target_role: targetRole,
                template,
                created_at: now,
                updated_at: now
              }));
              return;
            }

            // PUT /api/resumes/:id - Update existing resume
            if (req.method === 'PUT' && idMatch) {
              const id = idMatch[1];
              const body = await getBody();
              const now = new Date().toISOString();

              const existing = db.prepare(`SELECT * FROM saved_resumes WHERE id = ?`).get(id) as any;
              if (!existing) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Resume not found' }));
                return;
              }

              const title = body.title !== undefined ? body.title : existing.title;
              const candidateName = body.candidateName !== undefined ? body.candidateName : (body.resumeData?.fullName || existing.candidate_name);
              const targetRole = body.targetRole !== undefined ? body.targetRole : (body.resumeData?.title || existing.target_role);
              const template = body.template !== undefined ? body.template : existing.template;
              const contentJson = body.resumeData ? JSON.stringify(body.resumeData) : existing.content_json;

              db.prepare(`
                UPDATE saved_resumes
                SET title = ?, candidate_name = ?, target_role = ?, template = ?, content_json = ?, updated_at = ?
                WHERE id = ?
              `).run(title, candidateName, targetRole, template, contentJson, now, id);

              res.end(JSON.stringify({
                success: true,
                id,
                title,
                candidate_name: candidateName,
                target_role: targetRole,
                template,
                updated_at: now
              }));
              return;
            }

            // DELETE /api/resumes/:id - Delete resume
            if (req.method === 'DELETE' && idMatch) {
              const id = idMatch[1];
              db.prepare(`DELETE FROM saved_resumes WHERE id = ?`).run(id);
              res.end(JSON.stringify({ success: true, message: 'Deleted successfully' }));
              return;
            }
          } catch (err: any) {
            console.error('SQLite API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Internal Database Error' }));
            return;
          }
        }

        next();
      });
    }
  };
}

