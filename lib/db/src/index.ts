import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;
let _pool: pg.Pool | null = null;

function initDb(): DB {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle(_pool, { schema });
  return _db;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_t, prop) {
    if (!_pool) initDb();
    return (_pool as pg.Pool)[prop as keyof pg.Pool];
  },
});

export const db = new Proxy({} as DB, {
  get(_t, prop) {
    return (initDb() as any)[prop];
  },
});

export * from "./schema";
