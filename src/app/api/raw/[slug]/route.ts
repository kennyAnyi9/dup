import { NextRequest, NextResponse } from "next/server";
import { getPaste } from "@/features/paste/actions/paste.actions";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { withRateLimit } from "@/shared/lib/advanced-rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Get current user for rate limiting
  const user = await getCurrentUser();
  
  return withRateLimit("RAW_ACCESS", async () => {
    try {
    const { slug } = await params;
    const url = new URL(request.url);
    const password = url.searchParams.get("password");

    const result = await getPaste({ 
      slug, 
      password: password || undefined 
    });

    if (!result.success || !result.paste) {
      if (result.requiresPassword) {
        return new NextResponse("Password required", { 
          status: 401,
          headers: {
            "Content-Type": "text/plain",
          }
        });
      }
      
      return new NextResponse("Paste not found", { 
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        }
      });
    }

    const paste = result.paste;
    
      return new NextResponse(paste.content, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename="${paste.title || paste.slug}.txt"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      console.error("Failed to fetch raw paste:", error);
      return new NextResponse("Internal server error", { 
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        }
      });
    }
  }, { userId: user?.id || null });
}