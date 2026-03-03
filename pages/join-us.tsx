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
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    // 申请类别信息
    membershipCategory: '',
    technicalCommittee: '',
    // 组织/公司信息
    orgNameChinese: '',
    orgNameEnglish: '',
    orgType: '',
    industrySector: '',
    country: '',
    address: '',
    foundedDate: '',
    annualSales: '',
    orgIntroduction: '',
    orgIntroductionFile: null as File | null,
    // 申请人信息
    applicantNameChinese: '',
    applicantNameEnglish: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    jobTitle: '',
    phone: '',
    email: '',
    englishLevel: ''
  })

  // 表单验证错误
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Toast 通知：{ type: 'success'|'error', message: string }
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  // 文件输入重置 key，提交成功后递增以清空文件选择
  const [fileInputKey, setFileInputKey] = useState(0)

  // 表单限制常量
  const INPUT_MAX_LENGTH = 200
  const TEXTAREA_MAX_LENGTH = 500
  const FILE_MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const FILE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt'

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

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // 处理输入变化（带长度限制）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const target = e.target
    const maxLen = target instanceof HTMLTextAreaElement ? TEXTAREA_MAX_LENGTH : INPUT_MAX_LENGTH
    const trimmed = value.length > maxLen ? value.slice(0, maxLen) : value
    setFormData(prev => ({ ...prev, [name]: trimmed }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // 处理文件上传（带格式和大小校验）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    const isZh = language === 'zh-Hans'
    if (file) {
      if (file.size > FILE_MAX_SIZE) {
        setErrors(prev => ({ ...prev, orgIntroductionFile: isZh ? '文件大小不能超过 10MB' : 'File size must not exceed 10MB' }))
        setFormData(prev => ({ ...prev, orgIntroductionFile: null }))
        e.target.value = ''
        return
      }
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt']
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedExts.includes(ext)) {
        setErrors(prev => ({ ...prev, orgIntroductionFile: isZh ? '仅支持 JPG、PNG、GIF、WebP、PDF、DOC、DOCX、TXT 格式' : 'Only JPG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT formats are supported' }))
        setFormData(prev => ({ ...prev, orgIntroductionFile: null }))
        e.target.value = ''
        return
      }
    }
    setFormData(prev => ({ ...prev, orgIntroductionFile: file }))
    if (errors.orgIntroductionFile) {
      setErrors(prev => ({ ...prev, orgIntroductionFile: '' }))
    }
  }

  // 表单验证
  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {}
    const isZh = language === 'zh-Hans'

    // 申请类别信息验证
    if (!formData.membershipCategory) {
      newErrors.membershipCategory = isZh ? '请选择会员类别' : 'Please select membership category'
    }
    if (!formData.technicalCommittee) {
      newErrors.technicalCommittee = isZh ? '请选择申请加入的技术委员会' : 'Please select technical committee'
    }

    // 组织/公司信息验证
    if (!formData.orgNameChinese) {
      newErrors.orgNameChinese = isZh ? '请输入中文名称' : 'Please enter name in Chinese'
    }
    if (!formData.orgNameEnglish) {
      newErrors.orgNameEnglish = isZh ? '请输入英文名称' : 'Please enter name in English'
    }
    if (!formData.orgType) {
      newErrors.orgType = isZh ? '请选择组织/公司性质' : 'Please select organization type'
    }
    if (!formData.industrySector) {
      newErrors.industrySector = isZh ? '请输入所属行业' : 'Please enter industry sector'
    }
    if (!formData.country) {
      newErrors.country = isZh ? '请输入所在国家/地区' : 'Please enter country/region'
    }
    if (!formData.address) {
      newErrors.address = isZh ? '请输入单位地址' : 'Please enter address'
    }
    if (!formData.foundedDate) {
      newErrors.foundedDate = isZh ? '请输入成立时间' : 'Please enter founded date'
    }
    if (!formData.annualSales) {
      newErrors.annualSales = isZh ? '请输入年销售额' : 'Please enter annual sales volume'
    }
    if (!formData.orgIntroduction && !formData.orgIntroductionFile) {
      newErrors.orgIntroduction = isZh ? '请填写或上传组织/公司简介' : 'Please enter or upload organization introduction'
    }

    // 申请人信息验证
    if (!formData.applicantNameChinese) {
      newErrors.applicantNameChinese = isZh ? '请输入申请人中文姓名' : 'Please enter applicant name in Chinese'
    }
    if (!formData.applicantNameEnglish) {
      newErrors.applicantNameEnglish = isZh ? '请输入申请人英文姓名' : 'Please enter applicant name in English'
    }
    if (!formData.gender) {
      newErrors.gender = isZh ? '请选择性别' : 'Please select gender'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = isZh ? '请输入出生年月' : 'Please enter date of birth'
    }
    if (!formData.nationality) {
      newErrors.nationality = isZh ? '请输入国籍' : 'Please enter nationality'
    }
    if (!formData.jobTitle) {
      newErrors.jobTitle = isZh ? '请输入职务' : 'Please enter job title'
    }
    if (!formData.phone) {
      newErrors.phone = isZh ? '请输入电话' : 'Please enter phone number'
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '')
      if (digitsOnly.length < 7 || digitsOnly.length > 20) {
        newErrors.phone = isZh ? '请输入有效的电话号码（7-20位数字）' : 'Please enter a valid phone number (7-20 digits)'
      }
    }
    if (!formData.email) {
      newErrors.email = isZh ? '请输入邮箱' : 'Please enter email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isZh ? '请输入有效的邮箱地址' : 'Please enter a valid email address'
    }
    if (!formData.englishLevel) {
      newErrors.englishLevel = isZh ? '请选择英语水平' : 'Please select English level'
    }

    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateForm()
    if (!validation.isValid) {
      // 滚动到第一个错误字段
      const firstErrorField = Object.keys(validation.errors)[0]
      if (firstErrorField) {
        setTimeout(() => {
          const element = document.querySelector(`[name="${firstErrorField}"]`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
      return
    }

    setIsSubmitting(true)
    try {
      // 创建 FormData 对象用于文件上传
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData]
        if (value !== null && value !== '') {
          if (key === 'orgIntroductionFile' && value instanceof File) {
            submitData.append(key, value)
          } else if (key !== 'orgIntroductionFile') {
            submitData.append(key, String(value))
          }
        }
      })

      const response = await fetch('/api/join-us/submit', {
        method: 'POST',
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || (language === 'zh-Hans' ? '提交失败' : 'Submission failed'))
      }
      
      showToast('success', language === 'zh-Hans' ? '表单提交成功！' : 'Form submitted successfully!')
      
      // 重置表单
      setFormData({
        membershipCategory: '',
        technicalCommittee: '',
        orgNameChinese: '',
        orgNameEnglish: '',
        orgType: '',
        industrySector: '',
        country: '',
        address: '',
        foundedDate: '',
        annualSales: '',
        orgIntroduction: '',
        orgIntroductionFile: null,
        applicantNameChinese: '',
        applicantNameEnglish: '',
        gender: '',
        dateOfBirth: '',
        nationality: '',
        jobTitle: '',
        phone: '',
        email: '',
        englishLevel: ''
      })
      setErrors({})
      setFileInputKey(k => k + 1)
    } catch (error) {
      console.error('Form submission error:', error)
      showToast('error', error instanceof Error ? error.message : (language === 'zh-Hans' ? '提交失败，请稍后重试' : 'Submission failed, please try again'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast 通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
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
        <section className="py-12 lg:py-16 bg-gray-1 dark:bg-dark-2">
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
                    <p className="text-body-color dark:text-dark-6 mb-4" style={{display: 'none'}}>
                      {step.description}
                    </p>
                    <ul className="text-sm text-body-color dark:text-dark-6 space-y-2" style={{display: 'none'}}>
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

            {/* CTA Buttons - 使用 max-w-4xl px-4 与方式二对齐（方式二容器有 px-4） */}
            <div className="mt-12 max-w-4xl mx-auto px-4">
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
                    {language === 'zh-Hans' ? '方式一：点击下载表格填写' : 'Method 1: Click to Download Form'}
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
                    {language === 'zh-Hans' ? '方式一：点击下载表格填写' : 'Method 1: Click to Download Form'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Application Form - 与方式一使用相同 max-w-4xl 对齐 */}
        <section className="pb-20 lg:pb-[120px] bg-gray-1 dark:bg-dark-2">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">
                {language === 'zh-Hans' ? '方式二：在线填写信息' : 'Method 2: Fill Information Online'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark rounded-lg shadow-lg p-8 space-y-8">
              {/* 申请类别信息 */}
              <div className="border-b border-gray-200 dark:border-dark-3 pb-8">
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-6">
                  {language === 'zh-Hans' ? '（1）申请类别信息' : '(1) Category Information'}
                </h3>
                
                <div className="space-y-6">
                  {/* 会员类别 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '会员类别' : 'Membership Category'} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="membershipCategory"
                          value="core"
                          checked={formData.membershipCategory === 'core'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '核心会员 Core Member' : 'Core Member'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="membershipCategory"
                          value="ordinary"
                          checked={formData.membershipCategory === 'ordinary'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '普通会员 Ordinary Member' : 'Ordinary Member'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="membershipCategory"
                          value="associate"
                          checked={formData.membershipCategory === 'associate'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '准会员 Associate Member' : 'Associate Member'}
                        </span>
                      </label>
                    </div>
                    {errors.membershipCategory && (
                      <p className="mt-1 text-sm text-red-500">{errors.membershipCategory}</p>
                    )}
                  </div>

                  {/* 申请加入技术委员会 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '申请加入技术委员会' : 'Applied Technical Committee (TC)'} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="datacenter"
                          checked={formData.technicalCommittee === 'datacenter'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '数据中心技术委员会 Data Center Technical Committee' : 'Data Center Technical Committee'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="network"
                          checked={formData.technicalCommittee === 'network'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '可靠网络技术委员会 Reliable Network Technical Committee' : 'Reliable Network Technical Committee'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="governance"
                          checked={formData.technicalCommittee === 'governance'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '数据治理技术委员会 Data Governance Technical Committee' : 'Data Governance Technical Committee'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="ai"
                          checked={formData.technicalCommittee === 'ai'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '人工智能模型技术委员会 Artificial Intelligence Model Technical Committee' : 'Artificial Intelligence Model Technical Committee'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="energy"
                          checked={formData.technicalCommittee === 'energy'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '能源数字智能技术委员会 Energy Digital Intelligence Technical Committee' : 'Energy Digital Intelligence Technical Committee'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="technicalCommittee"
                          value="liquid-cooling"
                          checked={formData.technicalCommittee === 'liquid-cooling'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '液冷焦点工作组 DITC-LCSIG (Liquid Cooling Special Interest Group)' : 'Liquid Cooling Special Interest Group (DITC-LCSIG)'}
                        </span>
                      </label>
                    </div>
                    {errors.technicalCommittee && (
                      <p className="mt-1 text-sm text-red-500">{errors.technicalCommittee}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 组织/公司信息 */}
              <div className="border-b border-gray-200 dark:border-dark-3 pb-8">
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-6">
                  {language === 'zh-Hans' ? '（2）组织/公司信息' : '(2) Organization/Company Information'}
                </h3>
                
                <div className="space-y-6">
                  {/* 组织/公司名称 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '组织/公司名称' : 'Name of Organization/Company'} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-body-color dark:text-dark-6 mb-1">
                          {language === 'zh-Hans' ? '中文名称' : 'Name in Chinese'}
                        </label>
                        <input
                          type="text"
                          name="orgNameChinese"
                          value={formData.orgNameChinese}
                          onChange={handleChange}
                          maxLength={INPUT_MAX_LENGTH}
                          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                            errors.orgNameChinese ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                          }`}
                        />
                        {errors.orgNameChinese && (
                          <p className="mt-1 text-sm text-red-500">{errors.orgNameChinese}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-body-color dark:text-dark-6 mb-1">
                          {language === 'zh-Hans' ? '英文名称' : 'Name in English'}
                        </label>
                        <input
                          type="text"
                          name="orgNameEnglish"
                          value={formData.orgNameEnglish}
                          onChange={handleChange}
                          maxLength={INPUT_MAX_LENGTH}
                          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                            errors.orgNameEnglish ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                          }`}
                        />
                        {errors.orgNameEnglish && (
                          <p className="mt-1 text-sm text-red-500">{errors.orgNameEnglish}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 组织/公司性质 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '组织/公司性质' : 'Type of Organization/Company'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="orgType"
                      value={formData.orgType}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      placeholder={language === 'zh-Hans' ? '政府机构、企业、研究机构、高等院校等' : 'Government departments, Enterprises, Research institutions, Higher education institutions, etc'}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.orgType ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.orgType && (
                      <p className="mt-1 text-sm text-red-500">{errors.orgType}</p>
                    )}
                  </div>

                  {/* 所属行业 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '所属行业' : 'Industry Sector'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="industrySector"
                      value={formData.industrySector}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.industrySector ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.industrySector && (
                      <p className="mt-1 text-sm text-red-500">{errors.industrySector}</p>
                    )}
                  </div>

                  {/* 所在国家/地区 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '所在国家/地区' : 'Country of Residence'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.country ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>

                  {/* 单位地址 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '单位地址' : 'Address of Organization/Company'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.address ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  {/* 成立时间 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '成立时间' : 'Founded Date'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="foundedDate"
                      value={formData.foundedDate}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      placeholder={language === 'zh-Hans' ? '请输入成立时间' : 'Please enter founded date'}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.foundedDate ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.foundedDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.foundedDate}</p>
                    )}
                  </div>

                  {/* 年销售额 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '年销售额' : 'Annual Sales Volume'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="annualSales"
                      value={formData.annualSales}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.annualSales ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.annualSales && (
                      <p className="mt-1 text-sm text-red-500">{errors.annualSales}</p>
                    )}
                  </div>

                  {/* 组织/公司简介 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '组织/公司简介' : 'Introduction of the organization/company'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="orgIntroduction"
                      value={formData.orgIntroduction}
                      onChange={handleChange}
                      rows={4}
                      maxLength={TEXTAREA_MAX_LENGTH}
                      placeholder={language === 'zh-Hans' ? `最多${TEXTAREA_MAX_LENGTH}字` : `Max ${TEXTAREA_MAX_LENGTH} characters`}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.orgIntroduction ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    <div className="mt-2">
                      <label className="block text-xs text-body-color dark:text-dark-6 mb-2">
                        {language === 'zh-Hans' ? '或上传材料' : 'Or upload material'}
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-dark-3 rounded-lg bg-gray-50 dark:bg-dark-2 text-dark dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors">
                          <svg className="w-5 h-5 text-body-color dark:text-dark-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium">
                            {language === 'zh-Hans' ? '选择文件' : 'Choose file'}
                          </span>
                          <input
                            key={fileInputKey}
                            type="file"
                            name="orgIntroductionFile"
                            onChange={handleFileChange}
                            accept={FILE_ACCEPT}
                            className="sr-only"
                          />
                        </label>
                        {formData.orgIntroductionFile && (
                          <span className="text-sm text-body-color dark:text-dark-6 truncate max-w-[200px]" title={formData.orgIntroductionFile.name}>
                            {formData.orgIntroductionFile.name}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-body-color dark:text-dark-6">
                        {language === 'zh-Hans'
                          ? '支持格式：JPG、PNG、GIF、WebP、PDF、DOC、DOCX、TXT；大小不超过 10MB'
                          : 'Supported formats: JPG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT; Max 10MB'}
                      </p>
                    </div>
                    {(errors.orgIntroduction || errors.orgIntroductionFile) && (
                      <p className="mt-1 text-sm text-red-500">{errors.orgIntroduction || errors.orgIntroductionFile}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 申请人信息 */}
              <div className="pb-8">
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-6">
                  {language === 'zh-Hans' ? '（3）申请人信息' : '(3) Applicant Information'}
                </h3>
                
                <div className="space-y-6">
                  {/* 申请人姓名 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '申请人姓名' : 'Name of Applicant'} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-body-color dark:text-dark-6 mb-1">
                          {language === 'zh-Hans' ? '中文' : 'Chinese'}
                        </label>
                        <input
                          type="text"
                          name="applicantNameChinese"
                          value={formData.applicantNameChinese}
                          onChange={handleChange}
                          maxLength={INPUT_MAX_LENGTH}
                          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                            errors.applicantNameChinese ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                          }`}
                        />
                        {errors.applicantNameChinese && (
                          <p className="mt-1 text-sm text-red-500">{errors.applicantNameChinese}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-body-color dark:text-dark-6 mb-1">
                          {language === 'zh-Hans' ? '英文' : 'English'}
                        </label>
                        <input
                          type="text"
                          name="applicantNameEnglish"
                          value={formData.applicantNameEnglish}
                          onChange={handleChange}
                          maxLength={INPUT_MAX_LENGTH}
                          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                            errors.applicantNameEnglish ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                          }`}
                        />
                        {errors.applicantNameEnglish && (
                          <p className="mt-1 text-sm text-red-500">{errors.applicantNameEnglish}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 性别 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '性别' : 'Gender'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">{language === 'zh-Hans' ? '男 Male' : 'Male'}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">{language === 'zh-Hans' ? '女 Female' : 'Female'}</span>
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  {/* 出生年月 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '出生年月' : 'Date of Birth'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      placeholder={language === 'zh-Hans' ? '请输入出生年月' : 'Please enter date of birth'}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* 国籍 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '国籍' : 'Nationality'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.nationality ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.nationality && (
                      <p className="mt-1 text-sm text-red-500">{errors.nationality}</p>
                    )}
                  </div>

                  {/* 职务 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '职务' : 'Job title'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.jobTitle ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.jobTitle && (
                      <p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
                    )}
                  </div>

                  {/* 电话 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '电话' : 'Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      placeholder={language === 'zh-Hans' ? '支持国际格式，如 +86 138 1234 5678' : 'International format supported, e.g. +1 234 567 8900'}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* 邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '邮箱' : 'E-mail'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={INPUT_MAX_LENGTH}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-2 text-dark dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-3'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* 英语水平 */}
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                      {language === 'zh-Hans' ? '英语水平' : 'English Level'} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="englishLevel"
                          value="interpreter"
                          checked={formData.englishLevel === 'interpreter'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '能担任口译 Capable of Acting as an Interpreter' : 'Capable of Acting as an Interpreter'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="englishLevel"
                          value="conversation"
                          checked={formData.englishLevel === 'conversation'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '一般会话 Basic conversation' : 'Basic conversation'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="englishLevel"
                          value="reading"
                          checked={formData.englishLevel === 'reading'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '能阅读 Read proficiently' : 'Read proficiently'}
                        </span>
                      </label>
                      <label className="flex items-center py-2 cursor-pointer">
                        <input
                          type="radio"
                          name="englishLevel"
                          value="none"
                          checked={formData.englishLevel === 'none'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-dark dark:text-white">
                          {language === 'zh-Hans' ? '基本不会 Basically None' : 'Basically None'}
                        </span>
                      </label>
                    </div>
                    {errors.englishLevel && (
                      <p className="mt-1 text-sm text-red-500">{errors.englishLevel}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="pt-6 border-t border-gray-200 dark:border-dark-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? (language === 'zh-Hans' ? '提交中...' : 'Submitting...')
                    : (language === 'zh-Hans' ? '提交申请' : 'Submit Application')
                  }
                </button>
              </div>
            </form>
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