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
  Lock, Plus, Eye, EyeOff, Unlock, Copy, Check, Trash2, Timer, AlertTriangle, Search, ShieldCheck, ChevronRight, KeyRound
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createVault, getVaults, revealPassword, deleteVault } from '@/lib/vault'
import { encryptPassword, decryptPassword } from '@/lib/crypto'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/vault')({
  validateSearch: (search) => ({
    new: search.new === 'true' || search.new === true || undefined,
  }),
  component: VaultPage,
})

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
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4 border border-destructive/20 animate-pulse">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-center font-display font-extrabold text-xl">Delete this vault?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
            The lock <strong className="text-foreground">"{vaultName}"</strong> and all its passwords will be permanently deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 sm:flex-row mt-4">
          <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full font-bold shadow-soft" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Vault'}
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
      toast.success('Vault deleted successfully')
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

      <div className={`rounded-3xl bg-card border p-6 shadow-card flex gap-5 transition-all duration-300 hover:shadow-hover relative overflow-hidden group ${
        isUnlocked 
          ? 'border-emerald-200 bg-emerald-50/10' 
          : 'border-border'
      }`}>
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Progress circular gauge */}
        <div className="shrink-0 flex items-start pt-1.5">
          <div className="relative">
            <svg width="60" height="60" viewBox="0 0 60 60" className="group-hover:scale-105 transition-transform duration-300">
              <circle cx="30" cy="30" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4.5" />
              <circle
                cx="30" cy="30" r={r} fill="none"
                stroke={isUnlocked ? '#10b981' : 'url(#vaultProgressGrad)'}
                strokeWidth="5"
                strokeDasharray={`${circ * progress} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <defs>
                <linearGradient id="vaultProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isUnlocked
                ? <Unlock className="size-4.5 text-emerald-500 animate-pulse" />
                : <Lock className="size-4.5 text-amber-500" />
              }
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                {vault.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                {vault.duration_label} Lock &middot; {new Date(vault.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {vault.reason && (
                <div className="rounded-xl border border-border/40 bg-muted/30 px-3 py-1.5 mt-2.5 text-xs text-muted-foreground leading-normal italic font-medium pr-5 relative max-w-sm">
                  <span className="absolute right-2 top-1.5 text-lg font-serif opacity-10 select-none">”</span>
                  "{vault.reason}"
                </div>
              )}
            </div>
            
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-muted-foreground hover:text-destructive p-2 rounded-xl hover:bg-destructive/10 transition-all duration-300 flex-shrink-0"
              aria-label="Delete vault"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {error && (
            <div className="mt-3 text-xs text-destructive rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-2 font-semibold">
              {error}
            </div>
          )}

          {isUnlocked ? (
            <div className="mt-4 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-tight uppercase font-mono shadow-sm">
                <Unlock className="size-3" />
                Unlocked & Decrypted
              </span>
              
              {revealed && (
                <div className="space-y-2 animate-slide-up">
                  {revealed.map((pw, i) => (
                    <div key={i} className="space-y-1">
                      {revealed.length > 1 && (
                        <div className="text-xs font-bold text-muted-foreground font-mono pl-1">{pw.label}</div>
                      )}
                      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 px-3.5 py-2.5 shadow-sm group/pw">
                        <span className="flex-1 font-mono text-sm tracking-wider text-emerald-800 truncate select-all">{pw.text}</span>
                        <button
                          onClick={() => handleCopy(i, pw.text)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 hover:bg-emerald-100 rounded-lg shrink-0"
                          aria-label="Copy password"
                        >
                          {copied === i
                            ? <Check className="size-4.5 text-emerald-600 animate-scale-up" />
                            : <Copy className="size-4.5" />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <Button
                  onClick={handleReveal}
                  disabled={loading}
                  variant="link"
                  size="none"
                  className="text-xs text-primary font-bold hover:underline select-none mt-1 inline-flex items-center gap-1"
                >
                  {loading ? 'Decrypting…' : revealed ? 'Hide Passwords' : 'Reveal Passwords'}
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold font-mono tracking-tight uppercase shadow-sm animate-pulse">
                <Timer className="size-3.5" />
                {formatCountdown(remaining)}
              </span>
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
    if (!name.trim()) { setError('Account / App name is required.'); return }
    if (passwords.some((p) => !p.value.trim())) { setError('Passwords cannot be empty.'); return }
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
      toast.success(`Encrypted credentials locked for ${durationLabel}!`)
      onClose()
    } catch (e) {
      setError(e.message || 'Could not seal vault')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-card border border-border p-7 shadow-card space-y-6 mb-8 animate-slide-up relative overflow-hidden group">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary pointer-events-none" />
      <div className="flex items-center gap-3 mb-1">
        <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center shadow-sm">
          <KeyRound className="size-5.5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display text-foreground">Lock New Credentials</h2>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">AES-256 Client-Side Shield Active</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Account Name / App</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Instagram, Reddit, Private Key…" required className="rounded-xl" />
      </div>

      <div className="space-y-4">
        {passwords.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3 relative group/pw">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
                {passwords.length > 1 ? `Password Asset ${i + 1}` : 'Secure Password'}
              </span>
              {passwords.length > 1 && (
                <button type="button" onClick={() => setPasswords((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-destructive hover:underline font-bold">Remove</button>
              )}
            </div>
            
            <div className="space-y-2">
              <Input value={p.label} onChange={(e) => updatePassword(i, 'label', e.target.value)} placeholder="Label (e.g. Main Account, Secondary)" className="rounded-xl h-8.5 text-xs" />
              <div className="relative">
                <Input
                  type={p.show ? 'text' : 'password'}
                  value={p.value}
                  onChange={(e) => updatePassword(i, 'value', e.target.value)}
                  placeholder="Enter credential content to encrypt"
                  className="pr-10 rounded-xl"
                  required
                />
                <button type="button" onClick={() => updatePassword(i, 'show', !p.show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  aria-label={p.show ? 'Hide' : 'Show'}>
                  {p.show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {passwords.length < 5 && (
        <button type="button" onClick={() => setPasswords((prev) => [...prev, { value: '', show: false, label: '' }])}
          className="text-xs text-primary hover:underline font-bold inline-flex items-center gap-1 select-none">
          + Add another password card
        </button>
      )}

      <div className="space-y-1.5">
        <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Focus Reason / detox motivation</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Preparing for exams, detoxing social media…" className="rounded-xl" />
      </div>

      <div className="space-y-2.5">
        <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Lock Enforcement Duration</Label>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.ms} type="button" onClick={() => setDurationMs(d.ms)}
              className={`rounded-2xl border py-2.5 text-xs font-bold transition-all duration-300 transform active:scale-[0.98] ${
                durationMs === d.ms
                  ? 'bg-gradient-primary text-primary-foreground border-primary shadow-hover'
                  : 'bg-background border-border hover:border-primary/30 hover:bg-primary-soft/40'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Official Security Contract warning box */}
      <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5 relative overflow-hidden group">
        <span className="absolute -right-6 -bottom-6 text-7xl font-extrabold text-amber-200/20 select-none pointer-events-none">📜</span>
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-amber-800">Sealed Security Lock Contract</div>
            <div className="text-xs text-amber-700 leading-relaxed font-semibold">
              Once locked, this password will be encrypted using client-side AES-256 and sealed on the database. It cannot be revealed by anyone—including support—until the timer expires.
            </div>
            <div className="text-xs text-amber-600 italic border-t border-amber-200/50 pt-2 mt-2 leading-relaxed font-semibold">
              Yeh password <strong className="text-amber-800 font-bold">{durationLabel}</strong> tak completely lock rahega. Bypass karna asambhav hai.
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-destructive rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-2 font-semibold">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 rounded-full bg-gradient-primary hover:opacity-95 shadow-soft transition-all duration-300 font-bold" disabled={loading}>
          <Lock className="size-4.5 mr-1.5" />
          {loading ? 'Encrypting & Sealing…' : `Confirm Lock Contract (${durationLabel})`}
        </Button>
        <Button type="button" variant="outline" className="rounded-full hover:bg-muted/70 font-semibold" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/* ── Skeleton card ─────────────────────────────────────────────────── */
function VaultCardSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card flex gap-5">
      <div className="skeleton size-[60px] rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2.5 pt-1.5">
        <div className="skeleton h-4 w-36" />
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3.5 w-20 mt-2" />
      </div>
    </div>
  )
}

