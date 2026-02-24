export const CHART_PALETTES = [
  {
    id: "classroom",
    name: "Classroom",
    description: "Balanced tones for worksheets and slides.",
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]
  },
  {
    id: "soft-report",
    name: "Soft Report",
    description: "Muted and professional for handouts.",
    colors: ["#4f46e5", "#0ea5e9", "#22c55e", "#eab308", "#f97316", "#e11d48"]
  },
  {
    id: "pastel-math",
    name: "Pastel Math",
    description: "Light but readable palette for younger students.",
    colors: ["#60a5fa", "#34d399", "#fbbf24", "#fb7185", "#a78bfa", "#2dd4bf"]
  },
  {
    id: "print-safe",
    name: "Print Safe",
    description: "High-contrast colors that remain clear on print.",
    colors: ["#1d4ed8", "#047857", "#ca8a04", "#b91c1c", "#7c3aed", "#0f766e"]
  },
  {
    id: "science-lab",
    name: "Science Lab",
    description: "Cool tones with crisp separation.",
    colors: ["#2563eb", "#14b8a6", "#84cc16", "#f59e0b", "#f43f5e", "#6366f1"]
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Clean palette for presentations.",
    colors: ["#0f766e", "#0284c7", "#7c3aed", "#ea580c", "#dc2626", "#4d7c0f"]
  }
];

export const DEFAULT_PALETTE_ID = CHART_PALETTES[0].id;

export const ADVANCED_SWATCHES = [
  ...new Set(CHART_PALETTES.flatMap((palette) => palette.colors))
];

export function getPaletteById(paletteId) {
  return CHART_PALETTES.find((palette) => palette.id === paletteId) ?? CHART_PALETTES[0];
}
