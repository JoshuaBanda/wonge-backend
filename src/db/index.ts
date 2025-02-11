// db.ts
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { inboxParticipantsTable, inboxTable, usersTable } from './schema'; // Adjust the import path

config({ path: '.env' });

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {
  schema: {
  },
});
