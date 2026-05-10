import { useState } from 'react'
import { auth } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email aur password zaroori hai.'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Yeh email pehle se registered hai.',
        'auth/invalid-email': 'Email sahi nahi hai.',
        'auth/weak-password': 'Password kam se kam 6 characters ka hona chahiye.',
        'auth/invalid-credential': 'Email ya password galat hai.',
        'auth/user-not-found': 'Koi account nahi mila is email pe.',
        'auth/wrong-password': 'Password galat hai.',
      }
      setError(msgs[e.code] || 'Kuch galat hua. Dobara try karo.')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="auth-title">Time Vault</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Log in to access your locked passwords.'
            : 'Create an account to start locking passwords.'}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <div className="input-wrap">
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button className="input-eye" onClick={() => setShowPass(s => !s)} type="button">
              {showPass ? '○' : '●'}
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginBottom: '1rem' }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>

        <div className="divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716c' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#1c1917', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}
