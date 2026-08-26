import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from '../_lib/db';
import { requireRole } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await ensureDb();

  if (req.method === 'GET') {
    const user = requireRole(req, res, ['supervisor', 'revenue_officer', 'inspector']);
    if (!user) return;

    try {
      const { rows } = await db.execute('SELECT * FROM billboards');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = requireRole(req, res, ['supervisor', 'inspector']);
    if (!user) return;

    const b = req.body;
    const id = 'b' + Date.now();
    const query = `INSERT INTO billboards (id, lat, lng, lga, road_name, owner_name, owner_phone, dimensions, structure_type, status, created_by, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unregistered', ?, ?, ?)`;
    const now = new Date().toISOString();

    try {
      await db.execute({
        sql: query,
        args: [id, b.lat, b.lng, b.lga, b.road_name, b.owner_name, b.owner_phone, b.dimensions, b.structure_type, user.id, now, now]
      });
      res.json({ id, ...b, status: 'Unregistered' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
