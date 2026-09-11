import { Pool } from 'pg';
import type { DatabaseSchema } from './db';

let pool: Pool | null = null;
let isConnected = false;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL);
}

export function getPostgresPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected client pool error:', err);
    });

    return pool;
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize connection pool:', err);
    return null;
  }
}

/**
 * Initialize centralized PostgreSQL schema and migrate local dbState if table is empty
 */
export async function initPostgresDatabase(initialState: DatabaseSchema): Promise<DatabaseSchema | null> {
  const p = getPostgresPool();
  if (!p) return null;

  try {
    const client = await p.connect();
    try {
      // Create centralized store table
      await client.query(`
        CREATE TABLE IF NOT EXISTS blogge_collections (
          collection_name VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if collections already exist
      const res = await client.query('SELECT collection_name, data FROM blogge_collections;');
      
      if (res.rows.length === 0) {
        console.log('[PostgreSQL] Initializing and migrating local state to centralized database...');
        // Migrate all collections from initial / local dbState
        for (const [key, val] of Object.entries(initialState)) {
          await client.query(
            `INSERT INTO blogge_collections (collection_name, data, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (collection_name) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;`,
            [key, JSON.stringify(val)]
          );
        }
        console.log('[PostgreSQL] Migration completed successfully. Multi-instance persistence active.');
        isConnected = true;
        return initialState;
      } else {
        // Load centralized data into memory
        const remoteState: any = { ...initialState };
        for (const row of res.rows) {
          remoteState[row.collection_name] = row.data;
        }
        isConnected = true;
        console.log('[PostgreSQL] Successfully connected to centralized database. Multi-instance persistence active.');
        return remoteState as DatabaseSchema;
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[PostgreSQL] Centralized database connection failed, falling back to local storage:', err);
    isConnected = false;
    return null;
  }
}

export function isPostgresConnected(): boolean {
  return isConnected;
}

/**
 * Persist collection changes to centralized PostgreSQL database
 */
export async function syncPostgresDatabase(state: DatabaseSchema): Promise<void> {
  if (!isConnected) return;
  const p = getPostgresPool();
  if (!p) return;

  try {
    const client = await p.connect();
    try {
      for (const [key, val] of Object.entries(state)) {
        await client.query(
          `INSERT INTO blogge_collections (collection_name, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (collection_name) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;`,
          [key, JSON.stringify(val)]
        );
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[PostgreSQL] Async collection sync error:', err);
  }
}

/**
 * Gracefully terminates the PostgreSQL connection pool during shutdown
 */
export async function closePostgresPool(): Promise<void> {
  if (pool) {
    try {
      console.log('[PostgreSQL] Closing connection pool...');
      await pool.end();
      pool = null;
      isConnected = false;
      console.log('[PostgreSQL] Connection pool gracefully closed.');
    } catch (err) {
      console.error('[PostgreSQL] Error closing connection pool:', err);
    }
  }
}
