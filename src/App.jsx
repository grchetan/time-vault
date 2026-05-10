import { useState, useEffect } from 'react'
import { auth } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from './components/Auth'
import Vault from './components/Vault'
import PrivacyPolicy from './components/PrivacyPolicy'
import Terms from './components/Terms'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('home') // 'home' | 'privacy' | 'terms'
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('timevault_dark') === 'true'
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('timevault_dark', darkMode)
  }, [darkMode])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  if (page === 'privacy') return <PrivacyPolicy onBack={() => setPage('home')} />
  if (page === 'terms') return <Terms onBack={() => setPage('home')} />

  if (!user) return <Auth />

  return (
    <Vault
      user={user}
      darkMode={darkMode}
      toggleDark={() => setDarkMode(d => !d)}
      onPrivacy={() => setPage('privacy')}
      onTerms={() => setPage('terms')}
    />
  )
}
