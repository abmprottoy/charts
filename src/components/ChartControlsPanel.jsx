import { RefreshCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const CHART_TYPE_OPTIONS = [
  { value: "pie", label: "Pie" },
  { value: "doughnut", label: "Doughnut" },
  { value: "bar", label: "Bar" },
  { value: "horizontalBar", label: "Horizontal" },
  { value: "line", label: "Line" }
];

const LABEL_DISPLAY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "value", label: "Values" },
  { value: "percentage", label: "Percents" },
  { value: "both", label: "Both" }
];

const LABEL_POSITION_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "inside", label: "Inside" },
  { value: "outside", label: "Outside" }
];

const AXIS_CHART_TYPES = new Set(["bar", "horizontalBar", "line"]);

function SwitchRow({ id, label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function ChartControlsPanel({
  options,
  palettes,
  advancedSwatches,
  rows,
  onChangeOptions,
  onSetCustomColor,
  onResetCustomColors
}) {
  const activeRows = rows.filter((row) => row.label.trim() || String(row.value).trim());

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Chart Setup</CardTitle>
        <CardDescription>Configure chart type, labels, and colors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Chart Type</Label>
          <Tabs
            value={options.chartType}
            onValueChange={(value) => onChangeOptions({ chartType: value })}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3">
              {CHART_TYPE_OPTIONS.map((chartTypeOption) => (
                <TabsTrigger
                  key={chartTypeOption.value}
                  value={chartTypeOption.value}
                  className="text-xs sm:text-sm"
                >
                  {chartTypeOption.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chart-title">Title</Label>
          <Input
            id="chart-title"
            type="text"
            placeholder="Class poll results"
            value={options.title}
            onChange={(event) => onChangeOptions({ title: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <SwitchRow
            id="legend-toggle"
            label="Show legend"
            checked={options.showLegend}
            onCheckedChange={(value) => onChangeOptions({ showLegend: value })}
          />
          <SwitchRow
            id="value-label-toggle"
            label="Show value labels"
            checked={options.showLabels}
            onCheckedChange={(value) => onChangeOptions({ showLabels: value })}
          />
        </div>

        {options.showLabels ? (
          <div className="animate-fade-up space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-2">
              <Label>Label Content</Label>
              <Tabs
                value={options.labelDisplayMode}
                onValueChange={(value) => onChangeOptions({ labelDisplayMode: value })}
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                  {LABEL_DISPLAY_OPTIONS.map((labelMode) => (
                    <TabsTrigger key={labelMode.value} value={labelMode.value} className="text-xs">
                      {labelMode.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Label Position</Label>
              <Tabs
                value={options.labelPosition}
                onValueChange={(value) => onChangeOptions({ labelPosition: value })}
              >
                <TabsList className="grid w-full grid-cols-3">
                  {LABEL_POSITION_OPTIONS.map((labelPosition) => (
                    <TabsTrigger key={labelPosition.value} value={labelPosition.value}>
                      {labelPosition.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Decimal Places</Label>
              <Tabs
                value={String(options.labelPrecision)}
                onValueChange={(value) => onChangeOptions({ labelPrecision: Number(value) })}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="0">0</TabsTrigger>
                  <TabsTrigger value="1">1</TabsTrigger>
                  <TabsTrigger value="2">2</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        ) : null}

        {AXIS_CHART_TYPES.has(options.chartType) ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="x-axis-label">X Axis Label</Label>
              <Input
                id="x-axis-label"
                type="text"
                placeholder="Answer choices"
                value={options.xAxisLabel}
                onChange={(event) => onChangeOptions({ xAxisLabel: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y-axis-label">Y Axis Label</Label>
              <Input
                id="y-axis-label"
                type="text"
                placeholder="Number of students"
                value={options.yAxisLabel}
                onChange={(event) => onChangeOptions({ yAxisLabel: event.target.value })}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Color Theme</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {palettes.map((palette) => (
              <button
                key={palette.id}
                type="button"
                className={`rounded-lg border p-3 text-left transition hover:bg-muted/50 ${
                  options.paletteId === palette.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => onChangeOptions({ paletteId: palette.id })}
              >
                <div className="mb-2 flex gap-1.5">
                  {palette.colors.slice(0, 5).map((color) => (
                    <span
                      key={color}
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium">{palette.name}</p>
                <p className="text-xs text-muted-foreground">{palette.description}</p>
              </button>
            ))}
          </div>
        </div>

        <Accordion type="single" collapsible className="rounded-lg border px-3">
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="py-3 text-sm">Advanced Colors</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <SwitchRow
                  id="custom-color-toggle"
                  label="Enable custom item colors"
                  checked={options.advancedColorsEnabled}
                  onCheckedChange={(value) => onChangeOptions({ advancedColorsEnabled: value })}
                />
                <SwitchRow
                  id="full-color-toggle"
                  label="Show full color picker"
                  checked={options.showFullColorPicker}
                  onCheckedChange={(value) => onChangeOptions({ showFullColorPicker: value })}
                />

                {options.advancedColorsEnabled ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onResetCustomColors}
                    >
                      <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                      Reset custom colors
                    </Button>
                    <div className="space-y-3">
                      {activeRows.map((row, index) => {
                        const currentColor = options.customColors[row.id] ?? advancedSwatches[0];
                        return (
                          <div key={row.id} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {row.label.trim() || `Row ${index + 1}`}
                              </p>
                              <span
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: currentColor }}
                              />
                            </div>
                            <div className="mb-2 grid grid-cols-8 gap-1.5">
                              {advancedSwatches.slice(0, 16).map((swatch) => (
                                <button
                                  key={`${row.id}-${swatch}`}
                                  type="button"
                                  className={`h-6 rounded border ${
                                    currentColor === swatch ? "ring-2 ring-primary ring-offset-1" : ""
                                  }`}
                                  style={{ backgroundColor: swatch }}
                                  onClick={() => onSetCustomColor(row.id, swatch)}
                                  aria-label={`Set ${row.label || `row ${index + 1}`} color`}
                                />
                              ))}
                            </div>
                            {options.showFullColorPicker ? (
                              <Input
                                type="color"
                                value={currentColor}
                                onChange={(event) => onSetCustomColor(row.id, event.target.value)}
                                aria-label={`Custom color picker for ${row.label || `row ${index + 1}`}`}
                                className="h-10 w-20 p-1"
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
