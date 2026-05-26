import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Clock, Shield, Users, Star, ArrowRight, Code2 } from 'lucide-react';

export const Route = createFileRoute('/about')({ component: AboutPage });

const values = [
  {
    icon: Brain,
    title: 'Built on willpower, not willforce',
    body: "The hardest part isn't blocking — it's the moment you almost cave. We just make that moment harder to act on.",
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Clock,
    title: 'Real timers, real waits',
    body: "Our locks aren't a feature flag in your browser. They're a database promise. No bypass exists — and that's the point.",
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Heart,
    title: 'Gentle, by design',
    body: "Soft tones, friendly language, no scary metaphors. Discipline doesn't have to feel like a prison.",
    color: 'bg-rose-100 text-rose-600',
  },
];

const stats = [
  { value: '256-bit', label: 'AES Encryption', icon: Shield },
  { value: '100%', label: 'Server-enforced locks', icon: Clock },
  { value: 'Zero', label: 'Data sold or shared', icon: Heart },
  { value: 'Open', label: 'Source code on GitHub', icon: Code2 },
];

const stack = [
  { name: 'React 19', desc: 'Frontend framework' },
  { name: 'Firebase Auth', desc: 'Authentication' },
  { name: 'Supabase', desc: 'Database & API' },
  { name: 'AES-256', desc: 'Client-side encryption' },
  { name: 'TailwindCSS', desc: 'Styling' },
  { name: 'TanStack Router', desc: 'Type-safe routing' },
];

function AboutPage() {
  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="container mx-auto max-w-4xl px-5 pt-16 pb-12">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-5">
            <Star className="size-3.5" />
            Our story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            About <span className="text-gradient">TimeVault</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            TimeVault was born from a tired evening — the kind where you swear you
            only opened your phone "for a second" and emerged forty minutes later,
            without remembering a single thing you saw.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
            We didn't want another aggressive blocker that punishes you. We wanted a
            small, kind ritual: hand over the password, set a timer, walk away. The
            vault holds it. The clock decides. You're free.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-soft">
        <div className="container mx-auto max-w-5xl px-5 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s) => (
              <div key={s.label} className="card-premium p-6 text-center group">
                <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="size-5" />
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-gradient mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12">
          What we believe in
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card-premium p-7 group cursor-default">
              <div className={`size-12 rounded-2xl ${v.color} grid place-items-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <v.icon className="size-6" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="bg-soft">
        <div className="container mx-auto max-w-4xl px-5 py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-8 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <Code2 className="size-4" />
            </div>
            <h2 className="text-xl font-bold">Built with</h2>
            <div className="flex-1 h-px bg-border ml-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stack.map((s) => (
              <div key={s.name} className="rounded-2xl bg-card border border-border px-5 py-4 shadow-card">
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Ready to reclaim your focus?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join people who've chosen to lock out distraction — one password at a time.
        </p>
        <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hover:shadow-glow transition-all duration-200 group">
          <Link to="/login">
            Try it yourself
            <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
