"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  modelKey: string;
  area: string;
  furnitureType: string;
  imageUrl: string;
  suggestionNumbers: string[];
  headline?: string | null;
  raster?: string | null;
  baseType?: string | null;
  styleTags: string[];
  widthCm: number;
  heightCm: number;
  depthCm: number;
};

type DimensionRule = {
  id: string;
  area: string;
  dimension: string;
  key: string;
  minCm: number | null;
  maxCm: number | null;
  createdAt: string;
};

const MODEL_KEYS = [
  "HARMONY",
  "DEVISO",
  "CONCETTO",
  "SIENA",
  "LAVITA",
  "ENJOY",
  "MANHATTAN",
  "BRISTOL",
  "ALLEGRO",
  "DACAPO",
  "CENTO",
  "OPUS",
] as const;

const AREAS = ["BUERO", "WOHNEN", "SPEISEN", "GARDEROBE", "SCHLAFEN"] as const;

const FURNITURE_TYPES = [
  "SIDEBOARD",
  "LOWBOARD",
  "HIGHBOARD",
  "VITRINE",
  "KORPUSELEMENT",
  "SCHRANK",
  "REGAL",
] as const;

const RASTERS = [
  "RASTER_1_5",
  "RASTER_2",
  "RASTER_2_5",
  "RASTER_3",
  "RASTER_4",
  "RASTER_5",
] as const;


const BASE_TYPES = ["FEET", "FRAME"] as const;

const DIMENSIONS = ["DEPTH", "WIDTH", "HEIGHT"] as const;

const DEPTH_KEYS = ["SLIM", "STANDARD", "DEEP"] as const;
const WIDTH_KEYS = ["SLIM", "STANDARD", "WIDE"] as const;
const HEIGHT_KEYS = ["LOW", "STANDARD", "HIGH", "ROOM_HIGH"] as const;

function keysForDimension(d: string) {
  if (d === "DEPTH") return DEPTH_KEYS;
  if (d === "WIDTH") return WIDTH_KEYS;
  return HEIGHT_KEYS;
}


