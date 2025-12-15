import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ItemPayload = {
  title: string;
  imageUrl: string;
  suggestionNumbers: string[];
  tags: string[];
};

function toCsv(arr: string[]) {
  return arr.map((s) => s.trim()).filter(Boolean).join(", ");
}

function fromCsv(csv: string) {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

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
  const tags = (body.tags || []).map((t) => t.trim()).filter(Boolean);

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: body.title?.trim(),
      imageUrl: body.imageUrl?.trim(),
      suggestionNumbers: toCsv(body.suggestionNumbers || []),
      tags: {
        set: [],
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    imageUrl: updated.imageUrl,
    suggestionNumbers: fromCsv(updated.suggestionNumbers),
    tags: updated.tags.map((t) => t.name),
  });
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

  await prisma.item.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}