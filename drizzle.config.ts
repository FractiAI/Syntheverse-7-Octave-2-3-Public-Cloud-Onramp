import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

process.env.NODE_ENV !== 'production' ? config({ path: '.env' }) : config({ path: '.env.local' }); // or .env.local
config({ path: '.env.local' });

// Validate DATABASE_URL before using
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it in your .env file or environment.'
  );
}

export default defineConfig({
  schema: './utils/db/schema.ts',
  out: './utils/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