function labelArea(a: string) {
  switch (a) {
    case "BUERO":
      return "Büro";
    case "WOHNEN":
      return "Wohnen";
    case "SPEISEN":
      return "Speisen";
    case "GARDEROBE":
      return "Garderobe";
    case "SCHLAFEN":
      return "Schlafen";
    default:
      return a;
  }
}
function labelFurniture(t: string) {
  switch (t) {
    case "KORPUSELEMENT":
      return "Korpuselement";
    default:
      return t.charAt(0) + t.slice(1).toLowerCase();
  }
}
function labelRaster(r: string) {
  switch (r) {
    case "RASTER_1_5":
      return "1,5 Raster";
    case "RASTER_2_5":
      return "2,5 Raster";
    case "RASTER_2":
      return "2 Raster";
    case "RASTER_3":
      return "3 Raster";
    case "RASTER_4":
      return "4 Raster";
    case "RASTER_5":
      return "5 Raster";
    default:
      return r;
  }
}
function labelBase(b: string) {
  return b === "FEET" ? "Füße/Kufen" : b === "FRAME" ? "Rahmengestell" : b;
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state (Block 1 – Identität)
  const [modelKey, setModelKey] = useState<string>("SIENA");
  const [area, setArea] = useState<string>("WOHNEN");
  const [furnitureType, setFurnitureType] = useState<string>("SIDEBOARD");

  // Block 2 – Inhalt & Aktion
  const [imageUrl, setImageUrl] = useState("");
  const [suggestionNumbers, setSuggestionNumbers] = useState(""); // CSV input

  // Maße (cm)
  const [widthCm, setWidthCm] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [depthCm, setDepthCm] = useState<string>("");

  // Block 3 – Profi-Filter (optional)
  const [raster, setRaster] = useState<string>("");
  const [baseType, setBaseType] = useState<string>("");


  // Block 4 – Inspiration (optional)
  const [headline, setHeadline] = useState("");
  const [styleTagInput, setStyleTagInput] = useState("");
  const [selectedStyleTags, setSelectedStyleTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // DimensionDefinition (Regeln)
  const [rules, setRules] = useState<DimensionRule[]>([]);
  const [ruleArea, setRuleArea] = useState<string>("WOHNEN");
  const [ruleDimension, setRuleDimension] = useState<string>("DEPTH");
  const [ruleKey, setRuleKey] = useState<string>("SLIM");
  const [ruleMin, setRuleMin] = useState<string>("");
  const [ruleMax, setRuleMax] = useState<string>("");
  const [savingRule, setSavingRule] = useState(false);

  async function loadItems() {
    setLoading(true);
    const res = await fetch("/api/items", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function loadRules() {
    const res = await fetch("/api/dimensions", { cache: "no-store" });
    const data = await res.json();
    setRules(data);
  }

  async function createRule(e: React.FormEvent) {
    e.preventDefault();
    setSavingRule(true);

    const payload = {
      area: ruleArea,
      dimension: ruleDimension,
      key: ruleKey,
      minCm: ruleMin === "" ? null : Number(ruleMin),
      maxCm: ruleMax === "" ? null : Number(ruleMax),
    };

    const res = await fetch("/api/dimensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Fehler beim Speichern der Regel.");
      setSavingRule(false);
      return;
    }

    setRuleMin("");
    setRuleMax("");
    setSavingRule(false);
    loadRules();
  }

  async function deleteRule(id: string) {
    if (!confirm("Regel wirklich löschen?")) return;
    await fetch(`/api/dimensions/${id}`, { method: "DELETE" });
    loadRules();
  }

  async function deleteItem(id: string) {
    if (!confirm("Kachel wirklich löschen?")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    loadItems();
  }

  // existing style tags for autocomplete (derived from items)
  const knownStyleTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.styleTags?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const styleSuggestions = useMemo(() => {
    const q = styleTagInput.trim().toLowerCase();
    if (!q) return knownStyleTags.filter((t) => !selectedStyleTags.includes(t)).slice(0, 8);
    return knownStyleTags
      .filter(
        (t) =>
          t.toLowerCase().includes(q) && !selectedStyleTags.includes(t)
      )
      .slice(0, 8);
  }, [styleTagInput, knownStyleTags, selectedStyleTags]);

  function addStyleTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (selectedStyleTags.includes(t)) return;
    setSelectedStyleTags((prev) => [...prev, t]);
    setStyleTagInput("");
  }

  function removeStyleTag(tag: string) {
    setSelectedStyleTags((prev) => prev.filter((t) => t !== tag));
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();

    const nums = suggestionNumbers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!imageUrl.trim()) return alert("Bitte Bild-URL angeben.");
    if (nums.length === 0) return alert("Bitte mindestens 1 Vorschlagsnummer angeben.");
    if (!widthCm || !heightCm || !depthCm) {
      alert("Bitte Breite, Höhe und Tiefe in cm angeben.");
      return;
    }

    setSaving(true);

    const payload = {
      modelKey,
      area,
      furnitureType,
      imageUrl: imageUrl.trim(),
      suggestionNumbers: nums,
      // optional
      raster: raster || null,
      baseType: baseType || null,
      headline: headline.trim() ? headline.trim() : null,
      styleTags: selectedStyleTags,
      widthCm: Number(widthCm),
      heightCm: Number(heightCm),
      depthCm: Number(depthCm),
    };

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Fehler beim Speichern.");
      setSaving(false);
      return;
    }

    // reset (keep identity defaults)
    setImageUrl("");
    setSuggestionNumbers("");
    setRaster("");
    setBaseType("");
    setWidthCm("");
    setHeightCm("");
    setDepthCm("");
    setHeadline("");
    setSelectedStyleTags([]);
    setStyleTagInput("");
    setSaving(false);

    loadItems();
  }

  useEffect(() => {
    loadItems();
    loadRules();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold mb-6">Admin – Kacheln</h1>

      <form onSubmit={createItem} className="mb-10 rounded-xl bg-white p-6 shadow space-y-8">
        {/* BLOCK 1 */}
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">1) Identität</div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-600">Modell</label>
              <select
                value={modelKey}
                onChange={(e) => setModelKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {MODEL_KEYS.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0) + m.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Bereich</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {labelArea(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Möbeltyp</label>
              <select
                value={furnitureType}
                onChange={(e) => setFurnitureType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {FURNITURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {labelFurniture(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* BLOCK 2 */}
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">2) Inhalt & Aktion</div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Bild URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Vorschlagsnummern (Komma-getrennt)</label>
              <input
                value={suggestionNumbers}
                onChange={(e) => setSuggestionNumbers(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="SB-1042, FR-2210"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-600">Breite (cm)</label>
              <input
                type="number"
                step="0.1"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="z. B. 120,0"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Höhe (cm)</label>
              <input
                type="number"
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="z. B. 72,0 oder 243,0"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Tiefe (cm)</label>
              <input
                type="number"
                step="0.1"
                value={depthCm}
                onChange={(e) => setDepthCm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="z. B. 39,6"
              />
            </div>
          </div>
        </section>

        {/* BLOCK 3 */}
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">3) Profi-Filter (optional)</div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-600">Raster</label>
              <select
                value={raster}
                onChange={(e) => setRaster(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">—</option>
                {RASTERS.map((r) => (
                  <option key={r} value={r}>
                    {labelRaster(r)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Unterbau</label>
              <select
                value={baseType}
                onChange={(e) => setBaseType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">—</option>
                {BASE_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {labelBase(b)}
                  </option>
                ))}
              </select>
            </div>
            {/* Removed Tiefe (Kategorie) select */}
          </div>
        </section>

        {/* BLOCK 4 */}
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">4) Inspiration (optional)</div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Headline (optional)</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ruhiges Büro-Sideboard mit Rahmengestell"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Style Tags (optional)</label>

              <div className="mt-1 flex flex-wrap gap-2">
                {selectedStyleTags.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => removeStyleTag(t)}
                    className="rounded-full bg-slate-200 px-3 py-1 text-sm"
                  >
                    {t} ×
                  </button>
                ))}
              </div>

              <input
                value={styleTagInput}
                onChange={(e) => setStyleTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStyleTag(styleTagInput);
                  }
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Tag eintippen und Enter drücken"
              />

              {styleSuggestions.length > 0 && (
                <div className="mt-2 rounded-lg border bg-white shadow">
                  {styleSuggestions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => addStyleTag(s)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <button
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Speichert…" : "Kachel anlegen"}
        </button>
      </form>

      {loading && <p>Lade…</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-white p-4 shadow flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="font-medium">
                {item.headline?.trim()
                  ? item.headline
                  : `${item.modelKey} · ${labelArea(item.area)} · ${labelFurniture(
                      item.furnitureType
                    )}`}
              </div>
              <div className="text-sm text-slate-500">
                {item.modelKey} · {labelArea(item.area)} · {labelFurniture(item.furnitureType)}
                {item.raster ? ` · ${labelRaster(item.raster)}` : ""}
                {item.baseType ? ` · ${labelBase(item.baseType)}` : ""}
              </div>
              <span className="text-xs text-slate-400">
                {item.widthCm} × {item.heightCm} × {item.depthCm} cm
              </span>
              <div className="text-xs text-slate-400 mt-1">
                {item.suggestionNumbers?.join(", ")}
              </div>
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Löschen
            </button>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="rounded-xl bg-white p-6 shadow text-slate-600">
            Noch keine Kacheln vorhanden.
          </div>
        )}
      </div>

      <section className="mt-10 rounded-xl bg-white p-6 shadow space-y-6">
        <div className="text-xl font-semibold">Admin – DimensionDefinition</div>
        <p className="text-sm text-slate-600">
          Hier definierst du pro Bereich, was z.B. „schmal / standard / tief“ bedeutet.
          Items speichern nur cm-Werte – die Einordnung passiert später automatisch.
        </p>

        <form onSubmit={createRule} className="grid gap-3 md:grid-cols-5 items-end">
          <div>
            <label className="text-xs text-slate-600">Bereich</label>
            <select
              value={ruleArea}
              onChange={(e) => setRuleArea(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {labelArea(a)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Dimension</label>
            <select
              value={ruleDimension}
              onChange={(e) => {
                const d = e.target.value;
                setRuleDimension(d);
                const keys = keysForDimension(d);
                setRuleKey(keys[0]);
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {DIMENSIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Kategorie</label>
            <select
              value={ruleKey}
              onChange={(e) => setRuleKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {keysForDimension(ruleDimension).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Min (cm)</label>
            <input
              type="number"
              step="0.1"
              value={ruleMin}
              onChange={(e) => setRuleMin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="(leer = offen)"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Max (cm)</label>
            <input
              type="number"
              step="0.1"
              value={ruleMax}
              onChange={(e) => setRuleMax(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="(leer = offen)"
            />
          </div>

          <div className="md:col-span-5">
            <button
              disabled={savingRule}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {savingRule ? "Speichert…" : "Regel anlegen"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {rules.length === 0 ? (
            <div className="text-slate-600">Noch keine Regeln vorhanden.</div>
          ) : (
            rules.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div className="text-sm">
                  <b>{labelArea(r.area)}</b> · {r.dimension} · <b>{r.key}</b>{" "}
                  <span className="text-slate-500">
                    ({r.minCm ?? "—"} bis {r.maxCm ?? "—"} cm)
                  </span>
                </div>
                <button
                  onClick={() => deleteRule(r.id)}
                  className="text-red-600 text-sm hover:underline"
                  type="button"
                >
                  Löschen
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}