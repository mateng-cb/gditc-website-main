/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出模式
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // 确保静态导出兼容性
  // experimental: {
  //   appDir: false  // Next.js 14 中已移除此选项
  // },
  // 图片配置
  images: {
    unoptimized: true,
    domains: [
      'wonderful-serenity-47deffe3a2.strapiapp.com',
      'cdn.gditc.org'  // 添加CDN域名
    ]
  },
  // 环境变量
  env: {
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
    NEXT_PUBLIC_CDN_URL: 'https://cdn.gditc.org'
  },
  // 静态导出配置
  assetPrefix: '',
  basePath: '',
  // 静态导出模式下不支持i18n，需要手动实现
  // i18n: {
  //   locales: ['en', 'zh-Hans'],
  //   defaultLocale: 'en',
  //   localeDetection: false,
  // },
}

module.exports = nextConfig 