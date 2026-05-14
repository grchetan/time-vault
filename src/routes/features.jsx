import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Shield, Clock, Smile, Bell, Eye, Sparkles } from "lucide-react";

export const Route = createFileRoute("/features")({ component: FeaturesPage });

const features = [
  { icon: Lock,     title: "Time-Locked Vault",    body: "Hand over distracting passwords for 1 day, 7 days, 30 days, months or years. The vault keeps them sealed until time is up." },
  { icon: Eye,      title: "Truly hidden",          body: "Locked passwords are unreadable until the unlock moment — protected at the database level, not just by hiding the input." },
  { icon: Mail,     title: "Future Mail",           body: "Write a letter, pick any future date and email. We'll deliver it on time, exactly as you wrote it." },
  { icon: Shield,   title: "Private by default",    body: "Each user only sees their own vault and mail. Strict access rules prevent any data crossover." },
  { icon: Clock,    title: "Honest timers",         body: "Live countdowns to the second. No early peeks, no bypass options." },
  { icon: Bell,     title: "Email when it lands",   body: "When a Future Mail's time arrives, it's delivered to your inbox — no missed notes." },
  { icon: Smile,    title: "Calm UI",               body: "Soft pastels and friendly characters keep self-discipline from feeling like punishment." },
  { icon: Sparkles, title: "One account, everything", body: "Your locks and letters all live in one place, tied to the same login. No confusing dashboards." },
];

function FeaturesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-5 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Everything in TimeVault</h1>
        <p className="mt-4 text-muted-foreground">A small surface area, on purpose. Just enough to change your week.</p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-3xl bg-card border border-border p-6 shadow-card">
              <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-14 text-center">
        <Button asChild size="lg" className="rounded-full"><Link to="/login">Open your vault</Link></Button>
      </div>
    </div>
  );
}
