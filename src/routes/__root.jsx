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

/* ── Premium Click Spark ────────────────────────────────────────────── */
const SPARK_COLORS = [
  'oklch(0.58 0.18 290)',  // primary purple
  'oklch(0.62 0.16 270)',  // violet
  'oklch(0.55 0.14 310)',  // indigo
  'oklch(0.65 0.12 260)',  // soft indigo
  'oklch(0.60 0.16 285)',  // mid purple
  'oklch(0.70 0.10 295)',  // light purple
  'oklch(0.62 0.13 275)',  // blue-violet
  'oklch(0.58 0.15 300)',  // deep violet
]

// Radial directions for 8 particles (degrees)
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

function PremiumClickSpark() {
  const [sparks, setSparks] = useState([])

  useEffect(() => {
    const handleClick = (e) => {
      const id = Date.now() + Math.random()
      setSparks((prev) => [...prev.slice(-9), { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setSparks((prev) => prev.filter((s) => s.id !== id)), 700)
    }
    window.addEventListener('mousedown', handleClick, { passive: true })
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute"
          style={{ left: spark.x, top: spark.y, transform: 'translate(-50%, -50%)' }}
        >
          {/* Layer 1: Outer soft glow ring — blurred, expands wide */}
          <div className="absolute inset-0 rounded-full animate-spark-glow-ring"
            style={{
              width: 48, height: 48,
              marginLeft: -24, marginTop: -24,
              background: 'radial-gradient(circle, oklch(0.58 0.18 290 / 0.35) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          {/* Layer 2: Crisp expanding border ring */}
          <div className="absolute inset-0 rounded-full border border-[oklch(0.58_0.18_290/0.45)] animate-spark-crisp-ring"
            style={{ width: 28, height: 28, marginLeft: -14, marginTop: -14 }}
          />
          {/* Layer 3: Second larger crisp ring with slight delay */}
          <div className="absolute inset-0 rounded-full border border-[oklch(0.62_0.16_270/0.25)] animate-spark-crisp-ring-lg"
            style={{ width: 44, height: 44, marginLeft: -22, marginTop: -22 }}
          />
          {/* Layer 4: 8 radial micro-particles */}
          {PARTICLE_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const dist = 20 + (i % 3) * 6 // vary distance: 20px, 26px, 32px
            const size = i % 2 === 0 ? 3 : 2
            return (
              <div
                key={angle}
                className="absolute rounded-full animate-spark-particle"
                style={{
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  background: SPARK_COLORS[i],
                  animationDelay: `${i * 12}ms`,
                  '--tx': `${Math.cos(rad) * dist}px`,
                  '--ty': `${Math.sin(rad) * dist}px`,
                }}
              />
            )
          })}
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
      <PremiumClickSpark />
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
