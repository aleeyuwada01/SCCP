import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from './_lib/db';
import { requireRole } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireRole(req, res, ['supervisor']);
  if (!user) return;

  try {
    const db = await ensureDb();
    const { rows } = await db.execute('SELECT id, name, email, phone, role FROM users');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
