/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产模式配置 - 不使用静态导出
  trailingSlash: true,
  // 图片配置
  images: {
    unoptimized: true,
    domains: ['top.gditc.org', 'cdn.gditc.org']
  },
  // 环境变量
  env: {
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
    NEXT_PUBLIC_CDN_URL: 'https://cdn.gditc.org'
  },
  // 服务器配置
  serverRuntimeConfig: {
    // 服务器端配置
  },
  publicRuntimeConfig: {
    // 客户端配置
  }
}

module.exports = nextConfig
