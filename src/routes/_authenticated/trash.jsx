import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Trash2, RotateCcw, AlertTriangle, Lock, Mail, Clock,
  ShieldX, Info, Flame, CheckCircle2, PackageOpen, ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { getTrashVaults, restoreVault, permanentDeleteVault } from '@/lib/vault'
import { getTrashMails, restoreMail, permanentDeleteMail } from '@/lib/future-mail'

export const Route = createFileRoute('/_authenticated/trash')({
  component: TrashPage,
})

/* ── Helpers ───────────────────────────────────────────────────────── */
function getDaysRemaining(trashExpiresAt) {
  if (!trashExpiresAt) return 0
  // Coerce stringified BIGINT or ISO timestamps safely
  const expiryMs = isNaN(trashExpiresAt) ? new Date(trashExpiresAt).getTime() : Number(trashExpiresAt)
  const diff = expiryMs - Date.now()
  if (isNaN(diff) || diff <= 0) return 0
  return Math.ceil(diff / 86400000)
}

function getExpiryUrgency(days) {
  if (isNaN(days) || days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  return 'safe'
}

/* ── Permanent Delete Confirmation Dialog ──────────────────────────── */
function PermanentDeleteDialog({ open, onOpenChange, itemName, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader>
          <div className="size-14 rounded-xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4 border border-destructive/20">
            <Flame className="size-6" />
          </div>
          <DialogTitle className="text-center font-display font-extrabold text-xl">Delete Forever?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
            <strong className="text-foreground">"{itemName}"</strong> will be permanently erased from our servers. This action is irreversible and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive/80 font-semibold leading-relaxed">
            All encrypted data will be wiped permanently. No recovery possible after this action.
          </p>
        </div>
        <DialogFooter className="flex-row gap-3 mt-4">
          <Button variant="outline" className="flex-1 rounded-full font-bold btn-magnetic" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep in Trash
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full font-bold btn-magnetic" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Forever'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Restore Confirmation Dialog ───────────────────────────────────── */
function RestoreDialog({ open, onOpenChange, itemName, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader>
          <div className="size-14 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center mx-auto mb-4 border border-emerald-200">
            <RotateCcw className="size-6" />
          </div>
          <DialogTitle className="text-center font-display font-extrabold text-xl">Restore Item?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
            <strong className="text-foreground">"{itemName}"</strong> will be moved back to its original location and become fully active again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 mt-4">
          <Button variant="outline" className="flex-1 rounded-full font-bold btn-magnetic" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1 rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white btn-magnetic" onClick={onConfirm} disabled={loading}>
            {loading ? 'Restoring…' : 'Restore Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Expiry Badge ──────────────────────────────────────────────────── */
function ExpiryBadge({ days }) {
  const urgency = getExpiryUrgency(days)
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wide bg-destructive/10 border border-destructive/20 text-destructive">
        <Flame className="size-3" />
        Expiring Soon
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wide ${
      urgency === 'critical'
        ? 'bg-red-50 border border-red-200 text-red-700 animate-pulse'
        : urgency === 'warning'
        ? 'bg-amber-50 border border-amber-200 text-amber-700'
        : 'bg-muted border border-border text-muted-foreground'
    }`}>
      <Clock className="size-3" />
      {days}d left
    </span>
  )
}

/* ── Trash Card ────────────────────────────────────────────────────── */
function TrashCard({ item, type, onRestore, onDelete, restoring, deleting, exiting }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const days = getDaysRemaining(item.trash_expires_at)
  const urgency = getExpiryUrgency(days)
  const Icon = type === 'vault' ? Lock : Mail
  const deletedDate = (() => {
    if (!item.deleted_at) return 'Unknown'
    const dateObj = isNaN(item.deleted_at) ? new Date(item.deleted_at) : new Date(Number(item.deleted_at))
    return isNaN(dateObj.getTime())
      ? 'Unknown'
      : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  })()

  return (
    <>
      <PermanentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={item.name || item.subject}
        onConfirm={() => { onDelete(item.id); setDeleteOpen(false) }}
        loading={deleting}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        itemName={item.name || item.subject}
        onConfirm={() => { onRestore(item.id); setRestoreOpen(false) }}
        loading={restoring}
      />

      <div className={`card-3d p-4 sm:p-5 flex gap-3 sm:gap-4 items-start group relative overflow-hidden transition-all duration-300 ${
        urgency === 'critical' ? 'border-red-200/60 bg-red-50/5' : ''
      } ${
        exiting === 'restore' ? 'animate-restore-out' : exiting === 'delete' ? 'animate-delete-out' : ''
      }`}>
        {/* Urgency top stripe */}
        {urgency === 'critical' && (
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-destructive/60 via-red-500/80 to-destructive/60" />
        )}

        {/* Icon */}
        <div className={`size-10 rounded-xl flex-shrink-0 grid place-items-center border ${
          type === 'vault'
            ? 'bg-primary-soft text-primary border-primary/10'
            : 'bg-mint text-mint-foreground border-emerald-100'
        }`}>
          <Icon className="size-4.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm sm:text-base text-foreground truncate font-display">
                {item.name || item.subject}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-semibold font-mono uppercase tracking-wide truncate block">
                {type === 'vault' ? `${item.duration_label} Lock` : 'Future Mail'} · Deleted {deletedDate}
              </div>
            </div>
            <div className="flex-shrink-0 self-start sm:self-auto">
              <ExpiryBadge days={days} />
            </div>
          </div>

          {/* Warning for urgent items */}
          {urgency === 'critical' && (
            <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-red-600 shrink-0" />
              <p className="text-[11px] text-red-700 font-semibold">
                Permanent deletion in {days === 0 ? 'less than 24h' : `${days} day${days === 1 ? '' : 's'}`}. Restore now to save.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-row items-center gap-2 mt-4 w-full">
            <Button
              size="sm"
              onClick={() => setRestoreOpen(true)}
              disabled={restoring || deleting}
              className="rounded-full h-9 sm:h-8 px-3 sm:px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 sm:flex-initial justify-center btn-magnetic"
            >
              <RotateCcw className="size-3.5 mr-1.5 shrink-0" />
              Restore
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              disabled={restoring || deleting}
              className="rounded-full h-9 sm:h-8 px-3 sm:px-4 text-xs font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all flex-1 sm:flex-initial justify-center btn-magnetic"
            >
              <Trash2 className="size-3.5 mr-1.5 shrink-0" />
              Delete Forever
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Skeleton Card ─────────────────────────────────────────────────── */
function TrashCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
      <div className="skeleton size-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-8 w-36 mt-4 rounded-full" />
      </div>
    </div>
  )
}

/* ── Empty Trash State ─────────────────────────────────────────────── */
function EmptyTrash({ label }) {
  return (
    <div className="text-center py-16 animate-fade-in select-none">
      <div className="size-16 mx-auto rounded-xl bg-muted border border-border grid place-items-center mb-4">
        <PackageOpen className="size-7 text-muted-foreground" />
      </div>
      <p className="font-bold text-foreground font-display">{label} Trash is Empty</p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed font-medium">
        Deleted {label.toLowerCase()} items will appear here for 30 days before being permanently removed.
      </p>
    </div>
  )
}

/* ── Main Trash Page ───────────────────────────────────────────────── */
function TrashPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('vaults')
  const [trashVaults, setTrashVaults] = useState([])
  const [trashMails, setTrashMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [exitingItems, setExitingItems] = useState({})

  useEffect(() => {
    // Guard 1: Don't fire while Firebase auth state is still initialising
    if (authLoading) {
      console.log('[TRASH] Auth still loading — waiting before fetching trash...')
      return
    }

    // Guard 2: User must be logged in
    if (!user) {
      console.warn('[TRASH] No authenticated user — skipping trash fetch')
      setLoading(false)
      return
    }

    // Guard 3: auth.currentUser must be populated (can lag behind context user)
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
      console.error('[TRASH] auth.currentUser is NULL even though context user is set. Retrying via onAuthStateChanged...')
      // Retry once Firebase physically populates auth.currentUser
      const unsub = auth.onAuthStateChanged((u) => {
        if (u) {
          unsub()
          fetchTrash(u)
        }
      })
      return
    }

    fetchTrash(firebaseUser)
  }, [user, authLoading])

  async function fetchTrash(firebaseUser) {
    setLoading(true)
    console.log('[TRASH] ── Starting trash fetch ──────────────────────────')
    console.log('[TRASH] Firebase user present:', !!firebaseUser)
    console.log('[TRASH] Firebase UID:', firebaseUser?.uid)
    console.log('[TRASH] Firebase email:', firebaseUser?.email)

    try {
      // Force-refresh the token to guarantee it's not stale/expired
      console.log('[TRASH] Calling getIdToken(true) — forcing refresh...')
      const token = await firebaseUser.getIdToken(/* forceRefresh= */ true)
      console.log('[TRASH] Token retrieved ✓ | length:', token.length, '| first20:', token.slice(0, 20) + '...')
      console.log('[TRASH] Authorization header will be: Bearer', token.slice(0, 15) + '...')

      console.log('[TRASH] Firing Promise.allSettled for trash_list (vault + future-mail)...')
      const [vaultRes, mailRes] = await Promise.allSettled([
        getTrashVaults(token),
        getTrashMails(token),
      ])

      if (vaultRes.status === 'fulfilled') {
        console.log('[TRASH] Trash vaults response ✓:', vaultRes.value)
        setTrashVaults(vaultRes.value.vaults || [])
      } else {
        console.error('[TRASH] ✗ Failed to load trash vaults:', vaultRes.reason?.message)
        toast.error('Failed to load trash vaults: ' + (vaultRes.reason?.message || 'Unknown error'))
      }

      if (mailRes.status === 'fulfilled') {
        console.log('[TRASH] Trash letters response ✓:', mailRes.value)
        setTrashMails(mailRes.value.mails || [])
      } else {
        console.error('[TRASH] ✗ Failed to load trash letters:', mailRes.reason?.message)
        toast.error('Failed to load trash letters: ' + (mailRes.reason?.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('[TRASH] ✗ Critical auth/fetch error:', err)
      toast.error('Trash load failed: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      console.log('[TRASH] ── Trash fetch complete ───────────────────────')
    }
  }



  const handleRestoreVault = async (vaultId) => {
    setRestoringId(vaultId)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')
      const token = await currentUser.getIdToken(true)
      await restoreVault(token, vaultId)
      // Set exiting animation state
      setExitingItems((prev) => ({ ...prev, [vaultId]: 'restore' }))
      await new Promise((resolve) => setTimeout(resolve, 400))
      
      setTrashVaults((prev) => prev.filter((v) => v.id !== vaultId))
      toast.success('Vault restored successfully', { description: 'It\'s back in your Credential Vault.' })
    } catch (e) {
      toast.error(e.message || 'Restore failed')
    } finally {
      setRestoringId(null)
      setExitingItems((prev) => {
        const next = { ...prev }
        delete next[vaultId]
        return next
      })
    }
  }

  const handlePermanentDeleteVault = async (vaultId) => {
    setDeletingId(vaultId)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')
      const token = await currentUser.getIdToken(true)
      await permanentDeleteVault(token, vaultId)
      // Set exiting animation state
      setExitingItems((prev) => ({ ...prev, [vaultId]: 'delete' }))
      await new Promise((resolve) => setTimeout(resolve, 400))

      setTrashVaults((prev) => prev.filter((v) => v.id !== vaultId))
      toast.success('Vault permanently deleted')
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    } finally {
      setDeletingId(null)
      setExitingItems((prev) => {
        const next = { ...prev }
        delete next[vaultId]
        return next
      })
    }
  }

  const handleRestoreMail = async (mailId) => {
    setRestoringId(mailId)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')
      const token = await currentUser.getIdToken(true)
      await restoreMail(token, mailId)
      // Set exiting animation state
      setExitingItems((prev) => ({ ...prev, [mailId]: 'restore' }))
      await new Promise((resolve) => setTimeout(resolve, 400))

      setTrashMails((prev) => prev.filter((m) => m.id !== mailId))
      toast.success('Letter restored successfully', { description: 'It\'s back in your Future Mail inbox.' })
    } catch (e) {
      toast.error(e.message || 'Restore failed')
    } finally {
      setRestoringId(null)
      setExitingItems((prev) => {
        const next = { ...prev }
        delete next[mailId]
        return next
      })
    }
  }

  const handlePermanentDeleteMail = async (mailId) => {
    setDeletingId(mailId)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')
      const token = await currentUser.getIdToken(true)
      await permanentDeleteMail(token, mailId)
      // Set exiting animation state
      setExitingItems((prev) => ({ ...prev, [mailId]: 'delete' }))
      await new Promise((resolve) => setTimeout(resolve, 400))

      setTrashMails((prev) => prev.filter((m) => m.id !== mailId))
      toast.success('Letter permanently deleted')
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    } finally {
      setDeletingId(null)
      setExitingItems((prev) => {
        const next = { ...prev }
        delete next[mailId]
        return next
      })
    }
  }

  const urgentVaults = trashVaults.filter((v) => getExpiryUrgency(getDaysRemaining(v.trash_expires_at)) === 'critical')
  const urgentMails = trashMails.filter((m) => getExpiryUrgency(getDaysRemaining(m.trash_expires_at)) === 'critical')
  const totalUrgent = urgentVaults.length + urgentMails.length

  return (
    <div className="relative z-10 container mx-auto max-w-2xl px-5 py-12">
      {/* Back to Dashboard */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 select-none group/back"
      >
        <ChevronLeft className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-muted border border-border grid place-items-center">
            <Trash2 className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-display text-foreground">Trash & Recovery</h1>
            <p className="text-sm text-muted-foreground font-semibold mt-0.5">
              Deleted items are kept for <strong className="text-foreground">30 days</strong> before permanent removal.
            </p>
          </div>
        </div>

        {/* Global urgent warning banner */}
        {!loading && totalUrgent > 0 && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3 animate-slide-up">
            <AlertTriangle className="size-4.5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {totalUrgent} item{totalUrgent > 1 ? 's' : ''} expiring within 3 days
              </p>
              <p className="text-xs text-red-700 font-semibold mt-0.5">
                Restore them before they're permanently deleted from our servers.
              </p>
            </div>
          </div>
        )}

        {/* Info banner */}
        {!loading && trashVaults.length === 0 && trashMails.length === 0 && (
          <div className="mt-4 rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-start gap-3">
            <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Your trash is clean. When you delete vaults or future mail letters, they'll appear here with a 30-day recovery window.
            </p>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 border border-border">
        <button
          onClick={() => setActiveTab('vaults')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'vaults'
              ? 'bg-card text-foreground shadow-card border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="size-3.5" />
          Vaults
          {trashVaults.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold font-mono ${
              activeTab === 'vaults' ? 'bg-primary-soft text-primary' : 'bg-border text-muted-foreground'
            }`}>
              {trashVaults.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mails')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'mails'
              ? 'bg-card text-foreground shadow-card border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="size-3.5" />
          Future Mail
          {trashMails.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold font-mono ${
              activeTab === 'mails' ? 'bg-primary-soft text-primary' : 'bg-border text-muted-foreground'
            }`}>
              {trashMails.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <TrashCardSkeleton key={i} />)}
        </div>
      ) : activeTab === 'vaults' ? (
        trashVaults.length === 0 ? (
          <EmptyTrash label="Vault" />
        ) : (
          <div className="space-y-4">
            {trashVaults.map((vault) => (
              <TrashCard
                key={vault.id}
                item={vault}
                type="vault"
                onRestore={handleRestoreVault}
                onDelete={handlePermanentDeleteVault}
                restoring={restoringId === vault.id}
                deleting={deletingId === vault.id}
                exiting={exitingItems[vault.id]}
              />
            ))}
          </div>
        )
      ) : (
        trashMails.length === 0 ? (
          <EmptyTrash label="Mail" />
        ) : (
          <div className="space-y-4">
            {trashMails.map((mail) => (
              <TrashCard
                key={mail.id}
                item={mail}
                type="mail"
                onRestore={handleRestoreMail}
                onDelete={handlePermanentDeleteMail}
                restoring={restoringId === mail.id}
                deleting={deletingId === mail.id}
                exiting={exitingItems[mail.id]}
              />
            ))}
          </div>
        )
      )}

      {/* Footer notice */}
      {!loading && (trashVaults.length > 0 || trashMails.length > 0) && (
        <p className="text-center text-xs text-muted-foreground mt-10 font-semibold select-none">
          <ShieldX className="size-3.5 inline mr-1 mb-0.5" />
          Items are automatically and permanently purged after 30 days
        </p>
      )}
    </div>
  )
}
