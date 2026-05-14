import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Mail, LogOut, Clock, Plus, LockOpen } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { getVaults } from '@/lib/vault'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({ component: DashboardPage })

function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Friend'

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
    <div className="container mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Hey, {displayName} 👋</h1>
          <p className="text-muted-foreground mt-1">Your TimeVault dashboard</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full"
          onClick={() => signOut().then(() => router.navigate({ to: '/' }))}>
          <LogOut className="size-4 mr-2" /> Sign out
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total vaults', value: loading ? '…' : String(vaults.length), icon: Lock, tone: 'bg-primary-soft text-primary' },
          { label: 'Active locks', value: loading ? '…' : String(activeCount), icon: Clock, tone: 'bg-amber-100 text-amber-700' },
          { label: 'Unlocked', value: loading ? '…' : String(unlockedCount), icon: LockOpen, tone: 'bg-green-100 text-green-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-card border border-border p-5 shadow-card">
            <div className={`size-10 rounded-xl ${s.tone} grid place-items-center mb-3`}>
              <s.icon className="size-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-card border border-border p-7 shadow-card">
          <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-5">
            <Lock className="size-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Password Vault</h3>
          <p className="text-muted-foreground text-sm mb-5">AES-256 encrypted, server-locked passwords. Timer khatam hone se pehle koi nahi dekh sakta.</p>
          <div className="flex gap-2">
            <Button asChild className="rounded-full flex-1"><Link to="/vault"><Plus className="size-4 mr-1" /> New Lock</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/vault">View All</Link></Button>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-7 shadow-card">
          <div className="size-12 rounded-2xl bg-mint text-mint-foreground grid place-items-center mb-5">
            <Mail className="size-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Future Mail</h3>
          <p className="text-muted-foreground text-sm mb-5">Write a letter to your future self. We'll deliver it by email on the date you choose.</p>
          <Button asChild className="rounded-full w-full"><Link to="/future-mail"><Plus className="size-4 mr-1" /> Write a letter</Link></Button>
        </div>
      </div>
    </div>
  )
}
