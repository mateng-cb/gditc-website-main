/**
 * 封面图片工具函数
 *
 * 问题：大图（如 4096x2852）作为封面显示时，浏览器等比缩小会导致模糊
 * 解决：使用 Strapi 预生成的 formats（small/medium）而非原图，避免过度缩放
 */

export interface CoverWithFormats {
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

/**
 * 获取适合封面显示的图片 URL
 *
 * @param cover - 封面对象，需包含 url 和可选的 formats
 * @param preferredSize - 首选尺寸。封面卡片约 192px 高、384-576px 宽，small(500px) 或 medium(750px) 最合适
 * @returns 最佳可用 URL，无 formats 时回退到原图
 */
export function getCoverImageUrl(
  cover: CoverWithFormats | null | undefined,
  preferredSize: 'thumbnail' | 'small' | 'medium' = 'small'
): string {
  if (!cover?.url) return '';

  const formats = cover.formats;
  if (formats) {
    // 按优先级选择：medium 适合 2x 屏，small 适合常规，thumbnail 适合极小缩略图
    if (preferredSize === 'medium' && formats.medium?.url) return formats.medium.url;
    if (preferredSize === 'small' && formats.small?.url) return formats.small.url;
    if (preferredSize === 'thumbnail' && formats.thumbnail?.url) return formats.thumbnail.url;
    // 回退链：medium -> small -> thumbnail -> 原图
    if (formats.medium?.url) return formats.medium.url;
    if (formats.small?.url) return formats.small.url;
    if (formats.thumbnail?.url) return formats.thumbnail.url;
  }

  return cover.url;
}
