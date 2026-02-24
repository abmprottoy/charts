import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-4">
      <Link to="/" className="inline-flex">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Charts
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>Last updated: February 24, 2026</p>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">1. Data Storage</h2>
            <p>
              Simple Charts stores your worksheet data locally in your browser using local storage
              so your latest work can be restored on this device.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">2. No Account Data</h2>
            <p>
              This app does not require user accounts and does not collect profile information from
              within the app interface.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">3. Exported Files</h2>
            <p>
              Exported chart images are created in your browser and downloaded directly to your
              device.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">4. Third-Party Hosting</h2>
            <p>
              If hosted on third-party infrastructure, operational logs may be collected by that
              provider according to their own policies.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">5. Policy Updates</h2>
            <p>
              This policy may be updated over time. The latest update date is shown at the top of
              this page.
            </p>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
