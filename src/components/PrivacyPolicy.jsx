export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <button className="btn btn-outline" style={{ marginBottom: '1.5rem', fontSize: 13 }} onClick={onBack}>
        ← Back
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: May 2025</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>1. Data We Collect</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          We collect only the minimum data required to operate Time Vault:<br />
          • <strong>Email address</strong> — for account login (stored in Firebase Authentication)<br />
          • <strong>Encrypted vault data</strong> — your passwords are encrypted with AES-256 before being stored. We cannot read them.<br />
          • <strong>Timer data</strong> — lock/unlock timestamps for each vault
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>2. How We Use Your Data</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Your data is used solely to provide the Time Vault service — to store and retrieve your locked passwords after the timer expires. We do not sell, share, or use your data for advertising.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>3. Security / Suraksha</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          All passwords are encrypted using AES-256-GCM encryption on your device before being sent to our servers. Even we cannot decrypt your passwords. The encryption key is stored alongside the encrypted data, accessible only to you when the timer expires.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>4. Third-Party Services</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          We use <strong>Firebase (Google)</strong> for authentication and database. Firebase has its own privacy policy at firebase.google.com. We do not use any advertising or tracking services.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>5. Data Deletion</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          You can delete any vault at any time from the app. To delete your account and all associated data, contact us at the GitHub page below.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>6. Contact</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          For any privacy concerns, open an issue on GitHub:<br />
          <a href="https://github.com/grchetan" target="_blank" rel="noopener noreferrer"
            style={{ color: '#1c1917', fontWeight: 500 }}>
            github.com/grchetan
          </a>
        </p>
      </div>
    </div>
  )
}
