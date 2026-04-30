import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import SEOHead from '../../components/SEOHead'
import PageBanner from '../../components/PageBanner'

export default function MemberResetPassword() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const c = router.query.code
    if (typeof c === 'string') setCode(c)
  }, [router.query.code])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!code) {
      setError('重置链接已失效或未携带 code')
      return
    }
    if (password !== passwordConfirmation) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/member/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code, password, passwordConfirmation }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(json.message || '密码已重置')
        setTimeout(() => router.push('/member/login'), 2000)
      } else {
        setError(json.message || '重置失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Reset password" description="Set a new password" />
      <Layout>
        <PageBanner title="Reset password" description="Enter your new password" showDivider />
        <section className="pt-[10rem] pb-[10rem] dark:bg-dark">
          <div className="container mx-auto px-4 max-w-md">
            <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-dark-2 p-8 rounded-lg shadow">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">New password</label>
                <input
                  type="password"
                  className="w-full rounded border px-3 py-2 dark:bg-dark dark:text-white dark:border-dark-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm password</label>
                <input
                  type="password"
                  className="w-full rounded border px-3 py-2 dark:bg-dark dark:text-white dark:border-dark-3"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary text-white disabled:opacity-60">
                {loading ? 'Saving…' : 'Save password'}
              </button>
              <p className="text-sm text-center">
                <Link href="/member/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </Layout>
    </>
  )
}
