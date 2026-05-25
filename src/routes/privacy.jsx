import { createFileRoute } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
export const Route = createFileRoute('/privacy')({ component: PrivacyPage })
function PrivacyPage() {
  const sections = [
    { title: "1. Data We Collect", body: "We collect only the minimum required: your email address (stored in Firebase Authentication), AES-256 encrypted vault data (we cannot read your passwords), timer data (lock/unlock timestamps), and future mail content (stored until delivery date)." },
    { title: "2. How We Use Your Data", body: "Your data is used solely to provide the TimeVault service. We do not sell, share, or use your data for advertising or any other purpose." },
    { title: "3. Security", body: "All passwords are AES-256-GCM encrypted on your device before being sent to our servers. Even we cannot decrypt them. The timer is enforced server-side — it cannot be bypassed by any client." },
    { title: "4. Third-Party Services", body: "We use Firebase (Google) for authentication, Supabase for database and server functions, and Resend for future mail delivery. We do not use advertising or tracking services." },
    { title: "5. Data Deletion", body: "You can delete any vault or future mail from within the app at any time. To delete your full account and data, email support.timevault@gmail.com." },
    { title: "6. Contact", body: "For privacy concerns: support.timevault@gmail.com or github.com/grchetan" },
  ]
  return (
    <div className="container mx-auto max-w-3xl px-5 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center">
          <Shield className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Last updated: May 2025</p>
        </div>
      </div>
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
