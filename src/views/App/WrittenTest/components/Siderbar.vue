<script setup lang="ts">
import {
  DeleteOutlined,
  MessageOutlined,
  SelectOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { ref } from 'vue'
import type { writtenTestQuestion, writtenTestQuestionDetail } from '@/types/writtenTest'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import { VueMarkdownIt } from 'vue-markdown-shiki'
import { useHorizontalWheelScroll } from '@/utils/useHorizontalWheelScroll'

defineProps<{
  questionList: writtenTestQuestion[],
  questionDetail: writtenTestQuestionDetail | null,
  isLoading: boolean,
  selectedId: string | null,
  selectedQuestionType: string,
  imageList: string[],
  textList: string[],
  readyShot: boolean,
  readyAnswer: boolean
}>()

const emit = defineEmits([
  'select',
  'deleteQuestion',
  'screenshot',
  'next',
  'answer',
  'changeType',
  'deleteImage',
])
const scrollRowRef = ref<HTMLDivElement | null>(null)
useHorizontalWheelScroll(scrollRowRef)

const questionTypeOptions = [
  { label: '单选题', value: '单选题' },
  { label: '多选题', value: '多选题' },
  { label: '图表单选', value: '图表单选' },
  { label: '图表多选', value: '图表多选' },
  { label: '填空题', value: '填空题' },
  { label: '简答题', value: '简答题' },
  { label: '编程题', value: '编程题' },
]

const handleSelect = (q: writtenTestQuestion) => {
  emit('select', q.id)
}

const handleTypeChange = (val: string) => {
  emit('changeType', val)
}

const handleDelete = (q: writtenTestQuestion) => {
  emit('deleteQuestion', q.id)
}

const handleScreenshot = () => {
  emit('screenshot')
}

const handleNext = () => {
  emit('next')
}

const handleAnswer = () => {
  emit('answer')
}

const handleDeleteImage = (index: number) => {
  emit('deleteImage', index)
}
</script>

<template>
  <div class="flex flex-col w-[25%] items-center h-full px-2 py-2 border-right space-y-2">
    <div class="flex flex-col w-full rounded-[10px] body-bg p-2">
      <span class="text-primary text-xl font-bold">答题历史</span>
      <div class="flex h-[250px]">
        <LoadingWrapper :loading="isLoading" class="flex flex-col space-y-4 mt-4 pb-2 overflow-y-auto custom-scrollbar pr-2">
          <div
            v-for="q in questionList"
            :key="q.id"
            class="w-full rounded-[10px] box-bg px-4 py-2 space-y-2 question-card text-sm"
            :class="{ selected: selectedId === q.id }"
            @click="handleSelect(q)"
          >
            <div class="flex justify-between items-center">
              <div class="w-[80%] font-bold question-title text-ellipsis-single-line">
                {{ q.question_title }}
              </div>
              <div class="question-label">
                {{ q.question_type }}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="question-label">
                时间
              </div>
              <DeleteOutlined class="question-button" @click="handleDelete(q)" />
            </div>
          </div>
        </LoadingWrapper>
      </div>
    </div>
    <div class="flex flex-col flex-1 w-full rounded-[10px] body-bg p-2 min-h-0">
      <div class="flex items-center justify-between w-full mb-2">
        <span class="text-primary text-xl font-bold">{{ questionDetail ? '题目识别结果' : '题目输入区域' }}</span>
        <a-select
          :value="selectedQuestionType"
          :options="questionTypeOptions"
          placeholder="请选择题型"
          size="small"
          @change="handleTypeChange"
        />
      </div>
      <div class="flex-1 min-h-0 flex flex-col rounded-[10px] py-2">
        <div v-if="questionDetail" class="flex-1 min-h-0 overflow-y-auto custom-scrollbar allow-select">
          <VueMarkdownIt :content="questionDetail?.question_text" class="text-secondary" />
        </div>
        <div v-else class="flex-1 min-h-0 flex flex-col space-y-2 px-2">
          <div v-if="imageList.length">
            <a-image-preview-group>
              <div ref="scrollRowRef" class="flex gap-3 overflow-x-auto custom-scrollbar w-full whitespace-nowrap py-2">
                <div
                  v-for="(img, i) in imageList"
                  :key="img + i"
                  class="relative group"
                >
                  <a-image
                    :src="img"
                    :width="90"
                    :height="90"
                    class="rounded-lg object-cover h-[90px] min-w-[90px] min-h-[90px]"
                  />
                  <!-- 删除按钮 -->
                  <button
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-primary rounded-full flex items-center justify-center text-xs font-bold opacity-0 border-all group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    title="删除图片"
                    @click.stop="handleDeleteImage(i)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </a-image-preview-group>
          </div>
          <div
            v-if="textList.length"
            class="flex flex-1 flex-col space-y-2 box-bg rounded-[10px] overflow-y-auto custom-scrollbar allow-select p-4"
          >
            <div v-for="(text, i) in textList" :key="i" class="text-secondary">
              {{ text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex w-full rounded-[10px] py-2 space-x-2">
      <div class="flex flex-col flex-1 h-full">
        <button
          class="flex flex-1 items-center justify-center p-2 rounded-[10px] space-x-2 secondary-button"
          :disabled="!readyShot"
          @click="readyShot ? handleScreenshot() : null"
        >
          <SelectOutlined />
          <span class="text-xl">遥控截屏</span>
        </button>
      </div>
      <div class="flex flex-col flex-1 h-full space-y-2">
        <button
          v-if="selectedId"
          class="flex flex-1 items-center justify-center p-2 rounded-[10px] space-x-2 normal-button"
          :disabled="!questionDetail"
          @click="questionDetail ? handleNext() : null"
        >
          <MessageOutlined />
          <span class="text-xl">下一题</span>
        </button>
        <button
          v-else
          class="flex flex-1 items-center justify-center p-2 rounded-[10px] space-x-2 normal-button"
          :disabled="!readyAnswer"
          @click="readyAnswer ? handleAnswer() : null"
        >
          <ThunderboltOutlined />
          <span class="text-xl">解答</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.question-card {
  transition: all 0.2s ease;
  background-color: var(--normal-layout-box-bg-color);

  .question-title {
    color: var(--normal-layout-text-color);
  }

  .question-label {
    color: var(--normal-layout-text-secondary-color);
  }

  .question-button {
    color: var(--normal-layout-text-secondary-color);
  }

  &:hover {
    background-color: var(--normal-layout-box-bg-invert-color);
    cursor: pointer;

    .question-title {
      color: var(--normal-layout-text-invert-color);
    }

    .question-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }

    .question-button {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }

  &.selected {
    background-color: var(--normal-layout-body-bg-invert-color);
    cursor: default !important;

    .question-title {
      color: var(--normal-layout-text-invert-color);
    }

    .question-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }

    .question-button {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}

.question-button {
  transition: all 0.2s ease;
  &:hover {
    color: var(--primary) !important;
    font-weight: bold;
    transform: scale(1.15);
  }
}

.shiki .line {
  white-space: pre-wrap !important;
  overflow-wrap: break-word !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
</style>
