import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function TermsAndConditionsPage() {
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
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>Last updated: February 24, 2026</p>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">1. Use of Service</h2>
            <p>
              Simple Charts is provided for educational and general productivity use. You are
              responsible for the content and data you enter into the app.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">2. Availability</h2>
            <p>
              We may update, modify, or discontinue features at any time. We do not guarantee
              uninterrupted or error-free operation.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">3. Intellectual Property</h2>
            <p>
              The app interface, branding, and original implementation are owned by ABM Labs,
              unless otherwise noted.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">4. Limitation of Liability</h2>
            <p>
              This tool is provided on an “as is” basis. ABM Labs is not liable for indirect,
              incidental, or consequential damages resulting from its use.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">5. Contact</h2>
            <p>For policy questions, contact ABM Labs through your usual support channel.</p>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
