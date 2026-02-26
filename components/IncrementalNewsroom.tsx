import React from 'react';
import Link from 'next/link';
import { useIncrementalArticles } from '../hooks/useIncrementalData';
import { Article } from '../lib/strapi';
import { getCoverImageUrl } from '../lib/cover-utils';

interface IncrementalNewsroomProps {
  initialArticles: Article[];
  currentPage: number;
  totalPages: number;
  locale: string;
}

export default function IncrementalNewsroom({
  initialArticles,
  currentPage,
  totalPages,
  locale
}: IncrementalNewsroomProps) {
  // 使用增量数据Hook
  const { data, isLoading, lastUpdate, refresh } = useIncrementalArticles(initialArticles);
  
  const articles = data.articles;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {locale === 'zh-Hans' ? '新闻中心' : 'Newsroom'}
        </h1>
        <p className="text-lg text-gray-600">
          {locale === 'zh-Hans' ? '最新资讯和行业动态' : 'Latest news and industry updates'}
        </p>
        
        {/* 更新状态指示器 */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span>
              {isLoading 
                ? (locale === 'zh-Hans' ? '正在更新...' : 'Updating...')
                : (locale === 'zh-Hans' ? '已更新' : 'Updated')
              }
            </span>
          </div>
          <span>•</span>
          <span>
            {locale === 'zh-Hans' ? '最后更新' : 'Last updated'}: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            {locale === 'zh-Hans' ? '手动刷新' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {articles.map((article: Article, index: number) => (
          <article key={article.documentId || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {article.cover && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={getCoverImageUrl(article.cover, 'medium')}
                  alt={article.cover.alternativeText || article.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                {article.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                      {article.category.name}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.description || article.contents?.substring(0, 150) || article.content?.substring(0, 150) + '...'}
              </p>
              <Link
                href={`/${locale}/newsroom/${article.slug}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                {locale === 'zh-Hans' ? '阅读更多' : 'Read More'}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* 分页 */}
      <div className="flex justify-center items-center space-x-4">
        {currentPage > 1 && (
          <Link
            href={`/${locale}/newsroom/page/${currentPage - 1}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'zh-Hans' ? '上一页' : 'Previous'}
          </Link>
        )}

        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/${locale}/newsroom/page/${page}`}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>

        {currentPage < totalPages && (
          <Link
            href={`/${locale}/newsroom/page/${currentPage + 1}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {locale === 'zh-Hans' ? '下一页' : 'Next'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
