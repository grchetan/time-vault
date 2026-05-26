import { useState, useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, Lock, LayoutDashboard, LogOut, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Scroll detection for enhanced glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  const isActive = (to) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-card border-b border-white/40 bg-white/75'
          : 'bg-background/60 backdrop-blur-md border-b border-border/30'
      }`}
    >
      <div className="container mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        {/* Premium SVG Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-lg hover:opacity-95 transition-all group"
          aria-label="TimeVault home"
        >
          <div className="relative size-9 flex items-center justify-center">
            {/* Background glowing layer */}
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="size-9 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.58 0.18 290)" />
                  <stop offset="100%" stopColor="oklch(0.52 0.2 310)" />
                </linearGradient>
              </defs>
              {/* Outer vault wheel track */}
              <circle cx="18" cy="18" r="14.5" fill="none" stroke="oklch(0.92 0.015 280)" strokeWidth="2.5" />
              {/* Vault locking pins / Clock ticks */}
              <path d="M18 3.5v2.5M18 30v2.5M3.5 18H6M30 18h2.5" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" />
              <path d="M7.8 7.8l1.8 1.8M26.4 26.4l1.8 1.8M7.8 28.2l1.8-1.8M26.4 9.6l1.8-1.8" stroke="oklch(0.58 0.18 290 / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Clock Hands / Lock mechanism */}
              <path d="M18 18h6.5M18 18v-7.5" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" className="origin-[18px_18px] group-hover:rotate-12 transition-transform duration-500" />
              {/* Outer ring segmented segments */}
              <circle cx="18" cy="18" r="14.5" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeDasharray="20 12" strokeLinecap="round" className="origin-[18px_18px] group-hover:rotate-[45deg] transition-transform duration-700" />
              
              {/* Center lock vault center pin */}
              <circle cx="18" cy="18" r="4" fill="white" stroke="url(#logoGrad)" strokeWidth="2" />
              <circle cx="18" cy="18" r="1.5" fill="url(#logoGrad)" />
            </svg>
          </div>
          <span className="font-display font-bold tracking-tight text-lg text-foreground bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent group-hover:text-primary transition-all duration-300">
            TimeVault
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={isActive(n.to) ? 'page' : undefined}
              className={`
                relative px-4 py-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ease-out border border-transparent
                ${isActive(n.to)
                  ? 'text-primary bg-primary-soft/80 shadow-[inset_0_1px_2px_rgba(124,58,237,0.06)] border-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {n.label}
              {isActive(n.to) && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                aria-current={currentPath.startsWith('/dashboard') ? 'page' : undefined}
                className={`
                  flex items-center gap-2 px-[18px] py-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 border border-transparent
                  ${currentPath.startsWith('/dashboard') || currentPath.startsWith('/vault') || currentPath.startsWith('/future-mail')
                    ? 'text-primary bg-primary-soft/80 border-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
              <Link
                to="/trash"
                aria-current={currentPath.startsWith('/trash') ? 'page' : undefined}
                className={`
                  flex items-center gap-2 px-[18px] py-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 border border-transparent
                  ${currentPath.startsWith('/trash')
                    ? 'text-primary bg-primary-soft/80 border-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Trash2 className="size-3.5" />
                Trash
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-[18px] py-2 rounded-full text-sm font-semibold tracking-tight border border-border/80 hover:bg-muted/50 hover:border-border transition-all duration-300 text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-[18px] py-2 rounded-full text-sm font-semibold tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="relative px-5 py-2 rounded-full text-sm font-semibold bg-gradient-primary text-primary-foreground hover:opacity-95 transition-all duration-300 shadow-soft hover:shadow-glow overflow-hidden group/btn"
              >
                <span className="relative z-10">Get started</span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted/70 transition-colors flex items-center justify-center"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <div className="hamburger-btn" data-state={open ? 'open' : 'closed'}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/40 bg-white/85 backdrop-blur-xl px-5 py-5 flex flex-col gap-1.5 shadow-lg">
          {NAV_LINKS.map((n, idx) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={isActive(n.to) ? 'page' : undefined}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 border border-transparent
                ${isActive(n.to)
                  ? 'text-primary bg-primary-soft border-primary/5 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
              style={{
                animation: open ? 'slide-up 0.3s ease both' : 'none',
                animationDelay: `${idx * 40}ms`
              }}
            >
              {n.label}
            </Link>
          ))}

          <div className="h-px bg-border/40 my-2" />

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  currentPath.startsWith('/dashboard') || currentPath.startsWith('/vault') || currentPath.startsWith('/future-mail')
                    ? 'text-primary bg-primary-soft border-primary/5 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                style={{
                  animation: open ? 'slide-up 0.3s ease both' : 'none',
                  animationDelay: `${NAV_LINKS.length * 40}ms`
                }}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <Link
                to="/trash"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  currentPath.startsWith('/trash')
                    ? 'text-primary bg-primary-soft border-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                style={{
                  animation: open ? 'slide-up 0.3s ease both' : 'none',
                  animationDelay: `${(NAV_LINKS.length + 1) * 40}ms`
                }}
              >
                <Trash2 className="size-4" />
                Trash
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 text-left"
                style={{
                  animation: open ? 'slide-up 0.3s ease both' : 'none',
                  animationDelay: `${(NAV_LINKS.length + 2) * 40}ms`
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mt-1.5 px-4 py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold text-center shadow-soft hover:shadow-glow transition-all duration-300"
              style={{
                animation: open ? 'slide-up 0.3s ease both' : 'none',
                animationDelay: `${NAV_LINKS.length * 40}ms`
              }}
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
