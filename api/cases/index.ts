import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from '../_lib/db';
import { requireRole } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await ensureDb();

  if (req.method === 'GET') {
    const user = requireRole(req, res, ['supervisor', 'revenue_officer', 'inspector']);
    if (!user) return;

    try {
      const { rows } = await db.execute('SELECT * FROM construction_cases');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = requireRole(req, res, ['supervisor', 'inspector']);
    if (!user) return;

    const c = req.body;
    const id = 'c' + Date.now();
    const query = `INSERT INTO construction_cases (id, lat, lng, lga, detection_source, status, first_detected_at, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, 'field_inspection', 'Flagged', ?, ?, ?)`;
    const now = new Date().toISOString();

    try {
      await db.execute({
        sql: query,
        args: [id, c.lat, c.lng, c.lga, now, now, now]
      });
      res.json({ id, ...c, detection_source: 'field_inspection', status: 'Flagged' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
