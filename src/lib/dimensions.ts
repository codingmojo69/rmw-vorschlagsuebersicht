// src/lib/dimensions.ts

export type DimensionType = "DEPTH" | "WIDTH" | "HEIGHT";

export type DimensionRule = {
  id: string;
  area: string;
  dimension: DimensionType; // Wir bleiben STRENG!
  key: string;
  minCm: number | null;
  maxCm: number | null;
};

export function classifyDimension(
  rules: DimensionRule[],
  area: string,
  dimension: DimensionType, // Wir bleiben STRENG!
  valueCm: number
): string | null {
  if (!Number.isFinite(valueCm)) return null;

  const candidates = rules
    .filter((r) => r.area === area && r.dimension === dimension)
    .filter((r) => (r.minCm === null || valueCm >= r.minCm))
    .filter((r) => (r.maxCm === null || valueCm <= r.maxCm));

  if (candidates.length === 0) return null;

  const score = (r: DimensionRule) => {
    const min = r.minCm ?? -Infinity;
    const max = r.maxCm ?? Infinity;
    const span = max - min;
    const openPenalty =
      (r.minCm === null ? 1 : 0) + (r.maxCm === null ? 1 : 0);
    return { openPenalty, span, min };
  };

  candidates.sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sa.openPenalty !== sb.openPenalty) return sa.openPenalty - sb.openPenalty;
    if (sa.span !== sb.span) return sa.span - sb.span;
    return sa.min - sb.min;
  });

  return candidates[0].key;
}