import { useState } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { encryptPassword } from '../lib/crypto'

const DURATIONS = [
  { label: '1 Day', days: 1 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
]

export default function AddVault({ onClose }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [days, setDays] = useState(30)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim() || !password.trim()) {
      setError('App name aur password dono zaroori hain.')
      return
    }
    setLoading(true); setError('')
    try {
      const enc = await encryptPassword(password)
      await addDoc(collection(db, 'vaults'), {
        uid: auth.currentUser.uid,
        name: name.trim(),
        createdAt: Date.now(),
        unlockAt: Date.now() + days * 86400000,
        days,
        ...enc,
      })
      onClose()
    } catch (e) {
      setError('Save nahi hua. Internet check karo aur dobara try karo.')
      setLoading(false)
    }
  }

  return (
    <div className="add-form">
      <div className="add-form-title">Lock a New Password</div>

      <div className="field">
        <label>App / Account name</label>
        <input
          className="input"
          placeholder="e.g. Snapchat, Instagram"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Password to lock</label>
        <div className="input-wrap">
          <input
            className="input"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter the password you want to lock"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="input-eye" onClick={() => setShowPass(s => !s)} type="button">
            {showPass ? '○' : '●'}
          </button>
        </div>
      </div>

      <div className="field">
        <label>Lock duration / Kitne din ke liye?</label>
        <div className="duration-grid">
          {DURATIONS.map(d => (
            <button
              key={d.days}
              className={`dur-btn ${days === d.days ? 'active' : ''}`}
              onClick={() => setDays(d.days)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="warn-box">
        <strong>Warning:</strong> Once locked, this password cannot be seen for {days} days — not even by you.
        <br />
        <strong>Dhyan de:</strong> Lock hone ke baad {days} din tak password nahi dikhega — aapko bhi nahi.
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="row">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Locking...' : `Lock for ${days} days`}
        </button>
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  )
}
