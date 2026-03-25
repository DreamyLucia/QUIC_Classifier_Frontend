<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TaskResultItem } from '@/types/query'
import { t } from '@/locales';
import TruncateText from '@/components/TruncateText/index.vue'
import { Modal } from 'ant-design-vue'
import PieChart from './PieChart.vue'

const props = defineProps<{
  result: TaskResultItem
}>()

const modalVisible = ref(false)
const classNames = ['Nkiri', 'bilibili', 'edge', 'kwai',
  'tencentnews', 'tencentvideo', 'tiktok', 'xiaohongshu']

// 将 probabilities 数组转换为饼图数据格式
const pieData = computed(() => {
  const data: Record<string, number> = {}
  classNames.forEach((name, index) => {
    data[name] = props.result.probabilities[index] * 100
  })
  return data
})

const openModal = () => {
  modalVisible.value = true
}
</script>

<template>
  <div>
    <!-- 弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="result.filename"
      :footer="null"
      :centered="true"
    >
      <div class="modal-content">
        <div class="mb-4 text-secondary">
          {{ t('taskDetails.createdAt') }}: {{ result.created_at ? new Date(result.created_at).toLocaleString() : '--' }}
        </div>
        <div>
          <PieChart :data="pieData" />
        </div>
      </div>
    </Modal>
    <div
      class="flex no-bg-button items-center w-full px-4 py-2"
      @click="openModal"
    >
      <div class="flex flex-1 text-sm w-full pr-2">
        <TruncateText
          :text="result.filename"
          max-width="60%"
          text-class="font-bold text-primary"
        />
        <span class="text-secondary font-bold ml-auto">{{ (result.confidence * 100).toFixed(2) }}{{ t('common.unit.percent') }} {{ result.label }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
