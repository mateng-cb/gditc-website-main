import { useState, useEffect, useCallback } from 'react';
import { incrementalUpdater } from '../lib/incremental-updater';

// 增量数据Hook
export function useIncrementalData<T>(
  initialData: T,
  dataKey: keyof T,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // 更新数据
  const updateData = useCallback(async () => {
    setIsLoading(true);
    try {
      const newData = await fetcher();
      setData(newData);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('[useIncrementalData] 更新数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  // 监听增量更新
  useEffect(() => {
    const handleDataUpdate = (latestData: any) => {
      if (latestData && latestData[dataKey]) {
        setData(prevData => ({
          ...prevData,
          [dataKey]: latestData[dataKey]
        }));
        setLastUpdate(Date.now());
      }
    };

    // 添加监听器
    incrementalUpdater.addListener(handleDataUpdate);

    // 清理监听器
    return () => {
      incrementalUpdater.removeListener(handleDataUpdate);
    };
  }, [dataKey]);

  // 手动刷新
  const refresh = useCallback(() => {
    updateData();
  }, [updateData]);

  return {
    data,
    isLoading,
    lastUpdate,
    refresh,
  };
}

// 文章数据Hook
export function useIncrementalArticles(initialArticles: any[] = []) {
  return useIncrementalData(
    { articles: initialArticles },
    'articles',
    async () => {
      const response = await fetch('/api/articles?populate=*&sort=publishedAt:desc&pagination[limit]=12');
      const data = await response.json();
      return { articles: data.data || [] };
    }
  );
}

// 活动数据Hook
export function useIncrementalEvents(initialEvents: any[] = []) {
  return useIncrementalData(
    { events: initialEvents },
    'events',
    async () => {
      const response = await fetch('/api/events?populate=*&sort=startDate:desc&pagination[limit]=12');
      const data = await response.json();
      return { events: data.data || [] };
    }
  );
}

// 行业数据Hook
export function useIncrementalSectors(initialSectors: any[] = []) {
  return useIncrementalData(
    { sectors: initialSectors },
    'sectors',
    async () => {
      const response = await fetch('/api/sectors?populate=*&sort=createdAt:desc&pagination[limit]=12');
      const data = await response.json();
      return { sectors: data.data || [] };
    }
  );
}

// 资源数据Hook
export function useIncrementalResources(initialResources: any[] = []) {
  return useIncrementalData(
    { resources: initialResources },
    'resources',
    async () => {
      const response = await fetch('/api/resources?populate=*&sort=createdAt:desc&pagination[limit]=12');
      const data = await response.json();
      return { resources: data.data || [] };
    }
  );
}
