import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import SEOHead from '../../components/SEOHead'
import PageBanner from '../../components/PageBanner'
import { clearMemberToken, getStrapiOrigin, memberFetch } from '../../lib/member-client'

interface ExpertRow {
  documentId: string
  fullName?: string
  roleTitle?: string
  appointmentLetter?: { url?: string; name?: string; ext?: string }
}

interface DitcMemberCertRow {
  documentId: string
  companyName?: string
  membershipCategory?: string
  validFrom?: string
  validTo?: string
  certNo?: string
  certificateFile?: { url?: string; name?: string; ext?: string }
}

interface ProfileData {
  documentId?: string
  companyName?: string
  membershipLevel?: string
  country?: string
  membershipCategory?: string
  contactName?: string
  contactPhone?: string
  experts?: ExpertRow[]
  ditcMemberCertificates?: DitcMemberCertRow[]
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
      const res = await memberFetch('/member-profiles/me')
      const json = await res.json()
      if (res.status === 401 || !res.ok || !json?.data) {
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
      const res = await memberFetch('/member-profiles/me/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactName, contactPhone }),
      })
      const json = await res.json()
      if (res.ok) {
        setSaveMsg('Saved')
        setProfile((p) => (p ? { ...p, contactName, contactPhone } : p))
      } else {
        setSaveMsg(json?.error?.message || json?.message || 'Save failed')
      }
    } catch {
      setSaveMsg('Network error')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    clearMemberToken()
    router.push('/member/login')
  }

  const triggerDownload = (rawUrl?: string) => {
    if (!rawUrl) return
    const url = rawUrl.startsWith('http') ? rawUrl : `${getStrapiOrigin()}${rawUrl}`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatValidRange = (from?: string, to?: string) => {
    if (!from && !to) return '—'
    const opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    try {
      const a = from ? new Date(from).toLocaleDateString(undefined, opt) : '—'
      const b = to ? new Date(to).toLocaleDateString(undefined, opt) : '—'
      return `${a} – ${b}`
    } catch {
      return '—'
    }
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
                <div className="bg-white dark:bg-dark-2 rounded-lg shadow-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-dark dark:text-white">Company & membership</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                      <tbody>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <td className="py-3 px-4 text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Company Name</td>
                          <td className="py-3 px-4 font-medium text-dark dark:text-white">{profile.companyName || '—'}</td>
                        </tr>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <td className="py-3 px-4 text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Country/Region</td>
                          <td className="py-3 px-4 font-medium text-dark dark:text-white">{profile.country || '—'}</td>
                        </tr>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <td className="py-3 px-4 text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Membership Category</td>
                          <td className="py-3 px-4 font-medium text-dark dark:text-white">
                            {profile.membershipCategory || profile.membershipLevel || '—'}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <td className="py-3 px-4 text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Contact Name</td>
                          <td className="py-3 px-4">
                            <input
                              className="w-full max-w-md rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-dark dark:text-white"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              autoComplete="name"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Phone Number</td>
                          <td className="py-3 px-4">
                            <input
                              type="tel"
                              className="w-full max-w-md rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-dark dark:text-white"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              autoComplete="tel"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
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

                <div className="bg-white dark:bg-dark-2 rounded-lg shadow-xl p-6 space-y-3">
                  <h2 className="text-lg font-semibold text-dark dark:text-white">Experts</h2>
                  {!profile.experts?.length ? (
                    <p className="text-sm text-body-color">No expert records.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                        <thead>
                          <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                            <th className="py-2 px-4 font-medium text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Expert</th>
                            <th className="py-2 px-4 font-medium text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Role</th>
                            <th className="py-2 px-4 font-medium text-body-color whitespace-nowrap">Letter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(profile.experts || []).map((ex) => (
                            <tr key={ex.documentId} className="border-b border-gray-300 dark:border-gray-700">
                              <td className="py-3 px-4 font-medium text-dark dark:text-white whitespace-nowrap border-r border-gray-300 dark:border-gray-700">{ex.fullName}</td>
                              <td className="py-3 px-4 text-body-color border-r border-gray-300 dark:border-gray-700">{ex.roleTitle || '—'}</td>
                              <td className="py-3 px-4">
                                {ex.appointmentLetter?.url ? (
                                  <button
                                    type="button"
                                    onClick={() => triggerDownload(ex.appointmentLetter?.url)}
                                    className="text-sm text-primary hover:underline whitespace-nowrap"
                                  >
                                    Download
                                  </button>
                                ) : (
                                  <span className="text-xs text-body-color">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-dark-2 rounded-lg shadow-xl p-6 space-y-3">
                  <h2 className="text-lg font-semibold text-dark dark:text-white">DITC Membership Certificate Download</h2>
                  {!profile.ditcMemberCertificates?.length ? (
                    <p className="text-sm text-body-color">No DITC member certificate linked.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                        <thead>
                          <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                            <th className="py-2 px-4 font-medium text-body-color whitespace-nowrap border-r border-gray-300 dark:border-gray-700">Certificate</th>
                            <th className="py-2 px-4 font-medium text-body-color whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(profile.ditcMemberCertificates || []).map((c) => (
                            <tr key={c.documentId} className="border-b border-gray-300 dark:border-gray-700">
                              <td className="py-3 px-4 border-r border-gray-300 dark:border-gray-700">
                                <div className="font-medium text-dark dark:text-white whitespace-nowrap">
                                  {c.membershipCategory || 'DITC Member Certificate'}
                                </div>
                                <div className="text-xs text-body-color">
                                  Cert. No. {c.certNo || '—'} · {formatValidRange(c.validFrom, c.validTo)}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {c.certificateFile?.url ? (
                                  <button
                                    type="button"
                                    onClick={() => triggerDownload(c.certificateFile?.url)}
                                    className="text-sm text-primary hover:underline whitespace-nowrap"
                                  >
                                    Download
                                  </button>
                                ) : (
                                  <span className="text-xs text-body-color">File not uploaded</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}
