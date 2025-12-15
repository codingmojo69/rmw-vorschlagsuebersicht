'use client';

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  // From API
  modelKey?: string;
  area?: string;
  furnitureType?: string;
  imageUrl: string;
  headline?: string | null;
  raster?: string | null;
  baseType?: string | null;
  suggestionNumbers: string[];
  styleTags?: string[];
  // computed by API (optional)
  depthKey?: string | null;
  widthKey?: string | null;
  heightKey?: string | null;
};

function getTags(item: Item): string[] {
  return Array.isArray(item.styleTags) ? item.styleTags : [];
}

function uniqueTags(items: Item[]) {
  const set = new Set<string>();
  items.forEach((item) => {
    getTags(item).forEach((t) => set.add(t));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pretty(v?: string | null) {
  return (v ?? "").toString().trim();
}


function labelModel(modelKey?: string | null) {
  const v = pretty(modelKey);
  if (!v) return "";
  // Keep uppercase model keys readable
  return v.charAt(0) + v.slice(1).toLowerCase();
}

function labelFurnitureType(furnitureType?: string | null) {
  const v = pretty(furnitureType);
  if (!v) return "";

  // Normalize separators and casing
  const cleaned = v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If it contains a mix of letters/numbers (e.g. "TV" or "A100"), keep tokens that are already all caps or numeric.
  return cleaned
    .split(" ")
    .map((w) => {
      if (!w) return w;
      // keep short all-caps tokens like TV, LED
      if (w.length <= 3 && w === w.toUpperCase()) return w;
      // keep tokens that have numbers (A100, 3D)
      if (/[0-9]/.test(w) && w === w.toUpperCase()) return w;

      const lower = w.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}


function labelArea(area?: string | null) {
  const v = pretty(area);
  const map: Record<string, string> = {
    WOHNEN: "Wohnen",
    SPEISEN: "Speisen",
    GARDEROBE: "Garderobe",
    BUERO: "Büro",
    SCHLAFEN: "Schlafen",
  };
  return map[v] || v;
}

// User-friendly label helpers for filter dropdowns
function labelRaster(raster?: string | null) {
  const v = pretty(raster);
  if (!v) return "";
  // Accept formats like "RASTER_2_5", "2_5", "2.5", "2,5" etc.
  const m = v.match(/(\d+(?:[\.,_]?\d+)?)/);
  if (!m) return v;
  const raw = m[1].replace(/_/g, ".");
  const num = raw.replace(/\./g, ",");
  return num; // show only the number (e.g. 2,5)
}

function labelBaseType(base?: string | null) {
  const v = pretty(base);
  const map: Record<string, string> = {
    FEET: "Füße",
    FOOT: "Füße",
    FEET_GLIDE: "Gleiter",
    GLIDES: "Gleiter",
    SKID: "Kufe",
    SKIDS: "Kufen",
    SLED: "Kufe",
    SLED_BASE: "Kufe",
    FRAME: "Rahmengestell",
    FRAME_BASE: "Rahmengestell",
    BASE: "Sockel",
    PLINTH: "Sockel",
    WALL: "Hängend",
    HANGING: "Hängend",
  };
  return map[v] || (v ? v.charAt(0) + v.slice(1).toLowerCase() : "");
}

function labelDimKey(key?: string | null, kind?: "width" | "height" | "depth") {
  const v = pretty(key);
  if (!v) return "";
  const up = v.toUpperCase();

  const widthMap: Record<string, string> = {
    SLIM: "Schmal",
    NARROW: "Schmal",
    STANDARD: "Standard",
    NORMAL: "Standard",
    WIDE: "Breit",
    LARGE: "Breit",
    XL: "Sehr breit",
  };

  const heightMap: Record<string, string> = {
    LOW: "Niedrig",
    SHORT: "Niedrig",
    STANDARD: "Standard",
    NORMAL: "Standard",
    HIGH: "Hoch",
    TALL: "Hoch",
    XL: "Sehr hoch",
  };

  const depthMap: Record<string, string> = {
    SHALLOW: "Flach",
    SLIM: "Flach",
    STANDARD: "Standard",
    NORMAL: "Standard",
    DEEP: "Tief",
    XL: "Sehr tief",
  };

  const map =
    kind === "width" ? widthMap : kind === "height" ? heightMap : depthMap;

  return map[up] || v;
}

function titleForItem(item: Item) {
  const h = pretty(item.headline);
  if (h) return h;
  const ft = pretty(item.furnitureType);
  const bt = pretty(item.baseType);
  const r = pretty(item.raster);
  const parts = [ft, bt && `(${bt})`, r && `${r}`].filter(Boolean);
  return parts.join(" ") || "Vorschlag";
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const allTags = useMemo(() => uniqueTags(items), [items]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showProFilters, setShowProFilters] = useState(false);
  const [filterModel, setFilterModel] = useState<string>("");
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterWidthKey, setFilterWidthKey] = useState<string>("");
  const [filterHeightKey, setFilterHeightKey] = useState<string>("");
  const [filterDepthKey, setFilterDepthKey] = useState<string>("");
  const [filterRaster, setFilterRaster] = useState<string>("");
  const [filterBase, setFilterBase] = useState<string>("");
  const modelOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.modelKey && set.add(i.modelKey));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.area && set.add(i.area));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.furnitureType && set.add(i.furnitureType));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const rasterOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.raster && set.add(i.raster));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const baseOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.baseType && set.add(i.baseType));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const widthKeyOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.widthKey && set.add(i.widthKey));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const heightKeyOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.heightKey && set.add(i.heightKey));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const depthKeyOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.depthKey && set.add(i.depthKey));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setItemsLoading(true);
        setItemsError(null);

        const res = await fetch("/api/items", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as Item[];
        if (alive) setItems(data);
      } catch (e: any) {
        if (alive) setItemsError(e?.message || "Load failed");
      } finally {
        if (alive) setItemsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        (titleForItem(item) ?? "").toLowerCase().includes(q) ||
        item.suggestionNumbers.join(" ").toLowerCase().includes(q) ||
        getTags(item).join(" ").toLowerCase().includes(q);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => getTags(item).includes(t));

      const matchesModel = !filterModel || (item.modelKey ?? "") === filterModel;
      const matchesArea = !filterArea || (item.area ?? "") === filterArea;
      const matchesType = !filterType || (item.furnitureType ?? "") === filterType;
      const matchesWidthKey = !filterWidthKey || (item.widthKey ?? "") === filterWidthKey;
      const matchesHeightKey = !filterHeightKey || (item.heightKey ?? "") === filterHeightKey;
      const matchesDepthKey = !filterDepthKey || (item.depthKey ?? "") === filterDepthKey;
      const matchesRaster = !filterRaster || (item.raster ?? "") === filterRaster;
      const matchesBase = !filterBase || (item.baseType ?? "") === filterBase;

      return (
        matchesQuery &&
        matchesTags &&
        matchesModel &&
        matchesArea &&
        matchesType &&
        matchesWidthKey &&
        matchesHeightKey &&
        matchesDepthKey &&
        matchesRaster &&
        matchesBase
      );
    });
  }, [
    query,
    selectedTags,
    filterModel,
    filterArea,
    filterType,
    filterWidthKey,
    filterHeightKey,
    filterDepthKey,
    filterRaster,
    filterBase,
    items,
  ]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSelectedTags([]);
    setQuery("");
    setFilterModel("");
    setFilterArea("");
    setFilterType("");
    setFilterWidthKey("");
    setFilterHeightKey("");
    setFilterDepthKey("");
    setFilterRaster("");
    setFilterBase("");
    setShowProFilters(false);
  }

  async function copySuggestionNumbers(nums: string[]) {
    const copied = nums.join(", ");
    const key = Date.now();

    try {
      await navigator.clipboard.writeText(copied);

      if ("vibrate" in navigator) (navigator as any).vibrate?.(20);

      setCopyOverlay({ text: copied, ok: true, key });

      window.setTimeout(() => setCopyOverlay(null), 2800);
    } catch {
      setCopyOverlay({ text: "Clipboard blocked", ok: false, key });
      window.setTimeout(() => setCopyOverlay(null), 2800);
    }
  }

  const [copyOverlay, setCopyOverlay] = useState<{
    text: string;
    ok: boolean;
    key: number;
  } | null>(null);

  return (
    <main className="min-h-screen text-slate-900">
      {/* Background (premium, subtle) */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(79,70,229,0.55),transparent_65%),radial-gradient(1000px_circle_at_85%_20%,rgba(190,24,93,0.45),transparent_65%),radial-gradient(1000px_circle_at_30%_85%,rgba(21,128,61,0.40),transparent_65%),radial-gradient(900px_circle_at_80%_80%,rgba(2,132,199,0.40),transparent_65%),linear-gradient(to_bottom,rgba(10,12,18,1),rgba(20,24,36,1))]" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <h1 className="text-[18px] font-semibold tracking-tight">
              RMW Vorschlagsübersicht
            </h1>
            <p className="text-xs text-slate-600">
              Klick auf ein Bild → Vorschlagsnummern werden kopiert
            </p>
          </div>

          {/* Standard filters (always visible) */}
