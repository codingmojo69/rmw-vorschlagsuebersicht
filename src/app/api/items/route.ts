import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyDimension } from "@/lib/dimensions";

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
  const rules = await prisma.dimensionDefinition.findMany();

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
      depthKey: classifyDimension(rules, item.area, "DEPTH", item.depthCm),
      widthKey: classifyDimension(rules, item.area, "WIDTH", item.widthCm),
      heightKey: classifyDimension(rules, item.area, "HEIGHT", item.heightCm),
    }))
  );
}

// POST: neues Item
export async function POST(req: Request) {
  const body = await req.json();

  const styleTags = normalizeStringArray(body.styleTags);
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

  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || !Number.isFinite(depthCm)) {
    return NextResponse.json(
      { error: "Missing/invalid dimensions: widthCm, heightCm, depthCm" },
      { status: 400 }
    );
  }

  if (suggestionNumbers.length === 0) {
    return NextResponse.json(
      { error: "At least one suggestion number is required" },
      { status: 400 }
    );
  }

  const item = await prisma.item.create({
    data: {
      modelKey: body.modelKey,
      area: body.area,
      furnitureType: body.furnitureType,
      imageUrl: body.imageUrl,
      headline: body.headline || null,
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
}