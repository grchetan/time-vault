import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { 
  Lock, Mail, Sparkles, Shield, Zap, ArrowRight, RefreshCw, KeyRound, 
  Copy, LogOut, CheckCircle2, Lightbulb, Check, ShieldCheck, 
  Brain, HelpCircle, ChevronDown, Trash2, CalendarDays, TrendingUp
} from 'lucide-react';
import heroImg from '@/assets/img1.png';
import focusImg from '@/assets/img2.png';
import lockImg from '@/assets/img3.png';
import mailImg from '@/assets/img4.png';
import { BilingualNotice } from '@/components/bilingual-notice';
import { LiquidWave } from '@/components/liquid-wave';

export const Route = createFileRoute('/')({ component: Index });

/* Scroll-reveal hook for smooth entrance reveals */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* Trust badge */
function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300 group cursor-default">
      <div className="size-6 rounded-lg bg-primary-soft/80 border border-primary/10 grid place-items-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="size-3 text-primary group-hover:text-white transition-colors" />
      </div>
      {label}
    </div>
  );
}

const HOME_FAQS = [
  {
    q: 'Can I unseal my locked vault early?',
    a: 'No. All unseal countdowns are strictly enforced on server-side database clocks. Changing your system time or local settings has zero effect. Friction is our design intent.'
  },
  {
    q: 'What should I store in TimeVault?',
    a: 'TimeVault is safe for productivity credentials, game logins, or social tokens. Avoid storing passwords for primary emergency accounts, corporate database access, or banking details.'
  },
  {
    q: 'What happens if I delete an active vault?',
    a: 'Deleted items undergo a soft-delete lifecycle and reside in the Trash & Recovery section for 30 days. Locks remain active inside Trash to prevent simple delete bypasses.'
  }
];

