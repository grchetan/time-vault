import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-soft">
      <div className="container mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-7 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Lock className="size-3.5" />
          </div>
          TimeVault
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          {[["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, to]) => (
            <Link key={to} to={to} className="hover:text-foreground transition-colors">{label}</Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TimeVault</p>
      </div>
    </footer>
  );
}
