import axios from 'axios';

const strapiAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器来处理认证
strapiAPI.interceptors.request.use((config) => {
  const token = process.env.STRAPI_API_TOKEN;
  
  if (token && token !== 'your_readonly_token_here' && token !== 'your_api_token_here') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器来处理错误
strapiAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Strapi API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// 详情页面内容接口
export interface DetailContent {
  id: number;
  documentId: string;
  title: string;
  slug?: string;
  description?: string;
  content: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  cover?: {
    data?: {
      attributes: {
        url: string;
        alternativeText?: string;
      };
    } | null;
  } | null;
  author?: {
    data?: {
      attributes: {
        name: string;
        email?: string;
      };
    } | null;
  } | null;
  category?: {
    data?: {
      attributes: {
        name: string;
        slug: string;
      };
    } | null;
  } | null;
  type?: string;
  date?: string;
  source?: string;
  descript?: string;
  artcileId?: string;
  attach?: {
    data?: {
      attributes: {
        url: string;
        alternativeText?: string;
        name?: string;
        ext?: string;
      };
    }[] | null;
  } | null;
}

// 获取详情页面的多种方案
export class DetailPageService {
  
  /**
   * 内容类型映射 - 将前端使用的类型名映射到 Strapi API 端点
   */
  static getApiEndpoint(contentType: string): string {
    const typeMapping: { [key: string]: string } = {
      'certifications': 'certifications',
      'article': 'articles',
      'articles': 'articles',
      'training': 'training',
      'event': 'events',
      'events': 'events',
      'standards': 'standards'
    };
    
    return typeMapping[contentType] || contentType;
  }
  
  /**
   * 方案1: 使用documentId直接获取详情（推荐）
   * URL: /api/{contentType}/{documentId}?locale={locale}&populate=*
   */
  static async getByDocumentId(
    contentType: string, 
    documentId: string, 
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🔍 [方案1] 尝试获取详情: ${contentType} -> ${apiEndpoint}/${documentId} (${locale})`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}/${documentId}?locale=${locale}&populate=*`
      );
      
      if (response.data?.data) {
        console.log('✅ [方案1] 成功获取详情');
        return response.data.data;
      }
      
      console.log('❌ [方案1] 未找到数据');
      return null;
    } catch (error: any) {
      console.log('❌ [方案1] 失败:', error.response?.status, error.message);
      return null;
    }
  }

  /**
   * 方案2: 使用数字ID获取详情
   * URL: /api/{contentType}/{id}?locale={locale}&populate=*
   */
  static async getByNumericId(
    contentType: string, 
    id: string | number, 
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🔍 [方案2] 尝试获取详情: ${contentType} -> ${apiEndpoint}/${id} (${locale})`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}/${id}?locale=${locale}&populate=*`
      );
      
      if (response.data?.data) {
        console.log('✅ [方案2] 成功获取详情');
        return response.data.data;
      }
      
      console.log('❌ [方案2] 未找到数据');
      return null;
    } catch (error: any) {
      console.log('❌ [方案2] 失败:', error.response?.status, error.message);
      return null;
    }
  }

  /**
   * 方案3: 查询列表并筛选documentId
   * URL: /api/{contentType}?filters[documentId][$eq]={documentId}&locale={locale}&populate=*
   */
  static async getByDocumentIdFilter(
    contentType: string, 
    documentId: string, 
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🔍 [方案3] 尝试筛选获取详情: ${contentType} -> ${apiEndpoint} documentId=${documentId} (${locale})`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}?filters[documentId][$eq]=${documentId}&locale=${locale}&populate=*`
      );
      
      if (response.data?.data && response.data.data.length > 0) {
        console.log('✅ [方案3] 成功获取详情');
        return response.data.data[0];
      }
      
      console.log('❌ [方案3] 未找到数据');
      return null;
    } catch (error: any) {
      console.log('❌ [方案3] 失败:', error.response?.status, error.message);
      return null;
    }
  }

  /**
   * 方案4: 使用slug筛选
   * URL: /api/{contentType}?filters[slug][$eq]={slug}&locale={locale}&populate=*
   */
  static async getBySlug(
    contentType: string, 
    slug: string, 
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🔍 [方案4] 尝试用slug获取详情: ${contentType} -> ${apiEndpoint} slug=${slug} (${locale})`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}?filters[slug][$eq]=${slug}&locale=${locale}&populate=*`
      );
      
      if (response.data?.data && response.data.data.length > 0) {
        console.log('✅ [方案4] 成功获取详情');
        return response.data.data[0];
      }
      
      console.log('❌ [方案4] 未找到数据');
      return null;
    } catch (error: any) {
      console.log('❌ [方案4] 失败:', error.response?.status, error.message);
      return null;
    }
  }

  /**
   * 方案5: 使用artcileId筛选（针对sectors）
   * URL: /api/{contentType}?filters[artcileId][$eq]={artcileId}&locale={locale}&populate=*
   */
  static async getByArticleId(
    contentType: string, 
    artcileId: string, 
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🔍 [方案5] 尝试用artcileId获取详情: ${contentType} -> ${apiEndpoint} artcileId=${artcileId} (${locale})`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}?filters[artcileId][$eq]=${artcileId}&locale=${locale}&populate=*`
      );
      
      if (response.data?.data && response.data.data.length > 0) {
        console.log('✅ [方案5] 成功获取详情');
        return response.data.data[0];
      }
      
      console.log('❌ [方案5] 未找到数据');
      return null;
    } catch (error: any) {
      console.log('❌ [方案5] 失败:', error.response?.status, error.message);
      return null;
    }
  }

  /**
   * 智能获取详情 - 尝试多种方案直到成功
   */
  static async getDetailContent(
    contentType: string,
    identifier: string,
    locale: string = 'en'
  ): Promise<DetailContent | null> {
    console.log(`🚀 开始智能获取详情: ${contentType}/${identifier} (${locale})`);
    
    // 方案1: 尝试documentId直接获取
    let result = await this.getByDocumentId(contentType, identifier, locale);
    if (result) return result;
    
    // 方案2: 尝试数字ID获取
    if (/^\d+$/.test(identifier)) {
      result = await this.getByNumericId(contentType, identifier, locale);
      if (result) return result;
    }
    
    // 方案3: 尝试documentId筛选
    result = await this.getByDocumentIdFilter(contentType, identifier, locale);
    if (result) return result;
    
    // 方案4: 尝试slug筛选
    result = await this.getBySlug(contentType, identifier, locale);
    if (result) return result;
    
    // 方案5: 如果是sectors，尝试artcileId筛选
    if (contentType === 'sectors') {
      result = await this.getByArticleId(contentType, identifier, locale);
      if (result) return result;
    }
    
    console.log('❌ 所有方案都失败，未找到内容');
    return null;
  }

  /**
   * 获取同一文档的所有语言版本
   */
  static async getAllLocaleVersions(
    contentType: string,
    documentId: string
  ): Promise<DetailContent[]> {
    try {
      const apiEndpoint = this.getApiEndpoint(contentType);
      console.log(`🌐 获取所有语言版本: ${contentType} -> ${apiEndpoint}/${documentId}`);
      
      const response = await strapiAPI.get(
        `/${apiEndpoint}?filters[documentId][$eq]=${documentId}&populate=*&locale=all`
      );
      
      if (response.data?.data) {
        console.log(`✅ 找到 ${response.data.data.length} 个语言版本`);
        return response.data.data;
      }
      
      console.log('❌ 未找到任何语言版本');
      return [];
    } catch (error: any) {
      console.log('❌ 获取语言版本失败:', error.response?.status, error.message);
      return [];
    }
  }

  /**
   * 检查指定语言版本是否存在
   */
  static async checkLocaleExists(
    contentType: string,
    documentId: string,
    locale: string
  ): Promise<boolean> {
    const versions = await this.getAllLocaleVersions(contentType, documentId);
    return versions.some(version => version.locale === locale);
  }
}

