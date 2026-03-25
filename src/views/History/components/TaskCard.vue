<script setup lang="ts">
import { computed } from 'vue'
import type { TaskInfo } from '@/types/query'
import { t } from '@/locales';
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const props = defineProps<{
  task: TaskInfo
}>()

const router = useRouter()

const statusText = computed(() => {
  switch (props.task.status) {
    case 'completed': return t('taskCard.status.completed')
    case 'analyzing': return t('taskCard.status.analyzing')
    case 'pending': return t('taskCard.status.pending')
    case 'failed': return t('taskCard.status.failed')
    default: return props.task.status
  }
})

const statusClass = computed(() => {
  switch (props.task.status) {
    case 'completed': return 'text-green-600'
    case 'analyzing': return 'text-yellow-600'
    case 'pending': return 'text-gray-600'
    case 'failed': return 'text-red-600'
    default: return 'text-gray-600'
  }
})

const showStats = computed(() => props.task.status === 'completed')

const handleClick = () => {
  if (props.task.status === 'completed') {
    router.push(`/task/${props.task.task_id}`)
  }
  else {
    let infoMsg = ''
    switch (props.task.status) {
      case 'analyzing':
        infoMsg = t('message.info.taskAnalyzing')
        break
      case 'pending':
        infoMsg = t('message.info.taskPending')
        break
      case 'failed':
        infoMsg = t('message.info.taskFailed')
        break
      default:
        infoMsg = '任务未完成，暂无法查看详情'
    }
    message.info(infoMsg)
  }
}
</script>

<template>
  <div
    class="task-card flex w-full box-bg px-4 py-2 rounded-[10px] cursor-pointer transition-all duration-200 items-center"
    @click="handleClick"
  >
    <div class="flex flex-col">
      <span class="text-primary text-2xl font-bold">{{ task.task_name }}</span>
      <span class="text-secondary text-sm">{{ task.task_id }}</span>
    </div>
    <div v-if="showStats" class="flex ml-auto space-x-4 text-xl">
      <div>
        <span class="text-secondary">{{ t('taskCard.fileCount') }}</span>
        <span class="primary font-bold">{{ task.file_count }}</span>
        <span class="text-secondary">{{ t('common.unit.file') }}</span>
      </div>
      <div>
        <span class="text-secondary">{{ t('taskCard.avgConfidence') }}</span>
        <span class="primary font-bold">{{ (task.avg_confidence * 100).toFixed(2) }}</span>
        <span class="text-secondary">{{ t('common.unit.percent') }}</span>
      </div>
      <div>
        <span class="text-secondary">{{ t('taskCard.analysisTime') }}</span>
        <span class="primary font-bold">{{ task.total_analysis_time.toFixed(2) }}</span>
        <span class="text-secondary">{{ t('common.unit.second') }}</span>
      </div>
    </div>
    <div v-else class="flex ml-auto text-xl">
      <span
        :class="statusClass"
      >
        {{ statusText }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.task-card {
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--normal-layout-box-bg-invert-color);
    .text-primary {
      color: var(--normal-layout-text-invert-color);
    }
    .text-secondary {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}
</style>
