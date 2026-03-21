// 记录用户设置：语言选择，主题等等
import { defineStore } from 'pinia';
import type { Language } from '@/types/locales';

// 默认值常量
const DEFAULT_VALUES = {
  language: 'zh-CN' as Language,
  isDarkMode: true,
};

export const useAppStore = defineStore('appStore', {
  state: () => ({
    ...DEFAULT_VALUES,
  }),
  actions: {
    setLanguage(language: Language) {
      this.language = language;
    },
    setDarkMode(isDarkMode: boolean) {
      this.isDarkMode = isDarkMode;
    },
    // 重置所有设置为默认值
    resetToDefaults() {
      this.language = DEFAULT_VALUES.language;
      this.isDarkMode = DEFAULT_VALUES.isDarkMode;
    },
    // 获取默认值（不修改当前状态）
    getDefaults() {
      return { ...DEFAULT_VALUES };
    },
  },
  persist: true,
});
