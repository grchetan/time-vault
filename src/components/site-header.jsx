import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    setOpen(false);
    signOut().then(() => navigate({ to: "/" }));
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="container mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Lock className="size-4" />
          </div>
          TimeVault
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">Dashboard</Link>
              <button onClick={handleSignOut} className="px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Sign in</Link>
              <Link to="/login" className="px-4 py-2 rounded-full text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm">
              {n.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Dashboard</Link>
              <button onClick={handleSignOut} className="px-3 py-2 rounded-lg hover:bg-muted text-sm text-left">Sign out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="mt-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm text-center">
              Get started
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
