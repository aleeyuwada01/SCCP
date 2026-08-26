import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from './_lib/db';
import { requireRole } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireRole(req, res, ['supervisor', 'revenue_officer']);
  if (!user) return;

  try {
    const db = await ensureDb();
    const { rows: statusRows } = await db.execute('SELECT status, count(*) as count FROM billboards GROUP BY status');
    const { rows: lgaRows } = await db.execute('SELECT lga, count(*) as count FROM billboards GROUP BY lga');
    const { rows: casesRows } = await db.execute("SELECT count(*) as count FROM construction_cases WHERE status != 'Closed'");

    const stats = {
      totalBillboards: statusRows.reduce((acc: number, row: any) => acc + (row.count as number), 0),
      compliant: statusRows.filter((r: any) => (r.status as string).startsWith('Approved')).reduce((acc: number, row: any) => acc + (row.count as number), 0),
      unregistered: statusRows.filter((r: any) => r.status === 'Unregistered').reduce((acc: number, row: any) => acc + (row.count as number), 0),
      leakageEstimateNaira: statusRows.filter((r: any) => r.status === 'Unregistered').reduce((acc: number, row: any) => acc + (row.count as number), 0) * 500000,
      lgaBreakdown: lgaRows,
      activeCases: casesRows[0]?.count || 0
    };
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
