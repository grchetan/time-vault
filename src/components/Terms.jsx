export default function Terms({ onBack }) {
  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <button className="btn btn-outline" style={{ marginBottom: '1.5rem', fontSize: 13 }} onClick={onBack}>
        ← Back
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: May 2025</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>1. Acceptance of Terms</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          By using Time Vault, you agree to these terms. If you do not agree, please do not use the service.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>2. Service Description</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Time Vault is a self-discipline tool that allows you to lock passwords behind a timer. The service is provided as-is for personal use. Time Vault is a tool to help you — it is not a replacement for a proper password manager.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>3. Your Responsibility / Aapki Zimmedari</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          • You are responsible for keeping your account credentials safe.<br />
          • Once a password is locked, it cannot be recovered before the timer ends — not even by us.<br />
          • Always change your app password after locking it in Time Vault.<br />
          • We are not responsible for any loss of access to your accounts.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>4. Prohibited Use</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          You may not use Time Vault to store passwords of accounts that do not belong to you, or for any illegal purpose.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>5. Limitation of Liability</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Time Vault is provided free of charge. We are not liable for any damages, loss of data, or loss of account access arising from use of this service.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>6. Contact</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Questions? Open an issue on GitHub:<br />
          <a href="https://github.com/grchetan" target="_blank" rel="noopener noreferrer"
            style={{ color: '#1c1917', fontWeight: 500 }}>
            github.com/grchetan
          </a>
        </p>
      </div>
    </div>
  )
}
