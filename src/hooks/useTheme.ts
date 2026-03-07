import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { theme as customTheme } from '@/style/antd-theme'
import { theme as antdTheme } from 'ant-design-vue'
export const useTheme = () => {
  const appStore = useAppStore()

  const setTheme = () => {
    // 设置ant design 浅色与深色主题
    customTheme.value.algorithm = appStore.isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    // 设置html标签的data-theme属性
    document.documentElement.setAttribute('data-theme', appStore.isDarkMode ? 'dark' : 'light')
  }

  const isDarkMode = computed(() => {
    setTheme()
    return appStore.isDarkMode
  })

  const layoutTheme = computed(() => {
    setTheme()
    return isDarkMode.value ? 'dark' : 'light'
  })

  const theme = computed(() => {
    setTheme()
    return customTheme.value
  })

  return {
    isDarkMode,
    theme,
    layoutTheme,
  }
}
