// 使用国际化语言 钩子函数
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { setLocale } from '@/locales'
import type { Language } from '@/types/locales'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import zhTW from 'ant-design-vue/es/locale/zh_TW'

export const useLanguage = () => {
  const appStore = useAppStore()

  // 返回语言为 ant design 的 locale
  const language = computed(() => {
    setLocale(appStore.language)
    switch (appStore.language) {
      case 'zh-CN':
        return zhCN
      case 'zh-TW':
        return zhTW
      default:
        return enUS
    }
  })

  return { language }
}
