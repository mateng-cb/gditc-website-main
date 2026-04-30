const MEMBER_JWT_KEY = 'gditc_member_jwt'

export function getStrapiApiBase() {
  const raw = (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api').trim()
  const noSlash = raw.replace(/\/$/, '')
  if (noSlash.endsWith('/api')) return noSlash
  return `${noSlash}/api`
}

export function getStrapiOrigin() {
  return getStrapiApiBase().replace(/\/api\/?$/, '')
}

export function getMemberToken() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(MEMBER_JWT_KEY) || ''
}

export function setMemberToken(token: string) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(MEMBER_JWT_KEY, token)
}

export function clearMemberToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(MEMBER_JWT_KEY)
}

export async function memberFetch(path: string, init?: RequestInit) {
  const token = getMemberToken()
  const headers = new Headers(init?.headers || {})
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(`${getStrapiApiBase()}${path}`, { ...init, headers })
}
