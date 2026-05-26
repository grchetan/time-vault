import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/lib/auth';
import { Home, RotateCcw, Lock } from 'lucide-react';

/* ── Mouse-reactive background ─────────────────────────────────────── */
function AnimatedBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = document.documentElement
    const handler = (e) => {
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(1) + '%'
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(1) + '%'
      el.style.setProperty('--mouse-x', x)
      el.style.setProperty('--mouse-y', y)
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Static gradient mesh */}
      <div className="absolute inset-0 bg-hero opacity-60" />
      {/* Mouse-reactive spotlight */}
      <div className="absolute inset-0 mouse-spotlight transition-all duration-300 ease-out" />
      {/* Drifting blobs */}
      <div
        className="blob bg-primary/20 animate-blob"
        style={{ width: 520, height: 520, top: '-10%', left: '-8%', animationDelay: '0s' }}
      />
      <div
        className="blob bg-secondary/25 animate-blob"
        style={{ width: 420, height: 420, bottom: '5%', right: '-6%', animationDelay: '-4s' }}
      />
      <div
        className="blob animate-blob"
        style={{
          width: 320, height: 320,
          top: '40%', left: '60%',
          background: 'oklch(0.93 0.07 30 / 0.25)',
          animationDelay: '-8s',
        }}
      />
    </div>
  )
}

/* ── Full-page auth loading screen ──────────────────────────────────── */
function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow">
            <Lock className="size-7" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-primary/30 animate-spin-slow" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Unlocking your vault…</p>
      </div>
    </div>
  )
}

/* ── 404 ────────────────────────────────────────────────────────────── */
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
      <div className="max-w-md text-center animate-slide-up">
        <div className="size-20 mx-auto rounded-3xl bg-primary-soft text-primary grid place-items-center mb-6">
          <span className="text-4xl font-extrabold">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft"
        >
          <Home className="size-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

/* ── Error boundary ─────────────────────────────────────────────────── */
function ErrorComponent({ error, reset }) {
  const router = useRouter();
  console.error('Route error:', error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
      <div className="max-w-md text-center animate-slide-up">
        <div className="size-20 mx-auto rounded-3xl bg-destructive/10 text-destructive grid place-items-center mb-6">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground bg-muted rounded-xl px-4 py-3 font-mono mb-8">
          {error?.message}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset?.(); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Home className="size-4" />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/* ── Click Spark Ripple effect ─────────────────────────────────────── */
function ClickSparkEffect() {
  const [sparks, setSparks] = useState([])

  useEffect(() => {
    const handleMouseDown = (e) => {
      const id = Date.now() + Math.random()
      const newSpark = {
        id,
        x: e.clientX,
        y: e.clientY
      }
      
      // Strict memory capping (slice to 8 sparks) to ensure absolute scrolling fluidity
      setSparks((prev) => [...prev.slice(-7), newSpark])

      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== id))
      }, 500)
    }

    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{ left: spark.x, top: spark.y }}
        >
          {/* Subtle ripple expanding ring */}
          <div className="absolute w-10 h-10 rounded-full border border-primary/30 -translate-x-1/2 -translate-y-1/2 animate-spark-ripple" />
          
          {/* Directional spark glow particles */}
          <div className="absolute w-1 h-1 rounded-full bg-primary/70 blur-[0.5px] -translate-x-1/2 -translate-y-1/2 animate-spark-particle-0" />
          <div className="absolute w-1 h-1 rounded-full bg-violet-400/70 blur-[0.5px] -translate-x-1/2 -translate-y-1/2 animate-spark-particle-1" />
          <div className="absolute w-1 h-1 rounded-full bg-indigo-400/70 blur-[0.5px] -translate-x-1/2 -translate-y-1/2 animate-spark-particle-2" />
          <div className="absolute w-1 h-1 rounded-full bg-emerald-400/70 blur-[0.5px] -translate-x-1/2 -translate-y-1/2 animate-spark-particle-3" />
        </div>
      ))}
    </div>
  )
}

function AppLayout() {
  const { loading } = useAuth();
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <ClickSparkEffect />
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">
          {loading ? <AuthLoadingScreen /> : <Outlet />}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
