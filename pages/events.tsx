import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import SEOHead from '../components/SEOHead'
import { useLanguage } from './_app'

export default function Events() {
  const router = useRouter()
  const { language } = useLanguage()

  useEffect(() => {
    // 直接重定向到events页面，不使用多语言路径
    router.replace('/events/page/1')
  }, [router])

  // 固定为英文文本
  const getText = (key: string) => {
    const texts = {
      title: 'Events',
      description: 'Join our events, summits, and competitions to advance digital infrastructure standards',
      redirecting: 'Redirecting to events...'
    }
    return texts[key as keyof typeof texts] || texts.title
  }

  return (
    <>
      <SEOHead
        title={getText('title')}
        description={getText('description')}
      />
      <Layout>
        {/* 重定向加载页面 - 不使用 page-banner 类避免被隐藏 */}
        <div className="relative z-10 overflow-hidden pt-[120px] pb-[60px] dark:bg-dark">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-body-color dark:text-dark-6">
                {getText('redirecting')}
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