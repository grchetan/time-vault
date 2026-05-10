import { useState, useEffect } from 'react'
import { decryptPassword } from '../lib/crypto'
import { db } from '../lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

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

export default function VaultCard({ vault }) {
  const [now, setNow] = useState(Date.now())
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [copied, setCopied] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notified, setNotified] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const isUnlocked = now >= vault.unlockAt
  const remaining = Math.max(0, vault.unlockAt - now)

  // Email notification when vault unlocks
  useEffect(() => {
    if (isUnlocked && !notified) {
      setNotified(true)
      sendEmailNotification(vault)
    }
  }, [isUnlocked])

  const sendEmailNotification = async (vault) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    if (!serviceId || !templateId || !publicKey) return
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            vault_name: vault.name,
            unlock_date: new Date(vault.unlockAt).toLocaleDateString('en-IN'),
            to_email: import.meta.env.VITE_NOTIFICATION_EMAIL || '',
          }
        })
      })
    } catch (e) { /* silent fail */ }
  }

  const handleReveal = async (pwIndex) => {
    if (!isUnlocked) return
    if (revealedPasswords[pwIndex] !== undefined) {
      setRevealedPasswords(r => { const n = { ...r }; delete n[pwIndex]; return n })
      return
    }
    const pwData = vault.passwords[pwIndex]
    const pass = await decryptPassword(pwData)
    setRevealedPasswords(r => ({ ...r, [pwIndex]: pass }))
  }

  const handleCopy = (id, pass) => {
    navigator.clipboard.writeText(pass)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this vault? This cannot be undone.\nKya aap sure hain?')) return
    setDeleting(true)
    await deleteDoc(doc(db, 'vaults', vault.id))
  }

  // Support old single-password format
  const passwords = vault.passwords || [{
    label: 'Password',
    encrypted: vault.encrypted,
    iv: vault.iv,
    key: vault.key,
  }]

  return (
    <div className={'vault-card' + (isUnlocked ? ' unlocked' : '')}>
      <CountdownRing unlockAt={vault.unlockAt} createdAt={vault.createdAt} />
      <div className="vault-info">
        <div className="vault-info-top">
          <div>
            <div className="vault-name">{vault.name}</div>
            <div className="vault-date">
              {vault.durationLabel || (vault.days + ' days')} lock
              {' · '}locked {new Date(vault.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {vault.reason ? (
              <div className="vault-reason">"{vault.reason}"</div>
            ) : null}
          </div>
          <button className="card-del" onClick={handleDelete} disabled={deleting} title="Delete vault">×</button>
        </div>

        {isUnlocked ? (
          <>
            <span className="badge badge-success">Unlocked</span>
            {passwords.map((pw, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {passwords.length > 1 && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
                    {pw.label}
                  </div>
                )}
                {revealedPasswords[i] !== undefined && (
                  <div className="pass-box">
                    <span className="pass-text">{revealedPasswords[i]}</span>
                    <button className="pass-copy" onClick={() => handleCopy(i, revealedPasswords[i])}>
                      {copied === i ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                <button className="btn btn-outline"
                  style={{ fontSize: 13, padding: '5px 12px', marginTop: 4 }}
                  onClick={() => handleReveal(i)}>
                  {revealedPasswords[i] !== undefined ? 'Hide' : 'Show password'}
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="vault-countdown">{formatCountdown(remaining)}</div>
            <div className="vault-unlock-date">
              Unlocks {new Date(vault.unlockAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {remaining < 3600000 && remaining > 0 ? (
                ' · ' + Math.floor(remaining / 60000) + 'm ' + Math.floor((remaining % 60000) / 1000) + 's'
              ) : ''}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
