const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callVault(firebaseToken, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${firebaseToken}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const createVault = (token, data) => callVault(token, { action: 'create', ...data })
export const getVaults = (token) => callVault(token, { action: 'list' })
export const revealPassword = (token, vaultId) => callVault(token, { action: 'reveal', vaultId })
export const deleteVault = (token, vaultId) => callVault(token, { action: 'delete', vaultId })
