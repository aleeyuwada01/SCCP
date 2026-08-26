import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from '../../_lib/db';
import { requireRole } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireRole(req, res, ['supervisor', 'revenue_officer', 'inspector']);
  if (!user) return;

  const { id } = req.query;
  const { status } = req.body;

  // Revenue officer can only mark as Paid/Approved
  if (user.role === 'revenue_officer' && !status.includes('Paid') && !status.startsWith('Approved')) {
    return res.status(403).json({ error: 'Revenue officers can only approve payments.' });
  }

  const now = new Date().toISOString();

  try {
    const db = await ensureDb();
    await db.execute({
      sql: 'UPDATE billboards SET status = ?, updated_at = ? WHERE id = ?',
      args: [status, now, id as string]
    });

    const historyId = 'h' + Date.now();
    await db.execute({
      sql: 'INSERT INTO billboard_status_history (id, billboard_id, new_status, changed_by, changed_at) VALUES (?, ?, ?, ?, ?)',
      args: [historyId, id as string, status, user.id, now]
    });

    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