function Index() {
  const featureRef = useReveal();
  const focusRef = useReveal();
  const howRef = useReveal();
  const privacyRef = useReveal();
  const mailRef = useReveal();
  const statsRef = useReveal();
  const faqRef = useReveal();

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="relative overflow-hidden">
      
      {/* 🔮 Hero with reactive spotlight developer grid */}
      <section className="relative overflow-hidden bg-grid-spotlight border-b border-border/30 pb-4">
        {/* Soft background mesh glows */}
        <div className="absolute top-10 left-1/4 size-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />
        
        <div className="container mx-auto max-w-6xl px-5 pt-16 pb-28 md:pt-24 md:pb-36 grid md:grid-cols-2 gap-14 items-center relative z-10">
          
          {/* Left: copy */}
          <div className="space-y-7 animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft/80 border border-primary/20 text-xs font-bold text-primary shadow-soft tracking-wide uppercase animate-pulse-glow">
              <Sparkles className="size-3.5" />
              Built for deep focus
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight text-foreground font-display">
              Lock the noise. <br />
              <span className="text-gradient-moving">Unlock</span> your time.
            </h1>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed font-semibold">
              TimeVault safely seals your distracting passwords for a day, a
              week, or a year — and delivers letters from your past self when
              the timer rings.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full shadow-soft hover:shadow-glow bg-gradient-primary hover:opacity-95 text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5 group px-7 py-6 btn-magnetic"
              >
                <Link to="/login">
                  Start your first lock
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border/80 hover:border-primary/30 hover:bg-primary-soft/30 hover:text-primary text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5 px-7 py-6 btn-magnetic"
              >
                <Link to="/features">See how it works</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3">
              <TrustBadge icon={Shield} label="End-to-end private" />
              <TrustBadge icon={Zap} label="Free to start" />
              <TrustBadge icon={CheckCircle2} label="No card required" />
            </div>
          </div>

          {/* Right: Interactive Premium Mockup & Illustration */}
          <div className="relative animate-fade-in delay-200 flex items-center justify-center p-4">
            {/* Concentric Glowing Rings (Vault/Chronometer CONCEPT) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="size-[420px] absolute opacity-40 animate-spin-slow text-primary/20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 4" />
              </svg>
              <svg className="size-[340px] absolute opacity-35 animate-orbit-slow text-secondary/30" viewBox="0 0 100 100" style={{ animationDuration: '26s' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 12" />
              </svg>
              <div className="size-[260px] rounded-full border border-primary/10 absolute opacity-50 animate-pulse" />
            </div>
            
            <div className="blob bg-primary/20 size-80 -top-12 -left-12 animate-blob" />
            <div className="blob bg-secondary/25 size-72 -bottom-8 -right-8 animate-blob" style={{ animationDelay: '-5s' }} />

            {/* Floating Glass Stats Chip 1: Focus Score */}
            <div className="absolute top-[8%] left-[5%] z-20 glass px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-hover border border-white/50 animate-float-slow cursor-default select-none hover:scale-105 transition-transform duration-300">
              <div className="size-6 rounded-lg bg-emerald-100 border border-emerald-200 grid place-items-center text-emerald-600 shadow-sm">
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground font-extrabold tracking-wider uppercase font-mono">Focus Rating</span>
                <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">98% Active</span>
              </div>
            </div>

            {/* Floating Glass Stats Chip 2: Locked Timer */}
            <div className="absolute bottom-[18%] -right-[2%] z-20 glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-hover border border-white/50 animate-float-fast cursor-default select-none hover:scale-105 transition-transform duration-300" style={{ animationDelay: '-1.5s' }}>
              <div className="size-6 rounded-lg bg-violet-100 border border-violet-200 grid place-items-center text-violet-600 animate-pulse shadow-sm">
                <Lock className="size-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground font-extrabold tracking-wider uppercase font-mono">Timer Guard</span>
                <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">Locked by Choice</span>
              </div>
            </div>

            {/* Floating Glass Stats Chip 3: AES Encryption */}
            <div className="absolute bottom-[10%] left-[8%] z-20 glass px-4 py-2 rounded-2xl flex items-center gap-2 shadow-hover border border-white/50 animate-float-slow cursor-default select-none hover:scale-105 transition-transform duration-300" style={{ animationDelay: '-3.5s' }}>
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
              </div>
              <span className="text-xs font-extrabold text-foreground font-display tracking-tight">AES-256 Shield</span>
            </div>

            <LiquidWave isIllustration={true} className="z-10 w-full max-w-md mx-auto rounded-3xl">
              <div className="relative group/ill z-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-3xl blur-2xl opacity-0 group-hover/ill:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img
                  src={heroImg}
                  alt="Cartoon productivity meditating character lock representing focus"
                  width={640}
                  height={640}
                  className="relative w-full animate-float drop-shadow-2xl z-10"
                />
              </div>
            </LiquidWave>
          </div>
        </div>
      </section>

      {/* ── 📊 Focus Statistics Grid (Content Expansion) ───────────────── */}
      <section className="border-b border-border/30 bg-muted/10 py-16 select-none relative z-10">
        <div ref={statsRef} className="reveal container mx-auto max-w-6xl px-5 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          {[
            { val: '12,840+', label: 'Detox Contracts', desc: 'Secure vaults locked successfully', icon: Lock },
            { val: '99.4%', label: 'Willpower Success', desc: 'Active locks completed to term', icon: CheckCircle2 },
            { val: '4.8 Hrs', label: 'Daily Screen Time Saved', desc: 'Average attention reclaimed per user', icon: TrendingUp },
            { val: 'Zero', label: 'Backdoors & Overrides', desc: 'Enforced strictly at database tier', icon: Shield }
          ].map((s, idx) => (
            <div key={idx} className="card-premium p-6 text-center space-y-2 h-full flex flex-col justify-center">
              <div className="size-9 rounded-xl bg-primary-soft text-primary mx-auto grid place-items-center mb-1">
                <s.icon className="size-4.5" />
              </div>
              <div className="text-3xl font-black text-foreground font-display">{s.val}</div>
              <div className="text-xs font-bold text-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground font-semibold leading-normal">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 🧠 Why TimeVault Exists (Philosophy Content Expansion) ──────── */}
      <section className="container mx-auto max-w-6xl px-5 py-24 select-none">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              <Brain className="size-3.5" />
              Focus Philosophy
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
              Willpower fails. <br />
              <span className="text-gradient-moving">Friction</span> succeeds.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
              Distraction is a mismatch between caveman biology and modern dopaminergic feeds. In a digital world designed to exploit your impulses, simple blocking extensions fail because they are trivial to toggle off.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
              We operate under the philosophy of <strong>pre-commitment</strong>: locking your future actions away when your logical mind is in control, so that your impulsive mind cannot cave. It is an honest, physical barrier to rebuild your cognitive focus.
            </p>
          </div>
          {/* Quote Panel */}
          <div className="card-premium p-8 relative overflow-hidden group">
            <span className="absolute -right-3 -bottom-6 text-8xl font-extrabold text-primary/5 select-none font-serif">“</span>
            <p className="text-sm font-semibold italic text-foreground/80 leading-relaxed pr-6 relative z-10 font-serif">
              "Focus is not a state of constant battle against notifications. Focus is the clean design of an environment where notifications physically have no key to reach you."
            </p>
            <div className="mt-6 flex items-center gap-3 relative z-10">
              <div className="size-9 rounded-full bg-primary-soft text-primary font-mono grid place-items-center text-xs font-black">TV</div>
              <div>
                <div className="text-xs font-bold text-foreground">TimeVault Product Covenants</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Designed for Delayed Gratification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature trio ──────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-5 py-12">
        <div ref={featureRef} className="reveal">
          <div className="text-center max-w-2xl mx-auto mb-14 select-none">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              A kinder way to focus
            </h2>
            <p className="mt-3 text-muted-foreground font-semibold">
              Three simple tools, designed to feel like a friend — not a warden.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Time-Locked Vault',
                body: "Hand over your social media password. Pick a duration. We hide it until you've earned it back.",
                iconBg: 'bg-violet-100 text-violet-600',
              },
              {
                icon: Mail,
                title: 'Future Mail',
                body: "Write to your future self. We deliver it by email — exactly when it'll matter most.",
                iconBg: 'bg-teal-100 text-teal-600',
              },
              {
                icon: CheckCircle2,
                title: 'Honest Timers',
                body: 'No tricks, no early peeks. The clock is the contract. You decide; we just hold the key.',
                iconBg: 'bg-amber-100 text-amber-600',
              },
            ].map((f) => (
              <LiquidWave key={f.title} className="rounded-3xl h-full">
                <div
                  className="card-premium p-7 group cursor-default h-full"
                >
                  <div className={`size-12 rounded-2xl ${f.iconBg} grid place-items-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-semibold">{f.body}</p>
                </div>
              </LiquidWave>
            ))}
          </div>
        </div>
      </section>

      {/* ── ⛓️ Interactive Locks Timeline (Content Expansion) ─────────── */}
      <section className="container mx-auto max-w-4xl px-5 py-24 select-none">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
            <RefreshCw className="size-3.5" />
            User Flow Sequence
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-display mt-3">The Anatomy of a Temporal Seal</h2>
          <p className="text-sm text-muted-foreground mt-2 font-semibold">How your credential lock guarantees focus from start to end.</p>
        </div>

        <div className="relative border-l border-border pl-8 ml-4 space-y-10">
          {[
            { step: '01', title: 'Generate & Replace App Password', desc: 'Alter your Instagram or Game token with a randomized password in app settings, logging out of all active devices.', icon: KeyRound },
            { step: '02', title: 'Encrypt & Commit Vault', desc: 'Securely paste the password into TimeVault, encrypting it client-side before binding database timers.', icon: Lock },
            { step: '03', title: 'Absolute Friction Enforced', desc: 'System UTC clocks reject early decrypt calls. Not even developers or administrators hold override backdoor keys.', icon: ShieldCheck },
            { step: '04', title: 'Expiration Unseal & Restore', desc: 'Once the countdown clears, copy your decrypted credential, sign back in, and enjoy your earned attention.', icon: CheckCircle2 }
          ].map((t, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-12.5 top-1 size-8 rounded-full border border-border bg-white grid place-items-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                <t.icon className="size-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-primary font-mono uppercase tracking-wider">{t.step}</span>
                  <h4 className="font-bold text-foreground text-sm font-display">{t.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-xl">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Focus alternating ─────────────────────────────────────────── */}
      <section className="bg-soft border-y border-border/30">
        <div
          ref={focusRef}
          className="reveal container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center"
        >
          <LiquidWave isIllustration={true} className="w-full max-w-sm mx-auto rounded-3xl">
            <img
              src={focusImg}
              alt="A focused person in a calm environment"
              loading="lazy"
              width={512}
              height={512}
              className="w-full drop-shadow-xl"
            />
          </LiquidWave>
          <div className="space-y-6 select-none">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Distraction is a habit.{' '}
              <span className="text-gradient">So is focus.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              Every unlock you don't take builds a tiny bit of self-trust. After a
              week, you stop reaching for the phone. After a month, you barely
              remember why you did.
            </p>
            <ul className="space-y-3">
              {[
                'Pick the apps that pull you under.',
                'Lock them for the duration that scares you a little.',
                'Live the life that was always waiting underneath.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-primary-soft text-primary grid place-items-center flex-shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed font-semibold">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How to Use ────────────────────────────────────────────────── */}
      <section>
        <div
          ref={howRef}
          className="reveal container mx-auto max-w-6xl px-5 py-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-14 select-none">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-5">
              <CheckCircle2 className="size-3.5" />
              How to Use
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Lock any app in 4 steps
            </h2>
            <p className="mt-3 text-muted-foreground font-semibold">
              Works for Snapchat, Instagram, YouTube, or any app with a password.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: RefreshCw,
                color: 'bg-violet-100 text-violet-600',
                tipColor: 'bg-violet-50 text-violet-700 border border-violet-100',
                num: '01',
                title: 'Generate a Random Password',
                desc: "Go to passwordsgenerator.net and create a strong random password like 'xK9#mP2$qL7!nB4@'. Copy it.",
                tip: 'Use 16+ characters with symbols & numbers',
              },
              {
                icon: KeyRound,
                color: 'bg-amber-100 text-amber-600',
                tipColor: 'bg-amber-50 text-amber-700 border border-amber-100',
                num: '02',
                title: 'Change Your App Password',
                desc: 'Open Snapchat / Instagram → Settings → Password → Replace with the random password. Log out of all other devices.',
                tip: 'Log out from all active sessions too',
              },
              {
                icon: Copy,
                color: 'bg-emerald-100 text-emerald-600',
                tipColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                num: '03',
                title: 'Lock It in TimeVault',
                desc: 'Come back here → New Lock → paste the random password → choose your timer (7 days, 30 days, etc.) → Lock it.',
                tip: 'AES-256 encrypted before saving — server-side timer',
              },
              {
                icon: LogOut,
                color: 'bg-rose-100 text-rose-600',
                tipColor: 'bg-rose-50 text-rose-700 border border-rose-100',
                num: '04',
                title: "You're Locked Out — By Choice",
                desc: 'You cannot log in to the app anymore. When the timer expires, come back, reveal your password, and regain access.',
                tip: 'Nobody can bypass the server-side timer',
              },
            ].map((s) => (
              <LiquidWave key={s.num} className="rounded-3xl h-full">
                <div
                  className="card-premium p-6 flex gap-5 h-full"
                >
                  <div className="shrink-0">
                    <div className={`size-12 rounded-2xl ${s.color} grid place-items-center`}>
                      <s.icon className="size-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-muted-foreground/60 font-mono">{s.num}</span>
                      <h3 className="font-semibold text-base">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 font-semibold">{s.desc}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.tipColor}`}>
                      <Lightbulb className="size-3" />
                      {s.tip}
                    </div>
                  </div>
                </div>
              </LiquidWave>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200 group btn-magnetic">
              <Link to="/login">
                Start your first lock
                <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 🛡️ Enterprise Trust & Architecture (Security Content Expansion) ── */}
      <section className="bg-muted/10 border-y border-border/30 py-24 select-none">
        <div className="container mx-auto max-w-6xl px-5">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold font-mono tracking-wide uppercase">
              <ShieldCheck className="size-3.5" />
              Trust Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-display mt-3">Industry-Standard Security Protocols</h2>
            <p className="text-sm text-muted-foreground mt-2 font-semibold">We treat your data with professional privacy isolation structures.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Zero-Knowledge Architecture', 
                desc: 'Vault credentials are encrypted locally inside your browser memory using AES-256 before database upload. We only store encrypted ciphertexts.', 
                icon: KeyRound 
              },
              { 
                title: 'Database Lock Enforcement', 
                desc: 'Secure database row-level policies block read operations until unseal timers have expired. Changing system time or local clocks cannot bypass the lock.', 
                icon: ShieldCheck 
              },
              { 
                title: 'Secure Identity Isolation', 
                desc: 'User profiles are authenticated through advanced security services, ensuring complete account separation and preventing unauthorized session compromise.', 
                icon: CheckCircle2 
              }
            ].map((x, idx) => (
              <div key={idx} className="card-premium p-6 flex flex-col gap-4 h-full">
                <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/10 transition-transform duration-300 hover:scale-110">
                  <x.icon className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm font-display">{x.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-semibold">{x.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ───────────────────────────────────────────────────── */}
      <section className="bg-soft">
        <div
          ref={privacyRef}
          className="reveal container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 md:order-1 space-y-6 select-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
              <Shield className="size-3.5" />
              Privacy by Design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your secrets stay yours.
            </h2>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              Vault entries are protected by row-level access on a private
              database. Even our own servers won't reveal a locked password
              before its time — the rule is enforced in the database itself, not
              just in the app.
            </p>
            <div>
              <BilingualNotice
                en="Important: once a password is locked, it cannot be revealed early — not by us, not by support, not even by you."
                hi="Zaroori baat: ek baar password lock ho gaya, toh time se pehle wapas nahi milega. Soch samajh ke decide karein."
              />
            </div>
          </div>
          <LiquidWave isIllustration={true} className="order-1 md:order-2 w-full max-w-sm mx-auto rounded-3xl">
            <img
              src={lockImg}
              alt="A friendly padlock with a built-in clock"
              loading="lazy"
              width={512}
              height={512}
              className="w-full drop-shadow-xl"
            />
          </LiquidWave>
        </div>
      </section>

      {/* ── Future Mail ───────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div ref={mailRef} className="reveal w-full max-w-sm mx-auto">
          <LiquidWave isIllustration={true} className="w-full rounded-3xl">
            <img
              src={mailImg}
              alt="An envelope with wings carrying a heart"
              loading="lazy"
              width={512}
              height={512}
              className="w-full drop-shadow-xl"
            />
          </LiquidWave>
        </div>
        <div className="space-y-6 select-none">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            A letter from your past self.
          </h2>
          <p className="text-muted-foreground leading-relaxed font-semibold">
            Write the thing you wish someone would say to you in six months.
            We'll keep it safe and email it back to you — to the moment you need it.
          </p>
          <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200 btn-magnetic">
            <Link to="/login">Write your first letter</Link>
          </Button>
        </div>
      </section>

      {/* ── ❓ FAQ Drawer Preview (Content Expansion) ─────────────────── */}
      <section className="bg-muted/10 border-y border-border/30 py-24 select-none">
        <div ref={faqRef} className="reveal container mx-auto max-w-4xl px-5">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              <HelpCircle className="size-3.5" />
              Quick Answers
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-display mt-3">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-2 font-semibold">Quick help regarding locks, passwords, and server timers.</p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {HOME_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-40 border-t border-border/40' : 'max-h-0'
                  }`}>
                    <p className="px-6 py-4 text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-semibold bg-muted/20">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/docs" className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline select-none">
              View comprehensive Guides & FAQs
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-5xl px-5 pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-primary text-primary-foreground p-12 md:p-16 text-center shadow-soft select-none">
          <div className="absolute top-0 left-0 size-48 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 size-56 rounded-full bg-white/10 translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your time is calling.
            </h2>
            <p className="mt-3 opacity-80 max-w-md mx-auto font-semibold">
              Take it back, one locked hour at a time.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-7 rounded-full bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-200 font-semibold group btn-magnetic"
            >
              <Link to="/login">
                Get started — it's free
                <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
