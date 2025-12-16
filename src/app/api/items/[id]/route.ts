import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Typdefinition für die Daten, die vom Frontend kommen
type ItemPayload = {
  title: string;
  imageUrl: string;
  suggestionNumbers: string[];
  tags: string[];
};

// UPDATE ITEM
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = (await req.json()) as ItemPayload;

  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        // MAPPING: Frontend 'title' -> DB 'headline'
        headline: body.title?.trim(),
        
        imageUrl: body.imageUrl?.trim(),
        
        // JSON: Arrays direkt speichern (kein toCsv mehr nötig)
        suggestionNumbers: body.suggestionNumbers || [],
        
        // MAPPING: Frontend 'tags' -> DB 'styleTags' (JSON Feld)
        styleTags: body.tags || [],
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.headline, // Zurück mappen für das Frontend
      imageUrl: updated.imageUrl,
      suggestionNumbers: updated.suggestionNumbers, // Kommt als Array zurück
      tags: updated.styleTags, // Kommt als Array zurück
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

// DELETE ITEM
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 });
  }
}