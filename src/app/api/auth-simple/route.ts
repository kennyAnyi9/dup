import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Test a simple auth API call
    const session = await auth.api.getSession({
      headers: new Headers(),
    });
    
    return NextResponse.json({ 
      success: true,
      hasSession: !!session,
      session: session || null
    });
  } catch (error: unknown) {
    console.error("Auth API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ 
      success: false,
      error: message,
      stack
    }, { status: 500 });
  }
}