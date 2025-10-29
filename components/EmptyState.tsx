import React from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* 图标 */}
        {icon && (
          <div className="mb-6 flex justify-center">
            {icon}
          </div>
        )}
        
        {/* 默认图标（如果没有提供自定义图标） */}
        {!icon && (
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-gray-400 dark:text-dark-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* 标题 */}
        <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">
          {title}
        </h3>
        
        {/* 描述 */}
        <p className="text-body-color dark:text-dark-6 mb-6">
          {description}
        </p>
        
        {/* 操作按钮 */}
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

// 预定义的空状态组件
export const EmptyEvents = () => (
  <EmptyState
    title="No Events Found"
    description="There are currently no events available. Please check back later for updates."
    icon={
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    }
  />
)

export const EmptyCertifications = () => (
  <EmptyState
    title="No Certifications Found"
    description="There are currently no certification programs available. Please check back later for updates."
    icon={
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
    }
  />
)

export const EmptyStandards = () => (
  <EmptyState
    title="No Standards Found"
    description="There are currently no standards available. Please check back later for updates."
    icon={
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    }
  />
)

export const EmptyTraining = () => (
  <EmptyState
    title="No Training Programs Found"
    description="There are currently no training programs available. Please check back later for updates."
    icon={
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    }
  />
)

