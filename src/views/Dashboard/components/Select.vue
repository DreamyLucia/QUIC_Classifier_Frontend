<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { HistoryRecord } from '@/types/history'
import { appList } from '@/constants/apps'
import ExamModal from '@/components/ExamModal/index.vue'
import HistoryCard from './HistoryCard.vue'
import {
  PlusCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue';
import { getExamListApi } from '@/api/exam'

const selectedAppIndex = ref(0)
const modalRef = ref<InstanceType<typeof ExamModal>>()
const historyList = ref<HistoryRecord[]>([])

// 按钮列表
const buttonList = [
  {
    icon: PlusCircleOutlined,
    title: computed(() => appList[selectedAppIndex.value].add),
    action: () => {
      modalRef.value?.open()
    },
  },
]

// 排序函数
const sortHistoryList = () => {
  historyList.value.sort((a, b) => {
    // 先按日期排序(降序)
    const dateCompare = new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime()
    if (dateCompare !== 0)
      return dateCompare

    // 日期相同的情况下，再按exam_hour降序
    return b.exam_hour.localeCompare(a.exam_hour) // 注意这里改为b和a比较
  })
}

// 获取历史记录
const fetchHistoryList = async () => {
  try {
    historyList.value = await getExamListApi()
    sortHistoryList()
  }
  catch (error) {
    message.error('获取历史记录失败')
    console.error('获取历史记录失败:', error)
  }
}

const groupedHistory = computed(() => {
  const groups: Record<string, HistoryRecord[]> = {}
  const currentType = appList[selectedAppIndex.value].examType // 笔试模式对应1，面试模式对应2

  historyList.value
    .filter(record => record.exam_type === currentType)
    .forEach((record) => {
      if (!groups[record.exam_date])
        groups[record.exam_date] = []

      groups[record.exam_date].push(record)
    })

  return groups
})

const selectApp = (index: number) => {
  selectedAppIndex.value = index
}

onMounted(() => {
  fetchHistoryList()
})
</script>

<template>
  <ExamModal ref="modalRef" :selected-app-index="selectedAppIndex" @submit="fetchHistoryList" />
  <div class="flex flex-col w-full ml-4 normal-bg">
    <div class="flex flex-col w-full h-full rounded-[30px] body-bg py-4">
      <!-- 应用选择部分 -->
      <div class="flex gap-4 overflow-x-auto pb-2 border-bottom px-4">
        <button
          v-for="(app, index) in appList"
          :key="index"
          class="flex flex-col px-4 py-2 rounded-[10px] cursor-pointer items-start app-button"
          :class="{ selected: selectedAppIndex === index }"
          @click="selectApp(index)"
        >
          <span class="app-name text-xl text-primary">{{ app.name }}模式</span>
          <span class="app-label text-sm text-secondary">{{ app.label }}</span>
        </button>
      </div>

      <!-- 历史记录展示部分 -->
      <div class="flex-1 overflow-y-auto mt-4 custom-scrollbar border-bottom px-4">
        <div v-for="(records, date) in groupedHistory" :key="date" class="flex flex-col mb-4">
          <h3 class="text-xl font-bold text-primary">
            {{ date }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HistoryCard
              v-for="record in records"
              :key="record.exam_id"
              :selected-app-index="selectedAppIndex"
              :record="record"
              @refresh="fetchHistoryList"
            />
          </div>
        </div>
        <div v-if="Object.keys(groupedHistory).length === 0" class="flex h-full justify-center items-center text-secondary">
          <span>暂无历史记录</span>
        </div>
      </div>

      <!-- 底部按钮部分 -->
      <div class="flex justify-start gap-4 mt-4 px-4">
        <button
          v-for="(button, index) in buttonList"
          :key="index"
          class="flex items-center gap-2 px-4 py-4 rounded-[10px] text-primary action-button"
          @click="button.action"
        >
          <component :is="button.icon" class="text-lg action-label" />
          <span class="action-label">{{ button.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.app-button {
  transition: all 0.2s ease;
  border: solid 1px var(--normal-layout-border-color);
  background-color: var(--normal-layout-box-bg-color);

  &:hover {
    background-color: var(--normal-layout-box-bg-invert-color);
    border-color: var(--normal-layout-border-invert-color);

    .app-name {
      color: var(--normal-layout-text-invert-color);
    }

    .app-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }

  &.selected {
    background-color: var(--normal-layout-body-bg-invert-color);
    border-color: var(--normal-layout-border-invert-color);
    cursor: default !important;

    .app-name {
      color: var(--normal-layout-text-invert-color);
    }

    .app-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}

.action-button {
  transition: all 0.2s ease;
  border: none;
  background-color: var(--normal-layout-box-bg-color);

  &:hover {
    background-color: var(--normal-layout-body-bg-invert-color);

    .action-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}
</style>
