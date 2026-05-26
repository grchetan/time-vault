import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Mail,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Copy,
  LogOut,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Check,
} from 'lucide-react';
import heroImg from '@/assets/img1.png';
import focusImg from '@/assets/img2.png';
import lockImg from '@/assets/img3.png';
import mailImg from '@/assets/img4.png';
import { BilingualNotice } from '@/components/bilingual-notice';
import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/')(
  { component: Index }
);

/* Scroll-reveal hook */
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

function Index() {
  const featureRef = useReveal();
  const focusRef = useReveal();
  const howRef = useReveal();
  const privacyRef = useReveal();
  const mailRef = useReveal();

  return (
    <div>
      {/* ── Hero with reactive spotlight developer grid ────────────────── */}
      <section className="relative overflow-hidden bg-grid-spotlight border-b border-border/30 pb-4">
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

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              TimeVault safely seals your distracting passwords for a day, a
              week, or a year — and delivers letters from your past self when
              the timer rings.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full shadow-soft hover:shadow-glow bg-gradient-primary hover:opacity-95 text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5 group px-7 py-6"
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
                className="rounded-full border-border/80 hover:border-primary/30 hover:bg-primary-soft/30 hover:text-primary text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5 px-7 py-6"
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
              {/* Outer revolving dashed ring */}
              <svg className="size-[420px] absolute opacity-40 animate-spin-slow text-primary/20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 4" />
              </svg>
              {/* Mid revolving track */}
              <svg className="size-[340px] absolute opacity-35 animate-orbit-slow text-secondary/30" viewBox="0 0 100 100" style={{ animationDuration: '26s' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 12" />
              </svg>
              {/* Inner ambient ring */}
              <div className="size-[260px] rounded-full border border-primary/10 absolute opacity-50 animate-pulse" />
            </div>
            
            {/* Decorative background blobs */}
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

            {/* Cartoon illustration with glowing glass wrap */}
            <div className="relative group/ill transform hover:scale-[1.01] transition-transform duration-500 z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-3xl blur-2xl opacity-0 group-hover/ill:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <img
                src={heroImg}
                alt="Cartoon productivity meditating character lock representing focus"
                width={640}
                height={640}
                className="relative w-full max-w-md mx-auto animate-float drop-shadow-2xl z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature trio ──────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-5 py-24">
        <div ref={featureRef} className="reveal">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              A kinder way to focus
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three simple tools, designed to feel like a friend — not a warden.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Time-Locked Vault',
                body: "Hand over your social media password. Pick a duration. We hide it until you've earned it back.",
                gradient: 'from-violet-100 to-purple-50',
                iconBg: 'bg-violet-100 text-violet-600',
              },
              {
                icon: Mail,
                title: 'Future Mail',
                body: "Write to your future self. We deliver it by email — exactly when it'll matter most.",
                gradient: 'from-teal-50 to-mint',
                iconBg: 'bg-teal-100 text-teal-600',
              },
              {
                icon: CheckCircle2,
                title: 'Honest Timers',
                body: 'No tricks, no early peeks. The clock is the contract. You decide; we just hold the key.',
                gradient: 'from-amber-50 to-orange-50',
                iconBg: 'bg-amber-100 text-amber-600',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card-premium p-7 group cursor-default"
              >
                <div className={`size-12 rounded-2xl ${f.iconBg} grid place-items-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <f.icon className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Focus alternating ─────────────────────────────────────────── */}
      <section className="bg-soft">
        <div
          ref={focusRef}
          className="reveal container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center"
        >
          <img
            src={focusImg}
            alt="A focused person in a calm environment"
            loading="lazy"
            width={512}
            height={512}
            className="w-full max-w-sm mx-auto drop-shadow-xl"
          />
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Distraction is a habit.{' '}
              <span className="text-gradient">So is focus.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
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
                  <span className="text-sm text-muted-foreground leading-relaxed">{t}</span>
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
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-5">
              <CheckCircle2 className="size-3.5" />
              How to Use
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Lock any app in 4 steps
            </h2>
            <p className="mt-3 text-muted-foreground">
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
              <div
                key={s.num}
                className="card-premium p-6 flex gap-5"
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.tipColor}`}>
                    <Lightbulb className="size-3" />
                    {s.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200 group">
              <Link to="/login">
                Start your first lock
                <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Privacy ───────────────────────────────────────────────────── */}
      <section className="bg-soft">
        <div
          ref={privacyRef}
          className="reveal container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 md:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
              <Shield className="size-3.5" />
              Privacy by Design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your secrets stay yours.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
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
          <img
            src={lockImg}
            alt="A friendly padlock with a built-in clock"
            loading="lazy"
            width={512}
            height={512}
            className="order-1 md:order-2 w-full max-w-sm mx-auto drop-shadow-xl"
          />
        </div>
      </section>

      {/* ── Future Mail ───────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center">
        <img
          ref={mailRef}
          src={mailImg}
          alt="An envelope with wings carrying a heart"
          loading="lazy"
          width={512}
          height={512}
          className="reveal w-full max-w-sm mx-auto drop-shadow-xl"
        />
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            A letter from your past self.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Write the thing you wish someone would say to you in six months.
            We'll keep it safe and email it back to you — to the moment you need it.
          </p>
          <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200">
            <Link to="/login">Write your first letter</Link>
          </Button>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-5xl px-5 pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-primary text-primary-foreground p-12 md:p-16 text-center shadow-soft">
          {/* Decorative blobs inside CTA */}
          <div className="absolute top-0 left-0 size-48 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 size-56 rounded-full bg-white/10 translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your time is calling.
            </h2>
            <p className="mt-3 opacity-80 max-w-md mx-auto">
              Take it back, one locked hour at a time.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-7 rounded-full bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-200 font-semibold group"
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
