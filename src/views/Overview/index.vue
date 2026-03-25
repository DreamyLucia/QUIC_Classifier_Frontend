<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Siderbar from '@/components/SiderBar/index.vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import { getUserAllStatsApi } from '@/api/query'
import type { TaskInfo } from '@/types/query'
import { message } from 'ant-design-vue';
import { t } from '@/locales';

const isLoading = ref(true)
const stats = ref({
  total: 0,
  category_stats: {} as Record<string, number>,
  unknown_count: 0,
  total_analysis_time: 0,
  avg_confidence: 0,
})

const fetchStats = async () => {
  try {
    const res = await getUserAllStatsApi()
    stats.value = res
  }
  catch (error) {
    console.error('获取统计数据失败:', error)
    message.error(t('message.error.getStatsError'))
  }
  finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4 ">
    <div class="flex h-full w-full">
      <Siderbar />
      <LoadingWrapper :loading="isLoading" animated class="w-full h-full" />
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
