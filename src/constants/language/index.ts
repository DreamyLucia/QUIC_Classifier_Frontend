import type { Language } from '@/types/locales'

export interface LanguageOption {
  label: string
  key: Language
  value: Language
}

export const languageOptions: LanguageOption[] = [
  { label: 'English', key: 'en-US', value: 'en-US' },
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
]
