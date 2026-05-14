import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Send, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { createFutureMail, getFutureMails, deleteFutureMail } from '@/lib/future-mail'

export const Route = createFileRoute('/_authenticated/future-mail')({ component: FutureMailPage })

function MailCard({ mail, onDelete }) {
  const isDelivered = mail.delivered
  const daysLeft = Math.ceil((mail.deliver_at - Date.now()) / 86400000)
  const deliverDate = new Date(mail.deliver_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const createdDate = new Date(mail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className={`rounded-3xl bg-card border p-5 shadow-card flex gap-4 transition-colors ${isDelivered ? 'border-green-200 bg-green-50/30' : 'border-border'}`}>
      <div className="shrink-0 pt-1">
        <div className={`size-10 rounded-2xl grid place-items-center ${isDelivered ? 'bg-green-100 text-green-600' : 'bg-primary-soft text-primary'}`}>
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
            {isDelivered ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <CheckCircle2 className="size-3" /> Delivered
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <Clock className="size-3" /> {daysLeft > 0 ? `${daysLeft}d left` : 'Soon'}
              </span>
            )}
            {!isDelivered && (
              <button onClick={() => onDelete(mail.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-3.5" />
          <span>{isDelivered ? 'Delivered on' : 'Scheduled for'} <strong className="text-foreground">{deliverDate}</strong></span>
        </div>
      </div>
    </div>
  )
}

function FutureMailPage() {
  const { user } = useAuth()
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [deliverAt, setDeliverAt] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  useEffect(() => {
    if (!user) return
    getFutureMails()
      .then((res) => setMails(res.mails || []))
      .catch((e) => toast.error(e.message || 'Could not load letters'))
      .finally(() => setLoading(false))
  }, [user])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!body.trim() || !deliverAt) { setError('Message and delivery date are required.'); return }
    setSending(true); setError('')
    try {
      const res = await createFutureMail({
        subject: subject.trim() || 'A letter from your past self',
        message: body.trim(),
        deliverAt: new Date(deliverAt).getTime(),
      })
      setMails((prev) => [...prev, res.mail].sort((a, b) => a.deliver_at - b.deliver_at))
      toast.success('✉️ Letter sealed! It will be delivered on ' + new Date(deliverAt).toLocaleDateString('en-IN', { dateStyle: 'long' }))
      setSubject(''); setBody(''); setDeliverAt('')
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Could not schedule letter')
    }
    setSending(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this letter? It will not be delivered.')) return
    try {
      await deleteFutureMail(id)
      setMails((prev) => prev.filter((m) => m.id !== id))
      toast.success('Letter cancelled')
    } catch (e) {
      toast.error(e.message || 'Could not delete')
    }
  }

  const pendingCount = mails.filter((m) => !m.delivered).length
  const deliveredCount = mails.filter((m) => m.delivered).length

  return (
    <div className="container mx-auto max-w-2xl px-5 py-12">
      <div className="text-center mb-10">
        <div className="size-14 mx-auto rounded-2xl bg-mint text-mint-foreground grid place-items-center shadow-soft mb-4">
          <Mail className="size-7" />
        </div>
        <h1 className="text-3xl font-bold">Future Mail</h1>
        <p className="mt-2 text-muted-foreground">
          Write a letter to your future self. We'll deliver it by email on the date you choose.
        </p>
        {!loading && mails.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount} scheduled · {deliveredCount} delivered
          </p>
        )}
      </div>

      {!showForm && (
        <div className="flex justify-center mb-8">
          <Button onClick={() => setShowForm(true)} className="rounded-full">
            <Send className="size-4 mr-2" /> Write a Letter
          </Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSend} className="rounded-3xl bg-card border border-border p-7 shadow-card space-y-5 mb-8">
          <h2 className="text-lg font-semibold">Write to your future self</h2>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Hey future me…" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliver-at">Deliver on <span className="text-destructive">*</span></Label>
            <Input id="deliver-at" type="date" value={deliverAt} min={minDateStr}
              onChange={(e) => setDeliverAt(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Your letter <span className="text-destructive">*</span></Label>
            <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)}
              required rows={8}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Write whatever you want your future self to know…" />
            <div className="text-xs text-muted-foreground text-right">{body.length} characters</div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            ℹ️ This letter will be sent to <strong>{user?.email}</strong> on the selected date.
          </div>

          {error && <div className="text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 rounded-full" disabled={sending}>
              <Send className="size-4 mr-2" />{sending ? 'Sealing…' : 'Seal & Schedule'}
            </Button>
            <Button type="button" variant="outline" className="rounded-full"
              onClick={() => { setShowForm(false); setError('') }} disabled={sending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading && (
        <div className="text-center py-10 text-muted-foreground text-sm">Loading letters…</div>
      )}

      {!loading && mails.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="size-16 mx-auto rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
            <Mail className="size-8" />
          </div>
          <h3 className="font-semibold text-lg">No letters yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Write your first letter to your future self — it will be delivered on the date you choose.
          </p>
        </div>
      )}

      {mails.length > 0 && (
        <div className="space-y-4">
          {mails.map((mail) => (
            <MailCard key={mail.id} mail={mail} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {mails.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          Letters are delivered to your registered email address
        </p>
      )}
    </div>
  )
}
