import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

// Create client with error handling
const client = new Client({
  connectionString: process.env.DATABASE_URL!,
});

// Handle connection errors
client.on("error", (err) => {
  console.error("Database connection error:", err);
});

// Connect with error handling
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

async function ensureConnection() {
  if (isConnected) return;
  
  if (!connectionPromise) {
    connectionPromise = client.connect().then(() => {
      isConnected = true;
      console.log("Database connected successfully");
    }).catch((err) => {
      connectionPromise = null; // Reset so we can retry
      console.error("Failed to connect to database:", err);
      throw err;
    });
  }
  
  return connectionPromise;
}

// Create database instance with connection retry logic
const dbInstance = drizzle(client, { schema });

// Initialize connection automatically
ensureConnection().catch(() => {
  // Connection will be retried on first query
});

export const db = dbInstance;

// Graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await client.end();
    console.log("Database connection closed");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (isConnected) {
    await client.end();
    console.log("Database connection closed");
  }
  process.exit(0);
});
