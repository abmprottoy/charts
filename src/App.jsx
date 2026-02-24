import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ChartControlsPanel from "./components/ChartControlsPanel";
import ChartPreview from "./components/ChartPreview";
import DataTableEditor from "./components/DataTableEditor";
import ExportActions from "./components/ExportActions";
import {
  ADVANCED_SWATCHES,
  CHART_PALETTES,
  DEFAULT_PALETTE_ID,
  getPaletteById
} from "./constants/palettes";
import { usePersistedState } from "./hooks/usePersistedState";
import { useTheme } from "./hooks/useTheme";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import { downloadChartAsPng } from "./utils/chartExport";

const STORAGE_KEY = "teacher-chart-maker:v1";
const EXPORT_PIXEL_RATIO = {
  low: 2,
  medium: 4,
  high: 8
};
const BENGALI_DIGITS = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9"
};
const LATIN_TO_BENGALI_DIGITS = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯"
};

function normalizeNumericInput(value) {
  return String(value)
    .trim()
    .replace(/[০-৯]/g, (digit) => BENGALI_DIGITS[digit] ?? digit)
    .replace(/[%٪]/g, "")
    .replace(/[٬,]/g, "")
    .replace(/٫/g, ".")
    .replace(/[−–—]/g, "-");
}

function parseLocalizedNumber(value) {
  const normalized = normalizeNumericInput(value);
  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
    return Number.NaN;
  }
  return Number(normalized);
}

function toBengaliDigits(value) {
  return String(value).replace(/\d/g, (digit) => LATIN_TO_BENGALI_DIGITS[digit] ?? digit);
}

function formatChartNumber(value, useBengaliNumerals) {
  if (!Number.isFinite(value)) {
    return "";
  }

  const valueText = Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2))).replace(/\.0$/, "");

  return useBengaliNumerals ? toBengaliDigits(valueText) : valueText;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createRow(index = 1) {
  return {
    id: createId(),
    label: `Option ${index}`,
    value: String(index * 5)
  };
}

function buildDefaultState() {
  return {
    rows: [createRow(1), createRow(2), createRow(3)],
    options: {
      chartType: "pie",
      valueMode: "exact",
      title: "",
      showLegend: true,
      showLabels: true,
      xAxisLabel: "",
      yAxisLabel: "",
      paletteId: DEFAULT_PALETTE_ID,
      advancedColorsEnabled: false,
      showFullColorPicker: false,
      customColors: {},
      exportBackground: "white",
      exportResolution: "medium"
    }
  };
}

function sanitizeState(rawState, defaultState) {
  const safeRows = Array.isArray(rawState?.rows)
    ? rawState.rows
        .filter((row) => row && typeof row === "object")
        .map((row, index) => ({
          id: typeof row.id === "string" && row.id ? row.id : createId(),
          label: typeof row.label === "string" ? row.label : `Option ${index + 1}`,
          value:
            typeof row.value === "string" || typeof row.value === "number"
              ? String(row.value)
              : ""
        }))
    : defaultState.rows;

  const safeOptions = rawState?.options ?? {};
  return {
    rows: safeRows.length ? safeRows : defaultState.rows,
    options: {
      chartType: safeOptions.chartType === "bar" ? "bar" : "pie",
      valueMode: safeOptions.valueMode === "percentage" ? "percentage" : "exact",
      title: typeof safeOptions.title === "string" ? safeOptions.title : "",
      showLegend:
        typeof safeOptions.showLegend === "boolean"
          ? safeOptions.showLegend
          : defaultState.options.showLegend,
      showLabels:
        typeof safeOptions.showLabels === "boolean"
          ? safeOptions.showLabels
          : defaultState.options.showLabels,
      xAxisLabel: typeof safeOptions.xAxisLabel === "string" ? safeOptions.xAxisLabel : "",
      yAxisLabel: typeof safeOptions.yAxisLabel === "string" ? safeOptions.yAxisLabel : "",
      paletteId:
        typeof safeOptions.paletteId === "string" ? safeOptions.paletteId : DEFAULT_PALETTE_ID,
      advancedColorsEnabled:
        typeof safeOptions.advancedColorsEnabled === "boolean"
          ? safeOptions.advancedColorsEnabled
          : false,
      showFullColorPicker:
        typeof safeOptions.showFullColorPicker === "boolean"
          ? safeOptions.showFullColorPicker
          : false,
      customColors:
        safeOptions.customColors && typeof safeOptions.customColors === "object"
          ? safeOptions.customColors
          : {},
      exportBackground: safeOptions.exportBackground === "transparent" ? "transparent" : "white",
      exportResolution:
        safeOptions.exportResolution === "low" ||
        safeOptions.exportResolution === "medium" ||
        safeOptions.exportResolution === "high"
          ? safeOptions.exportResolution
          : "medium"
    }
  };
}

