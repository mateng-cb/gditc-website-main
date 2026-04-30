import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import SEOHead from '../../components/SEOHead'
import PageBanner from '../../components/PageBanner'
import { memberFetch, setMemberToken } from '../../lib/member-client'

function getFriendlyLoginError(message?: string) {
  const msg = (message || '').toLowerCase()
  if (!msg) return 'Sign in failed. Please try again.'
  if (msg.includes('invalid identifier') || msg.includes('invalid') || msg.includes('password')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (msg.includes('blocked')) {
    return 'This account is blocked. Please contact support.'
  }
  if (msg.includes('too many') || msg.includes('rate limit')) {
    return 'Too many attempts. Please try again later.'
  }
  if (msg.includes('network') || msg.includes('timeout')) {
    return 'Network error. Please check your connection and try again.'
  }
  return 'Sign in failed. Please check your email and password.'
}

export default function MemberLogin() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await memberFetch('/member-profiles/me')
        const j = await r.json()
        if (!cancelled && r.ok && j?.data) {
          router.replace('/member/center')
        }
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await memberFetch('/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      const json = await res.json()
      if (!res.ok || !json?.jwt) {
        setError(getFriendlyLoginError(json?.error?.message || json?.message))
        return
      }
      setMemberToken(json.jwt)
      const redir = typeof router.query.redirect === 'string' ? router.query.redirect : '/member/center'
      await router.push(redir.startsWith('/') ? redir : '/member/center')
    } catch {
      setError('Network error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Member Login" description="Member center login" />
      <Layout>
        <PageBanner title="Member Login" description="Sign in with your registered email and password" showDivider />
        <section className="pt-[10rem] pb-[10rem] dark:bg-dark">
          <div className="container mx-auto px-4 max-w-md">
            <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-dark-2 p-8 rounded-lg shadow-xl">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  autoComplete="username"
                  className="w-full rounded border border-gray-300 dark:border-dark-3 px-3 py-2 dark:bg-dark dark:text-white"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded border border-gray-300 dark:border-dark-3 px-3 py-2 dark:bg-dark dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded bg-primary text-white font-medium disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-sm text-center text-body-color dark:text-dark-6">
                <Link href="/member/forgot-password" className="text-primary hover:underline">
                  Forgot password
                </Link>
              </p>
            </form>
          </div>
        </section>
      </Layout>
    </>
  )
}
