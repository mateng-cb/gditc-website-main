import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import SEOHead from '../../../components/SEOHead'
import PageBanner from '../../../components/PageBanner'
import { EmptyEvents } from '../../../components/EmptyState'
import { getEvents, Event as StrapiEvent } from '../../../lib/strapi'
import { getCoverImageUrl } from '../../../lib/cover-utils'
import { useLanguage } from '../../_app'

// 本地Event接口，用于组件内部
interface Event {
  id: number;
  documentId: string | null;
  title: string;
  date: string;
  content: any; // 可能是字符串或 Strapi blocks 数组
  contents?: any; // 可能是字符串或 Strapi blocks 数组
  location: string | null;
  type: string | null;
  cover: {
    url: string;
    alternativeText?: string | null;
    formats?: { small?: { url: string }; medium?: { url: string }; thumbnail?: { url: string } };
  } | null;
}

// 从 Strapi blocks 格式提取纯文本
const extractTextFromBlocks = (content: any): string => {
  // 如果是字符串，直接返回
  if (typeof content === 'string') {
    return content;
  }
  
  // 如果是数组（blocks 格式），提取文本
  if (Array.isArray(content)) {
    return content.map((block: any) => {
      if (block.children && Array.isArray(block.children)) {
        return block.children
          .map((child: any) => child.text || '')
          .join('');
      }
      return '';
    }).join(' ').trim();
  }
  
  // 其他情况返回默认文本
  return 'No description available';
}