/* ── Vault page ────────────────────────────────────────────────────── */
function VaultPage() {
  const { new: showFormInit } = Route.useSearch()
  const { user } = useAuth()
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(showFormInit || false)
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
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-foreground">Credential Vault</h1>
          <p className="text-sm text-muted-foreground mt-1 font-semibold">
            {loading ? (
              <span className="skeleton h-3.5 w-28 inline-block" />
            ) : (
              `${vaults.length} locked items · ${unlockedCount} unlocked`
            )}
          </p>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 font-bold">
            <Plus className="size-4 mr-1" />
            New Lock
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm mb-5 flex items-center gap-2 font-semibold">
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
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials..."
            className="pl-9.5 rounded-full"
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
        <div className="text-center py-20 animate-fade-in select-none">
          <div className="size-20 mx-auto rounded-3xl bg-primary-soft text-primary border border-primary/10 grid place-items-center mb-6 shadow-soft">
            <Lock className="size-9" />
          </div>
          <h3 className="font-extrabold text-xl mb-2 text-foreground font-display">No locked credentials</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto mb-7 pr-1 font-semibold leading-relaxed">
            Encrypt and lock your password credentials behind enforced timers to reclaim your focus.
          </p>
          <Button onClick={() => setShowAdd(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft font-bold">
            Lock Your First Password
          </Button>
        </div>
      )}

      {/* No search results */}
      {!loading && vaults.length > 0 && filtered.length === 0 && search && (
        <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
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
