import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Use connection pool instead of single client for better stability
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 2,  // Minimum number of clients in the pool  
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout for new connections
  // Keepalive settings to prevent connection drops
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
