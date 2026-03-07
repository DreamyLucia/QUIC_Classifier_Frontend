import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'
import zhTW from './zh-TW'
import type { Language } from '@/types/locales'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

const defaultLocale: Language = 'zh-CN'

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  allowComposition: true,
  legacy: false,
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
  },
})

const dayjsLanguage = {
  'en-US': 'en',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
}

export const t = i18n.global.t

export function setLocale(locale: Language) {
  i18n.global.locale.value = locale as any
  dayjs.locale(dayjsLanguage[locale])
}

export function setupI18n(app: App) {
  app.use(i18n)
}

export default i18n
