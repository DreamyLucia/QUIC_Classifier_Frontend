<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Siderbar from '@/components/SiderBar/index.vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import StatsCard from '@/components/StatsCard/index.vue'
import TaskCard from './components/TaskCard.vue'
import { getUserAllStatsApi, getUserTasksApi } from '@/api/query'
import type { TaskInfo } from '@/types/query'
import { message } from 'ant-design-vue';
import { t } from '@/locales';

const isLoading = ref(true)
const tasks = ref<TaskInfo[]>([])
const total = ref(0)
const stats = ref({
  total: 0,
  category_stats: {} as Record<string, number>,
  unknown_count: 0,
  total_analysis_time: 0,
  avg_confidence: 0,
})

const fetchTasks = async () => {
  try {
    const [tasksRes, statsRes] = await Promise.all([
      getUserTasksApi(),
      getUserAllStatsApi(),
    ])
    tasks.value = tasksRes.tasks
    total.value = tasksRes.total
    stats.value = statsRes
  }
  catch (error) {
    console.error('获取数据失败:', error)
    message.error(t('message.error.getTasksError'))
  }
  finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4">
    <div class="flex h-full w-full">
      <Siderbar />
      <LoadingWrapper :loading="isLoading" animated class="w-full h-full">
        <div class="flex flex-1 flex-col w-full ml-4">
          <StatsCard
            :total-files="stats.total"
            :total-time="stats.total_analysis_time"
            :avg-confidence="stats.avg_confidence"
            class="mb-8"
          />
          <div class="flex justify-between items-center mt-2">
            <span class="text-2xl font-bold text-primary">{{ t('history.title') }}</span>
            <span class="text-sm text-secondary">{{ t('history.common.total') }} {{ total }} {{ t('history.common.unit') }}{{ t('history.common.task') }}</span>
          </div>
          <div class="flex flex-1 w-full mt-2 body-bg rounded-[10px] overflow-y-auto custom-scrollbar">
            <div v-if="tasks.length === 0" class="flex-1 flex items-center justify-center text-secondary text-3xl">
              {{ t('history.noTask') }}
            </div>
            <div v-else class="flex flex-1 w-full flex-col space-y-3 px-4 py-2">
              <TaskCard
                v-for="task in tasks"
                :key="task.task_id"
                :task="task"
              />
            </div>
          </div>
        </div>
      </LoadingWrapper>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
