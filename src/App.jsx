import { useState, useEffect } from 'react'
import { auth } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from './components/Auth'
import Vault from './components/Vault'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#78716c', fontSize: '14px' }}>
        Loading...
      </div>
    )
  }

  return user ? <Vault user={user} /> : <Auth />
}
