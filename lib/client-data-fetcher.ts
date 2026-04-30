/**
 * 客户端数据获取工具
 * 用于在静态页面中动态获取最新数据
 */

import axios from 'axios';

// 创建客户端API实例
const clientAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 客户端仅访问公开接口，不读取任何私密 Token。

// 添加响应拦截器
clientAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Client API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    });
    return Promise.reject(error);
  }
);

export interface ClientDataOptions {
  locale?: string;
  limit?: number;
  sort?: string;
  filters?: Record<string, any>;
}

/**
 * 客户端获取文章列表
 */
export const fetchClientArticles = async (options: ClientDataOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.locale && options.locale !== 'en') {
      params.append('locale', options.locale);
    }
    
    if (options.limit) {
      params.append('pagination[limit]', options.limit.toString());
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    } else {
      params.append('sort', 'publishedAt:desc');
    }
    
    // 添加筛选条件
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        params.append(`filters[${key}][$eq]`, value);
      });
    }
    
    params.append('populate', '*');
    
    const response = await clientAPI.get(`/articles?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching client articles:', error);
    return [];
  }
};

/**
 * 客户端获取事件列表
 */
export const fetchClientEvents = async (options: ClientDataOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.locale && options.locale !== 'en') {
      params.append('locale', options.locale);
    }
    
    if (options.limit) {
      params.append('pagination[limit]', options.limit.toString());
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    } else {
      params.append('sort', 'date:desc');
    }
    
    params.append('populate', '*');
    
    const response = await clientAPI.get(`/events?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching client events:', error);
    return [];
  }
};

/**
 * 客户端获取培训列表
 */
export const fetchClientTraining = async (options: ClientDataOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.locale && options.locale !== 'en') {
      params.append('locale', options.locale);
    }
    
    if (options.limit) {
      params.append('pagination[limit]', options.limit.toString());
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    } else {
      params.append('sort', 'createdAt:desc');
    }
    
    params.append('populate', '*');
    
    const response = await clientAPI.get(`/trainings?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching client training:', error);
    return [];
  }
};

/**
 * 客户端获取标准列表
 */
export const fetchClientStandards = async (options: ClientDataOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.locale && options.locale !== 'en') {
      params.append('locale', options.locale);
    }
    
    if (options.limit) {
      params.append('pagination[limit]', options.limit.toString());
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    } else {
      params.append('sort', 'createdAt:desc');
    }
    
    params.append('populate', '*');
    
    const response = await clientAPI.get(`/standards?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching client standards:', error);
    return [];
  }
};

/**
 * 客户端获取认证列表
 */
export const fetchClientCertifications = async (options: ClientDataOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.locale && options.locale !== 'en') {
      params.append('locale', options.locale);
    }
    
    if (options.limit) {
      params.append('pagination[limit]', options.limit.toString());
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    } else {
      params.append('sort', 'publishedAt:desc');
    }
    
    params.append('populate', '*');
    
    const response = await clientAPI.get(`/certifications?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching client certifications:', error);
    return [];
  }
};

/**
 * 客户端获取首页数据
 */
export const fetchClientHome = async () => {
  try {
    const response = await clientAPI.get('/home?populate[bannerSwiper][populate]=*');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching client home:', error);
    return null;
  }
};

/**
 * 客户端获取关于我们数据
 */
export const fetchClientAbout = async () => {
  try {
    const response = await clientAPI.get('/about?populate=*');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching client about:', error);
    return null;
  }
};

/**
 * 客户端获取加入我们数据
 */
export const fetchClientJoinus = async () => {
  try {
    const response = await clientAPI.get('/joinus?populate=*');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching client joinus:', error);
    return null;
  }
};

/**
 * 检查数据是否需要更新
 */
export const checkDataFreshness = (lastUpdate: string, maxAgeMinutes: number = 10): boolean => {
  const lastUpdateTime = new Date(lastUpdate);
  const now = new Date();
  const ageMinutes = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60);
  
  return ageMinutes > maxAgeMinutes;
};

/**
 * 混合数据获取器 - 优先使用静态数据，必要时获取最新数据
 */
export class HybridDataFetcher {
  private cache: Map<string, { data: any; timestamp: string }> = new Map();
  private maxCacheAge = 10; // 10分钟

  async getData<T>(
    key: string,
    staticData: T,
    fetchFunction: () => Promise<T>,
    forceRefresh: boolean = false
  ): Promise<T> {
    // 如果强制刷新，直接获取最新数据
    if (forceRefresh) {
      try {
        const freshData = await fetchFunction();
        this.cache.set(key, { data: freshData, timestamp: new Date().toISOString() });
        return freshData;
      } catch (error) {
        console.error(`Error fetching fresh data for ${key}:`, error);
        return staticData;
      }
    }

    // 检查缓存
    const cached = this.cache.get(key);
    if (cached && !checkDataFreshness(cached.timestamp, this.maxCacheAge)) {
      return cached.data;
    }

    // 尝试获取最新数据
    try {
      const freshData = await fetchFunction();
      this.cache.set(key, { data: freshData, timestamp: new Date().toISOString() });
      return freshData;
    } catch (error) {
      console.error(`Error fetching fresh data for ${key}:`, error);
      // 如果获取失败，返回静态数据
      return staticData;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

// 创建全局混合数据获取器实例
export const hybridFetcher = new HybridDataFetcher();
