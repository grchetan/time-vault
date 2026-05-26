import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  Shield, KeyRound, Sparkles, Database, EyeOff, Mail,
  CheckCircle2, ArrowLeft, UserCheck, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/privacy')({ component: PrivacyPage });

function PrivacyPage() {
  const sections = [
    {
      title: "1. Data Collection Protocols",
      icon: Database,
      points: [
        "We collect only the absolute minimum required to authenticate and deliver your data.",
        "Your Email Address is securely stored within Google Firebase Authentication.",
        "Your Password Credentials are encrypted client-side and saved as raw ciphertext payloads in Supabase.",
        "Your Future Letters are locked and scheduled, remaining completely sealed until the selected delivery timestamp."
      ]
    },
    {
      title: "2. How Your Data is Used",
      icon: UserCheck,
      points: [
        "We use your details strictly to provide password decryption timers and deliver letters from your past self.",
        "No advertisement scripts, analytics trackers, or commercial pixels are loaded on this application.",
        "We never sell, share, trade, or distribute your email address or locked data with any third-party."
      ]
    },
    {
      title: "3. End-to-End Client Encryption",
      icon: KeyRound,
      points: [
        "All credentials undergo local AES-256-GCM encryption in your browser before transmitting to databases.",
        "Decryption keys remain strictly inside your memory. Not even support or database administrators can inspect your secrets.",
        "Our lock enforcement is embedded as a database constraint — bypass or early reveal is physically impossible."
      ]
    },
    {
      title: "4. Infrastructure Partners",
      icon: Shield,
      points: [
        "Authentication is securely processed by Google Firebase Identity Services.",
        "Encrypted records and database engines are hosted by Supabase Inc.",
        "Future mail deliveries are scheduled and sent securely using Resend SMTP infrastructure."
      ]
    },
    {
      title: "5. Right to Instant Erasure",
      icon: Trash2,
      points: [
        "You retain complete, absolute ownership of your credentials and letters.",
        "You can securely delete any active vault item or pending future letter from your dashboard at any time.",
        "To permanently purge your account, profile, and all backup databases, email support.timevault@gmail.com."
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft/80 border border-primary/20 text-xs font-bold text-primary shadow-sm tracking-wide uppercase">
            <Shield className="size-3.5" />
            Security Shield
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm border border-border/50">
            Last Updated: May 2026
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed font-semibold">
          Your willpower contract is backed by absolute mathematical isolation. Here is exactly how we secure, isolate, and respect your attention data.
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
                <div className="absolute inset-y-0 left-0 w-1 bg-primary/40 pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4 select-none">
                  <div className="size-9 rounded-xl bg-primary-soft/80 text-primary grid place-items-center flex-shrink-0 border border-primary/10">
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

        {/* Right Column: Visual Trust Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trust Guarantees */}
          <div className="card-premium p-6 relative group overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="w-full flex items-center justify-between border-b border-border/50 pb-3.5 mb-4 select-none">
              <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">Privacy Highlights</span>
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>

            <div className="space-y-5">
              {[
                { 
                  title: "AES-256 Client Shield", 
                  desc: "All credentials are encrypted in your local memory before database transmission. Not even support can read your contents.", 
                  icon: KeyRound,
                  tone: "bg-violet-50 text-violet-600 border border-violet-100"
                },
                { 
                  title: "Zero-Knowledge Promise", 
                  desc: "Locks cannot be unsealed early under any circumstances. The contract is server-enforced and absolute.", 
                  icon: EyeOff,
                  tone: "bg-blue-50 text-blue-600 border border-blue-100"
                },
                { 
                  title: "100% Ad-Free Ecosystem", 
                  desc: "Zero trackers, advertisement scripts, tracking cookies, or profiling systems loaded on our servers.", 
                  icon: Shield,
                  tone: "bg-rose-50 text-rose-600 border border-rose-100"
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

          {/* Privacy SLA Guarantee */}
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 p-5 relative overflow-hidden group select-none">
            <span className="absolute -right-3 -bottom-6 text-7xl font-extrabold text-primary/5 select-none group-hover:scale-110 transition-transform duration-300">📜</span>
            <div className="flex gap-3">
              <Mail className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground">Privacy Queries</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Have inquiries regarding row-level access permissions or security logs? Write directly to <strong className="text-primary hover:underline">support.timevault@gmail.com</strong>.
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
