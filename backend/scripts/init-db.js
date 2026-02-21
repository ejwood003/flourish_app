#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schema.sql');

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/flourish';

async function init() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const sql = readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to init DB:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

init();
