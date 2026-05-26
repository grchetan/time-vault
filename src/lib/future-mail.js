const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

async function callFutureMail(token, body) {
  // ── Auth Diagnostics ──────────────────────────────────────────────
  console.log(`[FUTURE-MAIL API] action="${body.action}" | token_present=${!!token} | token_len=${token?.length ?? 0}`)

  const res = await fetch(`${SUPABASE_URL}/functions/v1/future-mail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Firebase JWT sent as Bearer for our custom verification inside the function
      'Authorization': `Bearer ${token}`,
      // Supabase anon key required by the API gateway regardless of JWT setting
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })

  console.log(`[FUTURE-MAIL API] action="${body.action}" → HTTP ${res.status} ${res.statusText}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    console.error(`[FUTURE-MAIL API] Error body:`, err)
    // Supabase gateway returns { message } while our code returns { error }
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const createFutureMail    = (token, data)   => callFutureMail(token, { action: 'create',           ...data })
export const getFutureMails      = (token)          => callFutureMail(token, { action: 'list'                     })
// Soft-delete (moves to trash, 30-day recovery)
export const deleteFutureMail    = (token, mailId)  => callFutureMail(token, { action: 'delete',           mailId  })
// Trash operations
export const getTrashMails       = (token)          => callFutureMail(token, { action: 'trash_list'               })
export const restoreMail         = (token, mailId)  => callFutureMail(token, { action: 'restore',          mailId  })
export const permanentDeleteMail = (token, mailId)  => callFutureMail(token, { action: 'permanent_delete', mailId  })
