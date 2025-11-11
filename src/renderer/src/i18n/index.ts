import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'

// 시스템 언어 가져오기
const getSystemLocale = async (): Promise<string> => {
  try {
    const locale = await window.electron.getSystemLocale()
    return locale || 'en'
  } catch (error) {
    console.error('Failed to get system locale:', error)
    return 'en'
  }
}

// 저장된 언어 또는 시스템 언어 가져오기
const getInitialLanguage = async (): Promise<string> => {
  const savedLang = localStorage.getItem('language')
  if (savedLang) {
    return savedLang
  }
  return await getSystemLocale()
}

// i18n 초기화
const initializeI18n = async () => {
  const language = await getInitialLanguage()

  await i18n.use(initReactI18next).init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
}

// 초기화 실행
initializeI18n()

export default i18n
