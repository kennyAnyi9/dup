import { checkUrlAvailability } from "@/features/paste/actions/paste.actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { available: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Trim and validate URL format
    const trimmedUrl = url.trim();
    if (trimmedUrl.length < 3 || trimmedUrl.length > 50) {
      return NextResponse.json(
        { available: false, error: "URL must be 3-50 characters" },
        { status: 400 }
      );
    }

    // Check URL format (letters, numbers, hyphens, underscores only)
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedUrl)) {
      return NextResponse.json(
        { available: false, error: "URL can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    const result = await checkUrlAvailability({ url: trimmedUrl });
    return NextResponse.json(result);
  } catch (error) {
    console.error("API: Check URL availability error:", error);
    return NextResponse.json(
      { available: false, error: "Failed to check URL availability" },
      { status: 500 }
    );
  }
}