import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Lock, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="container mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
            <Lock className="size-4" />
          </div>
          <span>TimeVault</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {n.icon && <n.icon className="size-3.5" />}
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-full text-sm border border-border hover:bg-muted transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Sign in
              </Link>
              <Link to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm">
              {n.icon && <n.icon className="size-4" />}
              {n.label}
            </Link>
          ))}
          <div className="h-px bg-border my-1" />
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Dashboard</Link>
              <button onClick={() => { setOpen(false); signOut() }}
                className="px-3 py-2 rounded-lg hover:bg-muted text-sm text-left">Sign out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm text-center font-semibold">
              Get started
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
