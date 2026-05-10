export async function encryptPassword(password) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(password)
  )
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    key: btoa(String.fromCharCode(...new Uint8Array(exportedKey))),
  }
}

export async function decryptPassword({ encrypted, iv, key }) {
  const dec = new TextDecoder()
  const rawKey = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(atob(key), (c) => c.charCodeAt(0)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)) },
    rawKey,
    Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0))
  )
  return dec.decode(decrypted)
}
