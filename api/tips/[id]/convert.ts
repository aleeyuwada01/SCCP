import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from '../../_lib/db';
import { requireRole } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireRole(req, res, ['supervisor', 'revenue_officer']);
  if (!user) return;

  const { id } = req.query;
  const { type } = req.body; // 'billboard' or 'construction'

  try {
    const db = await ensureDb();
    const { rows } = await db.execute({
      sql: 'SELECT * FROM public_tips WHERE id = ?',
      args: [id as string]
    });

    const tip = rows[0];
    if (!tip) return res.status(404).json({ error: 'Tip not found' });

    const now = new Date().toISOString();
    if (type === 'billboard') {
      const newId = 'b' + Date.now();
      await db.execute({
        sql: `INSERT INTO billboards (id, lat, lng, lga, status, created_at, updated_at) VALUES (?, ?, ?, 'Unknown', 'Unregistered', ?, ?)`,
        args: [newId, tip.lat as number, tip.lng as number, now, now]
      });
    } else {
      const newId = 'c' + Date.now();
      await db.execute({
        sql: `INSERT INTO construction_cases (id, lat, lng, lga, first_detected_at, detection_source, status, created_at, updated_at) VALUES (?, ?, ?, 'Unknown', ?, 'public_tip', 'Flagged', ?, ?)`,
        args: [newId, tip.lat as number, tip.lng as number, now, now, now]
      });
    }

    await db.execute({
      sql: 'UPDATE public_tips SET status = ? WHERE id = ?',
      args: ['Converted', id as string]
    });

    res.json({ success: true, message: 'Converted tip successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
