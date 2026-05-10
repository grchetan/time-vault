import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import VaultCard from './VaultCard'
import AddVault from './AddVault'

export default function Vault({ user }) {
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'vaults'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setVaults(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [user.uid])

  const unlockedCount = vaults.filter(v => Date.now() >= v.unlockAt).length

  return (
    <>
      <nav className="topnav">
        <span className="topnav-title">Time Vault</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="topnav-user">{user.email}</span>
          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => signOut(auth)}>
            Log out
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="vault-header">
          <div>
            <div className="vault-title">Your Vaults</div>
            <div className="vault-meta">
              {loading ? 'Loading...' : `${vaults.length} total · ${unlockedCount} unlocked`}
            </div>
          </div>
          {!showAdd && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + New Lock
            </button>
          )}
        </div>

        {showAdd && <AddVault onClose={() => setShowAdd(false)} />}

        {!loading && vaults.length === 0 && !showAdd && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="36" height="36" fill="none" stroke="#a8a29e" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="empty-title">No vaults yet</div>
            <div className="empty-desc">
              Lock your first password behind a timer.<br/>
              Apna pehla password yahan lock karo.
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Lock your first password
            </button>
          </div>
        )}

        {!loading && vaults.length > 0 && (
          <div className="vault-list">
            {vaults.map(vault => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        )}

        {vaults.length > 0 && (
          <div className="footer">
            AES-256 encrypted · Stored securely in Firebase · Accessible from any device
          </div>
        )}
      </div>
    </>
  )
}
