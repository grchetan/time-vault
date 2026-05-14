import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Clock } from 'lucide-react';

export const Route = createFileRoute('/about')({ component: AboutPage });

const values = [
  {
    icon: Brain,
    title: 'Built on willpower, not willforce',
    body: "The hardest part isn't blocking — it's the moment you almost cave. We just make that moment harder to act on.",
  },
  {
    icon: Clock,
    title: 'Real timers, real waits',
    body: "Our locks aren't a feature flag in your browser. They're a database promise. No bypass exists.",
  },
  {
    icon: Heart,
    title: 'Gentle, by design',
    body: "Soft pastels, friendly characters, no scary metaphors. Discipline doesn't have to feel like a prison.",
  },
];

function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-5 py-20">
      <h1 className="text-4xl md:text-5xl font-bold">About TimeVault</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        TimeVault was born from a tired evening — the kind where you swear you
        only opened your phone "for a second" and emerged forty minutes later,
        without remembering a single thing you saw.
      </p>
      <p className="mt-4 text-muted-foreground">
        We didn't want another aggressive blocker that punishes you. We wanted a
        small, kind ritual: hand over the password, set a timer, walk away. The
        vault holds it. The clock decides. You're free.
      </p>
      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div
              key={v.title}
              className="rounded-3xl bg-card border border-border p-7 shadow-card"
            >
              <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
                <Icon className="size-6" />
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.body}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-14 text-center">
        <Button asChild size="lg" className="rounded-full">
          <Link to="/login">Try it yourself</Link>
        </Button>
      </div>
    </div>
  );
}
