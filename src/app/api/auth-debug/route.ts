import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import auth here to catch any import errors
    const { auth } = await import("@/lib/auth");
    
    return NextResponse.json({ 
      message: "Better Auth import successful",
      config: {
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      }
    });
  } catch (error: any) {
    console.error("Auth import error:", error);
    return NextResponse.json({ 
      error: "Auth import failed",
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}