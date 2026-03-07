<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { Exam } from '@/types/exam'
import { appList } from '@/constants/apps'
import { upsertExamApi } from '@/api/exam'
import { toBase64 } from '@/utils/base64'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import { languageOptions } from '@/constants/language'
import { themeOptions } from '@/constants/theme'

const modalOpen = ref(false)
const formData = ref<Exam | null>(null)
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 通过 exam_type 在 appList 找到当前类型的配置信息
const appInfo = computed(() => {
  if (!formData.value)
    return null
  return appList.find(item => item.examType === formData.value!.exam_type) || appList[0]
})

// 缓存弹窗打开时的全局设置
const initialAppState = ref({
  language: appStore.language,
  isDarkMode: appStore.isDarkMode,
})

// v-model绑定
const uiSettings = ref({
  language: appStore.language,
  theme: appStore.isDarkMode ? 'dark' : 'light',
})

const open = (record: Exam) => {
  formData.value = { ...record }
  // 缓存全局设置
  initialAppState.value = {
    language: appStore.language,
    isDarkMode: appStore.isDarkMode,
  }
  // 更新uiSettings当前值
  uiSettings.value.language = appStore.language
  uiSettings.value.theme = appStore.isDarkMode ? 'dark' : 'light'
  modalOpen.value = true
}

const handleReset = () => {
  // 重置回打开时的原始数据
  appStore.setLanguage(initialAppState.value.language)
  appStore.setDarkMode(initialAppState.value.isDarkMode)
  uiSettings.value.language = initialAppState.value.language
  uiSettings.value.theme = initialAppState.value.isDarkMode ? 'dark' : 'light'
  if (formData.value)
    formData.value = { ...formData.value }
}

const handleCancel = () => {
  appStore.setLanguage(initialAppState.value.language)
  appStore.setDarkMode(initialAppState.value.isDarkMode)
  uiSettings.value.language = initialAppState.value.language
  uiSettings.value.theme = initialAppState.value.isDarkMode ? 'dark' : 'light'
  modalOpen.value = false
  message.info('取消保存')
}

const handleSubmit = async () => {
  if (!formData.value)
    return

  const data: Exam = {
    ...formData.value,
    exam_name: formData.value.exam_name.trim(),
    coding_lang: formData.value.coding_lang?.trim(),
    lang: formData.value.lang?.trim(),
  }

  try {
    await upsertExamApi(data)

    const updatedExamData = { ...formData.value }
    const encoded = await toBase64(JSON.stringify(updatedExamData))
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        examData: encoded,
      },
    })

    message.success('保存成功')
    modalOpen.value = false
  }
  catch (e) {
    message.error('保存失败')
    throw e
  }
}

watch(() => uiSettings.value.language, (val) => {
  appStore.setLanguage(val)
})

watch(() => uiSettings.value.theme, (val) => {
  appStore.setDarkMode(val === 'dark')
})

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="modalOpen"
    :title="`${appInfo?.name ?? ''}设置`"
    @cancel="handleCancel"
  >
    <div v-if="formData" class="p-4">
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">{{ appInfo?.name || '考试' }}名称</span>
        <a-input v-model:value="formData.exam_name" placeholder="填写考试名称" style="width: 200px" />
      </div>
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">编程语言</span>
        <a-input v-model:value="formData.coding_lang" placeholder="填写编程语言" style="width: 200px" />
      </div>
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">回答语种</span>
        <a-input v-model:value="formData.lang" placeholder="填写回答语种" style="width: 200px" />
      </div>
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">页面显示语言</span>
        <a-select
          v-model:value="uiSettings.language"
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
      <div class="flex justify-between items-center">
        <span class="text-primary">外观主题</span>
        <a-select
          v-model:value="uiSettings.theme"
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
          确定
        </a-button>
      </div>
    </template>
  </a-modal>
</template>
