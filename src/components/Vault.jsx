import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { getVaults } from '../lib/vault'
import VaultCard from './VaultCard'
import AddVault from './AddVault'

export default function Vault({ user, darkMode, toggleDark, onPrivacy, onTerms }) {
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState('')

  const displayName = user.displayName || user.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const fetchVaults = async () => {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await getVaults(token)
      setVaults(res.vaults || [])
    } catch (e) {
      setError('Vaults load nahi hue: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchVaults() }, [])

  const handleAdded = (vault) => {
    setVaults(prev => [vault, ...prev])
  }

  const handleDeleted = (id) => {
    setVaults(prev => prev.filter(v => v.id !== id))
  }

  const unlockedCount = vaults.filter(v => Date.now() >= v.unlock_at).length

  return (
    <>
      <nav className="topnav">
        <span className="topnav-title">Time Vault</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-outline icon-btn" onClick={toggleDark} title="Toggle dark mode">
            {darkMode ? '☀' : '◑'}
          </button>
          <div style={{ position: 'relative' }}>
            <button className="avatar-btn" onClick={() => setMenuOpen(m => !m)}>
              {user.photoURL
                ? <img src={user.photoURL} alt={displayName} className="avatar-img" />
                : <div className="avatar-initials">{initials}</div>}
              <span className="avatar-name">{displayName}</span>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>▼</span>
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-user">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{user.email}</div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { setMenuOpen(false); onPrivacy() }}>Privacy Policy</button>
                <button className="dropdown-item" onClick={() => { setMenuOpen(false); onTerms() }}>Terms of Service</button>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={() => signOut(auth)}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="vault-header">
          <div>
            <div className="vault-title">Your Vaults</div>
            <div className="vault-meta">
              {loading ? 'Loading...' : (vaults.length + ' total · ' + unlockedCount + ' unlocked')}
            </div>
          </div>
          {!showAdd && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Lock</button>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {showAdd && <AddVault onClose={() => setShowAdd(false)} onAdded={handleAdded} />}

        {!loading && vaults.length === 0 && !showAdd && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="36" height="36" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="empty-title">No vaults yet</div>
            <div className="empty-desc">
              Lock your first password behind a timer.<br/>
              Server pe lock hoga — koi nahi tod sakta!
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Lock your first password
            </button>
          </div>
        )}

        {!loading && vaults.length > 0 && (
          <div className="vault-list">
            {vaults.map(vault => (
              <VaultCard key={vault.id} vault={vault} onDeleted={handleDeleted} />
            ))}
          </div>
        )}

        <div className="footer">
          <span>AES-256 + Server-side lock · Koi nahi tod sakta</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <button onClick={onPrivacy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12 }}>Privacy</button>
          <span style={{ margin: '0 8px' }}>·</span>
          <button onClick={onTerms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12 }}>Terms</button>
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="https://github.com/grchetan" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-tertiary)', fontSize: 12, textDecoration: 'none' }}>
            Built by grchetan
          </a>
        </div>
      </div>
    </>
  )
}
