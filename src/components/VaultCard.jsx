import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { revealPassword, deleteVault } from '../lib/vault'
import { decryptPassword } from '../lib/crypto'

function CountdownRing({ unlockAt, createdAt }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const total = unlockAt - createdAt
  const remaining = Math.max(0, unlockAt - now)
  const progress = total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 1
  const unlocked = remaining <= 0
  const r = 30, circ = 2 * Math.PI * r
  return (
    <div className="ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--ring-bg)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none"
          stroke={unlocked ? '#22c55e' : '#d97706'}
          strokeWidth="5"
          strokeDasharray={(circ * progress) + ' ' + circ}
          strokeLinecap="round"
          transform="rotate(-90 36 36)" />
      </svg>
      <div className="ring-icon">
        {unlocked ? (
          <svg width="18" height="18" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
        ) : (
          <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}

function formatCountdown(ms) {
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return (d + 'd ' + h + 'h remaining')
  if (h > 0) return (h + 'h ' + m + 'm remaining')
  if (m > 0) return (m + 'm ' + sec + 's remaining')
  return (sec + 's remaining')
}

export default function VaultCard({ vault, onDeleted }) {
  const [now, setNow] = useState(Date.now())
  const [revealedPasswords, setRevealedPasswords] = useState(null)
  const [copied, setCopied] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const isUnlocked = now >= vault.unlock_at
  const remaining = Math.max(0, vault.unlock_at - now)

  const handleReveal = async () => {
    if (revealedPasswords) { setRevealedPasswords(null); return }
    setLoading(true); setError('')
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await revealPassword(token, vault.id)
      
      // Server returns encrypted passwords — decrypt on client
      const decrypted = await Promise.all(
        res.passwords.map(async (pw) => {
          const plaintext = await decryptPassword({
            encrypted: pw.encrypted,
            iv: pw.iv,
            key: pw.key,
          })
          return { label: pw.label, text: plaintext }
        })
      )
      setRevealedPasswords(decrypted)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this vault?\nKya aap sure hain?')) return
    setDeleting(true)
    try {
      const token = await auth.currentUser.getIdToken()
      await deleteVault(token, vault.id)
      onDeleted(vault.id)
    } catch (e) {
      setError(e.message)
      setDeleting(false)
    }
  }

  const handleCopy = (i, text) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={'vault-card' + (isUnlocked ? ' unlocked' : '')}>
      <CountdownRing unlockAt={vault.unlock_at} createdAt={vault.created_at} />
      <div className="vault-info">
        <div className="vault-info-top">
          <div>
            <div className="vault-name">{vault.name}</div>
            <div className="vault-date">
              {vault.duration_label} lock · {new Date(vault.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {vault.reason ? <div className="vault-reason">"{vault.reason}"</div> : null}
          </div>
          <button className="card-del" onClick={handleDelete} disabled={deleting}>×</button>
        </div>

        {error && <div className="error-msg" style={{ fontSize: 12, marginBottom: 8 }}>{error}</div>}

        {isUnlocked ? (
          <>
            <span className="badge badge-success">Unlocked</span>
            {revealedPasswords && revealedPasswords.map((pw, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {revealedPasswords.length > 1 && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
                    {pw.label}
                  </div>
                )}
                <div className="pass-box">
                  <span className="pass-text">{pw.text}</span>
                  <button className="pass-copy" onClick={() => handleCopy(i, pw.text)}>
                    {copied === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: 13, padding: '5px 12px' }}
              onClick={handleReveal} disabled={loading}>
              {loading ? 'Loading...' : revealedPasswords ? 'Hide' : 'Show password'}
            </button>
          </>
        ) : (
          <>
            <div className="vault-countdown">{formatCountdown(remaining)}</div>
            <div className="vault-unlock-date">
              Unlocks {new Date(vault.unlock_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
