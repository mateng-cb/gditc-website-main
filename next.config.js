/**
 * 静态导出 **仅** 在设置 GDITC_STATIC_SITE_BUILD=1 时启用（见 package.json 的 `build`）。
 * 切勿使用常见变量名 NEXT_STATIC_EXPORT：易被终端/脚本残留，导致 `next dev` 误开 export，
 * 进而 pages/api 全部 404（JSON、固定 Etag）。
 */
const useStaticExport = process.env.GDITC_STATIC_SITE_BUILD === '1'

/** @type {import('next').NextConfig} */
module.exports = {
  ...(useStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
        distDir: 'out',
      }
    : {
        trailingSlash: false,
      }),
  images: {
    unoptimized: true,
    domains: ['top.gditc.org', 'cdn.gditc.org'],
  },
  env: {
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    NEXT_PUBLIC_CDN_URL: 'https://cdn.gditc.org',
  },
  assetPrefix: '',
  basePath: '',
}
