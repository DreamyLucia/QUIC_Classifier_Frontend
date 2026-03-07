<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAppStore } from '@/store/app'
import { languageOptions } from '@/constants/language'
import { themeOptions } from '@/constants/theme'

const appStore = useAppStore()

const modalOpen = ref(false)

// 缓存弹窗打开时的设置
const initialState = ref({
  defaultCodingLang: appStore.defaultCodingLang,
  defaultResponseLang: appStore.defaultResponseLang,
  language: appStore.language,
  isDarkMode: appStore.isDarkMode,
})

// 绑定设置表单
const formData = ref({
  defaultCodingLang: appStore.defaultCodingLang,
  defaultResponseLang: appStore.defaultResponseLang,
  language: appStore.language,
  theme: appStore.isDarkMode ? 'dark' : 'light',
})

// 打开弹窗时存快照并初始化表单
const open = () => {
  initialState.value = {
    defaultCodingLang: appStore.defaultCodingLang,
    defaultResponseLang: appStore.defaultResponseLang,
    language: appStore.language,
    isDarkMode: appStore.isDarkMode,
  }
  formData.value = {
    defaultCodingLang: appStore.defaultCodingLang,
    defaultResponseLang: appStore.defaultResponseLang,
    language: appStore.language,
    theme: appStore.isDarkMode ? 'dark' : 'light',
  }
  modalOpen.value = true
}

// 表单每变动一次就实时应用到全局
watch(() => formData.value.language, (val) => {
  appStore.setLanguage(val)
})
watch(() => formData.value.theme, (val) => {
  appStore.setDarkMode(val === 'dark')
})
watch(() => formData.value.defaultCodingLang, (val) => {
  appStore.setDefaultCodingLang(val)
})
watch(() => formData.value.defaultResponseLang, (val) => {
  appStore.setDefaultResponseLang(val)
})

// 重置 = 恢复打开时的状态
const handleReset = () => {
  // 恢复初始表单 & 应用到store
  formData.value = {
    defaultCodingLang: initialState.value.defaultCodingLang,
    defaultResponseLang: initialState.value.defaultResponseLang,
    language: initialState.value.language,
    theme: initialState.value.isDarkMode ? 'dark' : 'light',
  }
  appStore.setDefaultCodingLang(initialState.value.defaultCodingLang)
  appStore.setDefaultResponseLang(initialState.value.defaultResponseLang)
  appStore.setLanguage(initialState.value.language)
  appStore.setDarkMode(initialState.value.isDarkMode)
  message.info('恢复设置')
}

// 确定 = 只是关闭弹窗
const handleSubmit = () => {
  message.success('保存成功')
  modalOpen.value = false
}

// 取消 = 恢复打开时的状态并关闭弹窗
const handleCancel = () => {
  handleReset()
  modalOpen.value = false
}

defineExpose({ open })
</script>

<template>
  <a-modal v-model:open="modalOpen" title="全局设置" @cancel="handleCancel">
    <div class="p-4 space-y-6">
      <!-- 默认编程语言 -->
      <div class="flex justify-between items-center">
        <span class="text-primary">默认编程语言</span>
        <a-input
          v-model:value="formData.defaultCodingLang"
          placeholder="设置默认编程语言"
          style="width: 200px"
        />
      </div>

      <!-- 默认回答语种 -->
      <div class="flex justify-between items-center">
        <span class="text-primary">默认回答语种</span>
        <a-input
          v-model:value="formData.defaultResponseLang"
          placeholder="倾向于回答的自然语言"
          style="width: 200px"
        />
      </div>

      <!-- 页面显示语言 -->
      <div class="flex justify-between items-center">
        <span class="text-primary">页面显示语言</span>
        <a-select
          v-model:value="formData.language"
          style="width: 200px"
        >
          <a-select-option
            v-for="option in languageOptions"
            :key="option.key"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 外观主题 -->
      <div class="flex justify-between items-center">
        <span class="text-primary">外观主题</span>
        <a-select
          v-model:value="formData.theme"
          style="width: 200px"
        >
          <a-select-option
            v-for="option in themeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <a-button @click="handleReset">
          重置
        </a-button>
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          保存
        </a-button>
      </div>
    </template>
  </a-modal>
</template>
