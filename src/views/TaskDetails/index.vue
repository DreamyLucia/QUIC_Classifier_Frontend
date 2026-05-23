<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Siderbar from '@/components/SiderBar/index.vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import PieChart from './components/PieChart.vue'
import ResultCard from './components/ResultCard.vue'
import { getTaskResultsApi } from '@/api/query'
import type { TaskResultsResponse } from '@/types/query'
import { message } from 'ant-design-vue'
import { t } from '@/locales'

const route = useRoute()
const isLoading = ref(true)
const taskDetail = ref<TaskResultsResponse | null>(null)

const fetchTaskDetail = async () => {
  const taskId = route.params.task_id as string

  if (!taskId) {
    message.error('任务ID不存在')
    return
  }

  try {
    const res = await getTaskResultsApi(taskId)
    taskDetail.value = res
  }
  catch (error) {
    console.error('获取任务详情失败:', error)
    message.error(t('message.error.getTaskDetailError'))
  }
  finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr)
    return '--'
  const date = new Date(dateStr)
  return date.toLocaleString()
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4">
    <div class="flex h-full w-full">
      <Siderbar />
      <LoadingWrapper :loading="isLoading" animated class="flex flex-col w-full h-full ml-4">
        <div v-if="taskDetail" class="flex flex-col flex-1 w-full min-h-0">
          <div class="flex flex-col justify-center items-center w-full">
            <span class="text-primary font-bold text-3xl">{{ taskDetail.task_name }}</span>
            <span class="text-secondary text-sm">{{ taskDetail.task_id }}</span>
          </div>
          <div class="flex flex-1 w-full rounded-[10px] body-bg px-4 py-4 min-h-0">
            <div class="flex flex-col w-[40%]">
              <div class="flex flex-col rounded-[10px] box-bg px-8 py-4 space-y-2">
                <!-- 文件总数 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.totalFiles') }}</span>
                  <span class="primary font-bold ml-auto">{{ taskDetail.file_count }}</span>
                  <span class="text-secondary ml-2">{{ t('common.unit.file') }}</span>
                </div>

                <!-- 创建时间 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.createdAt') }}</span>
                  <span class="primary font-bold ml-auto">{{ formatDate(taskDetail.created_at) }}</span>
                </div>

                <!-- 模型类型 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.modelType') }}</span>
                  <span class="primary font-bold ml-auto">{{ t(`model.${taskDetail.model_type}.name`) }}</span>
                </div>

                <!-- 成功识别 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.successCount') }}</span>
                  <span class="primary font-bold ml-auto">{{ taskDetail.file_count - taskDetail.unknown_count }}</span>
                  <span class="text-secondary ml-2">{{ t('common.unit.file') }}</span>
                </div>

                <!-- 未识别 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.unknownCount') }}</span>
                  <span class="primary font-bold ml-auto">{{ taskDetail.unknown_count }}</span>
                  <span class="text-secondary ml-2">{{ t('common.unit.file') }}</span>
                </div>

                <!-- 平均置信度 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.avgConfidence') }}</span>
                  <span class="primary font-bold ml-auto">{{ (taskDetail.avg_confidence * 100).toFixed(1) }}</span>
                  <span class="text-secondary ml-2">{{ t('common.unit.percent') }}</span>
                </div>

                <!-- 耗时 -->
                <div class="flex w-full">
                  <span class="text-primary">{{ t('taskDetails.analysisTime') }}</span>
                  <span class="primary font-bold ml-auto">{{ taskDetail.total_analysis_time.toFixed(2) }}</span>
                  <span class="text-secondary ml-2">{{ t('common.unit.second') }}</span>
                </div>
              </div>
              <div class="flex flex-1 mt-4">
                <PieChart
                  :data="taskDetail.category_stats"
                  style="height: 450px"
                />
              </div>
            </div>
            <div class="flex flex-col flex-1 min-h-0 ml-4 box-bg rounded-[10px] pl-4 py-2">
              <div v-if="taskDetail.results.length === 0" class="flex-1 flex items-center justify-center text-secondary text-3xl">
                {{ t('taskDetails.noDetails') }}
              </div>
              <div v-else class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div class="space-y-2">
                  <ResultCard
                    v-for="result in taskDetail.results"
                    :key="result.filename"
                    :result="result"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!isLoading" class="w-full items-center justify-center">
          <span class="text-secondary text-2xl">{{ t('taskDetails.noDetails') }}</span>
        </div>
      </LoadingWrapper>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
