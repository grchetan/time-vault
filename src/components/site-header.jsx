import { useState, useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, Lock, LayoutDashboard, LogOut, User } from 'lucide-react';
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
          ? 'glass shadow-card border-b border-white/40'
          : 'bg-background/70 backdrop-blur-md border-b border-border/50'
      }`}
    >
      <div className="container mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-lg hover:opacity-85 transition-opacity group"
          aria-label="TimeVault home"
        >
          <div className="size-8 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft group-hover:shadow-glow transition-shadow">
            <Lock className="size-4" />
          </div>
          <span className="font-display">TimeVault</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={isActive(n.to) ? 'page' : undefined}
              className={`
                relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(n.to)
                  ? 'text-primary bg-primary-soft'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }
              `}
            >
              {n.label}
              {isActive(n.to) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
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
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${currentPath.startsWith('/dashboard') || currentPath.startsWith('/vault') || currentPath.startsWith('/future-mail')
                    ? 'text-primary bg-primary-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }
                `}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-muted/70 hover:border-border/80 transition-all duration-200 text-muted-foreground hover:text-foreground"
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
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-glow"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted/70 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={isActive(n.to) ? 'page' : undefined}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(n.to)
                  ? 'text-primary bg-primary-soft'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }
              `}
            >
              {n.label}
            </Link>
          ))}

          <div className="h-px bg-border/50 my-2" />

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPath.startsWith('/dashboard') ? 'text-primary bg-primary-soft' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 text-left"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mt-1 px-4 py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold text-center shadow-soft"
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
