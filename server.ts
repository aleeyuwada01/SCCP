import express from 'express';
import cors from 'cors';
import { db, initDb, seedDb } from './src/db.js';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'urpb-super-secret-key';

// Mock Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB
  await initDb();
  await seedDb();

  // API Routes
  
  // Login Route
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const { rows } = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      });
      if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      
      const user = rows[0] as any;
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Users Management
  app.get('/api/users', authenticate, authorize(['supervisor']), async (req, res) => {
    try {
      const { rows } = await db.execute('SELECT id, name, email, phone, role FROM users');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics
  app.get('/api/analytics', authenticate, authorize(['supervisor', 'revenue_officer']), async (req, res) => {
    try {
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
  });

  // Billboards
  app.get('/api/billboards', authenticate, authorize(['supervisor', 'revenue_officer', 'inspector']), async (req, res) => {
    try {
      const { rows } = await db.execute('SELECT * FROM billboards');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/billboards', authenticate, authorize(['supervisor', 'inspector']), async (req, res) => {
    const b = req.body;
    const id = 'b' + Date.now();
    const query = `INSERT INTO billboards (id, lat, lng, lga, road_name, owner_name, owner_phone, dimensions, structure_type, status, created_by, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unregistered', ?, ?, ?)`;
    const now = new Date().toISOString();
    try {
      await db.execute({
        sql: query,
        args: [id, b.lat, b.lng, b.lga, b.road_name, b.owner_name, b.owner_phone, b.dimensions, b.structure_type, req.user?.id || 'u3', now, now]
      });
      res.json({ id, ...b, status: 'Unregistered' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/billboards/:id/status', authenticate, authorize(['supervisor', 'revenue_officer', 'inspector']), async (req, res) => {
    const { status } = req.body;
    
    // Revenue officer can only mark as Paid/Approved
    if (req.user?.role === 'revenue_officer' && !status.includes('Paid') && !status.startsWith('Approved')) {
       return res.status(403).json({ error: 'Revenue officers can only approve payments.' });
    }

    const now = new Date().toISOString();
    try {
      await db.execute({
        sql: 'UPDATE billboards SET status = ?, updated_at = ? WHERE id = ?',
        args: [status, now, req.params.id]
      });
      
      const historyId = 'h' + Date.now();
      await db.execute({
        sql: 'INSERT INTO billboard_status_history (id, billboard_id, new_status, changed_by, changed_at) VALUES (?, ?, ?, ?, ?)',
        args: [historyId, req.params.id, status, req.user?.id || 'u1', now]
      });
        
      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Construction Cases
  app.get('/api/cases', authenticate, authorize(['supervisor', 'revenue_officer', 'inspector']), async (req, res) => {
    try {
      const { rows } = await db.execute('SELECT * FROM construction_cases');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cases', authenticate, authorize(['supervisor', 'inspector']), async (req, res) => {
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
  });

  // Public Tips
  app.get('/api/tips', authenticate, authorize(['supervisor', 'revenue_officer', 'inspector']), async (req, res) => {
    try {
      const { rows } = await db.execute('SELECT * FROM public_tips');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Anyone can submit a tip (public endpoint)
  app.post('/api/tips', async (req, res) => {
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
  });
  
  app.post('/api/tips/:id/convert', authenticate, authorize(['supervisor', 'revenue_officer']), async (req, res) => {
    const { type } = req.body; // 'billboard' or 'construction'
    
    try {
      const { rows } = await db.execute({
        sql: 'SELECT * FROM public_tips WHERE id = ?',
        args: [req.params.id]
      });
      
      const tip = rows[0];
      if (!tip) return res.status(404).json({ error: 'Tip not found' });
      
      const now = new Date().toISOString();
      if (type === 'billboard') {
        const id = 'b' + Date.now();
        await db.execute({
          sql: `INSERT INTO billboards (id, lat, lng, lga, status, created_at, updated_at) VALUES (?, ?, ?, 'Unknown', 'Unregistered', ?, ?)`,
          args: [id, tip.lat as number, tip.lng as number, now, now]
        });
      } else {
        const id = 'c' + Date.now();
        await db.execute({
          sql: `INSERT INTO construction_cases (id, lat, lng, lga, first_detected_at, detection_source, status, created_at, updated_at) VALUES (?, ?, ?, 'Unknown', ?, 'public_tip', 'Flagged', ?, ?)`,
          args: [id, tip.lat as number, tip.lng as number, now, now, now]
        });
      }
      
      await db.execute({
        sql: 'UPDATE public_tips SET status = ? WHERE id = ?',
        args: ['Converted', req.params.id]
      });
      
      res.json({ success: true, message: 'Converted tip successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

