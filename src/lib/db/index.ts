import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';

export type QueryResult<T = any> = {
  rows: T[];
  rowCount: number;
  command: string;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For server-side queries (API routes, server components)
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

// For serverless/edge environments
const sql = neon(databaseUrl);

// Simple query function for server-side
const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// For serverless/edge environments
export const db = {
  // Server-side query (Node.js)
  query,
  
  // Client-side query (Edge/Serverless)
  sql: async <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> => {
    const queryString = strings.reduce(
      (acc, str, i) => acc + str + (values[i] !== undefined ? `$${i + 1}` : ''),
      ''
    );
    const result = await sql<T>(queryString, values);
    return Array.isArray(result) ? result : [];
  },
  
  // Close the connection pool
  close: async () => {
    await pool.end();
  },
};

// Example usage:
/*
// Server-side
const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);

// Client-side (in a server component or API route)
const data = await db.sql`SELECT * FROM users WHERE id = ${1}`;
const user = data[0];
*/

// Handle process termination
process.on('exit', () => {
  db.close().catch(console.error);
});
