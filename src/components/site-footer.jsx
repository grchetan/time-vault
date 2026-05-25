import { Link } from "@tanstack/react-router";
import { Lock, Github, Mail, Shield } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-soft">
      <div className="container mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-base mb-3">
              <div className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <Lock className="size-4" />
              </div>
              TimeVault
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A self-discipline tool that locks your passwords behind a server-side timer. Built for focus, built for you.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com/grchetan" target="_blank" rel="noopener noreferrer"
                className="size-8 rounded-lg bg-muted grid place-items-center hover:bg-muted/80 transition-colors">
                <Github className="size-4 text-muted-foreground" />
              </a>
              <a href="mailto:support.timevault@gmail.com"
                className="size-8 rounded-lg bg-muted grid place-items-center hover:bg-muted/80 transition-colors">
                <Mail className="size-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Product</div>
            <div className="flex flex-col gap-2.5">
              {[["Home", "/"], ["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, to]) => (
                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Legal</div>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Security */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Security</div>
            <div className="flex flex-col gap-2.5">
              {["AES-256 Encrypted", "Server-side Timer", "Zero-knowledge Vault"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="size-3.5 text-primary shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TimeVault · Built by{" "}
            <a href="https://github.com/grchetan" target="_blank" rel="noopener noreferrer"
              className="font-semibold hover:text-foreground transition-colors">@grchetan</a>
          </p>
          <p className="text-xs text-muted-foreground">AES-256 Encrypted · Server-side Lock · Open Source</p>
        </div>
      </div>
    </footer>
  );
}
