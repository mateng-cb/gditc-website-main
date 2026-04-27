import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  structuredData?: any;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'DITC - Digital Infrastructure Technical Council',
  description = 'Global Digital Infrastructure Technology Exchange. Leading international standards for digital infrastructure.',
  keywords = 'digital infrastructure, technical standards, international organization, technology exchange, DITC',
  image = '/images/og-default.jpg',
  url = 'https://gditc.org',
  type = 'website',
  locale = 'en_US',
  structuredData,
  canonical,
  noindex = false,
  nofollow = false
}) => {
  const fullTitle = title.includes('DITC') ? title : `${title} | DITC`;
  const fullImageUrl = image.startsWith('http') ? image : `https://gditc.org${image}`;
  const fullUrl = url.startsWith('http') ? url : `https://gditc.org${url}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Head>
      {/* 基础 Meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* 语言和地区 */}
      <meta httpEquiv="content-language" content={locale.split('_')[0]} />
      <meta name="language" content={locale.split('_')[0] === 'zh' ? 'Chinese' : 'English'} />
      
      {/* 搜索引擎控制 */}
      {noindex && <meta name="robots" content="noindex" />}
      {nofollow && <meta name="robots" content="nofollow" />}
      {!noindex && !nofollow && <meta name="robots" content="index, follow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="DITC" />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@DITC_Global" />
      <meta name="twitter:creator" content="@DITC_Global" />
      
      {/* 移动端优化 */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="DITC" />
      
      {/* 主题颜色 */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* 结构化数据 */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* 预连接优化 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://top.gditc.org" />
      <link rel="preconnect" href="https://cdn.gditc.org" />
      
      {/* DNS 预解析 */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//cdn.gditc.org" />
    </Head>
  );
};

export default SEOHead;