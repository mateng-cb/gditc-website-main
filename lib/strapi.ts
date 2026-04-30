import axios from 'axios';
import { processMediaUrls } from './cdn-utils';

const strapiAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器来处理认证
strapiAPI.interceptors.request.use((config) => {
  // 仅在服务端读取私密 Token，避免任何客户端打包泄露风险。
  const token = typeof window === 'undefined' ? process.env.STRAPI_API_TOKEN : '';
  if (token && token !== 'your_readonly_token_here' && token !== 'your_api_token_here') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器：自动处理图片URL转换为CDN
strapiAPI.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = processMediaUrls(response.data);
    }
    return response;
  },
  (error) => {
    console.error('Strapi API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    });
    return Promise.reject(error);
  }
);

// 响应数据类型定义 - 更新为Strapi 5格式
export interface StrapiResponse<T> {
  data: (T & {
    id: number;
    documentId: string;
    locale?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  })[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T & {
    id: number;
    documentId: string;
    locale?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
  meta: {};
}

export interface Page {
  title: string;
  slug: string;
  content: string;
  seo_title?: string;
  seo_description?: string;
  featured_image?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    url: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
}

export interface Article {
  documentId?: string;
  title: string;
  slug: string;
  description?: string;
  descript?: string;
  content?: string;
  contents?: string;
  cover?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  } | null;
  author?: {
    id?: number;
    documentId?: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  } | null;
  category?: {
    id?: number;
    documentId?: string;
    name: string;
    slug: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  } | null;
  blocks?: any[] | null;
  locale?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Sector {
  id?: number;
  documentId?: string;
  title: string;
  date: string;
  content: string;
  source?: string;
  descript?: string;
  artcileId?: string;
  type: 'Network' | 'Datacenter' | 'Data' | 'Cloud' | 'AI' | 'Security';
  cover?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  attach?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    url: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }[];
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Event {
  id?: number;
  documentId?: string;
  title: string;
  date: string;
  content: string;
  contents?: string;
  location?: string;
  type?: string;
  cover?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Resource {
  id?: number;
  documentId?: string;
  title: string;
  content: string;
  type?: string;
  cover?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  attachments?: {
    id?: number;
    documentId?: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    ext: string;
    url: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }[];
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// 定义通用的文件接口
interface StrapiFile {
  id?: number;
  documentId?: string;
  name?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  url: string;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface About {
  title: string;
  blocks?: any[];
  video?: StrapiFile[];
  aboutDwnUrl?: StrapiFile;
  MembershipDownloadUrl?: StrapiFile;
  ConstitutionDownloadUrl?: StrapiFile;
}

export interface JoinusFileItem {
  id: number;
  title: string;
  file: StrapiFile;
}

export interface Joinus {
  title: string;
  blocks?: any[];
  download?: StrapiFile;
  fileslist?: JoinusFileItem[];
}

export interface BannerSwiper {
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
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      medium?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
}

export interface Home {
  title: string;
  blocks?: any[];
  bannerSwiper?: BannerSwiper[];
}

export interface Global {
  siteName: string;
  siteDescription: string;
  logo?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    url: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  favicon?: {
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    url: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
}

// 获取页面内容
export const getPageContent = async (slug: string): Promise<Page | null> => {
  try {
    const response = await strapiAPI.get<StrapiResponse<Page>>(
      `/pages?filters[slug][$eq]=${slug}`
    );
    
    if (response.data.data.length === 0) {
      return null;
    }
    
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
};

// 获取所有页面（用于静态路径生成）
export const getAllPages = async (): Promise<{ slug: string }[]> => {
  try {
    // 先尝试从 articles 获取页面数据，因为 pages 端点可能不存在
    const response = await strapiAPI.get<StrapiResponse<{ slug: string }>>(
      '/articles?fields[0]=slug'
    );
    
    // 安全地处理响应数据
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.warn('Invalid articles data structure for pages:', response.data);
      return [];
    }
    
    // 过滤掉与静态页面冲突的路径
    const staticRoutes = ['about', 'join-us', 'activities-services', 'training', 'events', 'standards', 'news', 'certifications'];
    
    return response.data.data
      .map((page) => {
        // 确保 slug 存在
        if (!page.slug) {
          return null;
        }
        return { slug: page.slug };
      })
      .filter((page): page is { slug: string } => 
        page !== null && 
        !staticRoutes.includes(page.slug) // 排除与静态路由冲突的路径
      );
  } catch (error) {
    console.error('Error fetching all pages:', error);
    // 如果 API 失败，返回空数组而不是固定路由（避免冲突）
    return [];
  }
};

// 获取文章列表 - 更新为Strapi 5格式
export const getArticles = async (limit?: number, locale: string = 'en'): Promise<Article[]> => {
  try {
    const queryParams = new URLSearchParams({
      'sort': 'publishedAt:desc'
    });
    
    if (limit) {
      queryParams.append('pagination[limit]', limit.toString());
    }
    
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
    }
    
    const response = await strapiAPI.get<StrapiResponse<Article>>(
      `/articles?${queryParams.toString()}`
    );
    
    // 检查响应数据结构
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.warn('Invalid articles data structure:', response.data);
      return [];
    }
    
    return response.data.data
      .map((article) => {
        // Strapi 5 返回平面结构
        console.log('Processing article:', article);
        
        // 确保必需字段存在
        if (!article.title || !article.slug) {
          console.warn('Article missing required fields:', article);
          return null;
        }
        
        return {
          documentId: article.documentId,
          title: article.title,
          slug: article.slug,
          description: article.description,
          descript: article.descript,
          cover: article.cover || null,
          author: article.author || null,
          category: article.category || null,
          blocks: article.blocks || null,
          locale: article.locale || 'en',
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          publishedAt: article.publishedAt || article.createdAt,
        } as Article;
      })
      .filter((article): article is Article => article !== null);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

// 根据documentId获取文章 - Strapi 5版本
export const getArticleByDocumentId = async (documentId: string, locale: string = 'en'): Promise<Article | null> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
    }
    
    const url = `/articles/${documentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await strapiAPI.get<StrapiSingleResponse<Article>>(url);
    
    if (!response.data.data) {
      return null;
    }
    
    const article = response.data.data;
    
    // 确保必需字段存在
    if (!article.title) {
      console.warn('Article missing required fields:', article);
      return null;
    }
    
    return {
      documentId: article.documentId,
      title: article.title,
      slug: article.slug || '',
      description: article.description,
      descript: article.descript,
      cover: article.cover || null,
      author: article.author || null,
      category: article.category || null,
      blocks: article.blocks || null,
      locale: article.locale,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt || article.createdAt,
    } as Article;
  } catch (error) {
    console.error('Error fetching article by documentId:', error);
    return null;
  }
};

// 根据slug获取文章（保留兼容性）
export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const response = await strapiAPI.get<StrapiResponse<Article>>(
      `/articles?filters[slug][$eq]=${slug}`
    );
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    const article = response.data.data[0];
    
    // 确保必需字段存在
    if (!article.title || !article.slug) {
      console.warn('Article missing required fields:', article);
      return null;
    }
    
    return {
      documentId: article.documentId,
      title: article.title,
      slug: article.slug,
      description: article.description,
      descript: article.descript,
      cover: article.cover || null,
      author: article.author || null,
      category: article.category || null,
      blocks: article.blocks || null,
      locale: article.locale,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt || article.createdAt,
    } as Article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};

// 获取所有文章slug（用于静态路径生成）
export const getAllArticles = async (): Promise<{ slug: string }[]> => {
  try {
    const response = await strapiAPI.get<StrapiResponse<{ slug: string }>>(
      '/articles?fields[0]=slug'
    );
    
    return response.data.data.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
};

// 获取板块信息
export const getTraining = async (type?: string, locale: string = 'en'): Promise<Sector[]> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams({
      'sort': 'createdAt:desc',
      'populate': '*'
    });
    
    // 如果指定了语言且不是默认语言，添加locale参数
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
      console.log(`🔄 使用 locale: ${locale}`);
    }

    console.log(`Fetching training with locale: ${locale}, type: ${type || 'all'}`);
    
    const response = await strapiAPI.get<StrapiResponse<Sector>>(
      `/trainings?${queryParams.toString()}`
    );
    
    console.log('Training API response status:', response.status);
    console.log('Training data length:', response.data.data?.length || 0);
    
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.warn('Invalid training response format');
      return [];
    }
    
    let training = response.data.data.map((sector: any) => {
      // 调试日志：打印原始数据结构
      console.log('Raw training data:', {
        id: sector.id,
        documentId: sector.documentId,
        artcileId: sector.artcileId || sector.attributes?.artcileId,
        hasAttributes: !!sector.attributes,
        coverFromRoot: sector.cover,
        coverFromAttributes: sector.attributes?.cover,
        finalCover: sector.cover || sector.attributes?.cover
      });
      
      // 优化数据结构处理
      if (sector.attributes) {
        return { 
          ...sector.attributes, 
          id: sector.id,
          documentId: sector.documentId,
          locale: sector.locale || 'en',
          // 确保所有可能为undefined的字段都设为null
          attach: sector.attributes.attach || null,
          cover: sector.attributes.cover || null,
          author: sector.attributes.author || null,
          createdAt: sector.attributes.createdAt || null,
          updatedAt: sector.attributes.updatedAt || null,
          publishedAt: sector.attributes.publishedAt || null
        };
      } else {
        // 对于没有attributes的情况，直接使用sector对象
        return {
          id: sector.id,
          documentId: sector.documentId,
          title: sector.title || '',
          date: sector.date || null,
          content: sector.contents || sector.content || '',
          source: sector.source || null,
          descript: sector.descript || '',
          artcileId: sector.artcileId || null,
          type: sector.type || 'Network',
          locale: sector.locale || 'en',
          // 直接使用sector对象中的字段
          attach: sector.attach || null,
          cover: sector.cover || null,
          author: sector.author || null,
          createdAt: sector.createdAt || null,
          updatedAt: sector.updatedAt || null,
          publishedAt: sector.publishedAt || null
        };
      }
    });
    
    // 在前端进行筛选
    if (type) {
      training = training.filter((sector: Sector) => sector.type === type);
      console.log(`Filtered training by type '${type}':`, training.length);
    }
    
    return training;
  } catch (error: any) {
    console.error('Error fetching training:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // 如果是403错误且使用了locale参数，尝试不使用locale重新请求
    if (error.response?.status === 403 && locale !== 'en') {
      console.warn('🔒 403 error with locale, trying fallback to English...');
      try {
        return await getTraining(type, 'en');
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
      }
    }
    
    // 如果是认证错误或网络错误，返回空数组而不是抛出错误
    if (error.response?.status === 401 || error.response?.status === 403 || error.code === 'ENOTFOUND') {
      console.warn('🔒 Authentication or network error. Returning empty array.');
      return [];
    }
    
    return [];
  }
};

// 获取事件列表
export const getEvents = async (limit?: number, locale: string = 'en'): Promise<Event[]> => {
  try {
    console.log(`🔄 正在获取Events数据 (${locale})...`);
    
    const queryParams = new URLSearchParams();
    
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
      console.log(`🔄 使用 locale: ${locale}`);
    } else {
      console.log(`🔄 使用默认 locale: en`);
    }
    
    // 如果没有指定 limit，设置一个较大的值确保获取所有数据
    if (limit) {
      queryParams.append('pagination[limit]', limit.toString());
    } else {
      // 设置一个足够大的 limit 确保获取所有数据
      queryParams.append('pagination[limit]', '100');
    }
    
    queryParams.append('sort', 'date:desc');
    queryParams.append('populate', '*');
    
    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log(`🌐 完整的 Events API URL: ${url}`);
    console.log(`🔍 查询参数详情:`, Object.fromEntries(queryParams.entries()));
    
    const response = await strapiAPI.get<StrapiResponse<Event>>(url);
    
    // 打印分页信息用于调试
    console.log(`📊 Events API 分页信息:`, {
      page: response.data.meta?.pagination?.page,
      pageSize: response.data.meta?.pagination?.pageSize,
      pageCount: response.data.meta?.pagination?.pageCount,
      total: response.data.meta?.pagination?.total,
      dataLength: response.data.data?.length
    });
    
    const events = response.data.data.map((event: any) => {
      // 调试日志：打印Events数据结构
      console.log('Raw event data:', {
        id: event.id,
        title: event.title,
        locale: event.locale,
        hasAttributes: !!event.attributes,
        cover: event.cover || event.attributes?.cover
      });
      
      // 处理数据结构
      if (event.attributes) {
        return {
          id: event.id,
          documentId: event.documentId,
          title: event.attributes.title,
          date: event.attributes.date,
          content: event.attributes.contents || event.attributes.content,
          location: event.attributes.location,
          type: event.attributes.type,
          cover: event.attributes.cover,
          locale: event.locale,
          createdAt: event.attributes.createdAt,
          updatedAt: event.attributes.updatedAt,
          publishedAt: event.attributes.publishedAt,
        };
      } else {
        return {
          id: event.id,
          documentId: event.documentId,
          title: event.title,
          date: event.date,
          content: event.contents || event.content,
          location: event.location,
          type: event.type,
          cover: event.cover,
          locale: event.locale,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          publishedAt: event.publishedAt,
        };
      }
    });
    
    console.log(`✅ 成功获取 ${events.length} 条Events数据`);
    return events;
  } catch (error: any) {
    console.error('❌ 获取Events数据失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // 如果是403错误且使用了locale参数，尝试不使用locale重新请求
    if (error.response?.status === 403 && locale !== 'en') {
      console.warn('🔒 403 error with locale, trying fallback to English...');
      try {
        return await getEvents(limit, 'en');
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
      }
    }
    
    return [];
  }
};

// 获取标准列表
export const getStandards = async (type?: string): Promise<Resource[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (type) {
      queryParams.append('filters[type][$eq]', type);
    }
    
    queryParams.append('populate', '*');
    queryParams.append('sort', 'createdAt:desc');
    
    const response = await strapiAPI.get<StrapiResponse<Resource>>(
      `/standards?${queryParams.toString()}`
    );
    
    return response.data.data.map((resource: any) => {
      // 调试日志：打印Standards数据结构
      console.log('Raw standards data:', {
        id: resource.id,
        title: resource.title || resource.attributes?.title,
        hasAttributes: !!resource.attributes,
        cover: resource.cover || resource.attributes?.cover
      });
      
      // 处理数据结构
      if (resource.attributes) {
        return {
          id: resource.id,
          documentId: resource.documentId,
          title: resource.attributes.title,
          content: resource.attributes.contents || resource.attributes.content,
          type: resource.attributes.type,
          cover: resource.attributes.cover,
          attachments: resource.attributes.attachments,
          locale: resource.locale || 'en',
          createdAt: resource.attributes.createdAt,
          updatedAt: resource.attributes.updatedAt,
          publishedAt: resource.attributes.publishedAt,
        };
      } else {
        return {
          id: resource.id,
          documentId: resource.documentId,
          title: resource.title,
          content: resource.contents || resource.content,
          type: resource.type,
          cover: resource.cover,
          attachments: resource.attachments,
          locale: resource.locale || 'en',
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt,
          publishedAt: resource.publishedAt,
        };
      }
    });
  } catch (error) {
    console.error('Error fetching standards:', error);
    return [];
  }
};

// 获取关于我们信息
export const getAbout = async (): Promise<About | null> => {
  try {
    console.log('📄 Starting getAbout API call...');
    console.log('🌐 API URL:', strapiAPI.defaults.baseURL + '/about?populate=*');
    
    const response = await strapiAPI.get<StrapiSingleResponse<About>>(
      '/about?populate=*'
    );
    
    console.log('✅ About API response status:', response.status);
    const aboutData = response.data.data;
    
    if (aboutData) {
      console.log('📄 About data found:');
      console.log('  - Title:', aboutData.title);
      console.log('  - Has video:', !!aboutData.video);
      console.log('  - Has aboutDwnUrl:', !!aboutData.aboutDwnUrl);
      console.log('  - Has MembershipDownloadUrl:', !!aboutData.MembershipDownloadUrl);
      console.log('  - Has ConstitutionDownloadUrl:', !!aboutData.ConstitutionDownloadUrl);
      
      // 打印下载链接信息
      if (aboutData.aboutDwnUrl) {
        console.log(`  - aboutDwnUrl: ${aboutData.aboutDwnUrl.url} (${aboutData.aboutDwnUrl.ext})`);
      }
      if (aboutData.MembershipDownloadUrl) {
        console.log(`  - MembershipDownloadUrl: ${aboutData.MembershipDownloadUrl.url} (${aboutData.MembershipDownloadUrl.ext})`);
      }
      if (aboutData.ConstitutionDownloadUrl) {
        console.log(`  - ConstitutionDownloadUrl: ${aboutData.ConstitutionDownloadUrl.url} (${aboutData.ConstitutionDownloadUrl.ext})`);
      }
    } else {
      console.log('❌ No about data in response');
    }
    
    return aboutData;
  } catch (error: any) {
    console.error('❌ Error fetching about:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};

// 获取Joinus信息
export const getJoinus = async (): Promise<Joinus | null> => {
  try {
    console.log('🤝 Starting getJoinus API call...');
    console.log('🌐 API URL:', strapiAPI.defaults.baseURL + '/joinus?populate[fileslist][populate]=*');
    
    const response = await strapiAPI.get<StrapiSingleResponse<Joinus>>(
      '/joinus?populate[fileslist][populate]=*'
    );
    
    console.log('✅ Joinus API response status:', response.status);
    const joinusData = response.data.data;
    
    if (joinusData) {
      console.log('🤝 Joinus data found:');
      console.log('  - Title:', joinusData.title);
      console.log('  - Has download:', !!joinusData.download);
      console.log('  - Has fileslist:', !!joinusData.fileslist);
      console.log('  - Fileslist count:', joinusData.fileslist?.length || 0);
      
      // 打印下载文件信息
      if (joinusData.download) {
        console.log(`  - Download file: ${joinusData.download.name}`);
        console.log(`  - Download URL: ${joinusData.download.url}`);
        console.log(`  - File type: ${joinusData.download.ext} (${joinusData.download.mime})`);
        console.log(`  - File size: ${joinusData.download.size} KB`);
      }
      
      // 打印文件列表信息
      if (joinusData.fileslist && joinusData.fileslist.length > 0) {
        console.log('  - Fileslist items:');
        joinusData.fileslist.forEach((item, index) => {
          console.log(`    ${index + 1}. ${item.title}: ${item.file.name} (${item.file.ext})`);
        });
      }
    } else {
      console.log('❌ No joinus data in response');
    }
    
    return joinusData;
  } catch (error: any) {
    console.error('❌ Error fetching joinus:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};

// 获取Home信息
export const getHome = async (): Promise<Home | null> => {
  try {
    console.log('🏠 Starting getHome API call...');
    console.log('🌐 API URL:', strapiAPI.defaults.baseURL + '/home?populate[bannerSwiper][populate]=*');
    
    const response = await strapiAPI.get<StrapiSingleResponse<Home>>(
      '/home?populate[bannerSwiper][populate]=*'
    );
    
    console.log('✅ Home API response status:', response.status);
    console.log('📊 Home API response data:', JSON.stringify(response.data, null, 2));
    
    const homeData = response.data.data;
    if (homeData) {
      console.log('🏠 Home data found:');
      console.log('  - Title:', homeData.title);
      console.log('  - Has bannerSwiper:', !!homeData.bannerSwiper);
      console.log('  - BannerSwiper type:', typeof homeData.bannerSwiper);
      console.log('  - BannerSwiper is array:', Array.isArray(homeData.bannerSwiper));
      
      if (homeData.bannerSwiper) {
        console.log('  - BannerSwiper count:', homeData.bannerSwiper.length);
        if (Array.isArray(homeData.bannerSwiper)) {
          homeData.bannerSwiper.forEach((item, index) => {
            console.log(`  - Banner ${index + 1}:`);
            console.log(`    - Title: ${item.title}`);
            console.log(`    - Description: ${item.description}`);
            console.log(`    - Remark: ${item.remark}`);
            console.log(`    - Has images: ${!!item.images}`);
            if (item.images) {
              console.log(`      - Image URL: ${item.images.url}`);
              console.log(`      - Image formats available: ${Object.keys(item.images.formats || {}).join(', ')}`);
            }
          });
        }
      }
    } else {
      console.log('❌ No home data in response');
    }
    
    return homeData;
  } catch (error: any) {
    console.error('❌ Error fetching home:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return null;
  }
};

// 获取全局设置
export const getGlobal = async (): Promise<Global | null> => {
  try {
    const response = await strapiAPI.get<StrapiSingleResponse<Global>>(
      '/global'
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return null;
  }
};

// 获取认证资讯
export const getCertifications = async (limit?: number, locale: string = 'en'): Promise<Article[]> => {
  try {
    console.log(`🔄 正在获取Certifications数据 (${locale})...`);
    
    const queryParams = new URLSearchParams();
    
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
      console.log(`🔄 使用 locale: ${locale}`);
    }
    
    if (limit) {
      queryParams.append('pagination[limit]', limit.toString());
    }
    
    queryParams.append('sort', 'publishedAt:desc');
    queryParams.append('populate', '*');
    
    const url = `/certifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log(`🌐 完整的 Certifications API URL: ${url}`);
    console.log(`🔍 查询参数详情:`, Object.fromEntries(queryParams.entries()));
    
    const response = await strapiAPI.get<StrapiResponse<Article>>(url);
    
    const articles = response.data.data.map((news: any) => {
      // 调试日志：打印Certifications数据结构
      console.log('Raw certifications data:', {
        id: news.id,
        title: news.title || news.attributes?.title,
        locale: news.locale,
        hasAttributes: !!news.attributes,
        cover: news.cover || news.attributes?.cover
      });
      
      // 处理数据结构
      if (news.attributes) {
        return {
          documentId: news.documentId,
          title: news.attributes.title,
          slug: news.attributes.slug,
          description: news.attributes.description,
          descript: news.attributes.descript,
          content: news.attributes.contents || news.attributes.content,
          cover: news.attributes.cover,
          author: news.attributes.author,
          category: news.attributes.category,
          blocks: news.attributes.blocks,
          locale: news.locale,
          createdAt: news.attributes.createdAt,
          updatedAt: news.attributes.updatedAt,
          publishedAt: news.attributes.publishedAt,
        };
      } else {
        return {
          documentId: news.documentId,
          title: news.title,
          slug: news.slug,
          description: news.description,
          descript: news.descript,
          content: news.contents || news.content,
          cover: news.cover,
          author: news.author,
          category: news.category,
          blocks: news.blocks,
          locale: news.locale,
          createdAt: news.createdAt,
          updatedAt: news.updatedAt,
          publishedAt: news.publishedAt,
        };
      }
    });
    
    console.log(`✅ 成功获取 ${articles.length} 条Certifications数据`);
    return articles;
  } catch (error: any) {
    console.error('❌ 获取Certifications数据失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // 如果是403错误且使用了locale参数，尝试不使用locale重新请求
    if (error.response?.status === 403 && locale !== 'en') {
      console.warn('🔒 403 error with locale, trying fallback to English...');
      try {
        return await getCertifications(limit, 'en');
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
      }
    }
    
    return [];
  }
};

// 获取单个sector by artcileId
export const getTrainingById = async (artcileId: string): Promise<Sector | null> => {
  try {
    // 先尝试获取所有training，然后在客户端筛选
    const allTraining = await getTraining();
    const training = allTraining.find(s => s.artcileId === artcileId);
    
    console.log('Finding training by artcileId:', artcileId, 'Found:', !!training);
    
    return training || null;
  } catch (error: any) {
    console.error('Error fetching training by ID:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return null;
  }
};

// 根据documentId获取Sector - Strapi 5版本
export const getSectorByDocumentId = async (documentId: string, locale: string = 'en'): Promise<Sector | null> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (locale && locale !== 'en') {
      queryParams.append('locale', locale);
    }
    
    const url = `/sectors/${documentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await strapiAPI.get<StrapiSingleResponse<Sector>>(url);
    
    if (!response.data.data) {
      return null;
    }
    
    const sector = response.data.data;
    
    return {
      id: sector.id,
      documentId: sector.documentId,
      title: sector.title,
      date: sector.date,
      content: sector.content,
      source: sector.source,
      descript: sector.descript,
      artcileId: sector.artcileId,
      type: sector.type,
      attach: sector.attach,
      locale: sector.locale,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
      publishedAt: sector.publishedAt,
    } as Sector;
  } catch (error) {
    console.error('Error fetching sector by documentId:', error);
    return null;
  }
};

// 根据articleId和语言获取对应的training
export const getTrainingByArticleIdAndLanguage = async (artcileId: string, language: string): Promise<Sector | null> => {
  try {
    const training = await getTraining(undefined, language);
    return training.find(training => training.artcileId === artcileId) || null;
  } catch (error) {
    console.error('Error fetching training by articleId and language:', error);
    return null;
  }
};

export default strapiAPI; 