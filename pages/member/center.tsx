import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import SEOHead from '../../components/SEOHead'
import PageBanner from '../../components/PageBanner'

interface ExpertRow {
  documentId: string
  fullName?: string
  roleTitle?: string
  appointmentLetter?: { url?: string; name?: string; ext?: string }
}

interface CertRow {
  documentId: string
  certificateNumber?: string
  qualification?: string
  issueDate?: string
  certificateFile?: { url?: string; name?: string; ext?: string }
}

interface ProfileData {
  documentId?: string
  companyName?: string
  membershipLevel?: string
  contactName?: string
  contactPhone?: string
  experts?: ExpertRow[]
  certificates?: CertRow[]
  user?: { email?: string; username?: string }
}

export default function MemberCenter() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const loadMe = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/member/me', { credentials: 'same-origin' })
      const json = await res.json()
      if (res.status === 401 || !json.success) {
        router.replace(`/member/login?redirect=${encodeURIComponent('/member/center')}`)
        return
      }
      const d = json.data as ProfileData
      setProfile(d)
      setContactName(d.contactName || '')
      setContactPhone(d.contactPhone || '')
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const saveContact = async () => {
    setSaveMsg('')
    setSaving(true)
    try {
      const res = await fetch('/api/member/me/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ contactName, contactPhone }),
      })
      const json = await res.json()
      if (json.success) {
        setSaveMsg('已保存')
        setProfile((p) => (p ? { ...p, contactName, contactPhone } : p))
      } else {
        setSaveMsg(json.message || '保存失败')
      }
    } catch {
      setSaveMsg('网络错误')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await fetch('/api/member/auth/logout', { method: 'POST', credentials: 'same-origin' })
    router.push('/member/login')
  }

  const triggerDownload = (kind: 'expert' | 'certificate', documentId: string) => {
    const url = `/api/member/download?kind=${kind}&documentId=${encodeURIComponent(documentId)}`
    const a = document.createElement('a')
    a.href = url
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const displayName = profile?.companyName || profile?.user?.email || 'Member'

  return (
    <>
      <SEOHead title="Member Center" description="Member profile and certificates" />
      <Layout>
        <PageBanner title="Member Center" description={displayName} showDivider />
        <section className="pt-8 pb-20 dark:bg-dark">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <div className="flex justify-end">
              <button type="button" onClick={logout} className="text-sm text-primary hover:underline">
                Sign out
              </button>
            </div>

            {loading && <p className="text-body-color">Loading…</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && profile && (
              <>
                <div className="bg-white dark:bg-dark-2 rounded-lg shadow p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-dark dark:text-white">Company & membership</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-body-color">Company</dt>
                      <dd className="font-medium text-dark dark:text-white">{profile.companyName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-body-color">Membership level</dt>
                      <dd className="font-medium text-dark dark:text-white">{profile.membershipLevel || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-body-color">Contact name</dt>
                      <dd>
                        <input
                          className="mt-1 w-full rounded border px-2 py-1 dark:bg-dark dark:text-white dark:border-dark-3"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-body-color">Contact phone</dt>
                      <dd>
                        <input
                          className="mt-1 w-full rounded border px-2 py-1 dark:bg-dark dark:text-white dark:border-dark-3"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveContact}
                      disabled={saving}
                      className="px-4 py-2 rounded bg-primary text-white text-sm disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save contact'}
                    </button>
                    {saveMsg && <span className="text-sm text-body-color">{saveMsg}</span>}
                  </div>
                </div>

                <div className="bg-white dark:bg-dark-2 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">Experts & appointment letters</h2>
                  {!profile.experts?.length && <p className="text-sm text-body-color">No expert records.</p>}
                  <ul className="space-y-3">
                    {(profile.experts || []).map((ex) => (
                      <li key={ex.documentId} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-3 pb-3">
                        <div>
                          <p className="font-medium text-dark dark:text-white">{ex.fullName}</p>
                          <p className="text-sm text-body-color">{ex.roleTitle || ''}</p>
                        </div>
                        {ex.appointmentLetter?.url && (
                          <button
                            type="button"
                            onClick={() => triggerDownload('expert', ex.documentId)}
                            className="text-sm text-primary hover:underline"
                          >
                            Download letter
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-dark-2 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">Member certificates</h2>
                  {!profile.certificates?.length && <p className="text-sm text-body-color">No certificates linked.</p>}
                  <ul className="space-y-3">
                    {(profile.certificates || []).map((c) => (
                      <li key={c.documentId} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-3 pb-3">
                        <div>
                          <p className="font-medium text-dark dark:text-white">{c.certificateNumber}</p>
                          <p className="text-sm text-body-color">{c.qualification}</p>
                          <p className="text-xs text-body-color">{c.issueDate}</p>
                        </div>
                        {c.certificateFile?.url && (
                          <button
                            type="button"
                            onClick={() => triggerDownload('certificate', c.documentId)}
                            className="text-sm text-primary hover:underline"
                          >
                            Download
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-sm text-body-color">
                  Public certificate lookup:{' '}
                  <Link href="/certificate-query" className="text-primary hover:underline">
                    Certificate query
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}
