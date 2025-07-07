import { env } from './src/lib/env/setting-env';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/*.ts',
  out: './src/drizzle',
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schemaFilter: ["app", "auth"],

} satisfies Config;