interface EventsPageProps {
  events: Event[]
  currentPage: number
  totalPages: number
  totalEvents: number
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
        next: 'Next'
      },
      'zh-Hans': {
        previous: '上一页',
        next: '下一页'
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

export default function EventsPage({ 
  events, 
  currentPage, 
  totalPages, 
  totalEvents, 
  language 
}: EventsPageProps) {
  const router = useRouter()
  const { language: currentLanguage } = useLanguage()
  
  // 根据路由确定当前语言和基础路径
  const isZhHans = router.asPath.includes('/zh-Hans/')
  const isEn = router.asPath.includes('/en/')
  const actualLanguage = isZhHans ? 'zh-Hans' : (isEn ? 'en' : currentLanguage)
  const basePath = isZhHans ? '/zh-Hans/events/page' : (isEn ? '/en/events/page' : '/events/page')

  // 计算显示范围
  const eventsPerPage = 12
  const startIndex = (currentPage - 1) * eventsPerPage + 1
  const endIndex = Math.min(currentPage * eventsPerPage, totalEvents)

  // 获取本地化文本
  const getText = (key: string) => {
    const texts = {
      'en': {
        title: 'Events',
        description: 'Join our events, summits, and competitions to advance digital infrastructure standards',
        noEventsFound: 'No events found',
        noEventsDesc: 'Try selecting a different filter or check back later for updates.',
        upcoming: 'Upcoming',
        pastEvent: 'Past Event'
      },
      'zh-Hans': {
        title: '活动',
        description: '参加我们的活动、峰会和竞赛，推进数字基础设施标准',
        noEventsFound: '暂无活动',
        noEventsDesc: '请尝试选择不同的筛选条件或稍后查看更新。',
        upcoming: '即将举行',
        pastEvent: '已结束'
      }
    }
    return texts[actualLanguage as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts['en'][key as keyof typeof texts['en']]
  }

  // 格式化日期显示
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString(actualLanguage === 'zh-Hans' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'N/A'
    }
  }

  return (
    <>
      <SEOHead
        title={`${getText('title')} - ${actualLanguage === 'zh-Hans' ? `第${currentPage}页` : `Page ${currentPage}`}`}
        description={getText('description')}
        canonical={`https://gditc.org${basePath}/${currentPage}`}
      />
      <Layout>
        {/* Banner Section */}
        <PageBanner
          title={getText('title')}
          description={getText('description')}
          showDivider
        >
          {/* 活动统计信息 */}
          {totalEvents > 0 && (
            <div className="mb-6 text-sm text-body-color dark:text-dark-6">
              {actualLanguage === 'zh-Hans' 
                ? `共 ${totalEvents} 个活动 | 显示 ${startIndex}-${endIndex} 个`
                : `Showing ${startIndex}-${endIndex} of ${totalEvents} Events`
              }
            </div>
          )}
        </PageBanner>

        {/* Events List */}
        <section className="pt-20 pb-10 lg:pt-[35px] lg:pb-20 dark:bg-dark">
          <div className="container mx-auto px-4">
            {events.length > 0 ? (
              <>
                <div className="flex flex-wrap -mx-4">
                  {events.map((event, index) => (
                    <div key={event.documentId || event.id} className="w-full px-4 md:w-1/2 lg:w-1/3">
                      <div className="mb-10 wow fadeInUp group" data-wow-delay={`.${(index % 3 + 1) * 5}s`}>
                        <div className="mb-8 overflow-hidden rounded-[5px]">
                          <Link href={`/events/${event.documentId || event.id}`} className="block">
                            <img
                              src={getCoverImageUrl(event.cover, 'medium') || '/images/blog/blog-01.jpg'}
                              alt={event.cover?.alternativeText || event.title}
                              className="w-full aspect-[309/192] object-cover transition group-hover:rotate-6 group-hover:scale-125"
                            />
                          </Link>
                        </div>
                        <div>
                          <span className="inline-block px-4 py-0.5 mb-6 text-xs font-medium leading-loose text-center text-white rounded-[5px] bg-primary">
                            {String(formatDate(event.date))}
                          </span>
                          <h3>
                            <Link
                              href={`/events/${event.documentId || event.id}`}
                              className={`inline-block mb-4 text-xl font-semibold text-dark dark:text-white hover:text-primary dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl article-title ${actualLanguage === 'zh-Hans' ? 'zh' : 'en'}`}
                            >
                              {String(event.title || 'Untitled Event')}
                            </Link>
                          </h3>
                          <p className={`max-w-[370px] text-base text-body-color dark:text-dark-6 mb-4 article-description ${actualLanguage === 'zh-Hans' ? 'zh' : 'en'}`}>
                            {/* {extractTextFromBlocks(event.contents || event.content)} */}
                          </p>
                          {event.location && (
                            <p className="text-sm text-body-color dark:text-dark-6 mb-2">
                              📍 {String(event.location)}
                            </p>
                          )}
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
              <EmptyEvents />
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    console.log('🔄 开始生成 Events 静态路径...')
    
    // 获取所有活动数据来计算总页数
    const eventsEn = await getEvents(undefined, 'en')

    console.log(`📊 Events 数据统计:`, {
      eventsEn: eventsEn.length
    })

    const eventsPerPage = 12
    const totalPagesEn = Math.ceil(eventsEn.length / eventsPerPage)
    const maxPages = Math.max(1, totalPagesEn)

    console.log(`📄 分页计算:`, {
      eventsPerPage,
      totalPagesEn,
      maxPages
    })

    // 生成所有页面路径，至少生成第一页
    const paths = []
    for (let page = 1; page <= maxPages; page++) {
      paths.push({ params: { page: page.toString() } })
    }

    // 如果没有数据，至少生成第一页
    if (paths.length === 0) {
      paths.push({ params: { page: '1' } })
    }

    console.log(`✅ 生成 ${paths.length} 个静态路径`)

    return {
      paths,
      fallback: false
    }
  } catch (error) {
    console.error('❌ 生成Events分页路径失败:', error)
    return {
      paths: [{ params: { page: '1' } }],
      fallback: false
    }
  }
}

export const getStaticProps: GetStaticProps<EventsPageProps> = async ({ params }) => {
  try {
    const page = parseInt(params?.page as string) || 1
    const eventsPerPage = 12

    console.log(`🔄 生成 Events 页面数据 - 第 ${page} 页`)

    // 获取所有活动数据
    const eventsEn = await getEvents(undefined, 'en')

    console.log(`📊 获取到的 Events 数据:`, {
      eventsEn: eventsEn.length,
      page
    })

    // 转换数据格式
    const formatEvents = (events: StrapiEvent[]): Event[] => {
      return events.map((event: StrapiEvent, index: number) => ({
        id: event.id || index + 1,
        documentId: event.documentId || null,
        title: event.title || 'Untitled Event',
        date: event.date || new Date().toISOString(),
        content: event.contents || event.content || '',
        location: event.location || null,
        type: event.type || null,
        cover: event.cover ? {
          ...event.cover,
          url: event.cover.url || '/images/blog/blog-01.jpg',
          alternativeText: event.cover.alternativeText || event.title || 'Event cover'
        } : null
      }))
    }

    const allEvents = formatEvents(eventsEn)
    
    // 计算分页数据
    const totalEvents = allEvents.length
    const totalPages = Math.ceil(totalEvents / eventsPerPage)
    const startIndex = (page - 1) * eventsPerPage
    const endIndex = startIndex + eventsPerPage
    const pageEvents = allEvents.slice(startIndex, endIndex)

    console.log(`📄 分页数据计算:`, {
      totalEvents,
      totalPages,
      startIndex,
      endIndex,
      pageEventsCount: pageEvents.length,
      eventsPerPage
    })

    return {
      props: {
        events: pageEvents,
        currentPage: page,
        totalPages,
        totalEvents,
        language: 'en'
      }
    }
  } catch (error) {
    console.error('❌ 生成Events分页数据失败:', error)
    
    return {
      props: {
        events: [],
        currentPage: 1,
        totalPages: 1,
        totalEvents: 0,
        language: 'en'
      },
      revalidate: 60 // 1分钟后重新验证
    }
  }
}
