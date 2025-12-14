import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paste } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if paste exists in database
    const pasteData = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        visibility: paste.visibility,
        isDeleted: paste.isDeleted,
        userId: paste.userId,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
        views: paste.views,
        hasPassword: paste.password,
      })
      .from(paste)
      .where(eq(paste.slug, slug))
      .limit(1);

    if (pasteData.length === 0) {
      return NextResponse.json({
        found: false,
        message: "Paste not found in database",
        searchedSlug: slug,
      });
    }

    const foundPaste = pasteData[0];
    
    // Check if deleted
    if (foundPaste.isDeleted) {
      return NextResponse.json({
        found: true,
        accessible: false,
        reason: "Paste is marked as deleted",
        paste: {
          id: foundPaste.id,
          slug: foundPaste.slug,
          title: foundPaste.title,
          visibility: foundPaste.visibility,
          isDeleted: foundPaste.isDeleted,
          createdAt: foundPaste.createdAt,
          views: foundPaste.views,
        }
      });
    }

    // Check if expired
    const now = new Date();
    if (foundPaste.expiresAt && now > foundPaste.expiresAt) {
      return NextResponse.json({
        found: true,
        accessible: false,
        reason: "Paste has expired",
        expiredAt: foundPaste.expiresAt,
        currentTime: now,
        paste: {
          id: foundPaste.id,
          slug: foundPaste.slug,
          title: foundPaste.title,
          visibility: foundPaste.visibility,
          createdAt: foundPaste.createdAt,
          views: foundPaste.views,
        }
      });
    }

    return NextResponse.json({
      found: true,
      accessible: true,
      paste: {
        id: foundPaste.id,
        slug: foundPaste.slug,
        title: foundPaste.title,
        visibility: foundPaste.visibility,
        userId: foundPaste.userId ? "[HIDDEN]" : null,
        createdAt: foundPaste.createdAt,
        expiresAt: foundPaste.expiresAt,
        views: foundPaste.views,
        hasPassword: !!foundPaste.hasPassword,
      }
    });

  } catch (error) {
    console.error("Debug paste error:", error);
    return NextResponse.json({
      error: "Failed to check paste",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}