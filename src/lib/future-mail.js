const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callFutureMail(token, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/future-mail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const createFutureMail = (token, data) => callFutureMail(token, { action: 'create', ...data })
export const getFutureMails = (token) => callFutureMail(token, { action: 'list' })
export const deleteFutureMail = (token, mailId) => callFutureMail(token, { action: 'delete', mailId })

