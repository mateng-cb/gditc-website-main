import React from 'react';

interface PageBannerProps {
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 是否显示加载状态（用于重定向页面） */
  loading?: boolean;
  /** 加载时的提示文本 */
  loadingText?: string;
  /** 是否显示底部分隔线 */
  showDivider?: boolean;
  /** 子内容（如统计信息、面包屑等） */
  children?: React.ReactNode;
}

/**
 * 二级页面统一的 Banner 组件
 * 用于所有栏目页面的头部区域，确保样式一致性
 */
const PageBanner: React.FC<PageBannerProps> = ({
  title,
  description,
  loading = false,
  loadingText = 'Loading...',
  showDivider = false,
  children,
}) => {
  return (
    <div className="page-banner">
      {/* 底部分隔线 */}
      {showDivider && (
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-stroke/0 via-stroke dark:via-dark-3 to-stroke/0"></div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full px-4">
            <div className="text-center">
              {/* 加载状态 */}
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-body-color dark:text-dark-6">
                    {loadingText}
                  </p>
                </>
              ) : (
                <>
                  {/* 标题 */}
                  {title && (
                    <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                      {title}
                    </h1>
                  )}
                  
                  {/* 描述 */}
                  {description && (
                    <p className="mb-5 text-base text-body-color dark:text-dark-6">
                      {description}
                    </p>
                  )}
                  
                  {/* 子内容（统计信息、面包屑等） */}
                  {children}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBanner;

