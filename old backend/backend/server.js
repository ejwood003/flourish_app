import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool, entityNameToTable, orderByClause } from './db.js';

const app = express();
const pool = getPool();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

// ----- Public settings (auth/bootstrap) -----
app.get('/api/apps/public/prod/public-settings/by-id/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const r = await pool.query(
      'SELECT data FROM public_settings WHERE app_id = $1',
      [appId]
    );
    if (r.rows.length === 0) {
      // Insert default so frontend can bootstrap
      await pool.query(
        'INSERT INTO public_settings (app_id, data) VALUES ($1, $2) ON CONFLICT (app_id) DO NOTHING',
        [appId, JSON.stringify({ requires_auth: false })]
      );
      return res.json({ requires_auth: false });
    }
    const data = r.rows[0].data;
    res.json(typeof data === 'object' ? data : JSON.parse(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// ----- User/me (stub for SDK auth) -----
app.get('/api/apps/:appId/entities/User/me', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, created_date, data FROM "user" LIMIT 1'
    );
    if (r.rows.length === 0) {
      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO "user" (id, data) VALUES ($1, $2)',
        [id, JSON.stringify({ id })]
      );
      return res.json({ id });
    }
    const row = r.rows[0];
    res.json({ id: row.id, created_date: row.created_date, ...row.data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// ----- Analytics (no-op) -----
app.post('/api/apps/:appId/analytics/track/batch', (req, res) => {
  res.status(204).end();
});

// ----- Entity CRUD -----
const ENTITY_TABLES = new Set([
  'user_profile', 'mood_entry', 'baby_activity', 'baby_mood', 'journal_entry',
  'custom_affirmation', 'affirmation_reaction', 'support_request',
  'selected_support_request', 'saved_resource', 'user'
]);

function rowToEntity(row) {
  const data = row.data && typeof row.data === 'object' ? row.data : {};
  return { id: row.id, created_date: row.created_date, ...data };
}

// List / Filter: GET /api/apps/:appId/entities/:entityName?sort=&limit=&skip=&q=
app.get('/api/apps/:appId/entities/:entityName', async (req, res) => {
  const { entityName } = req.params;
  const table = entityNameToTable(entityName);
  if (!ENTITY_TABLES.has(table)) {
    return res.status(404).json({ message: 'Entity not found' });
  }
  try {
    const { sort, limit, skip, q } = req.query;
    const safeTable = `"${table}"`; // "user" needs quotes
    let where = '';
    const params = [];
    let paramIndex = 1;
    if (q) {
      try {
        const filter = JSON.parse(q);
        const conditions = Object.entries(filter).map(([key, value]) => {
          const idx = paramIndex++;
          params.push(value);
          const safeKey = key.replace(/'/g, "''");
          return `(data->>'${safeKey}') = $${idx}`;
        });
        if (conditions.length) where = 'WHERE ' + conditions.join(' AND ');
      } catch (_) {
        // ignore bad q
      }
    }
    const order = orderByClause(sort, safeTable);
    const limitClause = limit ? `LIMIT ${Math.min(parseInt(limit, 10) || 100, 500)}` : 'LIMIT 100';
    const skipClause = skip ? `OFFSET ${Math.max(0, parseInt(skip, 10))}` : '';
    const sql = `SELECT id, created_date, data FROM ${safeTable} ${where} ${order} ${limitClause} ${skipClause}`;
    const r = await pool.query(sql, params);
    const list = r.rows.map(rowToEntity);
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// Get one: GET /api/apps/:appId/entities/:entityName/:id
app.get('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const table = entityNameToTable(entityName);
  if (!ENTITY_TABLES.has(table)) {
    return res.status(404).json({ message: 'Entity not found' });
  }
  try {
    const safeTable = `"${table}"`;
    const r = await pool.query(
      `SELECT id, created_date, data FROM ${safeTable} WHERE id = $1`,
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rowToEntity(r.rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// Create: POST /api/apps/:appId/entities/:entityName
app.post('/api/apps/:appId/entities/:entityName', async (req, res) => {
  const { entityName } = req.params;
  const table = entityNameToTable(entityName);
  if (!ENTITY_TABLES.has(table)) {
    return res.status(404).json({ message: 'Entity not found' });
  }
  try {
    const body = req.body || {};
    const id = body.id || crypto.randomUUID();
    const created_date = body.created_date || new Date().toISOString();
    const { id: _i, created_date: _c, ...rest } = body;
    const data = { ...rest };
    const safeTable = `"${table}"`;
    await pool.query(
      `INSERT INTO ${safeTable} (id, created_date, data) VALUES ($1, $2, $3)`,
      [id, created_date, JSON.stringify(data)]
    );
    const row = { id, created_date, ...data };
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// Update: PUT /api/apps/:appId/entities/:entityName/:id
app.put('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const table = entityNameToTable(entityName);
  if (!ENTITY_TABLES.has(table)) {
    return res.status(404).json({ message: 'Entity not found' });
  }
  try {
    const body = req.body || {};
    const { id: _i, created_date: _c, ...rest } = body;
    const data = { ...rest };
    const safeTable = `"${table}"`;
    const r = await pool.query(
      `UPDATE ${safeTable} SET data = data || $1::jsonb WHERE id = $2 RETURNING id, created_date, data`,
      [JSON.stringify(data), id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rowToEntity(r.rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// Delete: DELETE /api/apps/:appId/entities/:entityName/:id
app.delete('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const table = entityNameToTable(entityName);
  if (!ENTITY_TABLES.has(table)) {
    return res.status(404).json({ message: 'Entity not found' });
  }
  try {
    const safeTable = `"${table}"`;
    const r = await pool.query(`DELETE FROM ${safeTable} WHERE id = $1 RETURNING id`, [id]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Flourish API listening on http://localhost:${PORT}`);
});
