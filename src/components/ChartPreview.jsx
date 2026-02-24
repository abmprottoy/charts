import { forwardRef } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { valueOverlayPlugin } from "../utils/valueOverlayPlugin";

const CHART_FONT_FAMILY =
  '"Inter", "Segoe UI", system-ui, -apple-system, "Noto Serif Bengali", "Nirmala UI", sans-serif';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  valueOverlayPlugin
);
ChartJS.defaults.font.family = CHART_FONT_FAMILY;

const ChartPreview = forwardRef(function ChartPreview(
  { chartType, chartData, chartOptions, canRender, issues },
  ref
) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Live update while you edit your class data.</CardDescription>
      </CardHeader>
      <CardContent>
        {canRender ? (
          <div className="animate-fade-up relative min-h-[360px] w-full rounded-xl border border-slate-200 bg-white p-3 md:min-h-[430px]">
            {chartType === "pie" ? (
              <Pie ref={ref} data={chartData} options={chartOptions} />
            ) : (
              <Bar ref={ref} data={chartData} options={chartOptions} />
            )}
          </div>
        ) : (
          <div className="animate-fade-up rounded-lg border border-dashed bg-muted/40 p-4">
            <p className="font-medium">Chart needs a few fixes</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {issues.map((issue) => (
                <li key={issue} className="animate-error-in">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ChartPreview;