function validateRows(rows, chartType, valueMode) {
  const fieldErrors = {};
  const validRows = [];

  rows.forEach((row) => {
    const label = row.label.trim();
    const valueText = String(row.value).trim();
    const hasAnyContent = label.length > 0 || valueText.length > 0;

    if (!hasAnyContent) {
      return;
    }

    fieldErrors[row.id] = {};

    if (!label) {
      fieldErrors[row.id].label = "Label required";
    }

    if (valueText.length === 0) {
      fieldErrors[row.id].value = "Value required";
    } else {
      const value = parseLocalizedNumber(valueText);
      if (!Number.isFinite(value)) {
        fieldErrors[row.id].value = "Use a valid number";
      } else if (valueMode === "percentage" && (value < 0 || value > 100)) {
        fieldErrors[row.id].value = "Use a percentage between 0 and 100";
      }
    }

    if (!fieldErrors[row.id].label && !fieldErrors[row.id].value) {
      validRows.push({
        ...row,
        label,
        value: parseLocalizedNumber(valueText),
        useBengaliNumerals: /[০-৯]/.test(valueText)
      });
    } else if (Object.keys(fieldErrors[row.id]).length === 0) {
      delete fieldErrors[row.id];
    }
  });

  const blockingIssues = [];
  const exportIssues = [];
  if (validRows.length === 0) {
    blockingIssues.push("Add at least one complete label and value pair.");
  }

  const hasFieldErrors = Object.values(fieldErrors).some((error) => Object.keys(error).length > 0);
  if (hasFieldErrors) {
    exportIssues.push("Complete or clear unfinished rows.");
  }

  if (chartType === "pie") {
    if (validRows.some((row) => row.value < 0)) {
      blockingIssues.push("Pie charts do not support negative values.");
    }
    if (validRows.length > 0 && !validRows.some((row) => row.value > 0)) {
      blockingIssues.push("Pie charts need at least one value above zero.");
    }

    if (valueMode === "percentage") {
      const total = validRows.reduce((sum, row) => sum + row.value, 0);
      if (validRows.length > 0 && Math.abs(total - 100) > 0.5) {
        exportIssues.push("For pie charts, percentage totals should be close to 100.");
      }
    }
  }

  const combinedExportIssues = [...new Set([...blockingIssues, ...exportIssues])];

  return {
    validRows,
    fieldErrors,
    blockingIssues,
    exportIssues: combinedExportIssues
  };
}

