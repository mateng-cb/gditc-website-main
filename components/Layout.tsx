import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { t } from '../lib/translations';
import { useLanguage } from '../pages/_app';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [memberNavLabel, setMemberNavLabel] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/member/me', { credentials: 'same-origin' });
        const j = await r.json();
        if (cancelled || !j?.success || !j?.data) {
          if (!cancelled) setMemberNavLabel(null);
          return;
        }
        const company = j.data.companyName as string | undefined;
        const email = j.data.user?.email as string | undefined;
        if (!cancelled) setMemberNavLabel(company || email || 'Member');
      } catch {
        if (!cancelled) setMemberNavLabel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.pathname]);

  // 导航菜单项 - 更新为新的栏目名称
  const navigationItems = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/about', label: 'About', key: 'about' },
    { href: '/training', label: 'Training', key: 'training' },
    { href: '/events', label: 'Events', key: 'events' },
    { href: '/certifications', label: 'Certifications', key: 'certifications' },
    { href: '/standards', label: 'Standards', key: 'standards' },
    { href: '/join-us', label: 'Join Us', key: 'joinUs' },
  ];

  // 社交媒体链接
  const socialLinks = [
    { href: '#', icon: 'facebook' },
    { href: '#', icon: 'twitter' },
    { href: '#', icon: 'instagram' },
    { href: '#', icon: 'linkedin' },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 检查当前路径是否匹配导航项
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* 主导航栏 */}
      <header className="fixed top-0 left-0 z-40 w-full bg-white/90 backdrop-blur-sm shadow-sm dark:bg-dark/90">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <img 
                  src="/logo_ditc.png" 
                  alt="DITC Logo" 
                  className="h-16 w-auto" 
                />
              </Link>
            </div>

            {/* 桌面导航菜单 */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors dark:hover:text-primary ${
                    isActiveRoute(item.href) 
                      ? 'text-blue-600 dark:text-blue-400' // 当前页面是蓝色
                      : 'text-gray-900 hover:text-primary dark:text-white dark:hover:text-primary' // 其他页面是黑色/白色
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {memberNavLabel ? (
                <Link
                  href="/member/center"
                  className={`font-medium transition-colors dark:hover:text-primary ${
                    router.pathname.startsWith('/member') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 hover:text-primary dark:text-white'
                  }`}
                >
                  {memberNavLabel}
                </Link>
              ) : (
                <Link
                  href="/member/login"
                  className="font-medium text-gray-900 hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  Member
                </Link>
              )}
            </div>

            {/* 右侧控制按钮 */}
            <div className="flex items-center space-x-4">
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400"
                aria-label="Toggle menu"
              >
                <span className="block w-6 h-0.5 bg-current mb-1"></span>
                <span className="block w-6 h-0.5 bg-current mb-1"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-dark-2 rounded-lg shadow-lg mt-2 p-4">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-primary dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={memberNavLabel ? '/member/center' : '/member/login'}
                className="block py-2 text-gray-700 hover:text-primary dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {memberNavLabel ? memberNavLabel : 'Member'}
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* 主要内容 */}
      <main className="pt-24">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="dtic-footer relative z-10 bg-[#090E34] pt-20 lg:pt-[100px]">
        <div className="footer-container container mx-auto px-4">
          {/* First Row: Logo Only */}
          <div className="flex flex-wrap -mx-4 mb-8">
            <div className="w-full px-4">
              <Link href="/" className="mb-6 inline-flex items-center space-x-3">
                <img src="/logo_dark.png" alt="DITC logo" className="h-12 w-auto" />
                <span className="text-2xl font-bold text-white">DIGITAL INFRASTRUCTURE TECHNICAL COUNCIL</span>
              </Link>
            </div>
          </div>

          {/* Second Row: Left Content + Right Columns */}
          <div className="flex flex-wrap lg:flex-nowrap -mx-4">
            {/* Left Side: Company Info & Newsletter (4/12) */}
            <div className="footer-section w-full px-4 lg:w-4/12 lg:flex-shrink-0 lg:pr-8">
              <div className="w-full mb-10">
                <p className="mb-4 text-base text-white font-medium">
                  The Global Trust Framework for Digital Infrastructure
                </p>
                {/* 社交媒体链接 - 暂时隐藏空链接 */}
                <div className="flex items-center -mx-3 mb-8">
                  <a href="#" className="px-3 text-white hover:text-primary">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                      <path d="M18.8065 1.8335H3.16399C2.42474 1.8335 1.83334 2.42489 1.83334 3.16414V18.8362C1.83334 19.5459 2.42474 20.1668 3.16399 20.1668H18.7473C19.4866 20.1668 20.078 19.5754 20.078 18.8362V3.13457C20.1371 2.42489 19.5457 1.8335 18.8065 1.8335ZM7.24464 17.4168H4.55379V8.69371H7.24464V17.4168ZM5.88443 7.48135C4.99733 7.48135 4.31721 6.77167 4.31721 5.91414C4.31721 5.05661 5.0269 4.34694 5.88443 4.34694C6.74196 4.34694 7.45163 5.05661 7.45163 5.91414C7.45163 6.77167 6.8011 7.48135 5.88443 7.48135ZM17.4463 17.4168H14.7554V13.1883C14.7554 12.183 14.7258 10.8523 13.336 10.8523C11.9167 10.8523 11.7097 11.976 11.7097 13.0996V17.4168H9.01884V8.69371H11.6506V9.90608H11.6801C12.0645 9.1964 12.9221 8.48672 14.2527 8.48672C17.0027 8.48672 17.5054 10.2609 17.5054 12.6856V17.4168H17.4463Z" />
                    </svg>
                  </a>
                  <a href="#" className="px-3 text-white hover:text-primary">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                      <path d="M20.1236 5.91236C20.2461 5.76952 20.0863 5.58286 19.905 5.64972C19.5004 5.79896 19.1306 5.8974 18.5837 5.95817C19.2564 5.58362 19.5693 5.04828 19.8237 4.39259C19.885 4.23443 19.7 4.09092 19.5406 4.16647C18.8931 4.47345 18.1945 4.70121 17.4599 4.83578C16.7338 4.11617 15.6988 3.6665 14.5539 3.6665C12.3554 3.6665 10.5725 5.32454 10.5725 7.36908C10.5725 7.65933 10.6081 7.94206 10.6752 8.21276C7.51486 8.06551 4.6968 6.71359 2.73896 4.64056C2.60477 4.49848 2.36128 4.51734 2.27772 4.69063C2.05482 5.15296 1.93056 5.66584 1.93056 6.20582C1.93056 7.49014 2.6332 8.62331 3.70132 9.28732C3.22241 9.27293 2.76441 9.17961 2.34234 9.02125C2.13684 8.94416 1.90127 9.07964 1.92888 9.28686C2.14084 10.8781 3.42915 12.1909 5.09205 12.5011C4.75811 12.586 4.40639 12.6311 4.04253 12.6311C3.95431 12.6311 3.86685 12.6284 3.78019 12.6231C3.55967 12.6094 3.38044 12.8067 3.47499 12.9954C4.09879 14.2404 5.44575 15.1096 7.0132 15.1367C5.65077 16.13 3.93418 16.7218 2.06882 16.7218C1.83882 16.7218 1.74015 17.0175 1.9442 17.1178C3.52016 17.8924 5.31487 18.3332 7.22182 18.3332C14.545 18.3332 18.549 12.6914 18.549 7.79843C18.549 7.63827 18.545 7.47811 18.5377 7.31945C19.1321 6.92012 19.6664 6.44528 20.1236 5.91236Z" />
                    </svg>
                  </a>
                  <a href="#" className="px-3 text-white hover:text-primary">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                      <path d="M20.1875 2.15625L20.1094 2.23437L13.0313 9.3125L20.1094 16.3906L20.1875 16.4688V16.5938V18.4375V19.25H19.375H17.5313H17.4063L17.3281 19.1719L10.25 12.0938L3.17188 19.1719L3.09375 19.25H2.96875H1.125H0.3125V18.4375V16.5938V16.4688L0.390625 16.3906L7.46875 9.3125L0.390625 2.23437L0.3125 2.15625V2.03125V0.1875V-0.625H1.125H2.96875H3.09375L3.17188 -0.546875L10.25 6.53125L17.3281 -0.546875L17.4063 -0.625H17.5313H19.375H20.1875V0.1875V2.03125V2.15625Z"/>
                    </svg>
                  </a>
                </div>

                {/* Newsletter Section - Hidden */}
                <div className="mt-8 hidden">
                  <h3 className="text-lg font-semibold text-white mb-6">Stay Updated</h3>
                  <form className="newsletter-form mb-4">
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="w-full pl-3 pr-20 py-2 bg-transparent text-white border border-gray-600 rounded-md focus:border-primary focus:outline-none placeholder:text-gray-300 text-sm" 
                      />
                      <button 
                        type="submit" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-white bg-primary rounded hover:bg-blue-dark transition duration-300 text-xs"
                      >
                        Subscribe
                      </button>
                    </div>
                  </form>
                  <p className="small-text text-xs text-white">Subscribe to our newsletter for the latest updates</p>
                </div>
              </div>
            </div>

            {/* Right Side: Columns 2, 3, 4 (8/12) */}
            <div className="w-full px-4 lg:w-8/12 lg:flex-shrink-0">
              <div className="flex flex-wrap -mx-4">
                {/* Column 2: Quick Links */}
                <div className="footer-section w-full px-4 sm:w-1/2 md:w-1/2 lg:w-1/3">
                  <div className="w-full mb-10">
                    <h3 className="text-lg font-semibold text-white mb-9">Quick Links</h3>
                    <ul>
                      <li>
                        <Link href="/about" className="inline-block mb-3 text-base text-white hover:text-primary">
                          About DITC
                        </Link>
                      </li>
                      <li>
                        <Link href="/join-us" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Membership
                        </Link>
                      </li>
                      <li>
                        <Link href="/standards" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Standards & Publications
                        </Link>
                      </li>
                      <li>
                        <Link href="/events" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Events & Conferences
                        </Link>
                      </li>
                      <li>
                        <Link href="/certifications" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Certifications
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Column 3: Resources */}
                <div className="footer-section w-full px-4 sm:w-1/2 md:w-1/2 lg:w-1/3">
                  <div className="w-full mb-10">
                    <h3 className="text-lg font-semibold text-white mb-9">Resources</h3>
                    <ul>
                      <li>
                        <Link href="/standards" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Document Library
                        </Link>
                      </li>
                      <li>
                        <Link href="/certifications" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Certification Programs
                        </Link>
                      </li>
                      <li>
                        <Link href="/training" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Technical Committees
                        </Link>
                      </li>
                      {/* 空链接暂时隐藏 */}
                      <li className="hidden">
                        <a href="#" className="inline-block mb-3 text-base text-white hover:text-primary">
                          FAQs
                        </a>
                      </li>
                      <li className="hidden">
                        <a href="#" className="inline-block mb-3 text-base text-white hover:text-primary">
                          Terminology Glossary
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Column 4: Contact */}
                <div className="footer-section w-full px-4 sm:w-1/2 md:w-1/2 lg:w-1/3">
                  <div className="w-full mb-10">
                    <h3 className="text-lg font-semibold text-white mb-9">Contact Us</h3>
                    <address className="not-italic">
                      <p className="mb-4 text-base text-white flex items-start">
                        <svg width="16" height="20" className="mt-1 mr-3 fill-current text-primary" viewBox="0 0 29 35">
                          <path d="M14.5 0.710938C6.89844 0.710938 0.664062 6.72656 0.664062 14.0547C0.664062 19.9062 9.03125 29.5859 12.6406 33.5234C13.1328 34.0703 13.7891 34.3437 14.5 34.3437C15.2109 34.3437 15.8672 34.0703 16.3594 33.5234C19.9688 29.6406 28.3359 19.9062 28.3359 14.0547C28.3359 6.67188 22.1016 0.710938 14.5 0.710938ZM14.9375 32.2109C14.6641 32.4844 14.2812 32.4844 14.0625 32.2109C11.3828 29.3125 2.57812 19.3594 2.57812 14.0547C2.57812 7.71094 7.9375 2.625 14.5 2.625C21.0625 2.625 26.4219 7.76562 26.4219 14.0547C26.4219 19.3594 17.6172 29.2578 14.9375 32.2109Z"/>
                          <path d="M14.5 8.58594C11.2734 8.58594 8.59375 11.2109 8.59375 14.4922C8.59375 17.7188 11.2187 20.3984 14.5 20.3984C17.7812 20.3984 20.4062 17.7734 20.4062 14.4922C20.4062 11.2109 17.7266 8.58594 14.5 8.58594ZM14.5 18.4297C12.3125 18.4297 10.5078 16.625 10.5078 14.4375C10.5078 12.25 12.3125 10.4453 14.5 10.4453C16.6875 10.4453 18.4922 12.25 18.4922 14.4375C18.4922 16.625 16.6875 18.4297 14.5 18.4297Z"/>
                        </svg>
                        60 Paya Lebar Road<br/>#12-03, Paya Lebar Square<br/>Singapore 409051
                      </p>
                      <p className="mb-4 text-base text-white flex items-center hidden">
                        <svg width="16" height="16" className="mr-3 fill-current text-primary" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        +65 XXXX XXXX
                      </p>
                      <p className="mb-4 text-base text-white flex items-center">
                        <svg width="16" height="12" className="mr-3 fill-current text-primary" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <a href="mailto:cn.rep@gditc.org" className="text-white hover:text-primary">cn.rep@gditc.org</a>
                      </p>
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Company Registration Info */}
        <div className="border-t border-[#8890A4]/40 py-6">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-3">
              <p className="text-base text-white">
                © 2024 Digital Infrastructure Technical Council. All Rights Reserved.
              </p>
              <p className="text-sm text-white">
                DIGITAL INFRASTRUCTURE TECHNICAL COUNCIL LTD. Register No. 202438789K
              </p>
            </div>
          </div>
        </div>

        <div>
          <span className="absolute left-0 top-0 z-[-1]">
            <img src="/images/footer/shape-1.svg" alt="" />
          </span>

          <span className="absolute bottom-0 right-0 z-[-1]">
            <img src="/images/footer/shape-3.svg" alt="" />
          </span>

          <span className="absolute top-0 right-0 z-[-1]">
            <svg width="102" height="102" viewBox="0 0 102 102" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.8667 33.1956C2.89765 33.1956 3.7334 34.0318 3.7334 35.0633C3.7334 36.0947 2.89765 36.9309 1.8667 36.9309C0.835744 36.9309 4.50645e-08 36.0947 0 35.0633C-4.50645e-08 34.0318 0.835744 33.1956 1.8667 33.1956Z"
                fill="white" fillOpacity="0.08"></path>
              <path
                d="M18.2939 33.1956C19.3249 33.1956 20.1606 34.0318 20.1606 35.0633C20.1606 36.0947 19.3249 36.9309 18.2939 36.9309C17.263 36.9309 16.4272 36.0947 16.4272 35.0633C16.4272 34.0318 17.263 33.1956 18.2939 33.1956Z"
                fill="white" fillOpacity="0.08"></path>
            </svg>
          </span>
        </div>
      </footer>

      {/* 回到顶部按钮 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-10 h-10 bg-primary text-white rounded-md shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5 mx-auto rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default Layout; 