import { createFileRoute } from '@tanstack/react-router';
import { Mail, MessageSquare } from 'lucide-react';

export const Route = createFileRoute('/contact')({ component: ContactPage });

function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-5 py-20">
      <h1 className="text-4xl md:text-5xl font-bold">Say hello</h1>
      <p className="mt-4 text-muted-foreground">
        We're a tiny team and we read every message. Whether you have a feature
        idea, a bug report, or a story to share — we'd love to hear it.
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <a
          href="mailto:contact.chetanprajapat@gmail.com"
          className="rounded-3xl bg-card border border-border p-7 shadow-card hover:shadow-soft transition-shadow"
        >
          <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
            <Mail className="size-6" />
          </div>
          <h3 className="font-semibold">Email us</h3>
          <p className="text-sm text-muted-foreground mt-1">
            contact.chetanprajapat@gmail.com
          </p>
        </a>
        <div className="rounded-3xl bg-card border border-border p-7 shadow-card">
          <div className="size-12 rounded-2xl bg-mint text-mint-foreground grid place-items-center mb-4">
            <MessageSquare className="size-6" />
          </div>
          <h3 className="font-semibold">Feedback</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us what's working — and what isn't. We iterate fast.
          </p>
        </div>
      </div>
    </div>
  );
}
