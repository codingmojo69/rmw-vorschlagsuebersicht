// src/app/api/items/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Wir importieren den Typ und die Funktion
import { classifyDimension, DimensionRule } from "@/lib/dimensions"; 

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

function normalizeNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

// GET: alle Items
export async function GET() {
  // 1. Daten laden (Prisma liefert hier 'dimension' als string)
  const rawRules = await prisma.dimensionDefinition.findMany();
  
  // 2. TYPE ASSERTION: Wir sagen TypeScript "Das sind valide DimensionRules"
  // Damit behalten wir deine strikte Logik in der classifyDimension Funktion bei!
  const rules = rawRules as unknown as DimensionRule[];

  const items = await prisma.item.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(
    items.map((item: any) => ({
      id: item.id,
      modelKey: item.modelKey,
      area: item.area,
      furnitureType: item.furnitureType,
      imageUrl: item.imageUrl,
      headline: item.headline,
      raster: item.raster,
      baseType: item.baseType,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      depthCm: item.depthCm,
      suggestionNumbers: Array.isArray(item.suggestionNumbers)
        ? item.suggestionNumbers
        : [],
      styleTags: Array.isArray(item.styleTags) ? item.styleTags : [],
      
      // Jetzt können wir die strengen Typen verwenden:
      depthKey: classifyDimension(rules, item.area, "DEPTH", item.depthCm),
      widthKey: classifyDimension(rules, item.area, "WIDTH", item.widthCm),
      heightKey: classifyDimension(rules, item.area, "HEIGHT", item.heightCm),
    }))
  );
}

// POST: neues Item
export async function POST(req: Request) {
  const body = await req.json();

  const styleTags = normalizeStringArray(body.styleTags || body.tags); 
  const suggestionNumbers = normalizeStringArray(body.suggestionNumbers);

  const widthCm = normalizeNumber(body.widthCm);
  const heightCm = normalizeNumber(body.heightCm);
  const depthCm = normalizeNumber(body.depthCm);

  if (!body.modelKey || !body.area || !body.furnitureType) {
    return NextResponse.json(
      { error: "Missing required fields: modelKey, area, furnitureType" },
      { status: 400 }
    );
  }

  if (!body.imageUrl) {
    return NextResponse.json(
      { error: "Missing required field: imageUrl" },
      { status: 400 }
    );
  }

  try {
    const item = await prisma.item.create({
      data: {
        modelKey: body.modelKey,
        area: body.area,
        furnitureType: body.furnitureType,
        imageUrl: body.imageUrl,
        headline: body.headline || body.title || null,
        raster: body.raster || null,
        baseType: body.baseType || null,
        widthCm,
        heightCm,
        depthCm,
        suggestionNumbers, 
        styleTags,         
      },
    });

    return NextResponse.json({ ok: true, id: item.id });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}