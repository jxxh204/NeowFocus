import { app } from 'electron'
import ko from './locales/ko.json'
import en from './locales/en.json'

type TranslationKey = string

const translations = {
  ko,
  en
}

let currentLocale: 'ko' | 'en' = 'en'

export function initI18n(): void {
  const systemLocale = app.getLocale()
  currentLocale = systemLocale.startsWith('ko') ? 'ko' : 'en'
}

export function t(key: TranslationKey): string {
  const keys = key.split('.')
  let value: any = translations[currentLocale]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export function getCurrentLocale(): string {
  return currentLocale
}
