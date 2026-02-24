import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function ExportActions({
  exportBackground,
  onBackgroundChange,
  exportResolution,
  onResolutionChange,
  onExport,
  isDisabled,
  issues
}) {
  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle>Export</CardTitle>
        <CardDescription>Download chart as a high-resolution PNG.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Background</Label>
          <Tabs value={exportBackground} onValueChange={onBackgroundChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="white">White</TabsTrigger>
              <TabsTrigger value="transparent">Transparent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label>Resolution</Label>
          <Tabs value={exportResolution} onValueChange={onResolutionChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="low">Low</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button type="button" className="w-full" disabled={isDisabled} onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export PNG
        </Button>

        {issues.length ? (
          <p className="animate-error-in text-sm text-muted-foreground">{issues[0]}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
