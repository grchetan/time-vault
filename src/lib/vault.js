// Server-side vault operations via Supabase Edge Function
// Timer check happens on SERVER - not in browser
// Nobody can bypass this - not even the admin

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export async function createVault(firebaseToken, vaultData) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ action: 'create', ...vaultData }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getVaults(firebaseToken) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ action: 'list' }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function revealPassword(firebaseToken, vaultId) {
  // Server checks timer - if not expired, returns error
  // Client CANNOT bypass this
  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ action: 'reveal', vaultId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Server ne password dene se mana kar diya')
  }
  return res.json()
}

export async function deleteVault(firebaseToken, vaultId) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ action: 'delete', vaultId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
