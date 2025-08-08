import { trackPasteView } from "@/shared/lib/analytics";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/shared/lib/advanced-rate-limit";

export async function POST(request: NextRequest) {
  return withRateLimit("GENERAL_API", async () => {
    try {
      const body = await request.json();
      const { pasteId } = body;

      if (!pasteId || typeof pasteId !== "string") {
        return NextResponse.json(
          { error: "Invalid paste ID" },
          { status: 400 }
        );
      }

      // Track the paste view
      await trackPasteView(pasteId);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error tracking paste view:", error);
      // Don't expose internal errors to client
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: 500 }
      );
    }
  });
}