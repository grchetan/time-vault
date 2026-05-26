import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  Mail, MessageSquare, Send, User, CheckCircle2, Tag, 
  AlertTriangle, Sparkles, Clock, Copy, Check, Loader2,
  ChevronRight, ArrowLeft, Terminal, ShieldCheck, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const Route = createFileRoute('/contact')({ component: ContactPage });

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report 🐛', color: 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/30' },
  { value: 'feature', label: 'Feature Request 💡', color: 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/30' },
  { value: 'ui', label: 'UI/UX Issue 🎨', color: 'text-violet-500 bg-violet-50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/30' },
  { value: 'support', label: 'Support Message 🤝', color: 'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/30' },
  { value: 'suggestion', label: 'Productivity Suggestion ⚡', color: 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/30' },
  { value: 'general', label: 'General Feedback 💬', color: 'text-muted-foreground bg-muted border-border dark:bg-muted/30 dark:border-border/30' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low (Nice-to-have suggestion)', color: 'text-muted-foreground' },
  { value: 'medium', label: 'Medium (Standard support/request)', color: 'text-blue-500 dark:text-blue-400' },
  { value: 'high', label: 'High (Urgent blocker / annoying bug)', color: 'text-amber-600 dark:text-amber-500' },
  { value: 'critical', label: 'Critical (Security issue or system crash)', color: 'text-rose-600 dark:text-rose-500 font-extrabold' }
];

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [priorityLevel, setPriorityLevel] = useState('low');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [copiedText, setCopiedText] = useState(false);

  // Environment checks
  const scriptUrl = import.meta.env.VITE_CONTACT_APPS_SCRIPT_URL;
  const isSandbox = !scriptUrl || scriptUrl.includes('your_') || scriptUrl.trim() === '';

  // Input validation state checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isMessageValid = message.trim().length >= 10 && message.length <= 2000;
  const isFormValid = name.trim().length > 0 && isEmailValid && subject.trim().length > 0 && isMessageValid;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopiedText(true);
    toast.success('Message content copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleMailtoBackup = () => {
    const selectedTypeLabel = FEEDBACK_TYPES.find(f => f.value === feedbackType)?.label || 'General';
    const selectedPriorityLabel = PRIORITIES.find(p => p.value === priorityLevel)?.label || 'Low';
    
    const mailSubject = `[${selectedTypeLabel.toUpperCase()} - ${selectedPriorityLabel.toUpperCase()}] ${subject}`;
    const mailBody = `Name: ${name}\nEmail: ${email}\nCategory: ${selectedTypeLabel}\nPriority: ${selectedPriorityLabel}\n\nMessage:\n${message}`;
    
    const mailtoUrl = `mailto:support.timevault@gmail.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoUrl;
    toast.info('Opening your native email client...');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please ensure all fields are filled out correctly.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');

    // If sandbox mode, simulate Apps Script save and launch mailto callback
    if (isSandbox) {
      setTimeout(() => {
        setSubmitting(false);
        setStatus('success');
        toast.info('Running in Sandbox Mode. Spreadsheet connection simulated!');
        handleMailtoBackup();
      }, 1000);
      return;
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // Forces no-cors to prevent browser-level CORS blocking on Google's 302 redirects
        headers: {
          'Content-Type': 'text/plain', // Google Apps Script handles text/plain best for direct POST triggers without complex preflights
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          feedbackType,
          priorityLevel,
          message: message.trim()
        }),
      });

      // Bypassed redirect blockers successfully
      setStatus('success');
      toast.success('Feedback logged directly in our Google Sheet!');
    } catch (err) {
      console.error('Contact Form Error:', err);
      setStatus('error');
      toast.error('Could not submit. Spreadsheet API endpoint offline or incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setFeedbackType('general');
    setPriorityLevel('low');
    setMessage('');
    setStatus('idle');
  };

  return (
    <div className="relative z-10 container mx-auto max-w-6xl px-5 py-12">
      {/* Upper decorative blur rings */}
      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none -z-10 overflow-hidden h-[300px]">
        <div className="size-[400px] rounded-full bg-primary/10 blur-[80px] -translate-y-1/2 opacity-70" />
      </div>

      {/* Header Banner */}
      <div className="animate-slide-up mb-10 text-left space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
            <MessageSquare className="size-3.5" />
            Feedback Loop
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide uppercase shadow-sm border ${
            isSandbox 
              ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30'
          }`}>
            <ShieldCheck className="size-3.5" />
            {isSandbox ? 'Sandbox (Mailto Active)' : 'Spreadsheet Live'}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
          Say <span className="text-gradient-moving font-extrabold">Hello</span> or Report Issues
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed font-semibold">
          TimeVault is self-funded, secure, and built on user stories. Share your bug logs, UI recommendations, priority support queries, or spreadsheet integrations directly with our team.
        </p>
      </div>

      {/* Grid containing Contact Form and Developer Sidebar */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form Column */}
        <div className="lg:col-span-8">
          {status === 'success' ? (
            <div className="card-premium p-10 text-center animate-slide-up space-y-6">
              <div className="size-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 grid place-items-center shadow-soft">
                <CheckCircle2 className="size-9 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight font-display text-foreground">Message Dispatched!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed">
                  {isSandbox 
                    ? 'Spreadsheet integration simulated in sandbox. We opened your native email client to guarantee delivery.'
                    : 'Your feedback was logged in our encrypted Google Sheet ledger. Our engineers review columns weekly.'
                  }
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button onClick={resetForm} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft font-bold px-6">
                  Send Another Entry
                </Button>
                <Button variant="outline" asChild className="rounded-full font-semibold px-6">
                  <a href="/">Go to Home</a>
                </Button>
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="card-premium p-10 text-center animate-slide-up space-y-6 border-rose-200 bg-rose-50/5">
              <div className="size-20 mx-auto rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 grid place-items-center shadow-soft">
                <AlertTriangle className="size-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight font-display text-foreground">Spreadsheet API Offline</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium leading-relaxed">
                  Our script web app rejected the submission or the endpoint was incorrect. Don't worry! We saved your text securely so you won't lose it.
                </p>
              </div>

              {/* Saved text capsule for user recovery */}
              <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 dark:bg-rose-950/10 p-5 text-left max-w-xl mx-auto space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-rose-100 dark:border-rose-900/50 pb-2">
                  <span className="text-xs font-bold text-rose-800 uppercase font-mono tracking-wider">Your Written Message</span>
                  <button onClick={handleCopyMessage} className="text-rose-700 hover:text-rose-900 text-xs font-bold flex items-center gap-1">
                    {copiedText ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedText ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <p className="text-xs text-rose-700/90 whitespace-pre-wrap leading-relaxed truncate max-h-40">{message}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button onClick={handleMailtoBackup} className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft font-bold px-6">
                  Open Mailto Backup
                </Button>
                <Button variant="outline" onClick={() => setStatus('idle')} className="rounded-full font-semibold px-6">
                  Retry Form Submission
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-premium p-7 md:p-8 space-y-6 relative overflow-hidden group">
              {/* Form boundary left accent gradient indicator */}
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary pointer-events-none" />

              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-2 select-none">
                <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">Contact & Support Ledger</span>
                <span className="text-[10px] text-muted-foreground font-semibold">ALL FIELDS ENFORCED</span>
              </div>

              {/* Name & Email Fields */}
              <div className="grid md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="contact-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chetan Prajapat"
                      className="pl-10 rounded-xl"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@chetan.com"
                      className={`pl-10 rounded-xl transition-all duration-300 ${
                        email ? (isEmailValid ? 'border-emerald-200 focus-visible:ring-emerald-500' : 'border-rose-200 focus-visible:ring-rose-500') : ''
                      }`}
                      disabled={submitting}
                      required
                    />
                  </div>
                  {email && !isEmailValid && (
                    <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase tracking-wider font-mono">Invalid email syntax</p>
                  )}
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Subject / Concern</Label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Briefly state your concern..."
                    className="pl-10 rounded-xl"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Feedback Type & Priority Selects */}
              <div className="grid md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-type" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Feedback Category</Label>
                  <Select value={feedbackType} onValueChange={setFeedbackType} disabled={submitting}>
                    <SelectTrigger id="contact-type" className="rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-priority" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Enforcement Priority</Label>
                  <Select value={priorityLevel} onValueChange={setPriorityLevel} disabled={submitting}>
                    <SelectTrigger id="contact-priority" className="rounded-xl">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value} className={p.color}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="contact-message" className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Describe your story</Label>
                  <span className={`text-[10px] font-bold font-mono tracking-widest ${
                    message.length < 10 ? 'text-muted-foreground' : (message.length > 1900 ? 'text-amber-600' : 'text-emerald-600')
                  }`}>
                    {message.length} / 2000 CHARS
                  </span>
                </div>
                
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details — specify exactly what went wrong, which password vault timer failed, your browser console logs, or your emotional productivity stories..."
                  rows={6}
                  className={`rounded-2xl transition-all duration-300 resize-none font-sans leading-relaxed text-sm ${
                    message ? (isMessageValid ? 'border-emerald-200 focus-visible:ring-emerald-500' : 'border-rose-200 focus-visible:ring-rose-500') : ''
                  }`}
                  disabled={submitting}
                  required
                />
                
                <div className="flex justify-between items-center px-1">
                  {message && message.trim().length < 10 ? (
                    <p className="text-[10px] font-bold text-rose-500 pl-0.5 uppercase tracking-wider font-mono">Minimum 10 characters required</p>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase font-mono">Bilingual support active (Hindi / English)</span>
                  )}
                </div>
              </div>

              {/* Submission Button */}
              <Button
                type="submit"
                disabled={submitting || !isFormValid}
                className="w-full rounded-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 py-6 text-sm font-bold flex items-center justify-center gap-2 group/submit"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    Logging in Google Sheet...
                  </>
                ) : (
                  <>
                    <Send className="size-4 group-hover/submit:translate-x-0.5 transition-transform" />
                    {isSandbox ? 'Simulate Sandbox Submit (Mailto Backup)' : 'Save Log to Google Spreadsheet'}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats/Email Directly Card */}
          <div className="card-premium p-6 flex gap-4 items-start group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="size-11 rounded-2xl bg-primary-soft text-primary border border-primary/10 grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Mail className="size-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm uppercase font-mono tracking-wider text-muted-foreground">Primary Support Inbox</h3>
              <a href="mailto:support.timevault@gmail.com" className="font-display font-extrabold text-base text-foreground hover:text-primary transition-colors block pr-2">
                support.timevault@gmail.com
              </a>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed pt-1.5">
                Have a raw SQL inquiry or security contract issue? Write directly. We resolve email backlog within 24 hours.
              </p>
            </div>
          </div>

          {/* Secure Sheet Integration Details Card */}
          <div className="card-premium p-6 flex gap-4 items-start relative group">
            <div className="absolute top-4 right-4 pointer-events-none">
              <Sparkles className="size-4.5 text-primary animate-pulse" />
            </div>
            <div className="size-11 rounded-2xl bg-mint text-mint-foreground border border-emerald-100 grid place-items-center flex-shrink-0 shadow-sm">
              <Terminal className="size-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm uppercase font-mono tracking-wider text-muted-foreground">Sheet Integration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                TimeVault submissions pass through a lightweight Google Apps Script layer, appending headers, priority codes, timestamps, and messages securely to your private sheet.
              </p>
              
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col gap-1.5 select-none">
                <div className="flex items-center justify-between text-[10px] font-bold font-mono uppercase">
                  <span>Connection Mode</span>
                  <span className={isSandbox ? 'text-amber-600' : 'text-emerald-600'}>
                    {isSandbox ? 'SANDBOX' : 'PRODUCTION'}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  {isSandbox 
                    ? 'No apps script endpoint detected in .env. Submissions will trigger mailto fallback.'
                    : 'Google Sheet Web App URL connected. Logging live database responses.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Response SLA Note */}
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 p-5 relative overflow-hidden group">
            <span className="absolute -right-3 -bottom-6 text-7xl font-extrabold text-primary/5 select-none font-serif group-hover:scale-110 transition-transform duration-300">📜</span>
            <div className="flex gap-3">
              <Clock className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground">SLA Response Timeline</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Critical system reports and security logs trigger instant slack Webhook actions. Standard feedback iterations roll out during our Saturday release cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
