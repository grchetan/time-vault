import { Link } from '@tanstack/react-router';
import { Lock, Github, Mail, Shield, ArrowUp, ExternalLink } from 'lucide-react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-soft">
      {/* Gradient top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-base mb-4">
              <div className="size-8 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft">
                <Lock className="size-4" />
              </div>
              <span className="font-display">TimeVault</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              A self-discipline tool that locks your passwords behind a server-side timer.
              Built for focus, privacy-first, and free to start.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com/grchetan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="size-8 rounded-lg bg-muted/80 grid place-items-center hover:bg-primary-soft hover:text-primary transition-all duration-200 group"
              >
                <Github className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="mailto:support.timevault@gmail.com"
                aria-label="Email support"
                className="size-8 rounded-lg bg-muted/80 grid place-items-center hover:bg-primary-soft hover:text-primary transition-all duration-200 group"
              >
                <Mail className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
              Product
            </div>
            <div className="flex flex-col gap-3">
              {[['Home', '/'], ['Features', '/features'], ['About', '/about'], ['Contact', '/contact']].map(
                ([label, to]) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                  >
                    {label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
              Legal
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Security */}
          <div>
            <div className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
              Security
            </div>
            <div className="flex flex-col gap-3">
              {['AES-256 Encrypted', 'Server-side Timer', 'Zero-knowledge Vault'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Shield className="size-3.5 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TimeVault &middot; Built with care by{' '}
            <a
              href="https://github.com/grchetan"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-foreground transition-colors inline-flex items-center gap-0.5"
            >
              @grchetan
              <ExternalLink className="size-3 ml-0.5" />
            </a>
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground hidden sm:block">
              AES-256 · Server-side lock · Open source
            </p>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="size-7 rounded-lg bg-muted/80 grid place-items-center hover:bg-primary-soft hover:text-primary transition-all duration-200 group"
            >
              <ArrowUp className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
