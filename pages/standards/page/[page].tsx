import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import SEOHead from '../../../components/SEOHead'
import PageBanner from '../../../components/PageBanner'
import { EmptyStandards } from '../../../components/EmptyState'
import { getStandards } from '../../../lib/strapi'
import { useLanguage } from '../../_app'

interface Resource {
  id: number;
  documentId: string;
  type: string;
  title: string;
  description: string;
  downloadUrl: string;
  publishDate: string;
  fileSize: string;
  format: string;
  cover: string;
}

interface ResourcesPageProps {
  resources: Resource[]
  currentPage: number
  totalPages: number
  totalResources: number
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

export default function ResourcesPage({ 
  resources, 
  currentPage, 
  totalPages, 
  totalResources, 
  language 
}: ResourcesPageProps) {
  const router = useRouter()
  const { language: currentLanguage } = useLanguage()
  
  // 固定为英文，不使用多语言路径
  const actualLanguage = 'en'
  const basePath = '/standards/page'

  // 计算显示范围
  const resourcesPerPage = 12
  const startIndex = (currentPage - 1) * resourcesPerPage + 1
  const endIndex = Math.min(currentPage * resourcesPerPage, totalResources)

  // 格式化日期
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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
        title={`Standards - Page ${currentPage}`}
        description="Explore our digital infrastructure standards and technical specifications"
        canonical={`https://gditc.org${basePath}/${currentPage}`}
      />
      <Layout>
        {/* Banner */}
        <PageBanner
          title="Standards"
          description="Explore our digital infrastructure standards and technical specifications"
          showDivider
        >
          {/* 标准统计信息 */}
          {totalResources > 0 && (
            <div className="mb-6 text-sm text-body-color dark:text-dark-6">
              Showing {startIndex}-{endIndex} of {totalResources} Standards
            </div>
          )}
        </PageBanner>

        {/* Resources Grid */}
        <section className="pt-20 pb-10 lg:pt-[120px] lg:pb-20 dark:bg-dark">
          <div className="container mx-auto px-4">
            {resources.length > 0 ? (
              <>
                <div className="flex flex-wrap -mx-4">
                  {resources.map((resource, index) => (
                    <div key={resource.id} className="w-full px-4 md:w-1/2 lg:w-1/3">
                      <div className="mb-10 wow fadeInUp group" data-wow-delay={`.${(index % 3 + 1) * 5}s`}>
                        <div className="mb-8 overflow-hidden rounded-[5px]">
                          <Link href={`/standards/${resource.documentId}`} className="block">
                            <img
                              src={resource.cover}
                              alt={resource.title}
                              className="w-full h-48 object-cover transition group-hover:rotate-6 group-hover:scale-125"
                            />
                          </Link>
                        </div>
                        <div>
                          <span className="inline-block px-4 py-0.5 mb-6 text-xs font-medium leading-loose text-center text-white rounded-[5px] bg-primary">
                            {String(formatDate(resource.publishDate))}
                          </span>
                          <h3>
                            <Link
                              href={`/standards/${resource.documentId}`}
                              className="inline-block mb-4 text-xl font-semibold text-dark dark:text-white hover:text-primary dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl article-title"
                            >
                              {String(resource.title || 'Untitled')}
                            </Link>
                          </h3>
                          <p className="max-w-[370px] text-base text-body-color dark:text-dark-6 mb-4 article-description">
                            {/* {String(resource.description || 'No description available')} */}
                          </p>
                          
                          {/* 下载按钮 */}
                          {resource.downloadUrl && resource.downloadUrl !== '#' && (
                            <div className="flex items-center gap-3">
                              <a
                                href={resource.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </a>
                            </div>
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
              <EmptyStandards />
            )}
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    console.log('🔄 开始生成Standards分页路径...');
    
    // 从API获取真实数据来计算总页数
    const standards = await getStandards();
    console.log(`📊 获取到 ${standards.length} 条Standards数据`);
    
    const resourcesPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(standards.length / resourcesPerPage));
    
    console.log(`📄 计算总页数: ${totalPages}`);

    // 生成所有页面路径，至少生成第一页
    const paths = [];
    for (let page = 1; page <= totalPages; page++) {
      paths.push({ params: { page: page.toString() } });
    }

    // 如果没有数据，至少生成第一页
    if (paths.length === 0) {
      paths.push({ params: { page: '1' } });
    }

    console.log(`✅ 生成 ${paths.length} 个路径:`, paths.map(p => p.params.page));

    return {
      paths,
      fallback: false
    }
  } catch (error) {
    console.error('❌ 生成Standards分页路径失败:', error);
    
    // 即使出错也要确保至少有一页
    return {
      paths: [{ params: { page: '1' } }],
      fallback: false
    }
  }
}

export const getStaticProps: GetStaticProps<ResourcesPageProps> = async ({ params }) => {
  try {
    console.log('🔄 开始生成Standards页面数据...');
    console.log('📄 页面参数:', params);
    
    const page = parseInt(params?.page as string) || 1;
    const resourcesPerPage = 12;

    // 从API获取真实数据
    const standards = await getStandards();
    console.log(`📊 获取到 ${standards.length} 条Standards数据`);
    
    // 转换数据格式以匹配Resource接口
    const allResources: Resource[] = standards.map((standard: any) => {
      // 安全处理cover字段
      let coverUrl = '/images/blog/blog-01.jpg';
      if (standard.cover) {
        if (typeof standard.cover === 'string') {
          coverUrl = standard.cover;
        } else if (standard.cover.url) {
          coverUrl = standard.cover.url;
        }
      }

      // 安全处理publishDate字段
      let publishDate = new Date().toISOString();
      if (standard.publishedAt) {
        publishDate = standard.publishedAt;
      } else if (standard.createdAt) {
        publishDate = standard.createdAt;
      }

      return {
        id: standard.id || Math.random().toString(),
        documentId: standard.documentId || standard.id || Math.random().toString(),
        type: standard.type || 'standard',
        title: standard.title || 'Untitled Standard',
        description: standard.content || standard.description || 'No description available',
        downloadUrl: standard.attachments?.url || '#',
        publishDate: publishDate,
        fileSize: 'N/A',
        format: 'PDF',
        cover: coverUrl
      };
    });
    
    console.log(`📋 转换后资源数量: ${allResources.length}`);
    
    // 计算分页数据
    const totalResources = allResources.length;
    const totalPages = Math.max(1, Math.ceil(totalResources / resourcesPerPage));
    const startIndex = (page - 1) * resourcesPerPage;
    const endIndex = startIndex + resourcesPerPage;
    const pageResources = allResources.slice(startIndex, endIndex);

    console.log(`📄 第 ${page} 页数据: ${pageResources.length} 条记录`);
    console.log(`📊 分页信息: 总计 ${totalResources} 条，共 ${totalPages} 页`);

    return {
      props: {
        resources: pageResources,
        currentPage: page,
        totalPages,
        totalResources,
        language: 'en'
      }
    }
  } catch (error) {
    console.error('❌ 生成Standards分页数据失败:', error);
    
    return {
      props: {
        resources: [],
        currentPage: 1,
        totalPages: 1,
        totalResources: 0,
        language: 'en'
      },
      revalidate: 60 // 1分钟后重新验证
    }
  }
}
