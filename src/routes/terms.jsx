import { createFileRoute } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
export const Route = createFileRoute('/terms')({ component: TermsPage })
function TermsPage() {
  const sections = [
    { title: "1. Acceptance of Terms", body: "By using TimeVault, you agree to these terms. If you do not agree, please do not use the service." },
    { title: "2. Service Description", body: "TimeVault is a self-discipline tool to lock passwords behind a timer. Do not use it for banking, email, or any critical accounts." },
    { title: "3. Your Responsibility", body: "You are responsible for your account. Once a password is locked, it cannot be recovered before the timer ends — not even by us. Always change your app password after locking it here." },
    { title: "4. Prohibited Use", body: "You may not use TimeVault to store passwords of accounts that don't belong to you, for any illegal purpose, or in ways that harm others." },
    { title: "5. Limitation of Liability", body: "TimeVault is provided free of charge. We are not liable for damages, loss of data, or loss of account access. Use at your own risk." },
    { title: "6. Contact", body: "Questions? Email support.timevault@gmail.com or visit github.com/grchetan" },
  ]
  return (
    <div className="container mx-auto max-w-3xl px-5 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-accent text-accent-foreground grid place-items-center">
          <FileText className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
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
