import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Mail, MessageSquare, Send, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/contact')({ component: ContactPage });

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    // Build mailto URL — clean approach, no backend needed
    const subject = encodeURIComponent(`TimeVault Contact — from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:contact.chetanprajapat@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="container mx-auto max-w-5xl px-5 pt-16 pb-10">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-5">
            <MessageSquare className="size-3.5" />
            Get in touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Say <span className="text-gradient">hello</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            We're a tiny team and we read every message. Whether you have a feature
            idea, a bug report, or a story to share — we'd love to hear it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-5xl px-5 pb-24">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Contact form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="card-premium p-10 text-center animate-slide-up">
                <div className="size-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 grid place-items-center mb-5">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message sent!</h3>
                <p className="text-muted-foreground text-sm">
                  Your email client should have opened. We'll reply as soon as possible.
                </p>
                <button
                  className="mt-6 text-sm text-primary hover:underline"
                  onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="card-premium p-8 space-y-5"
              >
                <h2 className="text-lg font-semibold mb-1">Send us a message</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Your name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Shah"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Your message</Label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Tell us what's on your mind — feature ideas, bugs, stories, anything…"
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors"
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">{message.length} characters</div>
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all duration-200 group"
                >
                  <Send className="size-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                  Send message
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="md:col-span-2 space-y-5">
            <a
              href="mailto:contact.chetanprajapat@gmail.com"
              className="card-premium p-6 flex gap-4 items-start group"
            >
              <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email us directly</h3>
                <p className="text-sm text-primary hover:underline break-all">
                  contact.chetanprajapat@gmail.com
                </p>
              </div>
            </a>

            <div className="card-premium p-6 flex gap-4 items-start">
              <div className="size-11 rounded-2xl bg-mint text-mint-foreground grid place-items-center flex-shrink-0">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us what's working — and what isn't. We iterate fast and genuinely love hearing from users.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary-soft/60 border border-primary/15 px-5 py-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Response time:</span> We typically reply within 24–48 hours. For urgent issues, please include "URGENT" in your subject line.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
