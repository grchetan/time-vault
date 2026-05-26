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
import { Mail, Send, Trash2, Clock, CheckCircle2, FlaskConical, Info, PenLine, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createFutureMail, getFutureMails, deleteFutureMail } from '@/lib/future-mail'

export const Route = createFileRoute('/_authenticated/future-mail')({ component: FutureMailPage })

/* ── Delete confirmation dialog ───────────────────────────────────── */
function DeleteMailDialog({ open, onOpenChange, subject, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-2">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-center">Cancel this letter?</DialogTitle>
          <DialogDescription className="text-center">
            "<strong>{subject}</strong>" will be permanently cancelled and will not be delivered.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep it
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling…' : 'Cancel letter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Mail card ─────────────────────────────────────────────────────── */
function MailCard({ mail, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isDelivered = mail.delivered
  const daysLeft = Math.ceil((mail.deliver_at - Date.now()) / 86400000)
  const deliverDateTime = new Date(mail.deliver_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  const createdDate = new Date(mail.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const token = await auth.currentUser.getIdToken()
      await deleteFutureMail(token, mail.id)
      onDelete(mail.id)
      toast.success('Letter cancelled')
      setDeleteOpen(false)
    } catch (e) {
      toast.error(e.message || 'Could not cancel letter')
      setDeleting(false)
    }
  }

  return (
    <>
      <DeleteMailDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        subject={mail.subject}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <div className={`rounded-3xl bg-card border p-5 shadow-card flex gap-4 transition-all duration-200 hover:shadow-hover ${isDelivered ? 'border-emerald-200 bg-emerald-50/20' : 'border-border'}`}>
        <div className="shrink-0 pt-0.5">
          <div className={`size-10 rounded-2xl grid place-items-center ${isDelivered ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-soft text-primary'}`}>
            {isDelivered ? <CheckCircle2 className="size-5" /> : <Mail className="size-5" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold truncate">{mail.subject}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Written {createdDate}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isDelivered
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {isDelivered
                  ? <><CheckCircle2 className="size-3" /> Delivered</>
                  : <><Clock className="size-3" /> {daysLeft > 0 ? `${daysLeft}d left` : 'Soon'}</>
                }
              </span>
              {!isDelivered && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-all duration-200"
                  aria-label="Cancel letter"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5 flex-shrink-0" />
            <span>
              {isDelivered ? 'Delivered on' : 'Scheduled for'}{' '}
              <strong className="text-foreground">{deliverDateTime}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Mail skeleton ─────────────────────────────────────────────────── */
function MailCardSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-5 shadow-card flex gap-4">
      <div className="skeleton size-10 rounded-2xl flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-32 mt-1" />
      </div>
    </div>
  )
}

/* ── Future Mail page ──────────────────────────────────────────────── */
function FutureMailPage() {
  const { user } = useAuth()
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [deliverDate, setDeliverDate] = useState('')
  const [deliverTime, setDeliverTime] = useState('09:00')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const fillDemo = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 2)
    setDeliverDate(now.toISOString().split('T')[0])
    setDeliverTime(now.toTimeString().slice(0, 5))
    setSubject('Test — Did Future Mail work?')
    setBody("Hey! If you're reading this, the Future Mail feature is working perfectly!\n\nThis was a test email from TimeVault.")
    setShowForm(true)
    toast.info('Demo filled — submit to test email delivery in ~2 minutes.')
  }

  useEffect(() => {
    if (!user) return
    auth.currentUser.getIdToken()
      .then((token) => getFutureMails(token))
      .then((res) => setMails(res.mails || []))
      .catch((e) => toast.error(e.message || 'Could not load letters'))
      .finally(() => setLoading(false))
  }, [user])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!body.trim() || !deliverDate) { setError('Message and delivery date are required.'); return }
    setSending(true); setError('')
    try {
      const deliverAt = new Date(`${deliverDate}T${deliverTime}:00`).getTime()
      if (deliverAt <= Date.now()) {
        setError('Delivery time must be in the future.')
        setSending(false)
        return
      }
      const token = await auth.currentUser.getIdToken()
      const res = await createFutureMail(token, {
        subject: subject.trim() || 'A letter from your past self',
        message: body.trim(),
        deliverAt,
      })
      setMails((prev) => [...prev, res.mail].sort((a, b) => a.deliver_at - b.deliver_at))
      const d = new Date(deliverAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      toast.success('Sealed and scheduled — delivering on ' + d)
      setSubject(''); setBody(''); setDeliverDate(''); setDeliverTime('09:00')
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Could not schedule letter')
    }
    setSending(false)
  }

  const handleDelete = (id) => {
    setMails((prev) => prev.filter((m) => m.id !== id))
  }

  const pending = mails.filter((m) => !m.delivered).length
  const delivered = mails.filter((m) => m.delivered).length
  const charLimit = 5000

  return (
    <div className="relative z-10 container mx-auto max-w-2xl px-5 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="size-16 mx-auto rounded-2xl bg-mint text-mint-foreground grid place-items-center shadow-soft mb-5">
          <Mail className="size-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Future Mail</h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-sm mx-auto">
          Write a letter to your future self — delivered by email on the date and time you choose.
        </p>
        {!loading && mails.length > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {pending} scheduled &middot; {delivered} delivered
          </p>
        )}
      </div>

      {/* Action buttons */}
      {!showForm && (
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all">
            <PenLine className="size-4 mr-2" />
            Write a Letter
          </Button>
          <Button variant="outline" onClick={fillDemo} className="rounded-full hover:border-primary/30 hover:bg-primary-soft/30 transition-all">
            <FlaskConical className="size-4 mr-2" />
            Test Email (Demo)
          </Button>
        </div>
      )}

      {/* Compose form */}
      {showForm && (
        <form onSubmit={handleSend} className="rounded-3xl bg-card border border-border p-7 shadow-card space-y-5 mb-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-mint text-mint-foreground grid place-items-center">
                <PenLine className="size-5" />
              </div>
              <h2 className="text-lg font-semibold">Write to your future self</h2>
            </div>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/70 transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label>Subject <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hey future me…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Delivery Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={deliverDate} onChange={(e) => setDeliverDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Time <span className="text-destructive">*</span></Label>
              <Input type="time" value={deliverTime} onChange={(e) => setDeliverTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Your letter <span className="text-destructive">*</span></Label>
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, charLimit))}
                required
                rows={8}
                className="flex w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors leading-relaxed"
                placeholder="Write whatever you want your future self to know…"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Be honest. Be kind. Be you.</span>
              <span className={`text-xs ${body.length > charLimit * 0.9 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {body.length}/{charLimit}
              </span>
            </div>
          </div>

          {/* Info notice — bilingual */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
              <Info className="size-3.5 flex-shrink-0" />
              This letter will be sent to <strong>{user?.email}</strong>
            </div>
            <div className="text-blue-600 text-xs">
              Yeh letter aapke registered email pe deliver hoga — bilkul scheduled time pe.
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">{error}</div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all" disabled={sending}>
              <Send className="size-4 mr-2" />
              {sending ? 'Sealing…' : 'Seal & Schedule'}
            </Button>
            <Button type="button" variant="outline" className="rounded-full hover:bg-muted/70"
              onClick={() => { setShowForm(false); setError('') }} disabled={sending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => <MailCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && mails.length === 0 && !showForm && (
        <div className="text-center py-16 animate-fade-in">
          <div className="size-20 mx-auto rounded-3xl bg-mint text-mint-foreground grid place-items-center mb-5">
            <Mail className="size-10" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No letters yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Write your first letter — delivered on the date and time you choose.
          </p>
        </div>
      )}

      {/* Mail list */}
      {mails.length > 0 && (
        <div className="space-y-4">
          {mails.map((mail) => (
            <MailCard key={mail.id} mail={mail} onDelete={handleDelete} />
          ))}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Letters delivered to <strong>{user?.email}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
