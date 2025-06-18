import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import auth here to catch any import errors
    await import("@/shared/lib/auth");
    
    return NextResponse.json({ 
      message: "Better Auth import successful",
      config: {
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      }
    });
  } catch (error: unknown) {
    console.error("Auth import error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ 
      error: "Auth import failed",
      message,
      stack 
    }, { status: 500 });
  }
}