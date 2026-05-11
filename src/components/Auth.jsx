import { useState } from 'react'
import { auth } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const provider = new GoogleAuthProvider()

export default function Auth() {
  const [mode, setMode] = useState('login') // login | signup | forgot
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const errMsg = (code) => ({
    'auth/email-already-in-use': 'Yeh email pehle se registered hai.',
    'auth/invalid-email': 'Email sahi nahi hai.',
    'auth/weak-password': 'Password kam se kam 6 characters ka hona chahiye.',
    'auth/invalid-credential': 'Email ya password galat hai.',
    'auth/user-not-found': 'Is email pe koi account nahi mila.',
    'auth/wrong-password': 'Password galat hai.',
    'auth/too-many-requests': 'Bahut zyada attempts. Thodi der baad try karo.',
    'auth/popup-closed-by-user': 'Google login cancel ho gaya.',
  })[code] || 'Kuch galat hua. Dobara try karo.'

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (mode === 'forgot') {
      if (!email) { setError('Email daalo.'); return }
      setLoading(true)
      try {
        await sendPasswordResetEmail(auth, email)
        setSuccess('Password reset email bhej diya! Inbox check karo.')
      } catch (e) { setError(errMsg(e.code)) }
      setLoading(false); return
    }
    if (!email || !password) { setError('Email aur password zaroori hai.'); return }
    if (mode === 'signup' && !name.trim()) { setError('Naam zaroori hai.'); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name.trim() })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (e) { setError(errMsg(e.code)); setLoading(false) }
  }

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true)
    try {
      await signInWithPopup(auth, provider)
    } catch (e) { setError(errMsg(e.code)); setGoogleLoading(false) }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  const switchMode = (m) => { setMode(m); setError(''); setSuccess('') }

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="auth-title">Time Vault</h1>
        <p className="auth-subtitle">
          {mode === 'login' && 'Welcome back! Log in to your account.'}
          {mode === 'signup' && 'Create an account to start locking passwords.'}
          {mode === 'forgot' && 'Enter your email to reset your password.'}
        </p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {mode === 'signup' && (
          <div className="field">
            <label>Full Name</label>
            <input className="input" placeholder="Apna naam likho" value={name}
              onChange={e => setName(e.target.value)} onKeyDown={handleKey} autoComplete="name" />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} autoComplete="email" />
        </div>

        {mode !== 'forgot' && (
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ margin: 0 }}>Password</label>
              {mode === 'login' && (
                <button onClick={() => switchMode('forgot')}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              )}
            </div>
            <div className="input-wrap">
              <input className="input" type={showPass ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              <button className="input-eye" onClick={() => setShowPass(s => !s)} type="button">
                {showPass ? '○' : '●'}
              </button>
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}
          style={{ marginBottom: '0.75rem' }}>
          {loading ? 'Please wait...' :
            mode === 'login' ? 'Log In' :
            mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
        </button>

        {mode !== 'forgot' && (
          <>
            <div className="divider">or</div>
            <button className="btn btn-google btn-full" onClick={handleGoogle} disabled={googleLoading}
              style={{ marginBottom: '1rem' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {googleLoading ? 'Please wait...' : 'Continue with Google'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {mode === 'login' && <>Don't have an account?{' '}
            <button onClick={() => switchMode('signup')} className="link-btn">Sign Up</button></>}
          {mode === 'signup' && <>Already have an account?{' '}
            <button onClick={() => switchMode('login')} className="link-btn">Log In</button></>}
          {mode === 'forgot' && <>Remember it?{' '}
            <button onClick={() => switchMode('login')} className="link-btn">Back to Login</button></>}
        </p>
      </div>
    </div>
  )
}
