import { useState } from 'react'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import SEOHead from '../components/SEOHead'
import PageBanner from '../components/PageBanner'
import { t, getTranslation } from '../lib/translations'
import { getJoinus } from '../lib/strapi'
import { useLanguage } from './_app'

interface JoinUsProps {
  // 预生成的翻译数据
  translations?: any;
  joinusData?: {
    title: string;
    blocks?: any[];
    download?: {
      url: string;
      name?: string;
    };
    fileslist?: {
      id: number;
      title: string;
      file: {
        url: string;
        name?: string;
        ext?: string;
        size?: number;
        mime?: string;
      };
    }[];
  };
}

export default function JoinUs({ translations = {}, joinusData }: JoinUsProps) {
  const { language } = useLanguage()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    membershipType: 'core',
    message: ''
  })

  const getApplicationSteps = () => {
    const currentTranslations = translations[language] || translations['en'] || getTranslation(language)
    return [
      {
        step: 1,
        title: currentTranslations.joinUs.steps.step1.title,
        description: currentTranslations.joinUs.steps.step1.description,
        items: currentTranslations.joinUs.steps.step1.items
      },
      {
        step: 2,
        title: currentTranslations.joinUs.steps.step2.title,
        description: currentTranslations.joinUs.steps.step2.description,
        items: currentTranslations.joinUs.steps.step2.items
      },
      {
        step: 3,
        title: currentTranslations.joinUs.steps.step3.title,
        description: currentTranslations.joinUs.steps.step3.description,
        items: currentTranslations.joinUs.steps.step3.items
      },
      {
        step: 4,
        title: currentTranslations.joinUs.steps.step4.title,
        description: currentTranslations.joinUs.steps.step4.description,
        items: currentTranslations.joinUs.steps.step4.items
      }
    ]
  }

  const getMembershipTypes = () => {
    const currentTranslations = translations[language] || translations['en'] || getTranslation(language)
    return [
      {
        type: 'core',
        title: currentTranslations.joinUs.membershipTypes.core.title,
        description: currentTranslations.joinUs.membershipTypes.core.description,
        features: currentTranslations.joinUs.membershipTypes.core.features,
        highlight: false
      },
      {
        type: 'sme',
        title: currentTranslations.joinUs.membershipTypes.sme.title,
        description: currentTranslations.joinUs.membershipTypes.sme.description,
        features: currentTranslations.joinUs.membershipTypes.sme.features,
        highlight: false
      },
      {
        type: 'government',
        title: currentTranslations.joinUs.membershipTypes.government.title,
        description: currentTranslations.joinUs.membershipTypes.government.description,
        features: currentTranslations.joinUs.membershipTypes.government.features,
        highlight: false
      }
    ]
  }

  const applicationSteps = getApplicationSteps()
  const membershipTypes = getMembershipTypes()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission
  }

  return (
    <>
      <SEOHead
        title={t(language, 'joinUs.pageTitle')}
        description={t(language, 'joinUs.pageDescription')}
      />
      <Layout>
        {/* Banner */}
        <PageBanner
          title={t(language, 'joinUs.howToJoin')}
          description={t(language, 'joinUs.becomePartOf')}
        >
          {/* 面包屑导航 */}
          <ul className="flex items-center justify-center gap-[10px]">
            <li><a href="/" className="text-base font-medium text-dark dark:text-white">{t(language, 'common.home')}</a></li>
            <li><span className="text-body-color dark:text-dark-6"> / </span></li>
            <li><span className="text-base font-medium text-body-color">{t(language, 'joinUs.title')}</span></li>
          </ul>
        </PageBanner>

        {/* 4-Step Process */}
        <section className="py-20 lg:py-[120px] bg-gray-1 dark:bg-dark-2">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2]">
                {t(language, 'joinUs.applicationProcess')}
              </h2>
              <p className="text-lg text-body-color dark:text-dark-6 max-w-3xl mx-auto">
                {t(language, 'joinUs.processDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {applicationSteps.map((step, index) => (
                <div key={step.step} className="relative">
                  {/* Step Number */}
                  <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-6 mx-auto">
                    {step.step}
                  </div>
                  
                  {/* Connector Line */}
                  {index < applicationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-dark-3 transform translate-x-8"></div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-dark dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-body-color dark:text-dark-6 mb-4">
                      {step.description}
                    </p>
                    <ul className="text-sm text-body-color dark:text-dark-6 space-y-2">
                      {step.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="flex items-start justify-start">
                          <svg className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-left">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="text-center mt-12 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{display: 'none'}}>
                <button className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t(language, 'joinUs.beginApplication')}
                </button>
              </div>
              
              {/* Download Files Section */}
              {(joinusData?.fileslist && joinusData.fileslist.length > 0) && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-dark dark:text-white mb-6">
                    {language === 'zh-Hans' ? '下载申请资料' : 'Download Application Materials'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {joinusData.fileslist.map((fileItem, index) => (
                      <a
                        key={fileItem.id}
                        href={fileItem.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {fileItem.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fallback: Single Download Button (for backward compatibility) */}
              {(!joinusData?.fileslist || joinusData.fileslist.length === 0) && joinusData?.download?.url && (
                <div className="mt-8">
                  <a 
                    href={joinusData.download.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {language === 'zh-Hans' ? '下载申请资料' : 'Download Application Materials'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Join DITC */}
        <section className="py-20 lg:py-[120px]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2]">
                {t(language, 'joinUs.whyJoin')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {membershipTypes.map((membership, index) => (
                <div key={membership.type} className={`bg-white dark:bg-dark rounded-lg shadow-lg border-2 p-8 ${
                  membership.highlight ? 'border-primary ring-4 ring-primary/20' : 'border-gray-200 dark:border-dark-3'
                }`}>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
                      {membership.title}
                    </h3>
                    <p className="text-body-color dark:text-dark-6 mb-4">
                      {membership.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {membership.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-body-color dark:text-dark-6">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps<JoinUsProps> = async ({ locale }) => {
  try {
    console.log('🔄 正在预生成Join Us页面数据...');
    
    // 预生成所有语言的翻译数据
    const translations: { [key: string]: any } = {}
    const locales = ['en', 'zh-Hans']
    
    locales.forEach(lang => {
      translations[lang] = getTranslation(lang)
    })

    // 从Strapi获取Joinus页面数据
    const joinusData = await getJoinus();

    console.log(`✅ 成功预生成Join Us页面翻译数据`);

    return {
      props: {
        translations,
        joinusData: joinusData || {
          title: 'Join Us',
          blocks: []
        }
      }
    };
  } catch (error) {
    console.error('❌ 预生成Join Us页面数据失败:', error);
    
    return {
      props: {
        translations: {
          'en': getTranslation('en'),
          'zh-Hans': getTranslation('zh-Hans')
        },
        joinusData: {
          title: 'Join Us',
          blocks: []
        }
      }
    };
  }
} 