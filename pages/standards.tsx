import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import SEOHead from '../components/SEOHead'

export default function Standards() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到标准页面
    router.replace('/standards/page/1')
  }, [router])

  return (
    <>
      <SEOHead
        title="Standards"
        description="Digital Infrastructure Technology Standards"
      />
      <Layout>
        {/* 重定向加载页面 - 不使用 page-banner 类避免被隐藏 */}
        <div className="relative z-10 overflow-hidden pt-[120px] pb-[60px] dark:bg-dark">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-body-color dark:text-dark-6">
                Redirecting to standards...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
} 