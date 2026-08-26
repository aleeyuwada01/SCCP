import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'sccp.db');
export const db = createClient({ url: `file:${dbPath}` });

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      role TEXT,
      password_hash TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS billboards (
      id TEXT PRIMARY KEY,
      lat REAL,
      lng REAL,
      lga TEXT,
      road_name TEXT,
      owner_name TEXT,
      owner_phone TEXT,
      dimensions TEXT,
      structure_type TEXT,
      permit_number TEXT,
      status TEXT,
      fee_amount INTEGER,
      issue_date TEXT,
      expiry_date TEXT,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS billboard_photos (
      id TEXT PRIMARY KEY,
      billboard_id TEXT,
      photo_url TEXT,
      captured_at TEXT,
      captured_by TEXT,
      lat REAL,
      lng REAL,
      FOREIGN KEY(billboard_id) REFERENCES billboards(id),
      FOREIGN KEY(captured_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS billboard_status_history (
      id TEXT PRIMARY KEY,
      billboard_id TEXT,
      old_status TEXT,
      new_status TEXT,
      changed_by TEXT,
      changed_at TEXT,
      note TEXT,
      FOREIGN KEY(billboard_id) REFERENCES billboards(id),
      FOREIGN KEY(changed_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS construction_cases (
      id TEXT PRIMARY KEY,
      lat REAL,
      lng REAL,
      lga TEXT,
      first_detected_at TEXT,
      detection_source TEXT,
      footprint_estimate_m2 REAL,
      status TEXT,
      assigned_to TEXT,
      resolution_note TEXT,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS construction_case_photos (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      photo_url TEXT,
      captured_at TEXT,
      captured_by TEXT,
      lat REAL,
      lng REAL,
      FOREIGN KEY(case_id) REFERENCES construction_cases(id),
      FOREIGN KEY(captured_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS permits (
      id TEXT PRIMARY KEY,
      permit_number TEXT UNIQUE,
      holder_name TEXT,
      holder_phone TEXT,
      type TEXT,
      issued_at TEXT,
      expires_at TEXT,
      lat REAL,
      lng REAL,
      linked_id TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS public_tips (
      id TEXT PRIMARY KEY,
      lat REAL,
      lng REAL,
      description TEXT,
      photo_url TEXT,
      reporter_phone TEXT,
      status TEXT,
      created_at TEXT
    )
  `);
}

export async function seedDb() {
  const { rows } = await db.execute('SELECT count(*) as count FROM users');
  const count = rows[0].count as number;
  
  if (count === 0) {
    // Seed initial data
    await db.execute({
      sql: 'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)',
      args: ['u1', 'Admin Supervisor', 'admin@sccp.ng', '08000000001', 'supervisor', 'hash123']
    });
    await db.execute({
      sql: 'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)',
      args: ['u2', 'Revenue Officer', 'rev@sccp.ng', '08000000002', 'revenue_officer', 'hash123']
    });
    await db.execute({
      sql: 'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)',
      args: ['u3', 'Field Inspector 1', 'insp1@sccp.ng', '08000000003', 'inspector', 'hash123']
    });

    const now = new Date().toISOString();
    
    // Seed Billboards
    const billboards = [
      ['b1', 12.989, 7.604, 'Katsina', 'Kano Road', 'Musa Ads', '08011111111', '10x20', 'Unipole', 'PMT-001', 'Approved-Paid', 50000000, '2023-01-01', '2024-01-01', 'u3', now, now],
      ['b2', 13.001, 7.599, 'Katsina', 'IBB Way', 'Unknown', '', '5x10', 'Wall Drape', null, 'Unregistered', 0, null, null, 'u3', now, now],
      ['b3', 11.121, 7.319, 'Funtua', 'Zaria Rd', 'Global Signage', '08022222222', '20x40', 'Gantry', 'PMT-002', 'Approved-Payment Due', 100000000, '2023-05-01', '2024-05-01', 'u3', now, now],
      ['b4', 13.015, 7.612, 'Katsina', 'Ring Road', 'Katsina Media', '08033333333', '10x20', 'Unipole', 'PMT-003', 'Approved-Paid', 50000000, '2023-02-15', '2024-02-15', 'u3', now, now],
      ['b5', 13.030, 7.290, 'Daura', "Mai'adua Rd", 'Local Biz', '', '3x6', 'Static', null, 'Unregistered', 0, null, null, 'u3', now, now],
      ['b6', 12.990, 7.585, 'Katsina', 'Hospital Rd', 'Health Ads', '08044444444', '10x20', 'LED', 'PMT-004', 'Approved-Payment Due', 120000000, '2023-06-10', '2024-06-10', 'u3', now, now],
      ['b7', 12.800, 7.500, 'Dutsin-Ma', 'University Rd', 'Student Promo', '', '5x10', 'Wall Drape', null, 'Unregistered', 0, null, null, 'u3', now, now],
    ];

    for (const b of billboards) {
      await db.execute({
        sql: 'INSERT INTO billboards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: b
      });
    }

    // Seed Construction Cases
    const cases = [
      ['c1', 12.995, 7.610, 'Katsina', now, 'satellite', 250, 'Flagged', 'u3', null, now, now],
      ['c2', 13.045, 7.301, 'Daura', new Date(Date.now() - 20 * 86400000).toISOString(), 'drone', 400, 'Under Review', 'u3', null, now, now],
      ['c3', 12.980, 7.590, 'Katsina', new Date(Date.now() - 5 * 86400000).toISOString(), 'field_inspection', 150, 'Flagged', 'u3', null, now, now],
      ['c4', 11.130, 7.320, 'Funtua', new Date(Date.now() - 10 * 86400000).toISOString(), 'satellite', 600, 'Stop Work Order', 'u3', null, now, now],
      ['c5', 12.992, 7.620, 'Katsina', new Date(Date.now() - 2 * 86400000).toISOString(), 'drone', 120, 'Flagged', 'u3', null, now, now],
      ['c6', 12.810, 7.510, 'Dutsin-Ma', new Date(Date.now() - 15 * 86400000).toISOString(), 'satellite', 350, 'Approved', 'u3', null, now, now],
    ];

    for (const c of cases) {
      await db.execute({
        sql: 'INSERT INTO construction_cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: c
      });
    }
    
    await db.execute({
      sql: 'INSERT INTO public_tips VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: ['t1', 12.990, 7.600, 'Illegal construction starting near the junction', null, '08033333333', 'New', now]
    });

    console.log('Database seeded with demo data');
  }
}