function ChartBuilderPage({ theme, onToggleTheme }) {
  const chartRef = useRef(null);
  const [recentlyAddedRowId, setRecentlyAddedRowId] = useState(null);
  const [appState, setAppState] = usePersistedState(STORAGE_KEY, buildDefaultState, sanitizeState);
  const { rows, options } = appState;
  const palette = getPaletteById(options.paletteId);

  useEffect(() => {
    if (!recentlyAddedRowId) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setRecentlyAddedRowId(null);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedRowId]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts?.ready) {
      return undefined;
    }

    let isCancelled = false;
    document.fonts.ready.then(() => {
      if (!isCancelled) {
        chartRef.current?.update("none");
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const validation = useMemo(
    () => validateRows(rows, options.chartType, options.valueMode),
    [rows, options.chartType, options.valueMode]
  );
  const chartRows = validation.validRows;
  const valueLocaleByIndex = useMemo(
    () => chartRows.map((row) => Boolean(row.useBengaliNumerals)),
    [chartRows]
  );
  const useBengaliNumeralsOnAxis = useMemo(
    () => valueLocaleByIndex.length > 0 && valueLocaleByIndex.every(Boolean),
    [valueLocaleByIndex]
  );
  const canRender = chartRows.length > 0 && validation.blockingIssues.length === 0;
  const canExport = validation.exportIssues.length === 0 && canRender;

  const resolvedColors = useMemo(
    () =>
      chartRows.map((row, index) => {
        if (options.advancedColorsEnabled && options.customColors[row.id]) {
          return options.customColors[row.id];
        }
        return palette.colors[index % palette.colors.length];
      }),
    [chartRows, options.advancedColorsEnabled, options.customColors, palette.colors]
  );

  const chartData = useMemo(
    () => ({
      labels: chartRows.map((row) => row.label),
      datasets: [
        {
          label: options.valueMode === "percentage" ? "Percentage" : "Value",
          data: chartRows.map((row) => row.value),
          useBengaliNumeralsByIndex: valueLocaleByIndex,
          backgroundColor: resolvedColors,
          borderColor: options.chartType === "pie" ? "#ffffff" : resolvedColors,
          borderWidth: options.chartType === "pie" ? 2 : 1,
          borderRadius: options.chartType === "bar" ? 10 : 0
        }
      ]
    }),
    [chartRows, options.valueMode, options.chartType, resolvedColors]
  );

  const hasNegativeBarValue = chartRows.some((row) => row.value < 0);
  const axisTextColor = "#334155";
  const titleColor = "#0f172a";
  const gridColor = "rgba(148, 163, 184, 0.28)";

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 350
      },
      plugins: {
        legend: {
          display: options.showLegend,
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 12,
            padding: 16,
            color: axisTextColor,
            generateLabels: (chart) => {
              const labels = chart.data.labels ?? [];
              const dataset = chart.data.datasets?.[0];
              const colors = Array.isArray(dataset?.backgroundColor)
                ? dataset.backgroundColor
                : labels.map(() => dataset?.backgroundColor ?? "#64748b");

              return labels.map((label, index) => ({
                text: String(label),
                fillStyle: colors[index] ?? colors[0] ?? "#64748b",
                strokeStyle: colors[index] ?? colors[0] ?? "#64748b",
                lineWidth: 1,
                hidden: false,
                index,
                datasetIndex: 0
              }));
            }
          }
        },
        title: {
          display: Boolean(options.title.trim()),
          text: options.title.trim(),
          color: titleColor,
          font: {
            size: 17,
            weight: "600"
          },
          padding: {
            bottom: 14
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 10,
          cornerRadius: 10,
          callbacks: {
            label: (context) => {
              const numericValue =
                options.chartType === "bar"
                  ? Number(context.parsed?.y)
                  : Number(context.parsed);

              const localizedForPoint = Boolean(
                chartRows[context.dataIndex]?.useBengaliNumerals
              );
              const formattedValue = formatChartNumber(numericValue, localizedForPoint);
              const labelPrefix = context.label ? `${context.label}: ` : "";
              const suffix = options.valueMode === "percentage" ? "%" : "";

              return `${labelPrefix}${formattedValue}${suffix}`;
            }
          }
        },
        valueOverlay: {
          enabled: options.showLabels,
          color: "#1f2937",
          font: '600 11px "Inter", "Segoe UI", system-ui, -apple-system, "Noto Serif Bengali", "Nirmala UI", sans-serif',
          valueMode: options.valueMode,
          useBengaliNumeralsByIndex: valueLocaleByIndex
        }
      },
      scales:
        options.chartType === "bar"
          ? {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: axisTextColor
                },
                title: {
                  display: Boolean(options.xAxisLabel.trim()),
                  text: options.xAxisLabel.trim(),
                  color: titleColor,
                  font: {
                    size: 12,
                    weight: "600"
                  }
                }
              },
              y: {
                beginAtZero: !hasNegativeBarValue,
                ticks: {
                  color: axisTextColor,
                  callback: (tickValue) => {
                    const formatted = formatChartNumber(
                      Number(tickValue),
                      useBengaliNumeralsOnAxis
                    );
                    return options.valueMode === "percentage" ? `${formatted}%` : formatted;
                  }
                },
                grid: {
                  color: gridColor
                },
                title: {
                  display: Boolean(options.yAxisLabel.trim()),
                  text:
                    options.valueMode === "percentage" && options.yAxisLabel.trim() === ""
                      ? "Percent (%)"
                      : options.yAxisLabel.trim(),
                  color: titleColor,
                  font: {
                    size: 12,
                    weight: "600"
                  }
                }
              }
            }
          : undefined
    }),
    [
      options.chartType,
      options.showLegend,
      options.title,
      options.showLabels,
      options.valueMode,
      options.xAxisLabel,
      options.yAxisLabel,
      chartRows,
      valueLocaleByIndex,
      useBengaliNumeralsOnAxis,
      hasNegativeBarValue,
      axisTextColor,
      titleColor,
      gridColor
    ]
  );

  function updateOptions(patch) {
    setAppState((current) => ({
      ...current,
      options: {
        ...current.options,
        ...patch
      }
    }));
  }

  function handleUpdateRow(id, key, value) {
    setAppState((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    }));
  }

  function handleAddRow() {
    const id = createId();
    setAppState((current) => ({
      ...current,
      rows: [...current.rows, { id, label: "", value: "" }]
    }));
    setRecentlyAddedRowId(id);
  }

  function handleRemoveRow(id) {
    setAppState((current) => {
      const nextRows = current.rows.filter((row) => row.id !== id);
      const nextCustomColors = { ...current.options.customColors };
      delete nextCustomColors[id];

      return {
        ...current,
        rows: nextRows.length ? nextRows : [{ id: createId(), label: "", value: "" }],
        options: {
          ...current.options,
          customColors: nextCustomColors
        }
      };
    });
    setRecentlyAddedRowId((current) => (current === id ? null : current));
  }

  function handleClearRows() {
    setAppState((current) => ({
      ...current,
      rows: [{ id: createId(), label: "", value: "" }],
      options: {
        ...current.options,
        customColors: {}
      }
    }));
    setRecentlyAddedRowId(null);
  }

  function handleSetCustomColor(rowId, color) {
    setAppState((current) => ({
      ...current,
      options: {
        ...current.options,
        advancedColorsEnabled: true,
        customColors: {
          ...current.options.customColors,
          [rowId]: color
        }
      }
    }));
  }

  function handleResetCustomColors() {
    setAppState((current) => ({
      ...current,
      options: {
        ...current.options,
        customColors: {}
      }
    }));
  }

  function handleExportPng() {
    if (!canExport) {
      return;
    }

    void downloadChartAsPng(chartRef.current, {
      background: options.exportBackground,
      pixelRatio: EXPORT_PIXEL_RATIO[options.exportResolution] ?? EXPORT_PIXEL_RATIO.medium,
      chartStyleOverrides: {
        titleColor: "#0f172a",
        axisTextColor: "#334155",
        gridColor: "rgba(148, 163, 184, 0.28)",
        valueOverlayColor: "#1f2937",
        tooltipBackgroundColor: "#0f172a"
      }
    }).catch(() => {});
  }

  return (
    <AppShell theme={theme} onToggleTheme={onToggleTheme}>
      <main className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="space-y-4">
          <DataTableEditor
            rows={rows}
            fieldErrors={validation.fieldErrors}
            valueMode={options.valueMode}
            recentlyAddedRowId={recentlyAddedRowId}
            onChangeValueMode={(valueMode) => updateOptions({ valueMode })}
            onUpdateRow={handleUpdateRow}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onClearRows={handleClearRows}
          />
          <ChartControlsPanel
            options={options}
            palettes={CHART_PALETTES}
            advancedSwatches={ADVANCED_SWATCHES}
            rows={rows}
            onChangeOptions={updateOptions}
            onSetCustomColor={handleSetCustomColor}
            onResetCustomColors={handleResetCustomColors}
          />
        </section>

        <section className="space-y-4">
          <ChartPreview
            ref={chartRef}
            chartType={options.chartType}
            chartData={chartData}
            chartOptions={chartOptions}
            canRender={canRender}
            issues={validation.blockingIssues}
          />
          <ExportActions
            exportBackground={options.exportBackground}
            onBackgroundChange={(value) => updateOptions({ exportBackground: value })}
            exportResolution={options.exportResolution}
            onResolutionChange={(value) => updateOptions({ exportResolution: value })}
            onExport={handleExportPng}
            isDisabled={!canExport}
            issues={validation.exportIssues}
          />
        </section>
      </main>
    </AppShell>
  );
}

function AppRouteLayout({ theme, onToggleTheme, children }) {
  return (
    <AppShell theme={theme} onToggleTheme={onToggleTheme}>
      {children}
    </AppShell>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Routes>
      <Route path="/" element={<ChartBuilderPage theme={theme} onToggleTheme={toggleTheme} />} />
      <Route
        path="/terms-and-conditions"
        element={
          <AppRouteLayout theme={theme} onToggleTheme={toggleTheme}>
            <TermsAndConditionsPage />
          </AppRouteLayout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <AppRouteLayout theme={theme} onToggleTheme={toggleTheme}>
            <PrivacyPolicyPage />
          </AppRouteLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
