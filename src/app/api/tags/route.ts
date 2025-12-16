import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Hole NUR die styleTags von allen Items (spart Performance)
    const items = await prisma.item.findMany({
      select: {
        styleTags: true,
      },
    });

    // 2. Sammle alle Tags in einem Set (verhindert Duplikate automatisch)
    const uniqueTags = new Set<string>();

    items.forEach((item) => {
      // Prüfen, ob styleTags wirklich ein Array ist
      if (Array.isArray(item.styleTags)) {
        item.styleTags.forEach((tag) => {
          // Sicherstellen, dass es ein String ist
          if (typeof tag === "string" && tag.trim() !== "") {
            uniqueTags.add(tag.trim());
          }
        });
      }
    });

    // 3. Sortieren und in das Format bringen, das dein Frontend erwartet
    // Das Frontend erwartet vermutlich Objekte mit { id, name }
    const sortedTags = Array.from(uniqueTags)
      .sort()
      .map((tag) => ({
        id: tag,   // Da wir keine ID mehr haben, nehmen wir den Namen als ID
        name: tag,
      }));

    return NextResponse.json(sortedTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}