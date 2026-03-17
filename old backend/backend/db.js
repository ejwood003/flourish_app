import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/flourish';

const pool = new pg.Pool({
  connectionString,
});

/**
 * Convert PascalCase entity name to snake_case table name.
 * UserProfile -> user_profile, MoodEntry -> mood_entry
 */
export function entityNameToTable(entityName) {
  const s = entityName.replace(/([A-Z])/g, '_$1').toLowerCase();
  return s.startsWith('_') ? s.slice(1) : s;
}

/**
 * Get Postgres client from pool.
 */
export function getPool() {
  return pool;
}

/**
 * Build ORDER BY from sort param (e.g. "-created_date" -> created_date DESC, "date" -> date ASC).
 * Sort can be a field name; prefix "-" means DESC.
 */
export function orderByClause(sort, tableName) {
  if (!sort || typeof sort !== 'string') return '';
  const desc = sort.startsWith('-');
  const field = sort.startsWith('-') ? sort.slice(1) : sort;
  // Map common sort fields to column or jsonb path
  if (field === 'created_date') return `ORDER BY ${tableName}.created_date ${desc ? 'DESC' : 'ASC'}`;
  if (field === 'date') return `ORDER BY (${tableName}.data->>'date') ${desc ? 'DESC' : 'ASC'}`;
  if (field === 'timestamp') return `ORDER BY (${tableName}.data->>'timestamp') ${desc ? 'DESC' : 'ASC'}`;
  if (field === 'selected_date') return `ORDER BY (${tableName}.data->>'selected_date') ${desc ? 'DESC' : 'ASC'}`;
  return `ORDER BY ${tableName}.created_date DESC`;
}

export default pool;
