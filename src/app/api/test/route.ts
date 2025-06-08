import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "API routes are working",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "Set" : "Not set",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    }
  });
}