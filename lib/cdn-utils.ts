/**
 * CDN 工具函数
 */

const CDN_BASE_URL = 'https://cdn.gditc.org';
const STRAPI_LEGACY_HOST = 'wonderful-serenity-47deffe3a2.strapiapp.com';
const STRAPI_MEDIA_HOST = 'top.gditc.org';

/**
 * 转换单个图片URL为CDN地址
 */
export const convertToCDN = (url: string): string => {
  if (!url) return '';
  
  // 如果是相对路径的uploads，添加CDN前缀
  if (url.startsWith('/uploads/')) {
    return `${CDN_BASE_URL}${url}`;
  }
  
  if (url.includes(STRAPI_LEGACY_HOST)) {
    return url.replace(STRAPI_LEGACY_HOST, 'cdn.gditc.org');
  }
  if (url.includes(STRAPI_MEDIA_HOST)) {
    return url.replace(STRAPI_MEDIA_HOST, 'cdn.gditc.org');
  }
  
  // 其他情况返回原始URL
  return url;
};

/**
 * 递归处理对象中的所有图片URL
 */
export const processMediaUrls = (data: any): any => {
  if (typeof data === 'string') {
    return convertToCDN(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(processMediaUrls);
  }
  
  if (data && typeof data === 'object') {
    const processed = { ...data };
    
    // 处理常见的图片字段
    if (processed.url) {
      processed.url = convertToCDN(processed.url);
    }
    
    if (processed.formats) {
      Object.keys(processed.formats).forEach(key => {
        if (processed.formats[key].url) {
          processed.formats[key].url = convertToCDN(processed.formats[key].url);
        }
      });
    }
    
    // 递归处理其他字段
    Object.keys(processed).forEach(key => {
      processed[key] = processMediaUrls(processed[key]);
    });
    
    return processed;
  }
  
  return data;
};

/**
 * 生成响应式图片URL
 */
export const getResponsiveImageUrl = (
  baseUrl: string, 
  width: number, 
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string => {
  const cdnUrl = convertToCDN(baseUrl);
  
  // 如果使用Cloudflare Image Resizing
  return `${cdnUrl}?width=${width}&format=${format}&quality=85`;
};

/**
 * 获取优化后的图片URL (支持WebP)
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'jpeg' | 'png';
    quality?: number;
  } = {}
): string => {
  const cdnUrl = convertToCDN(url);
  const params = new URLSearchParams();
  
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.format) params.append('format', options.format);
  if (options.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${cdnUrl}?${queryString}` : cdnUrl;
};

/**
 * 检查是否为图片URL
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * 获取图片的多种尺寸
 */
export const getImageSizes = (baseUrl: string) => {
  const cdnUrl = convertToCDN(baseUrl);
  
  return {
    thumbnail: `${cdnUrl}?width=150&height=150&format=webp&quality=80`,
    small: `${cdnUrl}?width=400&format=webp&quality=85`,
    medium: `${cdnUrl}?width=800&format=webp&quality=85`,
    large: `${cdnUrl}?width=1200&format=webp&quality=90`,
    original: cdnUrl
  };
}; 