import { theme as antdTheme } from 'ant-design-vue'
import { type SeedToken } from 'ant-design-vue/es/theme/interface'
import { ref } from 'vue'

const seedToken: Partial<SeedToken> = {
  colorPrimary: "#7757c0",
  fontSize: 16,
  sizeStep: 4,
}

export const theme = ref({
  // 支持浅色与深色主题切换，默认为深色主题
  algorithm: antdTheme.darkAlgorithm,
  token: seedToken,
})

// 导出主题算法
const { defaultAlgorithm, darkAlgorithm } = antdTheme

// 导出主题变量
export const lightMapToken = defaultAlgorithm({
  ...antdTheme.defaultSeed,
  ...seedToken,
})

export const darkMapToken = darkAlgorithm({
  ...antdTheme.defaultSeed,
  ...seedToken,
})

// 创建样式标签
const styleElement = document.createElement('style')
document.head.appendChild(styleElement)

// 生成CSS规则
const lightVars = Object.entries(lightMapToken)
  .map(([key, value]) => `--${key}: ${value};`)
  .join('\n  ')

const darkVars = Object.entries(darkMapToken)
  .map(([key, value]) => `--${key}: ${value};`)
  .join('\n  ')

// 注入CSS规则
styleElement.textContent = `
[data-theme="light"] {
  ${lightVars}
}

[data-theme="dark"] {
  ${darkVars}
}
`
