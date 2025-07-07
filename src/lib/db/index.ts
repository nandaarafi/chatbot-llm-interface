import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { env } from '../env/setting-env';

declare global {
  var pg: Pool | undefined;
}

// For server components and API routes
let pool: Pool;

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Function to ensure schema exists
async function ensureSchemaExists(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS vidiopintar');
  } finally {
    client.release();
  }
}

if (env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // In development, we can reuse the same pool
  if (!global.pg) {
    global.pg = new Pool({
      connectionString: databaseUrl,
      ssl: false, // Disable SSL for local development
    });
  }
  pool = global.pg;
}

// Ensure schema exists before proceeding
ensureSchemaExists(pool).catch(err => {
  console.error('Failed to ensure schema exists:', err);
  process.exit(1);
});

// Create a SQL client for server components
export const db = drizzlePg(pool);

// Create a SQL client for edge runtime (Neon only)
export const dbEdge = () => {
  if (!databaseUrl.includes('neon.tech')) {
    throw new Error('dbEdge is only supported for Neon databases');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
};
