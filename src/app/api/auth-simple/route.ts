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
  } catch (error: any) {
    console.error("Auth API error:", error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}