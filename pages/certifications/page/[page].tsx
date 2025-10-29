import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import SEOHead from '../../../components/SEOHead'
import { EmptyCertifications } from '../../../components/EmptyState'
import { getCertifications, Article } from '../../../lib/strapi'
import { useLanguage } from '../../_app'

interface NewsroomPageProps {
  articles: Article[]
  currentPage: number
  totalPages: number
  totalArticles: number
  language: string
}

// 分页导航组件
const Pagination = ({ 
  currentPage, 
  totalPages, 
  language,
  basePath
}: { 
  currentPage: number
  totalPages: number 
  language: string
  basePath: string
}) => {
  const getText = (key: string) => {
    const texts = {
      'en': {
        previous: 'Previous',
        next: 'Next',
        page: 'Page'
      },
      'zh-Hans': {
        previous: '上一页',
        next: '下一页',
        page: '第'
      }
    }
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts['en'][key as keyof typeof texts['en']]
  }

  const getVisiblePages = () => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center mt-12 space-x-2">
      {/* 上一页按钮 */}
      {currentPage > 1 ? (
        <Link 
          href={`${basePath}/${currentPage - 1}`}
          className="px-3 py-2 rounded-md transition-colors bg-white text-gray-700 border hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:bg-dark-2 dark:text-white dark:border-dark-3 dark:hover:bg-blue-500 dark:hover:border-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* 页码按钮 */}
      {getVisiblePages().map(page => (
        page === currentPage ? (
          <span 
            key={page}
            className="px-4 py-2 rounded-md bg-blue-500 text-white"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={`${basePath}/${page}`}
            className="px-4 py-2 rounded-md transition-colors bg-white text-gray-700 border hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:bg-dark-2 dark:text-white dark:border-dark-3 dark:hover:bg-blue-500 dark:hover:border-blue-500"
          >
            {page}
          </Link>
        )
      ))}

      {/* 下一页按钮 */}
      {currentPage < totalPages ? (
        <Link 
          href={`${basePath}/${currentPage + 1}`}
          className="px-3 py-2 rounded-md transition-colors bg-white text-gray-700 border hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:bg-dark-2 dark:text-white dark:border-dark-3 dark:hover:bg-blue-500 dark:hover:border-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  )
}

export default function NewsroomPage({ 
  articles, 
  currentPage, 
  totalPages, 
  totalArticles, 
  language 
}: NewsroomPageProps) {
  const router = useRouter()
  const { language: currentLanguage } = useLanguage()
  
  // 固定为英文，不使用多语言路径
  const actualLanguage = 'en'
  const basePath = '/certifications/page'

  // 固定为英文文本
  const getText = (key: string) => {
    const texts = {
      title: 'Certifications',
      description: 'Explore our certification programs and standards for digital infrastructure',
      noNewsFound: 'No certifications found',
      noNewsDesc: 'Try selecting a different filter or check back later for updates.',
      publishedOn: 'Published on',
      totalArticles: 'Total Certifications',
      showingResults: 'Showing'
    }
    return texts[key as keyof typeof texts] || texts.title
  }

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  // 处理富文本内容，提取纯文本用于预览
  const extractTextFromContent = (content: string) => {
    if (!content) return ''
    return content.replace(/<[^>]*>/g, '').trim()
  }

  // 计算显示范围
  const articlesPerPage = 12
  const startIndex = (currentPage - 1) * articlesPerPage + 1
  const endIndex = Math.min(currentPage * articlesPerPage, totalArticles)

  return (
    <>
      <SEOHead
        title={`${getText('title')} - Page ${currentPage}`}
        description={getText('description')}
        canonical={`https://gditc.org${basePath}/${currentPage}`}
      />
      <Layout>
        {/* Banner Section */}
        <div className="relative z-10 overflow-hidden pt-[120px] pb-[60px] md:pt-[130px] lg:pt-[160px] dark:bg-dark">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-stroke/0 via-stroke dark:via-dark-3 to-stroke/0"></div>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center -mx-4">
              <div className="w-full px-4">
                <div className="text-center">
                  <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                    {getText('title')}
                  </h1>
                  <p className="mb-5 text-base text-body-color dark:text-dark-6">
                    {getText('description')}
                  </p>

                  {/* 认证统计信息 */}
                  {totalArticles > 0 && (
                    <div className="mb-6 text-sm text-body-color dark:text-dark-6">
                      {getText('showingResults')} {startIndex}-{endIndex} of {totalArticles} {getText('totalArticles')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News List */}
        <section className="pt-20 pb-10 lg:pt-[120px] lg:pb-20 dark:bg-dark">
          <div className="container mx-auto px-4">
            {articles.length > 0 ? (
              <>
                <div className="flex flex-wrap -mx-4">
                  {articles.map((article, index) => (
                    <div key={article.documentId} className="w-full px-4 md:w-1/2 lg:w-1/3">
                      <div className="mb-10 wow fadeInUp group" data-wow-delay={`.${(index % 3 + 1) * 5}s`}>
                        <div className="mb-8 overflow-hidden rounded-[5px]">
                          <Link href={`/certifications/${article.documentId}`} className="block">
                            {article.cover && article.cover.url && (
                              <img
                                src={article.cover.url}
                                alt={article.cover.alternativeText || article.title}
                                className="w-full h-48 object-cover transition group-hover:rotate-6 group-hover:scale-125"
                              />
                            )}
                          </Link>
                        </div>
                        <div>
                          <span className="inline-block px-4 py-0.5 mb-6 text-xs font-medium leading-loose text-center text-white rounded-[5px] bg-primary">
                            {formatDate(article.publishedAt)}
                          </span>
                          {article.category && article.category.name && (
                            <span className="inline-block px-3 py-1 mb-4 ml-2 text-xs font-medium text-primary border border-primary rounded-full">
                              {article.category.name}
                            </span>
                          )}
                          <h3>
                            <Link
                              href={`/certifications/${article.documentId}`}
                              className="inline-block mb-4 text-xl font-semibold text-dark dark:text-white hover:text-primary dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl article-title"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <p className="max-w-[370px] text-base text-body-color dark:text-dark-6 article-description">
                            {extractTextFromContent(article.description || article.descript || article.contents || article.content || '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 分页导航 */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  language={actualLanguage}
                  basePath={basePath}
                />
              </>
            ) : (
              <EmptyCertifications />
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // 只获取英文数据来计算总页数
    const articlesEn = await getCertifications(undefined, 'en')

    const articlesPerPage = 12
    const totalPages = Math.max(1, Math.ceil(articlesEn.length / articlesPerPage))

    // 生成所有页面路径，至少生成第一页
    const paths = []
    for (let page = 1; page <= totalPages; page++) {
      paths.push({ params: { page: page.toString() } })
    }

    // 如果没有数据，至少生成第一页
    if (paths.length === 0) {
      paths.push({ params: { page: '1' } })
    }

    return {
      paths,
      fallback: false
    }
  } catch (error) {
    console.error('生成分页路径失败:', error)
    return {
      paths: [{ params: { page: '1' } }],
      fallback: false
    }
  }
}

export const getStaticProps: GetStaticProps<NewsroomPageProps> = async ({ params }) => {
  try {
    const page = parseInt(params?.page as string) || 1
    const articlesPerPage = 12

    // 只获取英文数据
    const articlesEn = await getCertifications(undefined, 'en')

    // 清理数据
    const cleanArticles = (articles: Article[]): Article[] => {
      return articles.map(article => ({
        documentId: article.documentId || `article-${Date.now()}`,
        title: article.title || '',
        slug: article.slug || '',
        description: article.description || '',
        descript: article.descript || '',
        content: article.contents || article.content || '',
        cover: article.cover || null,
        author: article.author || null,
        category: article.category || null,
        blocks: article.blocks || null,
        locale: article.locale || 'en',
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt || new Date().toISOString(),
        publishedAt: article.publishedAt || new Date().toISOString(),
      }))
    }

    const allArticles = cleanArticles(articlesEn)
    
    // 计算分页数据
    const totalArticles = allArticles.length
    const totalPages = Math.ceil(totalArticles / articlesPerPage)
    const startIndex = (page - 1) * articlesPerPage
    const endIndex = startIndex + articlesPerPage
    const pageArticles = allArticles.slice(startIndex, endIndex)

    return {
      props: {
        articles: pageArticles,
        currentPage: page,
        totalPages,
        totalArticles,
        language: 'en'
      }
    }
  } catch (error) {
    console.error('生成分页数据失败:', error)
    
    return {
      props: {
        articles: [],
        currentPage: 1,
        totalPages: 1,
        totalArticles: 0,
        language: 'en'
      }
    }
  }
} 