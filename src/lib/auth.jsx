import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, persistenceReady } from './firebase'

const Ctx = createContext({ user: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for persistence to be set before subscribing to auth state.
    // This prevents a flash of the logged-out state on first load.
    let unsub = () => {}
    persistenceReady.then(() => {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      })
    })
    return () => unsub()
  }, [])

  return (
    <Ctx.Provider value={{ user, loading, signOut: () => signOut(auth) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
