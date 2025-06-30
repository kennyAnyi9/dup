import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,

  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

pool.on("connect", () => {
  console.log("Database client connected to pool");
});

// Create database instance with pool
export const db = drizzle(pool, { schema });

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("Database pool closed");
  } catch (err) {
    console.error("Error closing database pool:", err);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  try {
    await pool.end();
    console.log("Database pool closed");
  } catch (err) {
    console.error("Error closing database pool:", err);
  }
  process.exit(0);
});
