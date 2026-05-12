import { useState } from 'react'
import { auth } from '../lib/firebase'
import { createVault } from '../lib/vault'
import { encryptPassword } from '../lib/crypto'

const MINUTE_DURATIONS = [
  { label: '1 Min', ms: 60000 },
  { label: '2 Min', ms: 120000 },
  { label: '5 Min', ms: 300000 },
  { label: '10 Min', ms: 600000 },
]

const DAY_DURATIONS = [
  { label: '1 Day', ms: 86400000 },
  { label: '7 Days', ms: 7 * 86400000 },
  { label: '30 Days', ms: 30 * 86400000 },
  { label: '6 Months', ms: 180 * 86400000 },
  { label: '1 Year', ms: 365 * 86400000 },
]

export default function AddVault({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [passwords, setPasswords] = useState([{ value: '', show: false, label: '' }])
  const [reason, setReason] = useState('')
  const [durationMs, setDurationMs] = useState(30 * 86400000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [durationMode, setDurationMode] = useState('days')

  const updatePassword = (i, field, val) => {
    setPasswords(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const getDurationLabel = () => {
    const all = [...MINUTE_DURATIONS, ...DAY_DURATIONS]
    return all.find(d => d.ms === durationMs)?.label || ''
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('App name zaroori hai.'); return }
    if (passwords.some(p => !p.value.trim())) { setError('Koi bhi password field khali nahi honi chahiye.'); return }
    setLoading(true); setError('')
    try {
      // Encrypt each password client-side with AES-256
      const encryptedPasswords = await Promise.all(
        passwords.map(async (p, i) => ({
          label: p.label.trim() || ('Password ' + (i + 1)),
          ...(await encryptPassword(p.value))
        }))
      )

      const token = await auth.currentUser.getIdToken()
      const vault = await createVault(token, {
        name: name.trim(),
        reason: reason.trim(),
        unlockAt: Date.now() + durationMs,
        durationLabel: getDurationLabel(),
        passwords: encryptedPasswords,
      })

      onAdded(vault.vault)
      onClose()
    } catch (e) {
      setError('Save nahi hua: ' + e.message)
      setLoading(false)
    }
  }

  const allDurations = durationMode === 'mins' ? MINUTE_DURATIONS : DAY_DURATIONS

  return (
    <div className="add-form">
      <div className="add-form-title">Lock a New Password</div>

      <div className="field">
        <label>App / Account name</label>
        <input className="input" placeholder="e.g. Snapchat, Instagram"
          value={name} onChange={e => setName(e.target.value)} />
      </div>

      {passwords.map((p, i) => (
        <div className="field" key={i}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{passwords.length > 1 ? ('Password ' + (i + 1)) : 'Password to lock'}</span>
            {passwords.length > 1 && (
              <button onClick={() => setPasswords(prev => prev.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                Remove
              </button>
            )}
          </label>
          {passwords.length > 1 && (
            <input className="input" placeholder="Label (e.g. Main, Backup)"
              value={p.label} onChange={e => updatePassword(i, 'label', e.target.value)}
              style={{ marginBottom: 6 }} />
          )}
          <div className="input-wrap">
            <input className="input" type={p.show ? 'text' : 'password'}
              placeholder="Enter password to lock"
              value={p.value} onChange={e => updatePassword(i, 'value', e.target.value)} />
            <button className="input-eye" onClick={() => updatePassword(i, 'show', !p.show)} type="button">
              {p.show ? '○' : '●'}
            </button>
          </div>
        </div>
      ))}

      {passwords.length < 5 && (
        <button className="btn btn-outline" style={{ fontSize: 13, marginBottom: '1rem', padding: '6px 14px' }}
          onClick={() => setPasswords(prev => [...prev, { value: '', show: false, label: '' }])}>
          + Add another password
        </button>
      )}

      <div className="field">
        <label>Reason (optional)</label>
        <input className="input" placeholder="e.g. Social media se door rehna chahta hoon"
          value={reason} onChange={e => setReason(e.target.value)} />
      </div>

      <div className="field">
        <label>Lock duration</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className={'dur-btn ' + (durationMode === 'mins' ? 'active' : '')}
            onClick={() => { setDurationMode('mins'); setDurationMs(60000) }}>Minutes</button>
          <button className={'dur-btn ' + (durationMode === 'days' ? 'active' : '')}
            onClick={() => { setDurationMode('days'); setDurationMs(30 * 86400000) }}>Days</button>
        </div>
        <div className="duration-grid">
          {allDurations.map(d => (
            <button key={d.ms} className={'dur-btn ' + (durationMs === d.ms ? 'active' : '')}
              onClick={() => setDurationMs(d.ms)}>{d.label}</button>
          ))}
        </div>
      </div>

      <div className="warn-box">
        <strong>Warning:</strong> Once locked, password cannot be seen for <strong>{getDurationLabel()}</strong> — server pe lock hoga, koi nahi tod sakta.
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="row">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Locking...' : ('Lock for ' + getDurationLabel())}
        </button>
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </div>
  )
}
