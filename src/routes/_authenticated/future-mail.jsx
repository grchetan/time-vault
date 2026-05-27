import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Mail, Send, Trash2, Clock, CheckCircle2, FlaskConical, Info, PenLine, X, CalendarDays, Inbox, FileText, ChevronRight, Lock, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { createFutureMail, getFutureMails, deleteFutureMail } from '@/lib/future-mail'
import { LiquidWave } from '@/components/liquid-wave'

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
      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader>
          <div className="size-14 rounded-xl bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4 border border-destructive/20 animate-pulse">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-center font-display font-extrabold text-xl">Move to Trash?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
            "<strong>{subject}</strong>" will be moved to Trash. You can restore it anytime within <strong>30 days</strong> before it is permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 sm:flex-row mt-4">
          <Button variant="outline" className="flex-1 rounded-full font-bold btn-magnetic" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep Letter
          </Button>
          <Button variant="destructive" className="flex-1 rounded-full font-bold shadow-soft btn-magnetic" onClick={onConfirm} disabled={loading}>
            {loading ? 'Moving…' : 'Move to Trash'}
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
      <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border shadow-hover bg-[#FAF8F5]">
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
      const token = await auth.currentUser.getIdToken(true)
      await deleteFutureMail(token, mail.id)
      toast.success('Letter moved to Trash', { description: 'Recoverable from Trash for 30 days.' })
      setDeleteOpen(false)
      onDelete(mail.id)
    } catch (e) {
      toast.error(e.message || 'Could not move letter to Trash')
    } finally {
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

      <div className={`relative flex items-center justify-between gap-3 bg-white dark:bg-card border border-border/85 hover:border-primary/25 hover:shadow-soft hover:-translate-y-0.5 rounded-xl p-3 sm:px-4 sm:py-3 transition-all duration-300 group select-none w-full ${
        isDelivered ? 'border-emerald-500/15 dark:border-emerald-500/15' : ''
      }`}>
        {/* Left Section: Status Icon & Title + Subtext */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Subtle Status Icon */}
          <div className="shrink-0">
            <div className={`size-8 rounded-lg grid place-items-center border transition-colors duration-300 ${
              isDelivered 
                ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                : 'bg-primary-soft text-primary border-primary/10'
            }`}>
              {isDelivered ? <Inbox className="size-4" /> : <Mail className="size-4" />}
            </div>
          </div>

          {/* Typography Hierarchy */}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm sm:text-base text-foreground tracking-tight truncate leading-tight group-hover:text-primary transition-colors duration-200">
              {mail.subject}
            </div>
            
            {/* Metadata Rows */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground mt-0.5 font-medium font-sans">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold opacity-75">Written {createdDate}</span>
              <span className="text-muted-foreground/30 font-sans">&middot;</span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                <CalendarDays className="size-3 text-muted-foreground/60 shrink-0" />
                <span>
                  {isDelivered ? 'Delivered' : 'Unseals'}{' '}
                  <strong className="text-foreground/80 font-medium">{deliverDateTime}</strong>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Badge & Subtle Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-1.5">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-tight uppercase font-mono border ${
            isDelivered
              ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-700'
              : 'bg-amber-500/10 border-amber-500/15 text-amber-700'
          }`}>
            {isDelivered ? (
              <><CheckCircle2 className="size-2.5 shrink-0" /><span>Unsealed</span></>
            ) : (
              <><Lock className="size-2.5 shrink-0" /><span className="animate-pulse">{daysLeft > 0 ? `${daysLeft}d` : 'Soon'}</span></>
            )}
          </span>

          {/* Compact Actions Layout */}
          <div className="flex items-center gap-1">
            {isDelivered && (
              <button
                onClick={() => setReadOpen(true)}
                className="h-8 text-xs text-primary font-bold hover:text-primary/80 transition-colors py-1 px-2.5 hover:bg-primary-soft/50 rounded-lg inline-flex items-center gap-0.5 select-none touch-manipulation font-sans border border-transparent"
              >
                <span>Read</span>
                <ChevronRight className="size-3.5" />
              </button>
            )}

            {/* Always Visible Tooltipped Delete Button */}
            <div className="relative group/tooltip">
              <button
                onClick={() => setDeleteOpen(true)}
                className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-all duration-300 size-8 flex items-center justify-center border border-transparent hover:border-destructive/10 touch-manipulation shrink-0"
                aria-label="Move letter to trash"
              >
                <Trash2 className="size-3.5" />
              </button>
              {/* Custom Pure CSS Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[9px] font-bold font-mono uppercase tracking-wider rounded shadow-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Delete
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Mail skeleton ─────────────────────────────────────────────────── */
function MailCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border/80 p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="skeleton size-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="skeleton h-3.5 w-36 sm:w-48 rounded" />
          <div className="skeleton h-3 w-24 sm:w-28 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="skeleton h-5 w-14 sm:w-16 rounded-full" />
        <div className="skeleton size-8 rounded-lg" />
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
    let mounted = true
    auth.currentUser.getIdToken(true)
      .then((token) => getFutureMails(token))
      .then((res) => { if (mounted) setMails(res.mails || []) })
      .catch((e) => { if (mounted) toast.error(e.message || 'Could not load letters') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [user])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!body.trim() || !deliverDate) { setError('Message and delivery date are required.'); return }
    setSending(true); setError('')
    try {
      const deliverAt = new Date(`${deliverDate}T${deliverTime}:00`).getTime()
      if (deliverAt <= Date.now()) {
        setError('Delivery time must be in the future.')
        return
      }
      const token = await auth.currentUser.getIdToken(true)
      const res = await createFutureMail(token, {
        subject: subject.trim() || 'A letter from your past self',
        message: body.trim(),
        deliverAt,
      })
      setMails((prev) => [...prev, res.mail].sort((a, b) => a.deliver_at - b.deliver_at))
      const d = new Date(deliverAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      toast.success('Capsule sealed and scheduled for ' + d)
      setSubject(''); setBody(''); setDeliverDate(''); setDeliverTime('09:00')
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Could not schedule letter')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = (id) => {
    setMails((prev) => prev.filter((m) => m.id !== id))
  }

  const pending = mails.filter((m) => !m.delivered).length
  const delivered = mails.filter((m) => m.delivered).length
  const charLimit = 5000

  return (
    <div className="relative z-10 container mx-auto max-w-2xl px-5 py-12">
      {/* Back to Dashboard */}
      <div className="text-left">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 select-none group/back"
        >
          <ChevronLeft className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-10 select-none">
        <div className="size-16 mx-auto rounded-xl bg-mint text-mint-foreground grid place-items-center shadow-soft mb-5 border border-emerald-100">
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

      {/* Beta / Demo Mode Banner Notice */}
      <div className="rounded-2xl border border-dashed border-amber-200/80 bg-amber-500/[0.03] p-5 flex items-start gap-4 mb-10 text-xs select-none relative overflow-hidden group">
        <span className="absolute -right-6 -bottom-6 text-7xl font-extrabold text-amber-500/5 select-none pointer-events-none">🧪</span>
        <FlaskConical className="size-5.5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1 relative z-10">
          <p className="font-bold text-amber-800 font-display text-sm">Future Mail currently operates in secure beta delivery mode during development.</p>
          <p className="text-amber-700 leading-relaxed font-semibold text-[11px] sm:text-xs">
            In sandbox mode, Resend may reroute emails to the verified owner inbox instead of the target recipient. 
            You can verify the entire delivery flow step-by-step (scheduled_at check, cron trigger, edge function execution, Resend API dispatch, and database delivered flags updates) normally under this environment!
          </p>
        </div>
      </div>

      {/* Trigger Buttons */}
      {!showForm && (
        <div className="flex justify-center gap-3.5 mb-10 flex-wrap">
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 font-bold btn-magnetic">
            <PenLine className="size-4.5 mr-2" />
            Write Future Letter
          </Button>
          <Button variant="outline" onClick={fillDemo} className="rounded-full hover:border-primary/20 hover:bg-primary-soft/30 hover:text-primary transition-colors duration-300 font-semibold btn-magnetic">
            <FlaskConical className="size-4.5 mr-2" />
            Demo Test Capsule
          </Button>
        </div>
      )}

      {/* Elegant Virtual Stationery Parchment Composer */}
      {showForm && (
        <form onSubmit={handleSend} className="card-3d bg-[#FAF8F5] border border-border/80 p-8 space-y-6 mb-10 animate-slide-up relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C2A691] to-[#E9DFD5] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-[#EBE5DF] text-[#6B5A4E] grid place-items-center shadow-sm">
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
                className="flex w-full rounded-xl border border-input/60 bg-white px-5 py-4 font-serif text-[#4E3F35] text-base placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors leading-relaxed shadow-sm"
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
          <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-5 relative overflow-hidden group">
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
            <Button type="submit" className="flex-1 rounded-full bg-gradient-primary hover:opacity-95 shadow-soft transition-all duration-300 font-bold btn-magnetic" disabled={sending}>
              <Send className="size-4.5 mr-2" />
              {sending ? 'Sealing Capsule…' : 'Seal & Dispatch Capsule'}
            </Button>
            <Button type="button" variant="outline" className="rounded-full hover:bg-muted/70 font-semibold btn-magnetic"
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
          <div className="size-20 mx-auto rounded-xl bg-primary-soft text-primary border border-primary/10 grid place-items-center mb-6 shadow-soft">
            <Mail className="size-9" />
          </div>
          <h3 className="font-extrabold text-xl mb-2 text-foreground font-display">No scheduled letters</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto mb-7 pr-1 font-semibold leading-relaxed">
            Write a reflective message to your future self about your ambitions and digital focus.
          </p>
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft font-bold btn-magnetic">
            Write Your First Capsule
          </Button>
        </div>
      )}

      {/* Letter Capsule Lists */}
      {mails.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 mb-4 border-b border-border/30 pb-2.5 select-none">
            <Inbox className="size-4 text-muted-foreground" />
            <h2 className="text-base font-bold tracking-tight font-display">Scheduled Time Capsules</h2>
          </div>
          
          <div className="space-y-2.5">
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

