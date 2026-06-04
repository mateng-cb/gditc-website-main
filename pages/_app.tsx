import type { AppProps } from 'next/app';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

// 创建语言上下文
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // 固定语言为英文 
  const [language, setLanguage] = useState('en');

  // 语言切换处理函数（虽然固定为en，但保留接口兼容性）
  const handleLanguageChange = (newLanguage: string) => {
    // 始终设置为en，忽略传入的语言参数
    setLanguage('en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange }}>
      <Component {...pageProps} />
    </LanguageContext.Provider>
  );
} 