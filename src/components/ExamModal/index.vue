<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Exam } from '@/types/exam'
import { appList } from '@/constants/apps'
import { useAppStore } from '@/store/app'
import { upsertExamApi } from '@/api/exam'
import { useRouter } from 'vue-router'
import { toBase64 } from '@/utils/base64';

const props = defineProps<{
  selectedAppIndex: number
}>()

const emit = defineEmits(['submit'])

const router = useRouter();

const appStore = useAppStore()
const modalOpen = ref(false)
const currentExam = ref<Exam | null>(null)
const isEditMode = computed(() => !!currentExam.value)

// 动态默认考试名称
const getDefaultExamName = () => `未命名${appList[props.selectedAppIndex].name}`

// 默认值
const getDefaultExam = (): Exam => ({
  exam_id: '',
  exam_name: getDefaultExamName(),
  coding_lang: appStore.defaultCodingLang,
  lang: appStore.defaultResponseLang,
  exam_type: appList[props.selectedAppIndex].examType,
})

const formData = ref<Exam>(getDefaultExam())

// 根据传入的记录初始化表单
const initForm = (record?: Exam) => {
  currentExam.value = record || null
  formData.value = record
    ? {
        exam_id: record.exam_id,
        exam_name: record.exam_name,
        coding_lang: record.coding_lang,
        lang: record.lang,
        exam_type: record.exam_type,
      }
    : getDefaultExam()
}

// 重置表单
const handleReset = () => {
  if (isEditMode.value && currentExam.value)
    initForm(currentExam.value)
  else
    formData.value = getDefaultExam()
}

// 取消
const handleCancel = () => {
  modalOpen.value = false
}

// 提交
const handleSubmit = async () => {
  const finalData: Exam = {
    exam_id: isEditMode.value ? currentExam.value!.exam_id : '',
    exam_name: formData.value.exam_name.trim() || (isEditMode.value ? currentExam.value!.exam_name : '未命名考试'),
    coding_lang: formData.value.coding_lang.trim() || (isEditMode.value ? currentExam.value!.coding_lang : appStore.defaultCodingLang),
    lang: formData.value.lang ?? (isEditMode.value ? currentExam.value!.lang : appStore.defaultResponseLang),
    exam_type: appList[props.selectedAppIndex].examType,
  }

  try {
    const response = await upsertExamApi(finalData)
    finalData.exam_id = response.exam_id
    // 将 finalData 转换为 JSON 字符串
    const data = JSON.stringify(finalData);
    // 使用 toBase64 函数进行 Base64 编码
    const encodedData = await toBase64(data);

    modalOpen.value = false

    // 新增路由跳转逻辑
    if (!isEditMode.value) {
      if (appList[props.selectedAppIndex].examType === 1) {
        router.push({
          name: 'WrittenTestPage',
          query: {
            examData: encodedData,
          },
        })
      }
      else if (appList[props.selectedAppIndex].examType === 2) {
        router.push({
          name: 'InterviewTestPage',
          query: {
            examData: encodedData,
          },
        })
      }
      else {
        message.error('考试类型错误')
      }
    }
    else {
      message.success('修改成功')
      emit('submit')
    }
  }
  catch (error) {
    message.error(`${isEditMode.value ? '修改' : '创建'}失败`)
    throw error
  }
}

// 暴露打开方法
const open = (record?: Exam) => {
  initForm(record)
  modalOpen.value = true
}

defineExpose({ open })
</script>

<template>
  <a-modal v-model:open="modalOpen" :title="`${isEditMode ? '修改' : '新建'}${appList[selectedAppIndex].name}`" @cancel="handleCancel">
    <div class="p-4">
      <!-- 考试名称 -->
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">{{ appList[selectedAppIndex].name }}名称</span>
        <a-input
          v-model:value="formData.exam_name"
          placeholder="规范名字方便后期复盘"
          style="width: 200px"
        />
      </div>

      <!-- 编程语言 (文本输入) -->
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">编程语言</span>
        <a-input
          v-model:value="formData.coding_lang"
          placeholder="倾向于使用的编程语言"
          style="width: 200px"
        />
      </div>

      <!-- 回复语言 -->
      <div class="flex justify-between items-center mb-6">
        <span class="text-primary">回答语种</span>
        <a-input
          v-model:value="formData.lang"
          placeholder="倾向于回答的自然语言"
          style="width: 200px"
        />
      </div>

      <!-- 考试类型 -->
      <div class="flex justify-between items-center">
        <span class="text-primary">考核形式</span>
        <a-input
          :value="appList[selectedAppIndex].name"
          disabled
          style="width: 200px"
        />
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
