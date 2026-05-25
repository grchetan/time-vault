import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Mail,
  Sparkles,
  Shield,
  Clock,
  Heart,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Copy,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import heroImg from '@/assets/img1.png';
import focusImg from '@/assets/img2.png';
import lockImg from '@/assets/img3.png';
import mailImg from '@/assets/img4.png';
import { BilingualNotice } from '@/components/bilingual-notice';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="container mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-border text-xs font-medium text-muted-foreground shadow-card">
              <Sparkles className="size-3.5 text-primary" /> Built for deep
              focus
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] text-foreground">
              Lock the noise.
              <br />
              <span className="text-primary">Unlock</span> your time.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              TimeVault safely seals your distracting passwords for a day, a
              week, or a year — and delivers letters from your past self when
              the timer rings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full shadow-soft text-base"
              >
                <Link to="/login">
                  Start your first lock <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link to="/features">See how it works</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" /> End-to-end private
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-primary" /> Free to start
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="blob bg-primary/30 size-72 -top-10 -left-10" />
            <div className="blob bg-secondary/40 size-64 bottom-0 -right-10" />
            <img
              src={heroImg}
              alt="A peaceful character meditating on top of a giant pastel lock with a clock"
              width={1280}
              height={1280}
              className="relative w-full max-w-md mx-auto animate-float"
            />
          </div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="container mx-auto max-w-6xl px-5 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">
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
              tone: 'bg-primary-soft',
            },
            {
              icon: Mail,
              title: 'Future Mail',
              body: "Write to your future self. We deliver it by email — exactly when it'll matter most.",
              tone: 'bg-mint',
            },
            {
              icon: Clock,
              title: 'Honest Timers',
              body: 'No tricks, no early peeks. The clock is the contract. You decide; we just hold the key.',
              tone: 'bg-accent',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-card border border-border p-7 shadow-card hover:shadow-soft transition-shadow"
            >
              <div
                className={`size-12 rounded-2xl ${f.tone} grid place-items-center mb-5`}
              >
                <f.icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Focus alternating section */}
      <section className="container mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <img
          src={focusImg}
          alt="A focused worker balloons"
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full max-w-sm mx-auto"
        />
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Distraction is a habit. So is focus.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every unlock you don't take builds a tiny bit of self-trust. After a
            week, you stop reaching for the phone. After a month, you barely
            remember why you did.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Pick the apps that pull you under.',
              'Lock them for the duration that scares you a little.',
              'Live the life that was always waiting underneath.',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="size-6 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-bold shrink-0">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== HOW TO USE ===== */}
      <section className="bg-soft">
        <div className="container mx-auto max-w-6xl px-5 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-4">
              <CheckCircle2 className="size-3.5" /> How to Use
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Lock any app in 4 steps
            </h2>
            <p className="mt-3 text-muted-foreground">
              Works for Snapchat, Instagram, YouTube, or any app with a
              password.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: RefreshCw,
                color: 'bg-violet-100 text-violet-600',
                tipColor: 'bg-violet-50 text-violet-700',
                num: '01',
                title: 'Generate a Random Password',
                desc: "Go to passwordsgenerator.net and create a strong random password like 'xK9#mP2$qL7!nB4@'. Copy it.",
                tip: 'Use 16+ characters with symbols & numbers',
              },
              {
                icon: KeyRound,
                color: 'bg-amber-100 text-amber-600',
                tipColor: 'bg-amber-50 text-amber-700',
                num: '02',
                title: 'Change Your App Password',
                desc: 'Open Snapchat / Instagram → Settings → Password → Replace with the random password. Log out of all other devices.',
                tip: 'Log out from all active sessions too',
              },
              {
                icon: Copy,
                color: 'bg-emerald-100 text-emerald-600',
                tipColor: 'bg-emerald-50 text-emerald-700',
                num: '03',
                title: 'Lock It in TimeVault',
                desc: 'Come back here → New Lock → paste the random password → choose your timer (7 days, 30 days, etc.) → Lock it.',
                tip: 'AES-256 encrypted before saving — server-side timer',
              },
              {
                icon: LogOut,
                color: 'bg-rose-100 text-rose-600',
                tipColor: 'bg-rose-50 text-rose-700',
                num: '04',
                title: "You're Locked Out — By Choice",
                desc: 'You cannot log in to the app anymore. When the timer expires, come back, reveal your password, and regain access.',
                tip: 'Nobody can bypass the server-side timer',
              },
            ].map((s) => (
              <div
                key={s.num}
                className="rounded-3xl bg-card border border-border p-6 shadow-card flex gap-5 hover:shadow-soft transition-shadow"
              >
                <div className="shrink-0">
                  <div
                    className={`size-12 rounded-2xl ${s.color} grid place-items-center`}
                  >
                    <s.icon className="size-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground">
                      {s.num}
                    </span>
                    <h3 className="font-semibold text-base">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {s.desc}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.tipColor}`}
                  >
                    💡 {s.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/login">
                Start your first lock <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="bg-soft">
        <div className="container mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your secrets stay yours.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Vault entries are protected by row-level access on a private
              database. Even our own servers won't reveal a locked password
              before its time — the rule is enforced in the database itself, not
              just in the app.
            </p>
            <div className="mt-6">
              <BilingualNotice
                en="Important: once a password is locked, it cannot be revealed early — not by us, not by support, not even by you."
                hi="Zaroori baat: ek baar password lock ho gaya, toh time se pehle wapas nahi milega. Soch samajh ke decide karein."
              />
            </div>
          </div>
          <img
            src={lockImg}
            alt="A friendly cartoon padlock with a built-in clock"
            loading="lazy"
            width={1024}
            height={1024}
            className="order-1 md:order-2 w-full max-w-sm mx-auto"
          />
        </div>
      </section>

      {/* Future mail section */}
      <section className="container mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <img
          src={mailImg}
          alt="A smiling envelope with wings carrying a heart"
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full max-w-sm mx-auto"
        />
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            A letter from your past self.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Write the thing you wish someone would say to you in six months.
            We'll keep it safe and email it back to you — to the moment you need
            it.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full">
            <Link to="/login">Write your first letter</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-5 pb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 text-center shadow-soft">
          <h2 className="text-3xl md:text-4xl font-bold">
            Your time is calling.
          </h2>
          <p className="mt-3 opacity-90 max-w-md mx-auto">
            Take it back, one locked hour at a time.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 rounded-full"
          >
            <Link to="/login">Get started — it's free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
