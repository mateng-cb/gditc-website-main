import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';
import AnimatedNumber from '../components/AnimatedNumber';
import { getTraining, getHome } from '../lib/strapi';
import { t } from '../lib/translations';
import { useLanguage } from './_app';

interface Sector {
  id: number;
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  locale: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
}

interface BannerSwiperItem {
  id?: number;
  title: string;
  description: string;
  remark?: string;
  images?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      large?: {
        url: string;
        width: number;
        height: number;
      };
      medium?: {
        url: string;
        width: number;
        height: number;
      };
      small?: {
        url: string;
        width: number;
        height: number;
      };
      thumbnail?: {
        url: string;
        width: number;
        height: number;
      };
    };
    url: string;
  };
}

interface HomeProps {
  sectors: {
    en: Sector[];
    'zh-Hans': Sector[];
  };
  homeData?: {
    title: string;
    blocks?: any[];
    bannerSwiper?: BannerSwiperItem[];
  };
}

export default function Home({ sectors, homeData }: HomeProps) {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 根据当前语言获取对应的sectors
  const currentSectors = sectors[language as keyof typeof sectors] || sectors.en || [];
  
  // 获取轮播图数据
  const bannerItems = homeData?.bannerSwiper || [];
  
  // 轮播图自动切换
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerItems.length);
    }, 5000); // 每5秒切换一次
    
    return () => clearInterval(interval);
  }, [bannerItems.length]);
  
  // 处理轮播图点击
  const handleSlideClick = (remark?: string) => {
    if (remark) {
      window.open(remark, '_blank');
    }
  };

  return (
    <Layout>
      <SEOHead
        title={language === 'zh-Hans' ? '首页' : 'Home'}
        description={language === 'zh-Hans' ? '数字基础设施技术委员会官方网站' : 'Global Digital Infrastructure Technology Exchange'}
      />
      
      <style jsx>{`
        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
        }
        
        .hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
        }
        
        .number {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--color-primary);
          font-family: 'Arial Black', sans-serif;
          transition: all 0.3s ease;
          display: inline-block;
          text-align: center;
        }
        
        .number:hover {
          color: var(--color-secondary);
          transform: scale(1.1);
          transition: all 0.2s ease;
        }
        
        .sectorItem .group:hover {
          background-color: #3B82F6;
          transition: all 0.5s ease;
          cursor: pointer;
        }
        
        .sectorItem .group:hover .icon-svg {
          stroke: white;
        }
        
        .sectorItem .group:hover h4 {
          color: white;
        }
        
        .hero-slide {
          transition: opacity 1s ease-in-out;
        }
        
        .hero-slide:hover {
          transform: scale(1.02);
          transition: transform 0.5s ease;
        }
        
        .hero-content h2 {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .hero-content p {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
      `}</style>
      
      {/* Hero Section - 轮播图 */}
      <div className="relative h-[600px] overflow-hidden">
        {bannerItems.length > 0 ? (
          <>
            {/* 轮播图容器 */}
            <div className="relative w-full h-full">
              {bannerItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`absolute inset-0 hero-slide transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: item.images?.url 
                      ? `url('${item.images.url}')` 
                      : "url('/images/hero/hero-image.jpg')"
                  }}
                  onClick={() => handleSlideClick(item.remark)}
                >
                  <div className="hero-content cursor-pointer">
                    <h2 className="text-4xl font-bold mb-4">
                      {item.title}
                    </h2>
                    <p className="text-lg mb-4">
                      {item.description}
                    </p>
                    {item.remark && (
                      <span className="bg-primary text-white px-6 py-2 rounded-lg inline-block hover:bg-opacity-90">
                        {t(language, 'hero.cta')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 导航点 */}
            {bannerItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {bannerItems.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}
            
            {/* 左右箭头 */}
            {bannerItems.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerItems.length) % bannerItems.length)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerItems.length)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          /* 默认轮播图 */
          <div className="hero-slide" style={{backgroundImage: "url('/images/hero/hero-image.jpg')"}}>
            <div className="hero-content">
              <h2 className="text-4xl font-bold mb-4">
                {t(language, 'hero.aiSummitTitle')}
              </h2>
              <p className="text-lg mb-4">
                {t(language, 'hero.aiSummitSubtitle')}
              </p>
              <span className="bg-primary text-white px-6 py-2 rounded-lg inline-block hover:bg-opacity-90">
                {t(language, 'hero.cta')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Features Section - 统计数据 */}
      <section className="pb-8 pt-20 dark:bg-dark lg:pb-[70px] lg:pt-[120px]" id="numberInfoBox">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[845px] lg:mb-[70px]">
                <h2 className="mb-3 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2] text-center">
                  {t(language, 'homepage.featuresTitle')}
                </h2>
                <p className="text-base text-body-color dark:text-dark-6">
                  {t(language, 'homepage.featuresDescription')}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-wrap -mx-4">
            <div className="w-full px-6 md:w-1/2 lg:w-1/3">
              <div className="mb-12 wow fadeInUp group" data-wow-delay=".1s">
                <h4 className="mb-3 text-xl font-bold text-dark dark:text-white number">
                  <AnimatedNumber value={25821} />
                </h4>
                <p className="mb-8 text-body-color dark:text-dark-6 lg:mb-9">
                  {t(language, 'homepage.stat1Description')}
                </p>
              </div>
            </div>
            <div className="w-full px-6 md:w-1/2 lg:w-1/3">
              <div className="mb-12 wow fadeInUp group" data-wow-delay=".15s">
                <h4 className="mb-3 text-xl font-bold text-dark dark:text-white number">
                  <AnimatedNumber value={173} />
                </h4>
                <p className="mb-8 text-body-color dark:text-dark-6 lg:mb-9">
                  {t(language, 'homepage.stat2Description')}
                </p>
              </div>
            </div>
            <div className="w-full px-6 md:w-1/2 lg:w-1/3">
              <div className="mb-12 wow fadeInUp group" data-wow-delay=".2s">
                <h4 className="mb-3 text-xl font-bold text-dark dark:text-white number">
                  <AnimatedNumber value={824} />
                </h4>
                <p className="mb-8 text-body-color dark:text-dark-6 lg:mb-9">
                  {t(language, 'homepage.stat3Description')}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Team Section - 核心板块 */}
      {/* <section id="team" className="overflow-hidden bg-gray-1 pb-12 pt-20 dark:bg-dark-2 lg:pb-[90px] lg:pt-[120px]"> */}
        {/* <div className="container px-4 mx-auto">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[485px] text-center">
                <h2 className="mb-3 text-3xl font-bold leading-[1.2] text-dark dark:text-white sm:text-4xl md:text-[40px]">
                  {t(language, 'homepage.sectorsTitle')}
                </h2>
              </div>
            </div>
          </div> */}
          {/* Row 1 */}
          {/* <div className="flex flex-wrap justify-center -mx-4 sectorItem mb-8">
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m78,53.24c.99-1,1.99-2,2.98-3,4.5-4.56,7.07-10.02,7.02-16.55-.02-9.66-6.49-18.11-15.78-20.58-7.93-2.08-14.99-.24-20.95,5.49-1.09,1.05-2.06,2.23-3.27,3.54-1.2-1.31-2.17-2.49-3.27-3.54-5.96-5.73-13.03-7.57-20.95-5.49-9.29,2.47-15.76,10.91-15.78,20.58-.05,6.53,2.52,11.99,7.02,16.55,7.89,8,15.83,15.94,23.75,23.92l9.25,9.33c2.71-2.75,5.35-5.43,7.98-8.09"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="67" y1="85" x2="67" y2="43"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="46" y1="64" x2="88" y2="64"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.standardsDevelopment')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <polyline strokeWidth="2" fill="none" strokeMiterlimit="10" points="33 85 33 53 20 53"/>
                    <polyline strokeWidth="2" fill="none" strokeMiterlimit="10" points="43 74 43 36 29 36"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="53" y1="56" x2="53" y2="22.38"/>
                    <polyline strokeWidth="2" fill="none" strokeMiterlimit="10" points="63 85 63 44 76 44"/>
                    <circle strokeWidth="2" fill="none" strokeMiterlimit="10" cx="14" cy="53" r="6"/>
                    <circle strokeWidth="2" fill="none" strokeMiterlimit="10" cx="23" cy="36" r="6"/>
                    <circle strokeWidth="2" fill="none" strokeMiterlimit="10" cx="53" cy="17" r="6"/>
                    <circle strokeWidth="2" fill="none" strokeMiterlimit="10" cx="82" cy="44" r="6"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="53" y1="64" x2="53" y2="80"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.benchmarkTools')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m78,53.24c.99-1,1.99-2,2.98-3,4.5-4.56,7.07-10.02,7.02-16.55-.02-9.66-6.49-18.11-15.78-20.58-7.93-2.08-14.99-.24-20.95,5.49-1.09,1.05-2.06,2.23-3.27,3.54-1.2-1.31-2.17-2.49-3.27-3.54-5.96-5.73-13.03-7.57-20.95-5.49-9.29,2.47-15.76,10.91-15.78,20.58-.05,6.53,2.52,11.99,7.02,16.55,7.89,8,15.83,15.94,23.75,23.92l9.25,9.33c2.71-2.75,5.35-5.43,7.98-8.09"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="67" y1="85" x2="67" y2="43"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="46" y1="64" x2="88" y2="64"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.certificationService')}
                  </h4>
                </div>
              </div>
            </div>
          </div>
           */}
          {/* Row 2 */}
          {/* <div className="flex flex-wrap justify-center -mx-4 sectorItem">
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m16.81,52.65c-.85-2.9-1.31-5.97-1.31-9.15,0-17.95,14.55-32.5,32.5-32.5s32.5,14.55,32.5,32.5c0,3.18-.46,6.25-1.31,9.15"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m62.74,72.47c-4.42,2.25-9.43,3.53-14.74,3.53s-10.31-1.27-14.74-3.53"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="48" y1="58.94" x2="48" y2="76"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="78.77" y1="33" x2="53" y2="33"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="43" y1="33" x2="17.23" y2="33"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="43" y1="54" x2="19.56" y2="54"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="76.44" y1="54" x2="53" y2="54"/>
                    <ellipse strokeWidth="2" fill="none" strokeMiterlimit="10" cx="48" cy="43.5" rx="17.88" ry="32.5"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="48" y1="37.81" x2="48" y2="49.19"/>
                    <line strokeWidth="2" fill="none" strokeMiterlimit="10" x1="48" y1="11" x2="48" y2="28.06"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.journalSubmission')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m86,54l-32-22V14c0-3.32-2.68-6-6-6s-6,2.68-6,6v18L10,54"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m10,64l32-10v18l-10,10v6l16-4,16,4v-6l-10-10v-18l32,10"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.eventCalendar')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="px-5 pt-12 pb-10 mb-8 bg-white group rounded-xl shadow-testimonial dark:bg-dark dark:shadow-none transition-colors cursor-pointer h-[280px] flex flex-col items-center justify-center">
                <div className="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                  <svg className="h-[120px] w-[120px] rounded-full stroke-current text-dark icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m54,72h6c2.4,0,4-2,4-4v-9.2c7.2-5.2,12-13.6,12-22.8,0-15.6-12.4-28-28-28s-28,12.4-28,28c0,9.6,4.8,18,12,22.8v9.2c0,2,1.6,4,4,4h6"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m36,84c0,2,1.6,4,4,4h16c2.4,0,4-2,4-4v-4h-24v4Z"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m48,47v19"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m42,41h-12"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m66,41h-12"/>
                    <path strokeWidth="2" fill="none" strokeMiterlimit="10" d="m48,35c0-.83,0-12,0-12"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                    {t(language, 'homepage.memberPortal')}
                  </h4>
                </div>
              </div>
            </div>
          </div> */}
        {/* </div> */}
      {/* </section> */}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    console.log('🔄 Starting getStaticProps for Home page...');
    
    // 并行获取所有数据
    const [sectorsEn, sectorsZh, homeData] = await Promise.all([
      getTraining('Network', 'en'),
      getTraining('Network', 'zh-Hans'),
      getHome()
    ]);

    console.log('✅ Sectors EN count:', sectorsEn?.length || 0);
    console.log('✅ Sectors ZH count:', sectorsZh?.length || 0);
    console.log('🏠 Home data received:', !!homeData);
    
    if (homeData) {
      console.log('🏠 Home data details:');
      console.log('  - Title:', homeData.title);
      console.log('  - Has bannerSwiper:', !!homeData.bannerSwiper);
      console.log('  - BannerSwiper count:', homeData.bannerSwiper?.length || 0);
      
      if (homeData.bannerSwiper && homeData.bannerSwiper.length > 0) {
        homeData.bannerSwiper.forEach((item, index) => {
          console.log(`  - Banner ${index + 1}: ${item.title} (has image: ${!!item.images})`);
        });
      }
    } else {
      console.log('❌ No home data received');
    }

    // 清理数据，确保所有locale字段不为undefined
    const cleanSectors = (sectors: any[]) => {
      return sectors?.map(sector => ({
        ...sector,
        locale: sector.locale || 'en'
      })) || [];
    };

    return {
      props: {
        sectors: {
          en: cleanSectors(sectorsEn),
          'zh-Hans': cleanSectors(sectorsZh)
        },
        homeData: homeData || null,
      }
    };
  } catch (error) {
    console.error('❌ Error in getStaticProps:', error);
    return {
      props: {
        sectors: {
          en: [],
          'zh-Hans': []
        },
        homeData: null,
      }
    };
  }
}; 