import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from '../_lib/db';
import { requireAuth } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await ensureDb();

  if (req.method === 'GET') {
    // Authenticated users can view tips
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { rows } = await db.execute('SELECT * FROM public_tips');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    // Anyone can submit a tip (public endpoint)
    const t = req.body;
    const id = 't' + Date.now();
    const query = `INSERT INTO public_tips (id, lat, lng, description, photo_url, reporter_phone, status, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, 'New', ?)`;
    const now = new Date().toISOString();

    try {
      await db.execute({
        sql: query,
        args: [id, t.lat, t.lng, t.description, t.photo_url, t.reporter_phone, now]
      });
      res.json({ id, ...t, status: 'New', created_at: now });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
