#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'seed.sql');

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/flourish';

async function seed() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const sql = readFileSync(seedPath, 'utf8');
    await client.query(sql);
    console.log('Seed data applied successfully.');
  } catch (err) {
    console.error('Failed to seed DB:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
