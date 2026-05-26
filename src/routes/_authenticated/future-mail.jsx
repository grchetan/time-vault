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
import { Mail, Send, Trash2, Clock, CheckCircle2, FlaskConical, Info, PenLine, X, CalendarDays, Inbox, FileText, ChevronRight, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createFutureMail, getFutureMails, deleteFutureMail } from '@/lib/future-mail'

export const Route = createFileRoute('/_authenticated/future-mail')({
  validateSearch: (search) => ({
    new: search.new === 'true' || search.new === true || undefined,
  }),
  component: FutureMailPage,
})

/* ── Delete confirmation dialog ───────────────────────────────────── */
function DeleteMailDialog({ open, onOpenChange, subject, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4 border border-destructive/20 animate-pulse">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-center font-display font-extrabold text-xl">Cancel this letter?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
            "<strong>{subject}</strong>" will be permanently deleted and cannot be delivered. This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 sm:flex-row mt-4">
          <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep Letter
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full font-bold shadow-soft" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling…' : 'Cancel Letter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── View Letter Dialog ───────────────────────────────────────────── */
function ReadMailDialog({ open, onOpenChange, mail }) {
  if (!mail) return null
  const createdDate = new Date(mail.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border border-border shadow-hover bg-[#FAF8F5]">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-secondary" />
        <div className="px-6 pt-7 pb-5 flex justify-between items-start border-b border-border/40">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase font-mono">Letter from {createdDate}</span>
            <DialogTitle className="font-serif font-extrabold text-2xl text-[#2C241E] mt-1 tracking-tight leading-tight">{mail.subject}</DialogTitle>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="px-6 py-6 max-h-96 overflow-y-auto">
          <p className="font-serif text-base text-[#4E3F35] leading-relaxed whitespace-pre-wrap select-text pr-2">
            {mail.message}
          </p>
        </div>
        
        <div className="bg-muted/40 border-t border-border/40 px-6 py-4 flex justify-between items-center text-xs text-muted-foreground">
          <span className="font-medium">Delivered to {auth.currentUser?.email}</span>
          <span className="font-bold font-mono">SEAL EXPIRED</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Mail card ─────────────────────────────────────────────────────── */
function MailCard({ mail, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [readOpen, setReadOpen] = useState(false)
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
      toast.success('Letter cancelled successfully')
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

      <ReadMailDialog
        open={readOpen}
        onOpenChange={setReadOpen}
        mail={mail}
      />

      <div className={`rounded-3xl bg-card border p-6 shadow-card flex gap-5 transition-all duration-300 hover:shadow-hover relative overflow-hidden group ${
        isDelivered 
          ? 'border-emerald-200 bg-emerald-50/10' 
          : 'border-border'
      }`}>
        <div className={`absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isDelivered ? 'bg-emerald-500' : 'bg-primary'}`} />
        
        {/* Envelope stamp icon */}
        <div className="shrink-0 pt-0.5">
          <div className={`size-11 rounded-2xl grid place-items-center shadow-sm group-hover:scale-105 transition-transform duration-300 ${
            isDelivered 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-primary-soft text-primary border border-primary/10'
          }`}>
            {isDelivered ? <Inbox className="size-5.5" /> : <Mail className="size-5.5" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-tight text-foreground truncate group-hover:text-primary transition-colors duration-200">
                {mail.subject}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-semibold font-mono uppercase tracking-wide">
                Written {createdDate}
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase font-mono shadow-sm border ${
                isDelivered
                  ? 'bg-emerald-100/80 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse'
              }`}>
                {isDelivered
                  ? <><CheckCircle2 className="size-3" /> Sealed Expired</>
                  : <><Lock className="size-3" /> {daysLeft > 0 ? `${daysLeft}d left` : 'Soon'}</>
                }
              </span>
              
              {!isDelivered && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="text-muted-foreground hover:text-destructive p-2 rounded-xl hover:bg-destructive/10 transition-all duration-300"
                  aria-label="Cancel letter"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CalendarDays className="size-4 flex-shrink-0" />
              <span>
                {isDelivered ? 'Delivered on' : 'Unseals on'}{' '}
                <strong className="text-foreground">{deliverDateTime}</strong>
              </span>
            </div>
            
            {isDelivered && (
              <Button
                onClick={() => setReadOpen(true)}
                variant="link"
                size="none"
                className="text-xs text-primary font-bold hover:underline select-none inline-flex items-center gap-0.5"
              >
                Read Letter
                <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Mail skeleton ─────────────────────────────────────────────────── */
function MailCardSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card flex gap-5">
      <div className="skeleton size-11 rounded-2xl flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="skeleton h-4.5 w-48" />
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3.5 w-40 mt-3.5" />
      </div>
    </div>
  )
}

/* ── Future Mail page ──────────────────────────────────────────────── */
function FutureMailPage() {
  const { new: showFormInit } = Route.useSearch()
  const { user } = useAuth()
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(showFormInit || false)
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
    setSubject('Test Letter — Hello from your past self!')
    setBody("Hey! If you are reading this email, the Future Mail features are working beautifully!\n\nThis was a scheduled capsule letter sent from TimeVault to remind you to protect your digital focus. Take a deep breath and keep pushing forward!")
    setShowForm(true)
    toast.info('Demo capsule loaded — submit form to test inbox delivery in ~2 minutes.')
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
      toast.success('Capusle sealed and scheduled for ' + d)
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
      {/* Header Banner */}
      <div className="text-center mb-10 select-none">
        <div className="size-16 mx-auto rounded-3xl bg-mint text-mint-foreground grid place-items-center shadow-soft mb-5 border border-emerald-100">
          <Mail className="size-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-foreground">Future Mail Caps</h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed font-semibold">
          Draft an emotional or motivational letter to your future self — encrypted and delivered by email on the date you choose.
        </p>
        {!loading && mails.length > 0 && (
          <p className="mt-2 text-[10px] font-extrabold font-mono text-muted-foreground uppercase tracking-wider">
            {pending} scheduled capsules &middot; {delivered} unsealed
          </p>
        )}
      </div>

      {/* Trigger Buttons */}
      {!showForm && (
        <div className="flex justify-center gap-3.5 mb-10 flex-wrap">
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 font-bold">
            <PenLine className="size-4.5 mr-2" />
            Write Future Letter
          </Button>
          <Button variant="outline" onClick={fillDemo} className="rounded-full hover:border-primary/20 hover:bg-primary-soft/30 hover:text-primary transition-colors duration-300 font-semibold">
            <FlaskConical className="size-4.5 mr-2" />
            Demo Test Capsule
          </Button>
        </div>
      )}

      {/* Elegant Virtual Stationery Parchment Composer */}
      {showForm && (
        <form onSubmit={handleSend} className="rounded-3xl bg-[#FAF8F5] border border-border/80 p-8 shadow-card space-y-6 mb-10 animate-slide-up relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C2A691] to-[#E9DFD5] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-[#EBE5DF] text-[#6B5A4E] grid place-items-center shadow-sm">
                <FileText className="size-5.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#2C241E] leading-tight">Virtual Stationery Pad</h2>
                <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase font-mono mt-0.5">Sealed Capsule Mail</p>
              </div>
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
            <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Subject / Letter Title</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Letter to my self in 6 months..." className="rounded-xl border-border/60 bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Delivery Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={deliverDate} onChange={(e) => setDeliverDate(e.target.value)} required className="rounded-xl border-border/60 bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Delivery Time <span className="text-destructive">*</span></Label>
              <Input type="time" value={deliverTime} onChange={(e) => setDeliverTime(e.target.value)} required className="rounded-xl border-border/60 bg-white" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Your Thoughts <span className="text-destructive">*</span></Label>
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, charLimit))}
                required
                rows={9}
                className="flex w-full rounded-2xl border border-input/60 bg-white px-5 py-4 font-serif text-[#4E3F35] text-base placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors leading-relaxed shadow-sm"
                placeholder="Dear self, I hope you achieved the goals we set today. Are we focusing on what truly matters..."
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase font-mono">Editorial Journal</span>
              <span className={`text-xs font-bold font-mono ${body.length > charLimit * 0.9 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {body.length}/{charLimit}
              </span>
            </div>
          </div>

          {/* Bilingual capsule details box */}
          <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-5 relative overflow-hidden group">
            <span className="absolute -right-6 -bottom-6 text-7xl font-extrabold text-blue-200/10 select-none pointer-events-none">📬</span>
            <div className="flex items-start gap-3">
              <Info className="size-5.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-blue-800">Capsule Delivery Protocol</div>
                <div className="text-xs text-blue-700 leading-relaxed font-semibold">
                  This letter will be securely sealed and dispatched directly to your verified inbox: <strong className="text-blue-900 font-bold">{user?.email}</strong>.
                </div>
                <div className="text-xs text-blue-600 italic border-t border-blue-200/50 pt-2 mt-2 leading-relaxed font-semibold">
                  Yeh mail scheduled date aur time pe hi deliver kiya jayega. Time-capsules cannot be opened early.
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 font-semibold">{error}</div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 rounded-full bg-gradient-primary hover:opacity-95 shadow-soft transition-all duration-300 font-bold" disabled={sending}>
              <Send className="size-4.5 mr-2" />
              {sending ? 'Sealing Capsule…' : 'Seal & Dispatch Capsule'}
            </Button>
            <Button type="button" variant="outline" className="rounded-full hover:bg-muted/70 font-semibold"
              onClick={() => { setShowForm(false); setError('') }} disabled={sending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => <MailCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && mails.length === 0 && !showForm && (
        <div className="text-center py-20 animate-fade-in select-none">
          <div className="size-20 mx-auto rounded-3xl bg-primary-soft text-primary border border-primary/10 grid place-items-center mb-6 shadow-soft">
            <Mail className="size-9" />
          </div>
          <h3 className="font-extrabold text-xl mb-2 text-foreground font-display">No scheduled letters</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto mb-7 pr-1 font-semibold leading-relaxed">
            Write a reflective message to your future self about your ambitions and digital focus.
          </p>
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft font-bold">
            Write Your First Capsule
          </Button>
        </div>
      )}

      {/* Letter Capsule Lists */}
      {mails.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-5 border-b border-border/30 pb-3 select-none">
            <Inbox className="size-4.5 text-muted-foreground" />
            <h2 className="text-lg font-bold tracking-tight font-display">Scheduled Time Capsules</h2>
          </div>
          
          <div className="space-y-4">
            {mails.map((mail) => (
              <MailCard key={mail.id} mail={mail} onDelete={handleDelete} />
            ))}
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8 font-semibold select-none">
            Capsules will unseal and deliver to <strong className="text-foreground">{user?.email}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