<div className="mx-auto max-w-6xl px-4 pb-4">
  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
    <div className="md:col-span-4">
      <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
        Modell
      </label>
      <select
        value={filterModel}
        onChange={(e) => setFilterModel(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
      >
        <option value="">Alle</option>
        {modelOptions.map((m) => (
          <option key={m} value={m}>
            {labelModel(m)}
          </option>
        ))}
      </select>
    </div>

    <div className="md:col-span-4">
      <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
        Bereich
      </label>
      <select
        value={filterArea}
        onChange={(e) => setFilterArea(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
      >
        <option value="">Alle</option>
        {areaOptions.map((a) => (
          <option key={a} value={a}>
            {labelArea(a)}
          </option>
        ))}
      </select>
    </div>

    <div className="md:col-span-4">
      <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
        Möbeltyp
      </label>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
      >
        <option value="">Alle</option>
        {typeOptions.map((t) => (
          <option key={t} value={t}>
            {labelFurnitureType(t)}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
    <span>{filtered.length} Treffer</span>
    <span className="hidden md:block">
      Filter-Logik: <b className="text-slate-800">UND</b>
    </span>
  </div>
</div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche: Titel, Nummer…"
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-black/20 focus:bg-white md:w-[320px]"
            />
            <button
              onClick={clearFilters}
              className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2.5 text-sm text-slate-800 hover:bg-white"
            >
              Reset
            </button>
            <button
              onClick={() => setShowProFilters((v) => !v)}
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-sm transition",
                showProFilters
                  ? "border-black/20 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  : "border-black/10 bg-white/70 text-slate-800 hover:bg-white"
              )}
            >
              Profi-Filter {showProFilters ? "ausblenden" : "einblenden"}
            </button>
          </div>
        </div>
        
        {showProFilters && (
          <div className="mx-auto max-w-6xl px-4 pb-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Modell
                </label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>
                      {labelModel(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Bereich
                </label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {areaOptions.map((a) => (
                    <option key={a} value={a}>
                      {labelArea(a)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Möbeltyp
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {labelFurnitureType(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Raster
                </label>
                <select
                  value={filterRaster}
                  onChange={(e) => setFilterRaster(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {rasterOptions.map((r) => (
                    <option key={r} value={r}>
                      {labelRaster(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Unterbau
                </label>
                <select
                  value={filterBase}
                  onChange={(e) => setFilterBase(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {baseOptions.map((b) => (
                    <option key={b} value={b}>
                      {labelBaseType(b)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Breite
                </label>
                <select
                  value={filterWidthKey}
                  onChange={(e) => setFilterWidthKey(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {widthKeyOptions.map((k) => (
                    <option key={k} value={k}>
                      {labelDimKey(k, "width")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Höhe
                </label>
                <select
                  value={filterHeightKey}
                  onChange={(e) => setFilterHeightKey(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {heightKeyOptions.map((k) => (
                    <option key={k} value={k}>
                      {labelDimKey(k, "height")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-600">
                  Tiefe
                </label>
                <select
                  value={filterDepthKey}
                  onChange={(e) => setFilterDepthKey(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-black/20 focus:bg-white"
                >
                  <option value="">Alle</option>
                  {depthKeyOptions.map((k) => (
                    <option key={k} value={k}>
                      {labelDimKey(k, "depth")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 text-[12px] text-slate-600">
              Profi-Filter greifen zusätzlich zur Suche & Tags. Logik bleibt <b className="text-slate-800">UND</b>.
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-6xl px-4 py-8">

        {itemsLoading && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-white/70 p-6 text-slate-700 shadow">
            Lade Kacheln…
          </div>
        )}

        {itemsError && (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-800 shadow">
            Fehler beim Laden: <span className="font-mono">{itemsError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {filtered.map((item, idx) => {
            const isFeature = idx % 5 === 0;

            return (
              <button
                key={item.id}
                onClick={() => copySuggestionNumbers(item.suggestionNumbers)}
                className={cn(
                  "group text-left",
                  "md:col-span-6",
                  isFeature && "md:col-span-12"
                )}
              >
                <div className="glass-card flex flex-col gap-4 p-5 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.01]">
                  <div
                    className={cn(
                      "glass-media relative overflow-hidden rounded-[22px]",
                      isFeature ? "aspect-[16/7]" : "aspect-[4/3]"
                    )}
                  >
                    <img
                      src={item.imageUrl}
                      alt={titleForItem(item)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-4 px-1 pb-1">
                    {/* Title */}
                    <div>
                      <h3 className="text-[28px] leading-[1.05] font-semibold tracking-tight text-white md:text-[34px]">
                        {titleForItem(item)}
                      </h3>
                      <p className="mt-2 text-sm text-white/70">
                        {labelModel(item.modelKey)}
                        {item.modelKey && item.area ? " · " : ""}
                        {labelArea(item.area)}
                      </p>
                    </div>


                    {/* Bottom row like reference: stats left, action pill right */}
                    <div className="flex items-center justify-between gap-4">
                      <div />

                      <div className="glass-pill flex items-center gap-2 px-5 py-2.5 text-xs font-semibold">
                        <span className="opacity-80">Nr.</span>
                        <span className="font-mono">{item.suggestionNumbers.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!itemsLoading && !itemsError && filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-8 text-center text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            Keine Treffer. Versuch weniger Filter oder andere Suchbegriffe.
          </div>
        )}
      </div>

      {/* Copy Overlay */}
      {copyOverlay && (
        <div
          key={copyOverlay.key}
          className="fixed inset-0 z-[999] grid place-items-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md animate-[overlayLife_2800ms_ease-in-out_forwards]" />

          {/* Glass modal */}
          <div className="copy-modal relative mx-4 w-[min(720px,92vw)] overflow-hidden rounded-[28px] p-7 text-center animate-[modalLife_2800ms_cubic-bezier(0.2,0.9,0.2,1)_forwards]">
            {/* subtle highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/15" />
            <div className="pointer-events-none absolute -inset-20 opacity-30 blur-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />

            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] tracking-[0.22em] text-white/85 backdrop-blur-xl">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  copyOverlay.ok ? "bg-emerald-400" : "bg-rose-400"
                )}
              />
              {copyOverlay.ok ? "KOPIERT" : "FEHLER"}
            </div>

            <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Vorschlagsnummern kopiert
            </div>

            <div className="mt-5 rounded-2xl border border-white/12 bg-black/25 px-5 py-4 font-mono text-base text-white/90 backdrop-blur-2xl md:text-lg">
              {copyOverlay.text}
            </div>

            <p className="mt-4 text-sm text-white/70">
              Jetzt einfach einfügen: <span className="font-semibold text-white">Cmd + V</span>
            </p>

            {/* Progress */}
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left bg-white/60 animate-[progressShrink_2800ms_linear_forwards]" />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes cardIn {
          0% {
            transform: translateY(14px) scale(0.92);
            opacity: 0;
            filter: blur(10px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes overlayFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes overlayLife {
          0% { opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes modalLife {
          0% { transform: translateY(14px) scale(0.96); opacity: 0; filter: blur(10px); }
          12% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
          85% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(8px) scale(0.985); opacity: 0; }
        }

        @keyframes progressShrink {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }

        .glass-card {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.22),
            rgba(255, 255, 255, 0.08)
          );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.35),
            0 8px 32px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.50),
            inset 0 -1px 0 rgba(255, 255, 255, 0.10),
            inset 0 0 38px 18px rgba(255, 255, 255, 0.10);
          position: relative;
          overflow: hidden;
          color: rgba(255, 255, 255, 0.92);
        }

        .copy-modal {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.16),
            rgba(255, 255, 255, 0.06)
          );
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.55),
            0 10px 30px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            inset 0 -1px 0 rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .glass-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.65),
            transparent
          );
          pointer-events: none;
        }

        .glass-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.65),
            transparent,
            rgba(255, 255, 255, 0.35)
          );
          pointer-events: none;
        }

        .glass-media {
          border: none;
          background: transparent;
          box-shadow: none;
        }

        .glass-media img {
          display: block;
        }

        .glass-pill {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
          color: rgba(255, 255, 255, 0.92);
          transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
          white-space: nowrap;
        }

        .glass-card:hover .glass-pill {
          transform: translateY(-1px);
          background: rgba(0, 0, 0, 0.24);
          border-color: rgba(255, 255, 255, 0.28);
        }

        /* Make inner content sit above the pseudo-elements */
        .glass-card > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </main>
  );
}