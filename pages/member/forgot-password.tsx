import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import SEOHead from '../../components/SEOHead'
import PageBanner from '../../components/PageBanner'
import { memberFetch } from '../../lib/member-client'

export default function MemberForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await memberFetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      if (res.ok) setMessage('若邮箱已注册，将收到重置邮件')
      else setError(json?.error?.message || json?.message || '发送失败')
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Forgot password" description="Reset member password" />
      <Layout>
        <PageBanner title="Forgot password" description="Enter your registered email" showDivider />
        <section className="pt-[10rem] pb-[10rem] dark:bg-dark">
          <div className="container mx-auto px-4 max-w-md">
            <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-dark-2 p-8 rounded-lg shadow">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded border px-3 py-2 dark:bg-dark dark:text-white dark:border-dark-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary text-white disabled:opacity-60">
                {loading ? 'Sending…' : 'Send reset link'}
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
