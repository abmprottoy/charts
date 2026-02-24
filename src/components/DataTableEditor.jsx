import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "../lib/utils";

export default function DataTableEditor({
  rows,
  fieldErrors,
  valueMode,
  recentlyAddedRowId,
  onChangeValueMode,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onClearRows
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Data</CardTitle>
            <CardDescription>Enter each answer choice and count.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClearRows}>
              Clear
            </Button>
            <Button type="button" size="sm" onClick={onAddRow}>
              <Plus className="mr-1 h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Value Format</Label>
          <Tabs value={valueMode} onValueChange={(value) => onChangeValueMode(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exact">Numbers</TabsTrigger>
              <TabsTrigger value="percentage">Percentages</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="-m-1 overflow-x-auto overflow-y-visible p-1">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Label</th>
                <th className="pb-2 font-medium">
                  {valueMode === "percentage" ? "Percent (%)" : "Value"}
                </th>
                <th className="w-16 pb-2 text-right font-medium">Remove</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowErrors = fieldErrors[row.id] ?? {};
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors last:border-b-0",
                      recentlyAddedRowId === row.id ? "animate-row-in bg-primary/5" : ""
                    )}
                  >
                    <td className="py-2 pl-1 pr-2 align-top">
                      <Label className="sr-only" htmlFor={`label-${row.id}`}>
                        Label {index + 1}
                      </Label>
                      <Input
                        id={`label-${row.id}`}
                        type="text"
                        value={row.label}
                        onChange={(event) => onUpdateRow(row.id, "label", event.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className={rowErrors.label ? "border-red-500 focus-visible:ring-red-400" : ""}
                      />
                      {rowErrors.label ? (
                        <p className="animate-error-in mt-1 text-xs text-red-600">{rowErrors.label}</p>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <Label className="sr-only" htmlFor={`value-${row.id}`}>
                        Value {index + 1}
                      </Label>
                      <Input
                        id={`value-${row.id}`}
                        type="text"
                        inputMode="decimal"
                        value={row.value}
                        onChange={(event) => onUpdateRow(row.id, "value", event.target.value)}
                        placeholder={valueMode === "percentage" ? "0-100" : "0"}
                        className={rowErrors.value ? "border-red-500 focus-visible:ring-red-400" : ""}
                      />
                      {rowErrors.value ? (
                        <p className="animate-error-in mt-1 text-xs text-red-600">{rowErrors.value}</p>
                      ) : null}
                    </td>
                    <td className="py-2 text-right align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveRow(row.id)}
                        disabled={rows.length <= 1}
                        aria-label={`Remove row ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
