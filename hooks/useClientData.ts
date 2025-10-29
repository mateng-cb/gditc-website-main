/**
 * 客户端数据获取Hook
 * 用于在组件中动态获取最新数据
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchClientArticles, 
  fetchClientEvents, 
  fetchClientTraining, 
  fetchClientStandards, 
  fetchClientCertifications,
  fetchClientHome,
  fetchClientAbout,
  fetchClientJoinus,
  hybridFetcher,
  ClientDataOptions 
} from '../lib/client-data-fetcher';

export interface UseClientDataOptions extends ClientDataOptions {
  enabled?: boolean;
  refreshInterval?: number; // 毫秒
  fallbackToStatic?: boolean;
}

/**
 * 通用客户端数据Hook
 */
export function useClientData<T>(
  key: string,
  staticData: T,
  fetchFunction: () => Promise<T>,
  options: UseClientDataOptions = {}
) {
  const [data, setData] = useState<T>(staticData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const {
    enabled = true,
    refreshInterval,
    fallbackToStatic = true
  } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await hybridFetcher.getData(
        key,
        staticData,
        fetchFunction,
        forceRefresh
      );
      
      setData(freshData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (fallbackToStatic) {
        setData(staticData);
      }
    } finally {
      setLoading(false);
    }
  }, [key, staticData, fetchFunction, enabled, fallbackToStatic]);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 定时刷新
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, enabled, fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * 文章数据Hook
 */
export function useClientArticles(
  staticArticles: any[],
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'articles',
    staticArticles,
    () => fetchClientArticles(options),
    options
  );
}

/**
 * 事件数据Hook
 */
export function useClientEvents(
  staticEvents: any[],
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'events',
    staticEvents,
    () => fetchClientEvents(options),
    options
  );
}

/**
 * 培训数据Hook
 */
export function useClientTraining(
  staticTraining: any[],
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'training',
    staticTraining,
    () => fetchClientTraining(options),
    options
  );
}

/**
 * 标准数据Hook
 */
export function useClientStandards(
  staticStandards: any[],
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'standards',
    staticStandards,
    () => fetchClientStandards(options),
    options
  );
}

/**
 * 认证数据Hook
 */
export function useClientCertifications(
  staticCertifications: any[],
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'certifications',
    staticCertifications,
    () => fetchClientCertifications(options),
    options
  );
}

/**
 * 首页数据Hook
 */
export function useClientHome(
  staticHomeData: any,
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'home',
    staticHomeData,
    () => fetchClientHome(),
    options
  );
}

/**
 * 关于我们数据Hook
 */
export function useClientAbout(
  staticAboutData: any,
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'about',
    staticAboutData,
    () => fetchClientAbout(),
    options
  );
}

/**
 * 加入我们数据Hook
 */
export function useClientJoinus(
  staticJoinusData: any,
  options: UseClientDataOptions = {}
) {
  return useClientData(
    'joinus',
    staticJoinusData,
    () => fetchClientJoinus(),
    options
  );
}

/**
 * 数据刷新状态Hook
 */
export function useDataRefreshStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const startRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
  }, []);

  const endRefresh = useCallback(() => {
    setIsRefreshing(false);
  }, []);

  return {
    isRefreshing,
    lastRefresh,
    startRefresh,
    endRefresh
  };
}
