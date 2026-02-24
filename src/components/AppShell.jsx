import { MoonStar, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function AppShell({ children, theme, onToggleTheme }) {
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Simple Charts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create polished charts in seconds.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="gap-2"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </header>
      <div className="animate-fade-up">{children}</div>
      <footer className="mt-8 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>{`© ${year} ABM Labs. All rights reserved.`}</p>
        <nav className="flex items-center gap-4">
          <Link className="transition-colors hover:text-foreground" to="/terms-and-conditions">
            Terms and Conditions
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/privacy-policy">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
