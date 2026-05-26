import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Mail, LogOut, Clock, Plus, LockOpen, TrendingUp, Sun, Moon, Sunset, Sparkles, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { getVaults } from '@/lib/vault'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({ component: DashboardPage })

const motivations = [
  "Focus is a matter of deciding what not to do. Lock the noise.",
  "Discipline is choosing between what you want now and what you want most.",
  "Every moment of distraction is a vote against your future self.",
  "Your attention is your most valuable asset — guard it like a vault.",
  "Self-trust is built one locked hour at a time. Keep the contract.",
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good morning', Icon: Sun }
  if (h < 17) return { text: 'Good afternoon', Icon: Sunset }
  return { text: 'Good evening', Icon: Moon }
}

function StatCard({ label, value, icon: Icon, tone, description }) {
  return (
    <div className="card-premium p-6 group cursor-default select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="text-sm font-bold text-muted-foreground tracking-tight uppercase font-mono">{label}</div>
          <div className="text-4xl font-extrabold tracking-tight text-foreground group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{description}</div>
        </div>
        <div className={`size-11 rounded-2xl ${tone} grid place-items-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="size-5.5" />
        </div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-3.5 w-20" />
        <div className="skeleton size-10 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-16" />
      <div className="skeleton h-3 w-28" />
    </div>
  )
}

function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Friend'
  const { text: greeting, Icon: GreetIcon } = getGreeting()
  const quote = motivations[new Date().getDate() % motivations.length]

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  useEffect(() => {
    if (!user) return
    auth.currentUser.getIdToken()
      .then((token) => getVaults(token))
      .then((res) => { setVaults(res.vaults || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const activeCount = vaults.filter((v) => Date.now() < v.unlock_at).length
  const unlockedCount = vaults.filter((v) => Date.now() >= v.unlock_at).length

  // Gamified Discipline score formula: active locks give 25 points, completed locks give 15 points (cap at 100)
  const disciplineScore = vaults.length > 0 ? Math.min(100, (activeCount * 25) + (unlockedCount * 15)) : 0

  const getDisciplineStatus = (score) => {
    if (score === 0) return { title: 'Focus Novice', desc: 'Seal your first lock to activate your discipline ranking.', color: 'text-muted-foreground' }
    if (score < 35) return { title: 'Focused Apprentice', desc: 'You are beginning to build self-trust. Keep locking!', color: 'text-amber-500' }
    if (score < 75) return { title: 'Focus Master', desc: 'Superb control against distractions. Keep it up!', color: 'text-primary' }
    return { title: 'Discipline Elite', desc: 'Absolute mastery over your digital workspace. Legendary!', color: 'text-emerald-500' }
  }

  const status = getDisciplineStatus(disciplineScore)
  const r = 32, circ = 2 * Math.PI * r
  const progressOffset = circ - (disciplineScore / 100) * circ

  return (
    <div className="relative z-10 container mx-auto max-w-6xl px-5 py-12">
      {/* Editorial Welcome Banner */}
      <div className="grid lg:grid-cols-12 gap-8 mb-10 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              <GreetIcon className="size-3.5" />
              {greeting}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              <Calendar className="size-3.5" />
              {formattedDate}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display">
            Hello, <span className="text-gradient-moving font-extrabold">{displayName}</span>
          </h1>
          {/* Quote of the day card */}
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 p-5 relative overflow-hidden group">
            <span className="absolute -right-3 -bottom-6 text-7xl font-extrabold text-primary/5 select-none font-serif group-hover:scale-110 transition-transform duration-300">“</span>
            <p className="text-sm font-semibold italic text-foreground/80 leading-relaxed pr-6">
              "{quote}"
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-end">
          <Button
            variant="outline"
            className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300 font-semibold tracking-tight"
            onClick={() => signOut().then(() => router.navigate({ to: '/' }))}
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Grid of Stats and Discipline Gauge */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Left columns: Stats widget cards */}
        <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Vaults"
                value={String(vaults.length)}
                icon={Lock}
                tone="bg-primary-soft text-primary border border-primary/10"
                description="Passwords sealed in safe vaults"
              />
              <StatCard
                label="Active Locks"
                value={String(activeCount)}
                icon={Clock}
                tone="bg-amber-50 text-amber-600 border border-amber-100"
                description="Currently enforcing focus mode"
              />
              <StatCard
                label="Unlocked Safe"
                value={String(unlockedCount)}
                icon={LockOpen}
                tone="bg-emerald-50 text-emerald-600 border border-emerald-100"
                description="Detox successfully completed"
              />
            </>
          )}
        </div>

        {/* Right column: Gamified Discipline Insight */}
        <div className="card-premium p-6 flex flex-col justify-between items-center text-center select-none relative group">
          <div className="absolute top-4 right-4">
            <Sparkles className="size-4.5 text-primary animate-pulse" />
          </div>
          <div className="w-full flex items-center justify-between border-b border-border/50 pb-3 mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">Discipline Level</span>
            <span className={`text-xs font-bold font-mono ${status.color}`}>{status.title}</span>
          </div>

          <div className="relative size-28 flex items-center justify-center my-1.5">
            <svg width="112" height="112" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4.5" />
              <circle
                cx="40" cy="40" r={r} fill="none"
                stroke="url(#dashboardScoreGrad)"
                strokeWidth="5"
                strokeDasharray={circ}
                strokeDashoffset={loading ? circ : progressOffset}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="dashboardScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.58 0.18 290)" />
                  <stop offset="100%" stopColor="oklch(0.6 0.15 200)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground leading-none">{loading ? '…' : disciplineScore}</span>
              <span className="text-[10px] text-muted-foreground font-bold tracking-wider mt-0.5">SCORE</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed px-2 mt-4">
            {loading ? 'Calculating your discipline rank…' : status.desc}
          </p>
        </div>
      </div>

      {/* Quick Actions split panels */}
      <h2 className="text-lg font-bold tracking-tight mb-5 font-display">Focus Shortcuts</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Password Vault panel */}
        <div className="card-premium p-7 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Lock className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Password Vault</h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Seclude your social media or gaming credentials behind dynamic, server-enforced timers to regain control of your attention.
          </p>
          <div className="rounded-xl bg-amber-50/50 border border-amber-200/50 px-3.5 py-2.5 mb-6 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-normal font-semibold">
              Enforced strictly on database: No early reveals, no override buttons.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="rounded-full flex-1 bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 group/btn">
              <Link to="/vault" search={{ new: true }}>
                <Plus className="size-4 mr-1.5" />
                New Lock
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full hover:border-primary/20 hover:bg-primary-soft/30 hover:text-primary transition-colors duration-300">
              <Link to="/vault">View Vaults</Link>
            </Button>
          </div>
        </div>

        {/* Future Mail panel */}
        <div className="card-premium p-7 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="size-12 rounded-2xl bg-mint text-mint-foreground grid place-items-center mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Mail className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Future Mail</h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Draft motivational letters or discipline advice to your future self and receive them directly in your inbox at your chosen time.
          </p>
          <div className="rounded-xl bg-blue-50/50 border border-blue-100/50 px-3.5 py-2.5 mb-6 flex items-start gap-2.5">
            <Sparkles className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-normal font-semibold">
              Write today. Securely scheduled. Delivered exactly when it matters most.
            </p>
          </div>
          <Button asChild className="rounded-full w-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 group/btn">
            <Link to="/future-mail" search={{ new: true }}>
              <Mail className="size-4 mr-1.5" />
              Write a letter
            </Link>
          </Button>
        </div>
      </div>

      {/* Activity Summary Tracker */}
      {!loading && vaults.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-5 border-b border-border/30 pb-3">
            <TrendingUp className="size-4.5 text-muted-foreground" />
            <h2 className="text-lg font-bold tracking-tight font-display">Recent Detox Actions</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {vaults.slice(0, 3).map((v) => {
              const locked = Date.now() < v.unlock_at
              return (
                <div key={v.id} className="flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-4 shadow-card hover:shadow-hover hover:border-primary/10 transition-all duration-300">
                  <div className={`size-9 rounded-xl grid place-items-center flex-shrink-0 ${locked ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {locked ? <Lock className="size-4.5" /> : <LockOpen className="size-4.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-foreground">{v.name}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wide font-mono">{v.duration_label} lock</div>
                  </div>
                  <span className={`text-[10px] font-extrabold font-mono uppercase px-2.5 py-1 rounded-full ${locked ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {locked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
              )
            })}
          </div>
          {vaults.length > 3 && (
            <div className="text-center mt-6">
              <Link to="/vault" className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline select-none">
                View all {vaults.length} vaults
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

