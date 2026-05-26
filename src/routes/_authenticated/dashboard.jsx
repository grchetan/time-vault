import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Mail, LogOut, Clock, Plus, LockOpen, TrendingUp, Sun, Moon, Sunset } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { getVaults } from '@/lib/vault'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({ component: DashboardPage })

const motivations = [
  "The secret of your success is determined by your daily agenda.",
  "Focus is a matter of deciding what not to do.",
  "Discipline is choosing between what you want now and what you want most.",
  "Every moment of distraction is a vote against your goals.",
  "Your attention is your most valuable asset — guard it.",
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good morning', Icon: Sun }
  if (h < 17) return { text: 'Good afternoon', Icon: Sunset }
  return { text: 'Good evening', Icon: Moon }
}

function StatSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-5 shadow-card">
      <div className="skeleton size-10 rounded-xl mb-3" />
      <div className="skeleton h-7 w-12 mb-1.5" />
      <div className="skeleton h-3 w-20" />
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

  useEffect(() => {
    if (!user) return
    auth.currentUser.getIdToken()
      .then((token) => getVaults(token))
      .then((res) => { setVaults(res.vaults || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const activeCount = vaults.filter((v) => Date.now() < v.unlock_at).length
  const unlockedCount = vaults.filter((v) => Date.now() >= v.unlock_at).length

  return (
    <div className="relative z-10 container mx-auto max-w-6xl px-5 py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
            <GreetIcon className="size-4" />
            <span>{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hello, <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm max-w-lg italic">
            "{quote}"
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
          onClick={() => signOut().then(() => router.navigate({ to: '/' }))}
        >
          <LogOut className="size-4 mr-2" />
          Sign out
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {loading ? (
          [1, 2, 3].map((i) => <StatSkeleton key={i} />)
        ) : (
          [
            { label: 'Total vaults', value: String(vaults.length), Icon: Lock, tone: 'bg-primary-soft text-primary', gradient: false },
            { label: 'Active locks', value: String(activeCount), Icon: Clock, tone: 'bg-amber-100 text-amber-600', gradient: false },
            { label: 'Unlocked', value: String(unlockedCount), Icon: LockOpen, tone: 'bg-emerald-100 text-emerald-600', gradient: false },
          ].map((s) => (
            <div key={s.label} className="card-premium p-5">
              <div className={`size-10 rounded-xl ${s.tone} grid place-items-center mb-3`}>
                <s.Icon className="size-5" />
              </div>
              <div className="text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-5">Quick actions</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {/* Vault card */}
        <div className="card-premium p-7">
          <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-5">
            <Lock className="size-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Password Vault</h3>
          <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
            AES-256 encrypted, server-locked passwords.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-5 font-medium">
            Timer khatam hone se pehle koi nahi dekh sakta — not even us.
          </p>
          <div className="flex gap-2">
            <Button asChild className="rounded-full flex-1 bg-gradient-primary hover:opacity-90 shadow-soft transition-all">
              <Link to="/vault">
                <Plus className="size-4 mr-1" />
                New Lock
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full hover:border-primary/30 hover:bg-primary-soft/30">
              <Link to="/vault">View All</Link>
            </Button>
          </div>
        </div>

        {/* Future Mail card */}
        <div className="card-premium p-7">
          <div className="size-12 rounded-2xl bg-mint text-mint-foreground grid place-items-center mb-5">
            <Mail className="size-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Future Mail</h3>
          <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
            Write a letter to your future self.
          </p>
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-5 font-medium">
            We'll deliver it by email on the date and time you choose.
          </p>
          <Button asChild className="rounded-full w-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all">
            <Link to="/future-mail">
              <Plus className="size-4 mr-1" />
              Write a letter
            </Link>
          </Button>
        </div>
      </div>

      {/* Activity summary (when there are vaults) */}
      {!loading && vaults.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Recent locks</h2>
          </div>
          <div className="space-y-2">
            {vaults.slice(0, 3).map((v) => {
              const locked = Date.now() < v.unlock_at
              return (
                <div key={v.id} className="flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-3.5 shadow-card">
                  <div className={`size-8 rounded-xl grid place-items-center flex-shrink-0 ${locked ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.duration_label} lock</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${locked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {locked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
              )
            })}
            {vaults.length > 3 && (
              <Link to="/vault" className="text-xs text-primary hover:underline block text-center mt-2">
                View all {vaults.length} vaults
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
