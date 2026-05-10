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
  const r = 30
  const circ = 2 * Math.PI * r
  return (
    <div className="ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e7e5e4" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={unlocked ? '#22c55e' : '#d97706'}
          strokeWidth="5"
          strokeDasharray={`${circ * progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
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
  if (d > 0) return `${d}d ${h}h remaining`
  if (h > 0) return `${h}h ${m}m remaining`
  if (m > 0) return `${m}m ${sec}s remaining`
  return `${sec}s remaining`
}

export default function VaultCard({ vault }) {
  const [now, setNow] = useState(Date.now())
  const [revealed, setRevealed] = useState(false)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const isUnlocked = now >= vault.unlockAt
  const remaining = Math.max(0, vault.unlockAt - now)

  const handleReveal = async () => {
    if (!isUnlocked) return
    if (revealed) { setRevealed(false); setPassword(''); return }
    const pass = await decryptPassword(vault)
    setPassword(pass)
    setRevealed(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this vault? This cannot be undone.\nKya aap sure hain?')) return
    setDeleting(true)
    await deleteDoc(doc(db, 'vaults', vault.id))
  }

  return (
    <div className={`vault-card ${isUnlocked ? 'unlocked' : ''}`}>
      <CountdownRing unlockAt={vault.unlockAt} createdAt={vault.createdAt} />
      <div className="vault-info">
        <div className="vault-info-top">
          <div>
            <div className="vault-name">{vault.name}</div>
            <div className="vault-date">
              Locked on {new Date(vault.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}{vault.days} day lock
            </div>
          </div>
          <button className="card-del" onClick={handleDelete} disabled={deleting} title="Delete vault">
            ×
          </button>
        </div>

        {isUnlocked ? (
          <>
            <span className="badge badge-success">Unlocked</span>
            {revealed && (
              <div className="pass-box">
                <span className="pass-text">{password}</span>
                <button className="pass-copy" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
            <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={handleReveal}>
              {revealed ? 'Hide password' : 'Show password'}
            </button>
          </>
        ) : (
          <>
            <div className="vault-countdown">{formatCountdown(remaining)}</div>
            <div className="vault-unlock-date">
              Unlocks on {new Date(vault.unlockAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
