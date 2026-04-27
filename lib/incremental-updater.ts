import axios from 'axios';
import { processMediaUrls } from './cdn-utils';

// 增量更新器类
export class IncrementalUpdater {
  private static instance: IncrementalUpdater;
  private updateInterval: number = 10 * 60 * 1000; // 10分钟
  private isUpdating: boolean = false;
  private lastUpdateTime: number = 0;
  private cache: Map<string, any> = new Map();
  private listeners: Set<(data: any) => void> = new Set();

  private constructor() {
    this.startPeriodicUpdate();
  }

  public static getInstance(): IncrementalUpdater {
    if (!IncrementalUpdater.instance) {
      IncrementalUpdater.instance = new IncrementalUpdater();
    }
    return IncrementalUpdater.instance;
  }

  // 启动定期更新
  private startPeriodicUpdate() {
    setInterval(() => {
      this.performIncrementalUpdate();
    }, this.updateInterval);
  }

  // 执行增量更新
  private async performIncrementalUpdate() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    console.log('[IncrementalUpdater] 开始增量更新...');

    try {
      // 获取最新数据
      const latestData = await this.fetchLatestData();
      
      // 比较数据变化
      const hasChanges = this.compareData(latestData);
      
      if (hasChanges) {
        console.log('[IncrementalUpdater] 检测到数据变化，更新缓存');
        this.updateCache(latestData);
        this.notifyListeners(latestData);
      } else {
        console.log('[IncrementalUpdater] 无数据变化，跳过更新');
      }
      
      this.lastUpdateTime = Date.now();
    } catch (error) {
      console.error('[IncrementalUpdater] 增量更新失败:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // 获取最新数据
  private async fetchLatestData() {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api';
    
    const [articles, events, sectors, resources] = await Promise.all([
      this.fetchData(`${apiUrl}/articles?populate=*&sort=publishedAt:desc&pagination[limit]=12`),
      this.fetchData(`${apiUrl}/events?populate=*&sort=startDate:desc&pagination[limit]=12`),
      this.fetchData(`${apiUrl}/sectors?populate=*&sort=createdAt:desc&pagination[limit]=12`),
      this.fetchData(`${apiUrl}/resources?populate=*&sort=createdAt:desc&pagination[limit]=12`),
    ]);

    return {
      articles: articles.data || [],
      events: events.data || [],
      sectors: sectors.data || [],
      resources: resources.data || [],
      timestamp: Date.now(),
    };
  }

  // 获取单个数据源
  private async fetchData(url: string) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.STRAPI_API_TOKEN && {
            'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
          }),
        },
      });
      
      // 处理CDN URL
      if (response.data?.data) {
        response.data.data = processMediaUrls(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`[IncrementalUpdater] 获取数据失败 ${url}:`, error);
      return { data: [] };
    }
  }

  // 比较数据变化
  private compareData(newData: any): boolean {
    const cacheKey = 'latestData';
    const cachedData = this.cache.get(cacheKey);
    
    if (!cachedData) {
      this.cache.set(cacheKey, newData);
      return true;
    }

    // 简单比较：检查数据长度和最后更新时间
    const hasChanges = 
      newData.articles.length !== cachedData.articles.length ||
      newData.events.length !== cachedData.events.length ||
      newData.sectors.length !== cachedData.sectors.length ||
      newData.resources.length !== cachedData.resources.length;

    return hasChanges;
  }

  // 更新缓存
  private updateCache(newData: any) {
    this.cache.set('latestData', newData);
    this.cache.set('lastUpdate', Date.now());
  }

  // 通知监听器
  private notifyListeners(data: any) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[IncrementalUpdater] 通知监听器失败:', error);
      }
    });
  }

  // 添加数据监听器
  public addListener(listener: (data: any) => void) {
    this.listeners.add(listener);
  }

  // 移除数据监听器
  public removeListener(listener: (data: any) => void) {
    this.listeners.delete(listener);
  }

  // 获取缓存数据
  public getCachedData() {
    return this.cache.get('latestData');
  }

  // 手动触发更新
  public async forceUpdate() {
    await this.performIncrementalUpdate();
  }

  // 获取更新状态
  public getUpdateStatus() {
    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      cacheSize: this.cache.size,
      listenerCount: this.listeners.size,
    };
  }
}

// 导出单例实例
export const incrementalUpdater = IncrementalUpdater.getInstance();