// 便捷函数
export const getDetailContent = DetailPageService.getDetailContent;
export const getAllLocaleVersions = DetailPageService.getAllLocaleVersions;
export const checkLocaleExists = DetailPageService.checkLocaleExists;

// 针对特定内容类型的便捷函数
export const getSectorDetail = (documentId: string, locale: string = 'en') => 
  DetailPageService.getDetailContent('sectors', documentId, locale);

export const getArticleDetail = (documentId: string, locale: string = 'en') => 
  DetailPageService.getDetailContent('articles', documentId, locale);

export const getEventDetail = (documentId: string, locale: string = 'en') => 
  DetailPageService.getDetailContent('events', documentId, locale);

export const getStandardsDetail = (documentId: string, locale: string = 'en') => 
  DetailPageService.getDetailContent('standards', documentId, locale);

export const getCertificationsDetail = (documentId: string, locale: string = 'en') => 
  DetailPageService.getDetailContent('certifications', documentId, locale);

// 列表获取函数（带语言筛选）
export const getContentList = async (
  contentType: string,
  locale: string = 'en',
  limit?: number
): Promise<DetailContent[]> => {
  try {
    const apiEndpoint = DetailPageService.getApiEndpoint(contentType);
    console.log(`📋 获取${contentType}列表 -> ${apiEndpoint} (${locale})`);
    
    let url = `/${apiEndpoint}?locale=${locale}&populate=*&sort=publishedAt:desc`;
    if (limit) {
      url += `&pagination[limit]=${limit}`;
    }
    
    const response = await strapiAPI.get(url);
    
    if (response.data?.data) {
      console.log(`✅ 获取到 ${response.data.data.length} 条数据`);
      return response.data.data;
    }
    
    console.log('❌ 未获取到数据');
    return [];
  } catch (error: any) {
    console.log('❌ 获取列表失败:', error.response?.status, error.message);
    return [];
  }
};

// 获取支持的语言列表
export const getSupportedLocales = async (): Promise<string[]> => {
  try {
    const response = await strapiAPI.get('/i18n/locales');
    
    if (response.data) {
      const locales = response.data.map((locale: any) => locale.code);
      console.log('✅ 支持的语言:', locales);
      return locales;
    }
    
    console.log('❌ 获取语言列表失败');
    return ['en', 'zh-Hans']; // 默认支持的语言
  } catch (error: any) {
    console.log('❌ 获取语言列表错误:', error.message);
    return ['en', 'zh-Hans']; // 默认支持的语言
  }
}; 