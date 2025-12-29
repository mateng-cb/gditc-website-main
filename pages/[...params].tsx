import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import SEOHead from '../components/SEOHead';
import BlockRenderer from '../components/BlockRenderer';
import { useLanguage } from './_app';
import { getDetailContent, getContentList, DetailContent, BlockContent } from '../lib/detail-api';
import { parseMarkdown, isMarkdown } from '../lib/markdown-parser';

interface DetailPageProps {
  channelType: string;
  documentId: string;
  initialContent: {
    title: string;
    description: string;
    contents: BlockContent[] | string | null;
    locale: string;
    createdAt: string;
    cover?: string | null;
  };
  relatedContentData?: { [key: string]: DetailContent[] };
}

export default function DetailPage({ 
  channelType, 
  documentId, 
  initialContent,
  relatedContentData = {}
}: DetailPageProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  // 使用新的 Markdown 解析器
  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    return parseMarkdown(markdown);
  };

  // 检查内容类型并处理
  const isBlockContent = useMemo(() => {
    return Array.isArray(content.contents);
  }, [content.contents]);

  // 预处理正文：检测并转换 Markdown 语法（仅用于字符串内容）
  const htmlContent = useMemo(() => {
    if (isBlockContent) return '';
    const raw = typeof content.contents === 'string' ? content.contents : '';
    const looksLikeMarkdown = isMarkdown(raw);
    return looksLikeMarkdown ? convertMarkdownToHtml(raw) : raw;
  }, [content.contents, isBlockContent]);

  // 获取相关文章
  const currentLocale = language === 'zh-Hans' ? 'zh-Hans' : 'en';
  const relatedArticles = relatedContentData[currentLocale] || relatedContentData['en'] || [];

  // 语言切换时重新获取内容
  useEffect(() => {
    if (content.locale !== currentLocale) {
      setLoading(true);
      
      const fetchContentForLanguage = async () => {
        try {
          const newContent = await getDetailContent(channelType, documentId, currentLocale);
          if (newContent) {
            setContent({
              title: newContent.title || content.title,
              description: newContent.description || newContent.descript || content.description,
              contents: newContent.contents || content.contents,
              locale: newContent.locale || currentLocale,
              createdAt: newContent.createdAt || content.createdAt,
              cover: newContent.cover?.url || content.cover,
            });
          }
        } catch (error) {
          console.error('Error fetching content for language:', error);
          // 如果获取失败，保持当前内容但更新语言标识
          setContent(prev => ({ ...prev, locale: currentLocale }));
        } finally {
          setLoading(false);
        }
      };

      fetchContentForLanguage();
    }
  }, [currentLocale, channelType, documentId, content.locale, content.title, content.description, content.contents, content.createdAt, content.cover]);

  // 路由变化时重置内容
  useEffect(() => {
    setContent(initialContent);
  }, [channelType, documentId, initialContent]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh-Hans' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChannelDisplayName = (channel: string) => {
    const channelNames: { [key: string]: { [key: string]: string } } = {
      'zh-Hans': {
        'sectors': '行业板块',
        'events': '活动',
        'resources': '资源',
        'newsroom': '新闻中心',
        'articles': '文章'
      },
      'en': {
        'sectors': 'Sectors',
        'events': 'Events', 
        'resources': 'Resources',
        'newsroom': 'Newsroom',
        'articles': 'Articles'
      }
    };
    
    const locale = language === 'zh-Hans' ? 'zh-Hans' : 'en';
    return channelNames[locale]?.[channel] || channel;
  };

  return (
    <Layout>
      <SEOHead
        title={`${content.title} - DITC`}
        description={content.description}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark p-6 rounded-lg">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-dark dark:text-white">
              {language === 'zh-Hans' ? '正在加载内容...' : 'Loading content...'}
            </p>
          </div>
        </div>
      )}

      {/* Banner Section */}
      <div className="relative z-10 overflow-hidden pb-[10px] pt-[10px] dark:bg-dark md:pt-[10px] lg:pt-[20px]">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-stroke/0 via-stroke to-stroke/0 dark:via-dark-3" style={{ display: 'none' }}></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center -mx-4" style={{ display: 'none' }}>
            <div className="w-full px-4">
              <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                  {language === 'zh-Hans' ? '详情页面' : 'Detail Page'}
                </h1>
                <p className="mb-5 text-base text-body-color dark:text-dark-6">
                  {language === 'zh-Hans' 
                    ? '了解更多DITC的最新资讯和见解' 
                    : 'Learn more about DITC\'s latest news and insights'
                  }
                </p>
              </div>
            </div>
          </div>
          {/* 面包屑导航 - 左对齐 */}
          <ul className="flex items-center gap-[10px] text-sm">
            <li>
              <a
                href={language === 'en' ? '/' : `/${language}`}
                className="text-body-color dark:text-dark-6 hover:text-primary transition-colors"
              >
                {language === 'zh-Hans' ? '首页' : 'Home'}
              </a>
            </li>
            <li>
              <span className="text-body-color dark:text-dark-6"> / </span>
              <a 
                href={language === 'en' ? `/${channelType}` : `/${language}/${channelType}`}
                className="capitalize text-body-color dark:text-dark-6 hover:text-primary transition-colors"
              >
                {getChannelDisplayName(channelType)}
              </a>
            </li>
            <li>
              <span className="text-body-color dark:text-dark-6"> / </span>
              <span className="text-dark dark:text-white font-medium">
                {language === 'zh-Hans' ? '详情' : 'Details'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Featured Image - 符合版心宽度，高度自适应 */}
      {content.cover && (
        <div className="container mx-auto px-4 mb-[50px]" style={{display: 'none'}}>
          <div className="wow fadeInUp relative z-20 overflow-hidden rounded-[5px]" data-wow-delay=".1s">
            <img
              src={content.cover}
              alt={content.title}
              className="w-full h-auto object-cover object-center"
            />
            {/* 图片上的覆盖层和元信息 */}
            <div className="absolute top-0 left-0 z-10 flex items-end w-full h-full bg-gradient-to-t from-dark/70 to-transparent">
              <div className="flex flex-wrap items-center p-4 pb-4 sm:px-8">
                <div className="flex items-center mb-4 mr-5 md:mr-10">
                  <p className="text-base font-medium text-white">
                    {language === 'zh-Hans' ? '发布时间：' : 'Published: '}
                    <span className="text-white/90">
                      {formatDate(content.createdAt)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center mb-4">
                  <p className="flex items-center mr-5 text-sm font-medium text-white md:mr-6">
                    <span className="mr-3">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                        <path d="M11.1002 4.875H4.6502C4.3502 4.875 4.0752 5.125 4.0752 5.45C4.0752 5.775 4.3252 6.025 4.6502 6.025H11.1252C11.4252 6.025 11.7002 5.775 11.7002 5.45C11.7002 5.125 11.4252 4.875 11.1002 4.875Z"/>
                        <path d="M9.8002 7.92505H4.6502C4.3502 7.92505 4.0752 8.17505 4.0752 8.50005C4.0752 8.82505 4.3252 9.07505 4.6502 9.07505H9.8002C10.1002 9.07505 10.3752 8.82505 10.3752 8.50005C10.3752 8.17505 10.1002 7.92505 9.8002 7.92505Z"/>
                      </svg>
                    </span>
                    {getChannelDisplayName(channelType)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section - paddingTop为0 */}
      <section className="pb-10 pt-0 dark:bg-dark lg:pb-20 lg:pt-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                {/* Article Title - 添加文章标题到图片下方 */}
                <div className="wow fadeInUp mb-8" data-wow-delay=".1s">
                  <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-3xl md:text-[35px] md:leading-[1.28]">
                    {content.title}
                  </h1>
                  
                  {/* Meta info under title */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-body-color dark:text-dark-6">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(content.createdAt)}
                    </span>
                    
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {getChannelDisplayName(channelType)}
                    </span>
                  </div>
                </div>

                <p className="mb-6 text-base wow fadeInUp text-body-color dark:text-dark-6 text-justify" data-wow-delay=".1s">
                  {content.description}
                </p>

                <div className="mb-10 wow fadeInUp" data-wow-delay=".1s">
                  {content.contents ? (
                    isBlockContent ? (
                      <BlockRenderer 
                        blocks={content.contents as BlockContent[]} 
                        className="text-justify"
                      />
                    ) : (
                      <div 
                        className="prose prose-lg max-w-none dark:prose-invert text-justify"
                        dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        style={{ textAlign: 'justify', lineHeight: '1.7' }}
                      />
                    )
                  ) : (
                    <p className="text-body-color dark:text-dark-6 text-justify">
                      {language === 'zh-Hans' ? '暂无内容' : 'No content available'}
                    </p>
                  )}
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center mb-8 p-4 bg-gray-50 dark:bg-dark-2 rounded-lg">
                  <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <p className="text-sm text-body-color dark:text-dark-6">
                      <strong>{language === 'zh-Hans' ? '发布时间：' : 'Published:'}</strong> {formatDate(content.createdAt)}
                    </p>
                  </div>
                  <div className="w-full md:w-1/2">
                    <p className="text-sm text-body-color dark:text-dark-6">
                      <strong>{language === 'zh-Hans' ? '分类：' : 'Category:'}</strong> {getChannelDisplayName(channelType)}
                    </p>
                  </div>
                </div>

                {/* Share Section */}
                <div className="flex flex-wrap items-center mb-12 -mx-4">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="flex flex-wrap items-center gap-3 mb-8 wow fadeInUp md:mb-0" data-wow-delay=".1s">
                      <span className="block rounded-md bg-primary/[0.08] px-[14px] py-[5px] text-base text-dark dark:text-white">
                        {getChannelDisplayName(channelType)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="flex items-center wow fadeInUp md:justify-end" data-wow-delay=".1s">
                      <span className="mr-5 text-sm font-medium text-body-color dark:text-dark-6">
                        {language === 'zh-Hans' ? '分享此文章' : 'Share This Post'}
                      </span>
                      <div className="flex items-center gap-[10px]">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#1877F2"/>
                            <path d="M17 15.5399V12.7518C17 11.6726 17.8954 10.7976 19 10.7976H21V7.86631L18.285 7.67682C15.9695 7.51522 14 9.30709 14 11.5753V15.5399H11V18.4712H14V24.3334H17V18.4712H20L21 15.5399H17Z" fill="white"/>
                          </svg>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}&text=${content.title}`} target="_blank" rel="noopener noreferrer">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#55ACEE"/>
                            <path d="M24.2945 11.375C24.4059 11.2451 24.2607 11.0755 24.0958 11.1362C23.728 11.2719 23.3918 11.3614 22.8947 11.4166C23.5062 11.0761 23.7906 10.5895 24.0219 9.99339C24.0777 9.84961 23.9094 9.71915 23.7645 9.78783C23.1759 10.0669 22.5408 10.274 21.873 10.3963C21.2129 9.7421 20.272 9.33331 19.2312 9.33331C17.2325 9.33331 15.6117 10.8406 15.6117 12.6993C15.6117 12.9632 15.6441 13.2202 15.7051 13.4663C12.832 13.3324 10.2702 12.1034 8.49031 10.2188C8.36832 10.0897 8.14696 10.1068 8.071 10.2643C7.86837 10.6846 7.7554 11.1509 7.7554 11.6418C7.7554 12.8093 8.39417 13.8395 9.36518 14.4431C8.92981 14.4301 8.51344 14.3452 8.12974 14.2013C7.94292 14.1312 7.72877 14.2543 7.75387 14.4427C7.94657 15.8893 9.11775 17.0827 10.6295 17.3647C10.3259 17.442 10.0061 17.483 9.67537 17.483C9.59517 17.483 9.51567 17.4805 9.43688 17.4756C9.23641 17.4632 9.07347 17.6426 9.15942 17.8141C9.72652 18.946 10.951 19.7361 12.376 19.7607C11.1374 20.6637 9.57687 21.2017 7.88109 21.2017C7.672 21.2017 7.5823 21.4706 7.7678 21.5617C9.20049 22.266 10.832 22.6666 12.5656 22.6666C19.2231 22.6666 22.8631 17.5377 22.8631 13.0896C22.8631 12.944 22.8594 12.7984 22.8528 12.6542C23.3932 12.2911 23.8789 11.8595 24.2945 11.375Z" fill="white"/>
                          </svg>
                        </a>
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#007AB9"/>
                            <path d="M11.7836 10.1666C11.7833 10.8452 11.3716 11.4559 10.7426 11.7106C10.1137 11.9654 9.39306 11.8134 8.92059 11.3263C8.44811 10.8392 8.31813 10.1143 8.59192 9.49341C8.86572 8.87251 9.48862 8.4796 10.1669 8.49996C11.0678 8.527 11.784 9.26533 11.7836 10.1666ZM11.8336 13.0666H8.50024V23.4999H11.8336V13.0666ZM17.1003 13.0666H13.7836V23.4999H17.0669V18.0249C17.0669 14.9749 21.0419 14.6916 21.0419 18.0249V23.4999H24.3336V16.8916C24.3336 11.75 18.4503 11.9416 17.0669 14.4666L17.1003 13.0666Z" fill="white"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-12">
                  <button
                    onClick={() => router.back()}
                    className="bg-secondary text-white px-6 py-3 rounded-md hover:bg-secondary/90 transition duration-300"
                  >
                    {language === 'zh-Hans' ? '返回' : 'Go Back'}
                  </button>
                  <a
                    href={`/${channelType}`}
                    className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition duration-300 inline-block"
                  >
                    {language === 'zh-Hans' ? `浏览更多${getChannelDisplayName(channelType)}` : `View More ${getChannelDisplayName(channelType)}`}
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full px-4 lg:w-4/12">
              <div>
                {/* Popular Articles */}
                <div className="mb-8">
                  <h2 className="wow fadeInUp relative pb-5 text-2xl font-semibold text-dark dark:text-white sm:text-[28px]" data-wow-delay=".1s">
                    {language === 'zh-Hans' ? '推荐阅读' : 'Popular Articles'}
                  </h2>
                  <span className="mb-10 inline-block h-[2px] w-20 bg-primary"></span>

                  {relatedArticles.slice(0, 4).map((article, index) => (
                    <div key={article.documentId} className="w-full">
                      <div className={`flex items-center w-full pb-5 mb-5 wow fadeInUp border-stroke dark:border-dark-3 ${index === 3 ? 'border-0' : 'border-b'}`} data-wow-delay=".1s">
                        <div className="mr-5 h-20 w-full max-w-[80px] overflow-hidden rounded-full">
                          {article.cover?.url ? (
                            <img
                              src={article.cover.url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="/images/blog/article-author-01.png"
                              alt="default"
                              className="w-full"
                            />
                          )}
                        </div>
                        <div className="w-full">
                          <h4>
                                                          <a
                                href={`/${channelType}/${article.documentId}`}
                                className={`inline-block mb-1 text-lg font-medium leading-snug text-dark hover:text-primary dark:text-dark-6 dark:hover:text-primary lg:text-base xl:text-lg article-title ${language === 'zh-Hans' ? 'zh' : 'en'}`}
                              >
                                {article.title}
                              </a>
                            </h4>
                            <p className={`text-sm text-body-color dark:text-dark-6 article-description ${language === 'zh-Hans' ? 'zh' : 'en'}`}>
                              {article.description || article.descript || formatDate(article.createdAt)}
                            </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show placeholder articles if no related articles */}
                  {relatedArticles.length === 0 && (
                    <>
                      <div className="w-full">
                        <div className="flex items-center w-full pb-5 mb-5 border-b wow fadeInUp border-stroke dark:border-dark-3" data-wow-delay=".1s">
                          <div className="mr-5 h-20 w-full max-w-[80px] overflow-hidden rounded-full">
                            <img
                              src="/images/blog/article-author-01.png"
                              alt="image"
                              className="w-full"
                            />
                          </div>
                          <div className="w-full">
                            <h4>
                              <a
                                href="javascript:void(0)"
                                className={`inline-block mb-1 text-lg font-medium leading-snug text-dark hover:text-primary dark:text-dark-6 dark:hover:text-primary lg:text-base xl:text-lg article-title ${language === 'zh-Hans' ? 'zh' : 'en'}`}
                              >
                                {language === 'zh-Hans' ? '创建引人入胜的在线课程…' : 'Create engaging online courses your student…'}
                              </a>
                            </h4>
                            <p className={`text-sm text-body-color dark:text-dark-6 article-description ${language === 'zh-Hans' ? 'zh' : 'en'}`}>
                              {language === 'zh-Hans' ? 'DITC 团队' : 'DITC Team'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles Section */}
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4 wow fadeInUp mt-14" data-wow-delay=".2s">
              <h2 className="relative pb-5 text-2xl font-semibold text-dark dark:text-white sm:text-[36px]">
                {language === 'zh-Hans' ? '相关文章' : 'Related Articles'}
              </h2>
              <span className="mb-10 inline-block h-[2px] w-20 bg-primary"></span>
            </div>
            
            {relatedArticles.slice(0, 3).map((article, index) => (
              <div key={article.documentId} className="w-full px-4 md:w-1/2 lg:w-1/3">
                <div className="mb-10 wow fadeInUp group" data-wow-delay={`.${1 + index}s`}>
                  <div className="mb-8 overflow-hidden rounded-[5px]">
                    <a href={`/${channelType}/${article.documentId}`} className="block">
                      {article.cover?.url ? (
                        <img
                          src={article.cover.url}
                          alt={article.title}
                          className="w-full h-48 object-cover transition group-hover:rotate-6 group-hover:scale-125"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition group-hover:rotate-6 group-hover:scale-125">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </a>
                  </div>
                  <div>
                    <span className="mb-6 inline-block rounded-[5px] bg-primary px-4 py-0.5 text-center text-xs font-medium leading-loose text-white">
                      {formatDate(article.createdAt)}
                    </span>
                    <h3>
                      <a
                        href={`/${channelType}/${article.documentId}`}
                        className={`inline-block mb-4 text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl lg:text-xl xl:text-2xl article-title ${language === 'zh-Hans' ? 'zh' : 'en'}`}
                      >
                        {article.title}
                      </a>
                    </h3>
                    <p className={`max-w-[370px] text-base text-body-color dark:text-dark-6 article-description ${language === 'zh-Hans' ? 'zh' : 'en'}`}>
                      {article.description || article.descript || ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const paths: any[] = [];
    const validChannels = ['articles', 'training', 'events', 'standards', 'certifications'];
    const locales = ['en', 'zh-Hans'];
    
    // 为每个内容类型和语言获取记录来生成路径
    for (const channelType of validChannels) {
      // 创建语言特定的路径
      for (const locale of locales) {
        try {
          console.log(`📋 获取${channelType}的${locale}路径...`);
          
          const content = await getContentList(channelType, locale, 20);
          content.forEach(item => {
            if (item.documentId) {
              // 添加语言前缀到路径中
              paths.push({ 
                params: { params: [locale, channelType, item.documentId] }
              });
            }
          });
          
          console.log(`✅ ${channelType}-${locale}: 生成了 ${content.length} 个路径`);
        } catch (error) {
          console.log(`❌ 获取${channelType}-${locale}失败:`, error);
        }
      }
      
      // 同时为无语言前缀的路径生成（默认英文）
      try {
        const content = await getContentList(channelType, 'en', 20);
        content.forEach(item => {
          if (item.documentId) {
            paths.push({ 
              params: { params: [channelType, item.documentId] }
            });
          }
        });
      } catch (error) {
        console.log(`❌ 获取${channelType}默认路径失败:`, error);
      }
    }
    
    // 如果没有任何路径，至少添加一些示例路径
    if (paths.length === 0) {
      paths.push(
        { params: { params: ['sectors', 'sample-doc-id'] } },
        { params: { params: ['en', 'sectors', 'sample-doc-id'] } },
        { params: { params: ['zh-Hans', 'sectors', 'sample-doc-id'] } }
      );
    }
    
    console.log(`🚀 总共生成了 ${paths.length} 个静态路径`);
    
    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    
    return {
      paths: [
        { params: { params: ['sectors', 'wt9v3cvkbqgpp4z2cj902ect'] } },
        { params: { params: ['en', 'sectors', 'wt9v3cvkbqgpp4z2cj902ect'] } },
        { params: { params: ['zh-Hans', 'sectors', 'wt9v3cvkbqgpp4z2cj902ect'] } },
      ],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps<DetailPageProps> = async ({ params }) => {
  try {
    const pathParams = params?.params as string[];

    // 路由格式支持: /{channel}/{documentId} 或 /{locale}/{channel}/{documentId}
    let channelType: string;
    let documentId: string;
    let requestedLocale: string;

    if (pathParams?.length === 2) {
      // 格式: /{channel}/{documentId} - 默认英文
      [channelType, documentId] = pathParams;
      requestedLocale = 'en';
    } else if (pathParams?.length === 3) {
      // 格式: /{locale}/{channel}/{documentId}
      [requestedLocale, channelType, documentId] = pathParams;
    } else {
      return {
        notFound: true,
      };
    }

    // 验证channelType
    const validChannels = ['articles', 'training', 'events', 'standards', 'certifications'];
    if (!validChannels.includes(channelType)) {
      return {
        notFound: true,
      };
    }

    // 验证locale
    const validLocales = ['en', 'zh-Hans'];
    if (!validLocales.includes(requestedLocale)) {
      requestedLocale = 'en'; // 默认英文
    }
    console.log(`🌐 请求的语言: ${requestedLocale}, 内容类型: ${channelType}, documentId: ${documentId}`);

    // 首先尝试获取英文内容
    let content = await getDetailContent(channelType, documentId, 'en');
    
    // 如果请求的是中文，则尝试获取中文内容
    if (requestedLocale === 'zh-Hans' || requestedLocale === 'zh') {
      const chineseContent = await getDetailContent(channelType, documentId, 'zh-Hans');
      if (chineseContent) {
        content = chineseContent;
      }
    }

    // 如果都没有找到，返回404
    if (!content) {
      console.log(`❌ 未找到内容: ${channelType}/${documentId}`);
      return {
        notFound: true,
      };
    }

    // 并行获取相关内容数据
    const relatedContentData: { [key: string]: DetailContent[] } = {}
    const locales = ['en', 'zh-Hans']
    
    const relatedDataPromises = locales.map(async (lang) => {
      try {
        const articles = await getContentList(channelType, lang, 6);
        return { lang, articles };
      } catch (error) {
        console.error(`❌ 获取${lang}语言相关内容失败:`, error);
        return { lang, articles: [] };
      }
    });
    
    const relatedResults = await Promise.all(relatedDataPromises);
    relatedResults.forEach(({ lang, articles }) => {
      relatedContentData[lang] = articles;
    });

    console.log(`✅ 成功获取内容: ${content.title} (${content.locale})`);

    return {
      props: {
        channelType,
        documentId,
        initialContent: {
          title: content.title || 'Untitled',
          description: content.description || content.descript || '',
          contents: content.contents || null,
          locale: content.locale || 'en',
          createdAt: content.createdAt || new Date().toISOString(),
          cover: content.cover?.url || null,
        },
        relatedContentData
      }
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
}; 