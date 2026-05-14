import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Plus, Eye, EyeOff, Unlock, Copy, Check, Trash2, Timer } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createVault, getVaults, revealPassword, deleteVault } from '@/lib/vault'
import { encryptPassword, decryptPassword } from '@/lib/crypto'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/vault')({ component: VaultPage })

const DURATIONS = [
  { label: '1 Min', ms: 60_000 },
  { label: '5 Min', ms: 300_000 },
  { label: '1 Day', ms: 86_400_000 },
  { label: '7 Days', ms: 7 * 86_400_000 },
  { label: '30 Days', ms: 30 * 86_400_000 },
  { label: '6 Months', ms: 180 * 86_400_000 },
  { label: '1 Year', ms: 365 * 86_400_000 },
]

function formatCountdown(ms) {
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h remaining`
  if (h > 0) return `${h}h ${m}m remaining`
  if (m > 0) return `${m}m ${sec}s remaining`
  return `${sec}s remaining`
}

function VaultCard({ vault, onDeleted }) {
  const [now, setNow] = useState(Date.now())
  const [revealed, setRevealed] = useState(null)
  const [copied, setCopied] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const isUnlocked = now >= vault.unlock_at
  const remaining = Math.max(0, vault.unlock_at - now)
  const progress = Math.min(1, (now - vault.created_at) / (vault.unlock_at - vault.created_at))
  const r = 30, circ = 2 * Math.PI * r

  const handleReveal = async () => {
    if (revealed) { setRevealed(null); return }
    setLoading(true); setError('')
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await revealPassword(token, vault.id)
      const decrypted = await Promise.all(
        res.passwords.map(async (pw) => ({ label: pw.label, text: await decryptPassword(pw) }))
      )
      setRevealed(decrypted)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this vault?')) return
    setDeleting(true)
    try {
      const token = await auth.currentUser.getIdToken()
      await deleteVault(token, vault.id)
      onDeleted(vault.id)
      toast.success('Vault deleted')
    } catch (e) {
      setError(e.message || 'Delete failed')
      setDeleting(false)
    }
  }

  const handleCopy = (i, text) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={`rounded-3xl bg-card border p-5 shadow-card flex gap-4 transition-colors ${isUnlocked ? 'border-green-200' : 'border-border'}`}>
      <div className="shrink-0 flex items-start pt-1">
        <div className="relative">
          <svg width="64" height="64" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle cx="36" cy="36" r={r} fill="none"
              stroke={isUnlocked ? '#22c55e' : '#d97706'}
              strokeWidth="5"
              strokeDasharray={`${circ * progress} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isUnlocked ? <Unlock className="size-5 text-green-500" /> : <Lock className="size-5 text-amber-600" />}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold">{vault.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {vault.duration_label} lock · {new Date(vault.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {vault.reason && <div className="text-xs text-muted-foreground mt-1 italic">"{vault.reason}"</div>}
          </div>
          <button onClick={handleDelete} disabled={deleting} className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10">
            <Trash2 className="size-4" />
          </button>
        </div>

        {error && <div className="mt-2 text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">{error}</div>}

        {isUnlocked ? (
          <div className="mt-3 space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <Unlock className="size-3" /> Unlocked
            </span>
            {revealed && revealed.map((pw, i) => (
              <div key={i}>
                {revealed.length > 1 && <div className="text-xs font-medium text-muted-foreground mb-1">{pw.label}</div>}
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <span className="flex-1 font-mono text-sm truncate">{pw.text}</span>
                  <button onClick={() => handleCopy(i, pw.text)} className="text-muted-foreground hover:text-foreground">
                    {copied === i ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleReveal} disabled={loading} className="text-xs text-primary hover:underline">
              {loading ? 'Loading…' : revealed ? 'Hide password' : 'Show password'}
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <Timer className="size-4" />
            <span>{formatCountdown(remaining)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AddVaultForm({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [passwords, setPasswords] = useState([{ value: '', show: false, label: '' }])
  const [reason, setReason] = useState('')
  const [durationMs, setDurationMs] = useState(30 * 86_400_000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updatePassword = (i, field, val) =>
    setPasswords((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  const durationLabel = DURATIONS.find((d) => d.ms === durationMs)?.label ?? ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('App name zaroori hai.'); return }
    if (passwords.some((p) => !p.value.trim())) { setError('Password khali nahi hona chahiye.'); return }
    setLoading(true); setError('')
    try {
      const encryptedPasswords = await Promise.all(
        passwords.map(async (p, i) => ({
          label: p.label.trim() || `Password ${i + 1}`,
          ...(await encryptPassword(p.value)),
        }))
      )
      const token = await auth.currentUser.getIdToken()
      const res = await createVault(token, {
        name: name.trim(), reason: reason.trim(),
        unlockAt: Date.now() + durationMs,
        durationLabel, passwords: encryptedPasswords,
      })
      onAdded(res.vault)
      toast.success(`🔒 ${name} locked for ${durationLabel}!`)
      onClose()
    } catch (e) {
      setError(e.message || 'Save nahi hua')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-card border border-border p-7 shadow-card space-y-5 mb-6">
      <h2 className="text-lg font-semibold">Lock a new password</h2>
      <div className="space-y-1.5">
        <Label>App / Account name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Instagram, Twitter, Reddit…" required />
      </div>
      {passwords.map((p, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label>{passwords.length > 1 ? `Password ${i + 1}` : 'Password to lock'}</Label>
            {passwords.length > 1 && (
              <button type="button" onClick={() => setPasswords((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs text-destructive hover:underline">Remove</button>
            )}
          </div>
          {passwords.length > 1 && (
            <Input value={p.label} onChange={(e) => updatePassword(i, 'label', e.target.value)} placeholder="Label (e.g. Main, Backup)" />
          )}
          <div className="relative">
            <Input type={p.show ? 'text' : 'password'} value={p.value}
              onChange={(e) => updatePassword(i, 'value', e.target.value)} placeholder="Enter password to lock" className="pr-10" required />
            <button type="button" onClick={() => updatePassword(i, 'show', !p.show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {p.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      ))}
      {passwords.length < 5 && (
        <button type="button" onClick={() => setPasswords((prev) => [...prev, { value: '', show: false, label: '' }])}
          className="text-xs text-primary hover:underline">+ Add another password</button>
      )}
      <div className="space-y-1.5">
        <Label>Reason (optional)</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Social media se door rehna chahta hoon" />
      </div>
      <div className="space-y-2">
        <Label>Lock duration</Label>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.ms} type="button" onClick={() => setDurationMs(d.ms)}
              className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${durationMs === d.ms ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        ⚠️ Once locked, password cannot be seen for <strong>{durationLabel}</strong> — server pe lock hoga.
      </div>
      {error && <div className="text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1 rounded-full" disabled={loading}>
          <Plus className="size-4 mr-1" />{loading ? 'Locking…' : `Lock for ${durationLabel}`}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={loading}>Cancel</Button>
      </div>
    </form>
  )
}

function VaultPage() {
  const { user } = useAuth()
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    auth.currentUser.getIdToken()
      .then((token) => getVaults(token))
      .then((res) => { setVaults(res.vaults || []); setLoading(false) })
      .catch((e) => { setError(e.message || 'Load failed'); setLoading(false) })
  }, [user])

  const unlockedCount = vaults.filter((v) => Date.now() >= v.unlock_at).length

  return (
    <div className="container mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Password Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading…' : `${vaults.length} total · ${unlockedCount} unlocked`}
          </p>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full">
            <Plus className="size-4 mr-1" /> New Lock
          </Button>
        )}
      </div>
      {error && <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm mb-4">{error}</div>}
      {showAdd && <AddVaultForm onClose={() => setShowAdd(false)} onAdded={(v) => setVaults((prev) => [v, ...prev])} />}
      {!loading && vaults.length === 0 && !showAdd && (
        <div className="text-center py-20">
          <div className="size-16 mx-auto rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
            <Lock className="size-8" />
          </div>
          <h3 className="font-semibold text-lg">No vaults yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Lock your first password behind a timer!</p>
          <Button onClick={() => setShowAdd(true)} className="mt-5 rounded-full">Lock your first password</Button>
        </div>
      )}
      <div className="space-y-4">
        {vaults.map((vault) => (
          <VaultCard key={vault.id} vault={vault} onDeleted={(id) => setVaults((prev) => prev.filter((v) => v.id !== id))} />
        ))}
      </div>
    </div>
  )
}
