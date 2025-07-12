import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test the database connection by running a simple query
    const result = await db.execute(sql`SELECT 1 as status`);
    
    // If we get here, the database connection is working
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        version: await getDatabaseVersion(),
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}

async function getDatabaseVersion(): Promise<string> {
  try {
    const result = await db.execute(sql`SELECT version()`);
    return result.rows[0]?.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

// Set the revalidation time for this route (in seconds)
export const revalidate = 0; // No cache for health checks