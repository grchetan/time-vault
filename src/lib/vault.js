const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

async function callVault(firebaseToken, body) {
  // ── Auth Diagnostics ──────────────────────────────────────────────
  console.log(`[VAULT API] action="${body.action}" | token_present=${!!firebaseToken} | token_len=${firebaseToken?.length ?? 0}`)

  const res = await fetch(`${SUPABASE_URL}/functions/v1/vault`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Firebase JWT sent as Bearer for our custom verification inside the function
      'Authorization': `Bearer ${firebaseToken}`,
      // Supabase anon key required by the API gateway regardless of JWT setting
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })

  console.log(`[VAULT API] action="${body.action}" → HTTP ${res.status} ${res.statusText}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    console.error(`[VAULT API] Error body:`, err)
    // Supabase gateway returns { message } while our code returns { error }
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const createVault       = (token, data)    => callVault(token, { action: 'create',           ...data })
export const getVaults         = (token)           => callVault(token, { action: 'list'                     })
export const revealPassword    = (token, vaultId)  => callVault(token, { action: 'reveal',           vaultId })
// Soft-delete (moves to trash, 30-day recovery)
export const deleteVault       = (token, vaultId)  => callVault(token, { action: 'delete',           vaultId })
// Trash operations
export const getTrashVaults    = (token)           => callVault(token, { action: 'trash_list'               })
export const restoreVault      = (token, vaultId)  => callVault(token, { action: 'restore',          vaultId })
export const permanentDeleteVault = (token, vaultId) => callVault(token, { action: 'permanent_delete', vaultId })
