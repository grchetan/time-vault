import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Lock, Plus, Eye, EyeOff, Unlock, Copy, Check, Trash2, Timer, AlertTriangle, Search
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createVault, getVaults, revealPassword, deleteVault } from '@/lib/vault'
import { encryptPassword, decryptPassword } from '@/lib/crypto'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/vault')({ component: VaultPage })

const DURATIONS = [
  { label: '1 Min',    ms: 60_000 },
  { label: '5 Min',   ms: 300_000 },
  { label: '1 Day',   ms: 86_400_000 },
  { label: '7 Days',  ms: 7 * 86_400_000 },
  { label: '30 Days', ms: 30 * 86_400_000 },
  { label: '6 Mo',    ms: 180 * 86_400_000 },
  { label: '1 Year',  ms: 365 * 86_400_000 },
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

/* ── Delete confirmation dialog ───────────────────────────────────── */
function DeleteDialog({ open, onOpenChange, vaultName, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-2">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-center">Delete this vault?</DialogTitle>
          <DialogDescription className="text-center">
            <strong>"{vaultName}"</strong> will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Vault card ────────────────────────────────────────────────────── */
function VaultCard({ vault, onDeleted }) {
  const [now, setNow] = useState(Date.now())
  const [revealed, setRevealed] = useState(null)
  const [copied, setCopied] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const isUnlocked = now >= vault.unlock_at
  const remaining = Math.max(0, vault.unlock_at - now)
  const progress = Math.min(1, (now - vault.created_at) / (vault.unlock_at - vault.created_at))
  const r = 26, circ = 2 * Math.PI * r

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
    setDeleting(true)
    try {
      const token = await auth.currentUser.getIdToken()
      await deleteVault(token, vault.id)
      onDeleted(vault.id)
      toast.success('Vault deleted')
      setDeleteOpen(false)
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
    <>
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        vaultName={vault.name}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <div className={`rounded-3xl bg-card border p-5 shadow-card flex gap-4 transition-all duration-200 hover:shadow-hover ${isUnlocked ? 'border-emerald-200' : 'border-border'}`}>
        {/* Progress ring */}
        <div className="shrink-0 flex items-start pt-1">
          <div className="relative">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
              <circle
                cx="30" cy="30" r={r} fill="none"
                stroke={isUnlocked ? '#10b981' : '#f59e0b'}
                strokeWidth="4"
                strokeDasharray={`${circ * progress} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isUnlocked
                ? <Unlock className="size-4.5 text-emerald-500" />
                : <Lock className="size-4.5 text-amber-500" />
              }
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{vault.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {vault.duration_label} lock &middot; {new Date(vault.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {vault.reason && (
                <div className="text-xs text-muted-foreground mt-1 italic">"{vault.reason}"</div>
              )}
            </div>
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-all duration-200 flex-shrink-0"
              aria-label="Delete vault"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {error && (
            <div className="mt-2 text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">
              {error}
            </div>
          )}

          {isUnlocked ? (
            <div className="mt-3 space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <Unlock className="size-3" />
                Unlocked
              </span>
              {revealed && revealed.map((pw, i) => (
                <div key={i}>
                  {revealed.length > 1 && (
                    <div className="text-xs font-medium text-muted-foreground mb-1">{pw.label}</div>
                  )}
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                    <span className="flex-1 font-mono text-sm truncate">{pw.text}</span>
                    <button
                      onClick={() => handleCopy(i, pw.text)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      aria-label="Copy password"
                    >
                      {copied === i
                        ? <Check className="size-4 text-emerald-500" />
                        : <Copy className="size-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleReveal}
                disabled={loading}
                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
              >
                {loading ? 'Loading…' : revealed ? 'Hide password' : 'Reveal password'}
              </button>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-2 text-sm text-amber-600">
              <Timer className="size-4" />
              <span className="font-medium">{formatCountdown(remaining)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Add vault form ────────────────────────────────────────────────── */
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
    if (!name.trim()) { setError('App name is required.'); return }
    if (passwords.some((p) => !p.value.trim())) { setError('Password cannot be empty.'); return }
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
      toast.success(`${name} locked for ${durationLabel}!`)
      onClose()
    } catch (e) {
      setError(e.message || 'Could not save vault')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-card border border-border p-7 shadow-card space-y-5 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-1">
        <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
          <Lock className="size-5" />
        </div>
        <h2 className="text-lg font-semibold">Lock a new password</h2>
      </div>

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
            <Input
              type={p.show ? 'text' : 'password'}
              value={p.value}
              onChange={(e) => updatePassword(i, 'value', e.target.value)}
              placeholder="Enter password to lock"
              className="pr-10"
              required
            />
            <button type="button" onClick={() => updatePassword(i, 'show', !p.show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={p.show ? 'Hide' : 'Show'}>
              {p.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      ))}

      {passwords.length < 5 && (
        <button type="button" onClick={() => setPasswords((prev) => [...prev, { value: '', show: false, label: '' }])}
          className="text-xs text-primary hover:underline font-medium">
          + Add another password
        </button>
      )}

      <div className="space-y-1.5">
        <Label>Reason (optional)</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Focus mode, social media detox…" />
      </div>

      <div className="space-y-2">
        <Label>Lock duration</Label>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.ms} type="button" onClick={() => setDurationMs(d.ms)}
              className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                durationMs === d.ms
                  ? 'bg-gradient-primary text-primary-foreground border-primary shadow-soft'
                  : 'bg-background border-border hover:border-primary/40 hover:bg-primary-soft/30'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning notice — bilingual */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
          <AlertTriangle className="size-3.5 flex-shrink-0" />
          Once locked, this password cannot be revealed for <strong>{durationLabel}</strong>.
        </div>
        <div className="text-amber-600 text-xs">
          Yeh password <strong>{durationLabel}</strong> tak lock rahega — server pe enforce hota hai.
        </div>
      </div>

      {error && <div className="text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all" disabled={loading}>
          <Lock className="size-4 mr-1.5" />
          {loading ? 'Locking…' : `Lock for ${durationLabel}`}
        </Button>
        <Button type="button" variant="outline" className="rounded-full hover:bg-muted/70" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/* ── Skeleton card ─────────────────────────────────────────────────── */
function VaultCardSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-5 shadow-card flex gap-4">
      <div className="skeleton size-[60px] rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-20 mt-2" />
      </div>
    </div>
  )
}

/* ── Vault page ────────────────────────────────────────────────────── */
function VaultPage() {
  const { user } = useAuth()
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    auth.currentUser.getIdToken()
      .then((token) => getVaults(token))
      .then((res) => { setVaults(res.vaults || []); setLoading(false) })
      .catch((e) => { setError(e.message || 'Could not load vaults'); setLoading(false) })
  }, [user])

  const filtered = vaults.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.reason && v.reason.toLowerCase().includes(search.toLowerCase()))
  )
  const unlockedCount = vaults.filter((v) => Date.now() >= v.unlock_at).length

  return (
    <div className="relative z-10 container mx-auto max-w-2xl px-5 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Password Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? (
              <span className="skeleton h-3 w-28 inline-block" />
            ) : (
              `${vaults.length} total · ${unlockedCount} unlocked`
            )}
          </p>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all">
            <Plus className="size-4 mr-1" />
            New Lock
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm mb-5 flex items-center gap-2">
          <AlertTriangle className="size-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {showAdd && (
        <AddVaultForm
          onClose={() => setShowAdd(false)}
          onAdded={(v) => setVaults((prev) => [v, ...prev])}
        />
      )}

      {/* Search */}
      {!loading && vaults.length > 2 && !showAdd && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vaults…"
            className="pl-9 rounded-full"
          />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => <VaultCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && vaults.length === 0 && !showAdd && (
        <div className="text-center py-20 animate-fade-in">
          <div className="size-20 mx-auto rounded-3xl bg-primary-soft text-primary grid place-items-center mb-5">
            <Lock className="size-10" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No vaults yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto mb-6">
            Lock your first password behind a timer and reclaim your focus.
          </p>
          <Button onClick={() => setShowAdd(true)} className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft">
            Lock your first password
          </Button>
        </div>
      )}

      {/* No search results */}
      {!loading && vaults.length > 0 && filtered.length === 0 && search && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No vaults match "<strong>{search}</strong>"
        </div>
      )}

      {/* Vault list */}
      <div className="space-y-4">
        {filtered.map((vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            onDeleted={(id) => setVaults((prev) => prev.filter((v) => v.id !== id))}
          />
        ))}
      </div>
    </div>
  )
}
