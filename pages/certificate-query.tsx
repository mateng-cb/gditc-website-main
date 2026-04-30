import { useState } from 'react'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import SEOHead from '../components/SEOHead'
import PageBanner from '../components/PageBanner'
import { useLanguage } from './_app'
import { getStrapiApiBase, getStrapiOrigin } from '../lib/member-client'

interface CertificateResult {
  year: string
  certificateNumber: string
  qualification: string
  name: string
  idNumber: string
  trainingStartDate: string
  trainingEndDate: string
  assessmentMethod: string
  issueDate: string
  certificateUrl?: string
}

export default function CertificateQuery() {
  const { language } = useLanguage()
  const [idNumber, setIdNumber] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [results, setResults] = useState<CertificateResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!idNumber.trim() || !certificateNumber.trim()) {
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        idNumber: idNumber.trim(),
        certificateNumber: certificateNumber.trim(),
      })
      const res = await fetch(`${getStrapiApiBase()}/certificate-query?${params}`)
      const json = await res.json()

      if (res.ok && json?.data && Array.isArray(json.data)) {
        const data = json.data.map((item: CertificateResult) => {
          let certificateUrl = item.certificateUrl
          if (certificateUrl && !certificateUrl.startsWith('http')) {
            certificateUrl = `${getStrapiOrigin()}${certificateUrl}`
          }
          return { ...item, certificateUrl }
        })
        setResults(data)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDownload = (url: string, fileName?: string) => {
    const a = document.createElement('a')
    a.href = url
    if (fileName) a.download = fileName
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const isZh = language === 'zh-Hans'

  return (
    <>
      <SEOHead
        title={isZh ? '证书查询' : 'Certificate Query'}
        description={isZh ? '查询您的DITC证书信息' : 'Query your DITC certificate information'}
      />
      <Layout>
        {/* Banner Section */}
        <PageBanner
          title={isZh ? '证书查询' : 'Certificate Query'}
          description={isZh ? '输入身份证号和证书编号查询证书信息' : 'Enter ID number and certificate number to query certificate information'}
          showDivider
        />

        {/* Query Section */}
        <section className="py-20 lg:py-[120px] bg-gray-1 dark:bg-dark-2">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Search Form */}
            <div className="bg-white dark:bg-dark rounded-lg shadow-lg p-8 mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {isZh ? '身份证号' : 'ID Number'}
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isZh ? '请输入身份证号' : 'Please enter ID number'}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-3 rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {isZh ? '证书编号' : 'Certificate Number'}
                    </label>
                    <input
                      type="text"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isZh ? '请输入证书编号' : 'Please enter certificate number'}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-3 rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !idNumber.trim() || !certificateNumber.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching 
                      ? (isZh ? '查询中...' : 'Searching...')
                      : (isZh ? '查询' : 'Search')
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {hasSearched && (
              <div className="bg-white dark:bg-dark rounded-lg shadow-lg p-8">
                {results.length > 0 ? (
                  <div className="space-y-6">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-dark-3 rounded-lg bg-white dark:bg-dark-2 overflow-hidden"
                      >
                        {/* 证书信息卡片 */}
                        <div className="px-6 py-6">
                          {/* 证书编号 - 一行显示 */}
                          <div className="mb-4">
                            <p className="text-base" style={{color: '#717171'}}>
                              {isZh ? '证书编号' : 'Certificate Number'}: {result.certificateNumber}
                            </p>
                          </div>
                          
                          {/* 分隔线 */}
                          <div className="border-t border-gray-200 dark:border-dark-3 my-4"></div>
                          
                          {/* 证书标题 - 字号更大 */}
                          <div className="mb-6">
                            <p className="text-xl font-semibold text-dark dark:text-white">
                              {result.qualification}
                            </p>
                          </div>
                          
                          {/* 详细信息 */}
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* 第一列 */}
                            <div className="flex-1 space-y-4">
                              <div>
                                <p className="text-base" style={{color: '#717171'}}>
                                  <span>{isZh ? '姓名' : 'Name'}: </span>
                                  <span>{result.name}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-base" style={{color: '#717171'}}>
                                  <span>{isZh ? '身份证号' : 'ID Number'}: </span>
                                  <span>{result.idNumber}</span>
                                </p>
                              </div>
                            </div>

                            {/* 第二列 */}
                            <div className="flex-1 space-y-4">
                              <div>
                                <p className="text-base" style={{color: '#717171'}}>
                                  <span>{isZh ? '培训时间' : 'Training Time'}: </span>
                                  <span>{result.trainingStartDate} — {result.trainingEndDate}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-base" style={{color: '#717171'}}>
                                  <span>{isZh ? '考核方式' : 'Assessment Method'}: </span>
                                  <span>{result.assessmentMethod}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-base" style={{color: '#717171'}}>
                                  <span>{isZh ? '发证日期' : 'Issue Date'}: </span>
                                  <span>{result.issueDate}</span>
                                </p>
                              </div>
                            </div>

                            {/* 内容与按钮之间的分割线（只保留这一条） */}
                            <div className="hidden md:block w-px bg-gray-200 dark:bg-dark-3"></div>
                            
                            {/* 第三列 - 查看证书和下载，纵向居中，左对齐（移动端去掉左右内边距） */}
                            <div className="flex flex-col items-start justify-center px-0 md:px-4 space-y-3">
                              {result.certificateUrl ? (
                                <>
                                  <a
                                    href={result.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
                                  >
                                    {isZh ? '查看证书' : 'View Certificate'}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(result.certificateUrl!, `${result.name}_${result.certificateNumber}`)}
                                    className="text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap text-left bg-transparent border-0 p-0 cursor-pointer"
                                  >
                                    {isZh ? '证书下载' : 'Download Certificate'}
                                  </button>
                                </>
                              ) : (
                                <span className="text-body-color dark:text-dark-6 text-sm">
                                  {isZh ? '暂无证书文件' : 'No certificate file'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-dark-6 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg text-body-color dark:text-dark-6">
                      {isZh ? '未找到相关证书信息' : 'No certificate found'}
                    </p>
                    <p className="text-sm text-body-color dark:text-dark-6 mt-2">
                      {isZh ? '请检查证书编号是否正确' : 'Please check if the certificate number is correct'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}

