import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function s(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function nOpt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

// GET: alle Regeln
export async function GET() {
  const rules = await prisma.dimensionDefinition.findMany({
    orderBy: [{ area: "asc" }, { dimension: "asc" }, { key: "asc" }],
  });
  return NextResponse.json(rules);
}

// POST: neue Regel
export async function POST(req: Request) {
  const body = await req.json();

  const area = s(body.area);
  const dimension = s(body.dimension);
  const key = s(body.key);
  const minCm = nOpt(body.minCm);
  const maxCm = nOpt(body.maxCm);

  if (!area || !dimension || !key) {
    return NextResponse.json(
      { error: "Missing required fields: area, dimension, key" },
      { status: 400 }
    );
  }

  if (minCm !== null && maxCm !== null && minCm > maxCm) {
    return NextResponse.json(
      { error: "minCm must be <= maxCm" },
      { status: 400 }
    );
  }

  const rule = await prisma.dimensionDefinition.create({
    data: { area, dimension, key, minCm, maxCm },
  });

  return NextResponse.json({ ok: true, id: rule.id });
}