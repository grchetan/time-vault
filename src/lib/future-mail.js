import { auth } from './firebase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callFutureMail(body) {
  const token = await auth.currentUser.getIdToken()
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

export const createFutureMail = (data) => callFutureMail({ action: 'create', ...data })
export const getFutureMails = () => callFutureMail({ action: 'list' })
export const deleteFutureMail = (mailId) => callFutureMail({ action: 'delete', mailId })
