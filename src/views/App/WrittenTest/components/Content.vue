<script setup lang="ts">
import { t } from '@/locales';
import { ref, watch } from 'vue'
import type { writtenTestQuestionDetail } from '@/types/writtenTest'
import { message } from 'ant-design-vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import { VueMarkdownIt } from 'vue-markdown-shiki'

const props = defineProps<{
  isLoading: boolean,
  questionDetail: writtenTestQuestionDetail | null
}>()

const selectedSolutionIdx = ref(0)

const quickStartGuides = [
  '请连接到客户端使用，备战更轻松；',
  '使用“远控截屏”遥控客户端截图并自动读题，最多可截三张；',
  '点击“下一题”可开启新的题目；',
  '图推题：请选择“图表单选”题型！',
]

watch(
  () => props.questionDetail,
  (val) => {
    // questionDetail 更新时索引重置为第一个
    if (val && val.solutions && val.solutions.length)
      selectedSolutionIdx.value = 0
  },
)
</script>

<template>
  <div v-if="!props.questionDetail" class="flex flex-1 flex-col justify-center items-center space-y-8">
    <div class="flex items-center gap-3 justify-center">
      <div class="h-20 w-20">
        <img src="@/assets/logo.png" alt="Logo" class="h-full w-full object-contain">
      </div>
      <span class="text-4xl font-bold ml-2 primary">{{ t('productName') }}</span>
    </div>
    <div class="flex flex-col items-center justify-center">
      <span class="text-primary text-3xl mb-4">快速上手</span>
      <div class="flex flex-col w-full space-y-2">
        <span
          v-for="(item, idx) in quickStartGuides"
          :key="item"
          class="text-secondary text-sm"
        >
          {{ idx + 1 }}. {{ item }}
        </span>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-1">
    <LoadingWrapper :loading="isLoading">
      <div v-if="questionDetail" class="flex flex-col flex-1">
        <div class="flex w-full border-bottom px-4 py-2 justify-between items-center">
          <span class="text-primary text-2xl font-bold">{{ questionDetail.question_title }}</span>
          <div v-if="questionDetail?.solutions?.length" class="flex items-center gap-2">
            <button
              v-for="(sol, idx) in questionDetail.solutions"
              :key="sol.id"
              class="w-[36px] h-[36px] rounded-full solutions-index"
              :class="{ selected: selectedSolutionIdx === idx }"
              @click="selectedSolutionIdx = idx"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </div>
        <div v-if="questionDetail?.solutions.length" class="flex flex-col flex-1 min-h-0 mx-4 my-2 body-bg rounded-[10px] px-4 py-2">
          <div class="flex w-full">
            <span class="text-primary text-sm font-bold rounded-full box-bg px-4 py-2 inline-block">
              {{ selectedSolutionIdx + 1 }}: {{ questionDetail.solutions[selectedSolutionIdx].model }}
            </span>
          </div>
          <div class="flex-1 min-h-0 flex flex-col rounded-[10px] py-2">
            <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar allow-select">
              <VueMarkdownIt :content="questionDetail.solutions[selectedSolutionIdx].answer_text" class="text-primary" />
            </div>
          </div>
        </div>
        <div v-else class="flex flex-1 justify-center items-center">
          <span class="text-primary text-2xl font-bold">暂无答案</span>
        </div>
      </div>
    </LoadingWrapper>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.solutions-index {
  transition: all 0.2s ease;
  background-color: var(--normal-layout-box-bg-color);
  color: var(--normal-layout-text-secondary-color);
  border: none;

  &:hover {
    background-color: var(--normal-layout-box-bg-invert-color);
    cursor: pointer;
    color: var(--normal-layout-text-secondary-invert-color);
  }

  &.selected {
    background-color: var(--normal-layout-body-bg-invert-color);
    cursor: default !important;
    color: var(--normal-layout-text-secondary-invert-color);
  }
}
</style>
