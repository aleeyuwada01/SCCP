import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDb } from './_lib/db';
import { signToken } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const db = await ensureDb();
    const { rows } = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0] as any;
    const token = signToken({ id: user.id, role: user.role, name: user.name });
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
