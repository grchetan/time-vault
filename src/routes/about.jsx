import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Lock, ShieldCheck, EyeOff, Brain, Clock, Shield, Star, ArrowRight, Code2, Sparkles
} from 'lucide-react';
import aboutIllustration from '@/assets/about_illustration.png';

export const Route = createFileRoute('/about')({ component: AboutPage });

const values = [
  {
    icon: Brain,
    title: 'Focus Built on Friction',
    body: "Willpower isn't a permanent resource—it depletes. Blocker widgets fail because they are simple client toggles. We build real, server-enforced friction to save you from your impulses.",
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:border-violet-900/30',
  },
  {
    icon: Clock,
    title: 'Absolute Database Promises',
    body: "Our locks aren't simple local preferences or browser extensions. They are secure, row-level Supabase constraints. No override hooks exist—and that is the absolute design intent.",
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/30',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    body: "Focus requires absolute trust. We implement standard AES-256 client-side cryptographic layers and hardened, serverless row-level database rules to ensure your credentials remain completely private.",
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/30',
  },
];

const stats = [
  { value: '256-bit', label: 'AES Encryption Shield', icon: Shield },
  { value: '100%', label: 'Database Enforced Timers', icon: Clock },
  { value: 'Zero', label: 'Commercial Tracking / Ads', icon: EyeOff },
  { value: 'Public', label: 'Open Source Transparency', icon: Code2 },
];

const stack = [
  { name: 'React 19', desc: 'Sleek component view architecture' },
  { name: 'Firebase Identity', desc: 'Secure user login state' },
  { name: 'Supabase Serverless', desc: 'Row-level access & locked rows' },
  { name: 'AES-256 Crypto', desc: 'Local browser-side cypher lock' },
  { name: 'TailwindCSS', desc: 'Hardware-accelerated visual system' },
  { name: 'TanStack Router', desc: 'Rigorous type-safe SPA routes' },
];

function AboutPage() {
  return (
    <div className="relative z-10">
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none -z-10 overflow-hidden h-[360px]">
        <div className="size-[500px] rounded-full bg-primary/10 blur-[90px] -translate-y-1/2 opacity-60" />
      </div>

      {/* Story Hero Section */}
      <section className="container mx-auto max-w-5xl px-5 pt-16 pb-12 select-none">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Narrative Copy */}
          <div className="lg:col-span-8 animate-slide-up space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm border border-primary/10">
              <Star className="size-3.5" />
              TimeVault Ethos
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
              About <span className="text-gradient-moving font-extrabold">TimeVault</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-semibold">
              TimeVault was born from an exhausted evening—the kind where you swear you only opened your phone "for a quick notification check" and emerged forty minutes later, completely drained without recalling anything you saw.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
              We did not want to engineer another aggressive block extension that locks down your screen like a warden. We envisioned a subtle, supportive focus contract: hand over the credentials, choose a timestamp, seal the lock, and walk away.
            </p>
          </div>
          
          {/* Right Column: Premium AI Illustration with smooth floating motion & soft reveal */}
          <div className="lg:col-span-4 hidden lg:block relative z-10">
            <div className="relative group/ill transform hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
              {/* Subtle back glowing halo */}
              <div className="absolute size-48 rounded-full bg-primary/10 blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
              <div className="relative glass p-2.5 rounded-[2.5rem] border border-white/40 shadow-hover overflow-hidden animate-float">
                <img
                  src={aboutIllustration}
                  alt="Premium minimal technology focus and structured productivity workspace vector illustration"
                  width={384}
                  height={384}
                  className="rounded-[2rem] w-full max-w-[280px] drop-shadow-xl z-10 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Trust Stats Grid */}
      <section className="bg-soft relative overflow-hidden select-none border-y border-border/30">
        <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
        <div className="container mx-auto max-w-5xl px-5 py-14 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s, idx) => (
              <div 
                key={s.label} 
                className="card-premium p-5 text-center group hover:scale-[1.01] transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="size-10 rounded-xl bg-primary-soft text-primary border border-primary/10 grid place-items-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                  <s.icon className="size-5" />
                </div>
                <div className="text-xl font-black tracking-tight text-gradient mb-1">{s.value}</div>
                <div className="text-[10px] font-extrabold font-mono uppercase text-muted-foreground/80 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="container mx-auto max-w-5xl px-5 py-20 select-none">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-12 font-display">
          Our Architectural Principles
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v, idx) => (
            <div 
              key={v.title} 
              className="card-premium p-7 group cursor-default relative overflow-hidden animate-slide-up hover:scale-[1.01] transition-all duration-300 bg-card"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className={`size-12 rounded-2xl ${v.color} grid place-items-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 shadow-sm`}>
                <v.icon className="size-6" />
              </div>
              <h3 className="font-extrabold text-base tracking-tight mb-2 text-foreground">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Stack Blueprint */}
      <section className="bg-soft border-t border-border/30 relative select-none">
        <div className="container mx-auto max-w-4xl px-5 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-8 rounded-xl bg-primary-soft text-primary border border-primary/10 grid place-items-center flex-shrink-0 shadow-sm">
              <Code2 className="size-4.5" />
            </div>
            <h2 className="text-lg font-bold font-display">TimeVault Open Source Stack</h2>
            <div className="flex-1 h-px bg-border/60 ml-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stack.map((s, idx) => (
              <div 
                key={s.name} 
                className="rounded-2xl bg-card border border-border/80 px-5 py-4 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="font-extrabold text-sm text-foreground">{s.name}</div>
                <div className="text-[10px] font-bold text-muted-foreground/80 uppercase mt-0.5 font-mono tracking-wider">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actionable CTA */}
      <section className="container mx-auto max-w-4xl px-5 py-20 text-center select-none">
        <h2 className="text-3xl font-extrabold font-display tracking-tight mb-4">
          Establish your focus contract today
        </h2>
        <p className="text-muted-foreground text-sm font-semibold max-w-md mx-auto mb-8 pr-1 leading-relaxed">
          Reclaim your cognitive capital. Formulate timers, delay distraction triggers, and unlock letters from your past self when the contract expires.
        </p>
        <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-95 shadow-soft hover:shadow-glow transition-all duration-300 px-8 py-6 text-sm font-bold group">
          <Link to="/login">
            Lock Distraction Out
            <ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
