import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  FileText, ShieldCheck, Sparkles, Scale, AlertOctagon, Mail,
  CheckCircle2, ArrowLeft, UserX, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/terms')({ component: TermsPage });

function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Service Conditions",
      icon: Scale,
      points: [
        "By accessing and authenticating on TimeVault, you formally declare your compliance with these Terms of Service.",
        "If you disagree with any segment of this contract, please terminate your account operations immediately.",
        "We reserve the right to revise legal details and publish notifications regarding operational updates."
      ]
    },
    {
      title: "2. Functional Scope & Target Use",
      icon: Clock,
      points: [
        "TimeVault is developed strictly as a self-discipline utility to delay access to distraction triggers.",
        "Do not store passwords for critical accounts such as primary business emails, financial banking services, or emergency communication layers.",
        "We are not an active password recovery engine — we are an enforcement clock."
      ]
    },
    {
      title: "3. Absolute Willpower Contract Enforcements",
      icon: AlertOctagon,
      points: [
        "Once a timer is sealed on the database, it cannot be decrypted or bypassed by any party, including developers or support staff.",
        "Always change your target app password immediately after generating it to guarantee complete lockouts.",
        "We are physically incapable of overriding timer locks. The database rule is absolute."
      ]
    },
    {
      title: "4. Prohibited Account Behaviors",
      icon: UserX,
      points: [
        "You are strictly prohibited from storing credentials belonging to accounts you do not legally own.",
        "Any attempt to bypass, exploit, or flood our Supabase APIs will trigger immediate, permanent account termination.",
        "Do not employ this service to facilitate automated web scraping or bot authentication loops."
      ]
    },
    {
      title: "5. Absolute Limitation of Liability",
      icon: ShieldCheck,
      points: [
        "TimeVault is provided free of charge, with zero guarantees regarding database uptime or client SMTP mail delivery.",
        "We accept zero liability for any loss of account access, forgotten passwords, client email blockers, or focus slips.",
        "You accept full, unconditional responsibility for your lock configurations and credential backups."
      ]
    }
  ];

  return (
    <div className="relative z-10 container mx-auto max-w-6xl px-5 py-12">
      {/* Upper decorative background blur */}
      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none -z-10 overflow-hidden h-[320px]">
        <div className="size-[450px] rounded-full bg-primary/10 blur-[80px] -translate-y-1/2 opacity-70 animate-pulse" />
      </div>

      {/* Header and Title */}
      <div className="animate-slide-up space-y-4 mb-12 select-none text-left">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm border border-accent/10">
            <FileText className="size-3.5" />
            Terms Contract
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm border border-border/50">
            Last Updated: May 2026
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed font-semibold">
          Please review the official rules of the TimeVault contract. By sealing a credential, you establish a lock backed by database constraints.
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Legal Clauses */}
        <div className="lg:col-span-8 space-y-6">
          {sections.map((s, idx) => {
            const SectionIcon = s.icon;
            return (
              <div 
                key={s.title} 
                className="card-premium p-7 relative overflow-hidden group animate-slide-up bg-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Visual accent left line */}
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-primary/40 pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4 select-none">
                  <div className="size-9 rounded-xl bg-accent/15 text-accent-foreground grid place-items-center flex-shrink-0 border border-accent/20">
                    <SectionIcon className="size-4.5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground leading-tight">{s.title}</h2>
                </div>

                <ul className="space-y-3.5 pl-1.5">
                  {s.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 grid place-items-center flex-shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle2 className="size-3" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed font-semibold">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Right Column: Visual Highlights Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Service Conditions Summary */}
          <div className="card-premium p-6 relative group overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="w-full flex items-center justify-between border-b border-border/50 pb-3.5 mb-4 select-none">
              <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">Contract Terms</span>
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>

            <div className="space-y-5">
              {[
                { 
                  title: "Absolute Timer Lock", 
                  desc: "Early unsealing requests are physically impossible. Timer constraints are server-enforced and zero-override.", 
                  icon: Clock,
                  tone: "bg-amber-50 text-amber-600 border border-amber-100"
                },
                { 
                  title: "Safe Use Warning", 
                  desc: "Do not store passwords for critical, banking, or business-critical accounts. Use strictly for distractions.", 
                  icon: AlertOctagon,
                  tone: "bg-rose-50 text-rose-600 border border-rose-100"
                },
                { 
                  title: "Limitation of Liability", 
                  desc: "Provided for self-discipline, with zero commercial warranties. You accept absolute responsibility for forgotten passwords.", 
                  icon: Scale,
                  tone: "bg-blue-50 text-blue-600 border border-blue-100"
                }
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div key={i} className="flex gap-3.5 items-start">
                    <div className={`size-10 rounded-2xl ${item.tone} grid place-items-center flex-shrink-0 shadow-sm`}>
                      <ItemIcon className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-xs tracking-wide uppercase text-foreground">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-normal font-semibold">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLA Terms Support */}
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 p-5 relative overflow-hidden group select-none">
            <span className="absolute -right-3 -bottom-6 text-7xl font-extrabold text-primary/5 select-none group-hover:scale-110 transition-transform duration-300">📜</span>
            <div className="flex gap-3">
              <Mail className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground">Terms Support</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Need custom enterprise compliance details or open-source legal audits? Drop us a line at <strong className="text-primary hover:underline">support.timevault@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick link button to Home */}
          <Button variant="outline" asChild className="rounded-full w-full font-bold select-none hover:bg-muted/70">
            <Link to="/" className="inline-flex items-center justify-center gap-1.5">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
