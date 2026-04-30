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

type MemberFetchOptions = {
  skipAuth?: boolean
  retryOnUnauthorized?: boolean
}

export async function memberFetch(path: string, init?: RequestInit, options?: MemberFetchOptions) {
  const token = getMemberToken()
  const skipAuth = Boolean(options?.skipAuth)
  const shouldRetry = options?.retryOnUnauthorized !== false
  const headers = new Headers(init?.headers || {})
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !skipAuth) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${getStrapiApiBase()}${path}`
  const response = await fetch(url, { ...init, headers })
  if (response.status === 401 && token) {
    clearMemberToken()
    // Stale tokens from old environments should not block auth/public requests.
    if (shouldRetry) {
      const retryHeaders = new Headers(init?.headers || {})
      if (!retryHeaders.has('Content-Type') && init?.body) {
        retryHeaders.set('Content-Type', 'application/json')
      }
      retryHeaders.delete('Authorization')
      return fetch(url, { ...init, headers: retryHeaders })
    }
  }
  return response
}
