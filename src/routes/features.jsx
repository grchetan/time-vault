import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Lock, Mail, Shield, Clock, Bell, Eye, Sparkles, Smile, ArrowRight, Check
} from 'lucide-react';
import { LiquidWave } from '@/components/liquid-wave';

export const Route = createFileRoute('/features')({ component: FeaturesPage });

const vaultFeatures = [
  {
    icon: Lock,
    title: 'Time-Locked Vault',
    body: 'Hand over distracting passwords for 1 day, 7 days, 30 days, months or years. The vault keeps them sealed until time is up.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Eye,
    title: 'Truly Hidden',
    body: 'Locked passwords are unreadable until the unlock moment — protected at the database level, not just by hiding the input.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Private by Default',
    body: 'Each user only sees their own vault and mail. Strict access rules prevent any data crossover.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Honest Timers',
    body: 'Live countdowns to the second. No early peeks, no bypass options. The server enforces the rule.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const mailFeatures = [
  {
    icon: Mail,
    title: 'Future Mail',
    body: 'Write a letter, pick any future date and time. We\'ll deliver it to your inbox on time, exactly as you wrote it.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Bell,
    title: 'Email When It Lands',
    body: "When a Future Mail's time arrives, it's delivered to your inbox — no missed notes, no notifications needed.",
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Smile,
    title: 'Calm Interface',
    body: 'Soft pastels and friendly design keep self-discipline from feeling like punishment.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Sparkles,
    title: 'One Account, Everything',
    body: 'Your locks and letters all live in one place, tied to the same login. No confusing dashboards.',
    color: 'bg-teal-100 text-teal-600',
  },
];

const perks = [
  'Free to start, no credit card',
  'AES-256 client-side encryption',
  'Server-enforced unlock timers',
  'Email delivery for Future Mail',
  'Mobile-responsive design',
  'Privacy-first architecture',
];

function FeatureCard({ icon: Icon, title, body, color }) {
  return (
    <LiquidWave>
      <div className="card-premium p-6 group cursor-default h-full">
        <div className={`size-11 rounded-2xl ${color} grid place-items-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </LiquidWave>
  );
}

function FeaturesPage() {
  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="container mx-auto max-w-6xl px-5 pt-16 pb-12 text-center">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-5">
            <Sparkles className="size-3.5" />
            Everything in TimeVault
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Small surface area.{' '}
            <span className="text-gradient">Big impact.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A focused set of tools — just enough to change your week.
          </p>
        </div>
      </section>

      {/* Vault features */}
      <section className="container mx-auto max-w-6xl px-5 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-8 rounded-xl bg-violet-100 text-violet-600 grid place-items-center">
            <Lock className="size-4" />
          </div>
          <h2 className="text-xl font-bold">Password Vault</h2>
          <div className="flex-1 h-px bg-border ml-2" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vaultFeatures.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* Future Mail features */}
      <section className="container mx-auto max-w-6xl px-5 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-8 rounded-xl bg-teal-100 text-teal-600 grid place-items-center">
            <Mail className="size-4" />
          </div>
          <h2 className="text-xl font-bold">Future Mail</h2>
          <div className="flex-1 h-px bg-border ml-2" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mailFeatures.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* Perks strip */}
      <section className="bg-soft">
        <div className="container mx-auto max-w-4xl px-5 py-16">
          <h2 className="text-2xl font-bold text-center mb-10 tracking-tight">
            Everything you get, for free
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3 card-3d px-5 py-4 cursor-default">
                <div className="size-5 rounded-full bg-primary-soft grid place-items-center flex-shrink-0">
                  <Check className="size-3 text-primary" />
                </div>
                <span className="text-sm font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to lock in?</h2>
        <p className="text-muted-foreground mb-8">Start free. No commitment. Cancel anytime.</p>
        <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200 group btn-magnetic">
          <Link to="/login">
            Open your vault
            <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
