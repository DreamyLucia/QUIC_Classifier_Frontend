<script setup lang="ts">
import DigitalDisplay from '@/components/DigitalDisplay/index.vue'
import { t } from '@/locales'

defineProps<{
  totalFiles: number
  totalTime: number
  avgConfidence: number
}>()
</script>

<template>
  <div class="flex w-full space-x-4 items-center justify-center">
    <DigitalDisplay
      :header="t('statsCard.stats.totalFiles')"
      :number="totalFiles"
      :unit="t('common.unit.file')"
    />
    <DigitalDisplay
      :header="t('statsCard.stats.totalTime')"
      :number="totalTime"
      :unit="t('common.unit.second')"
    />
    <DigitalDisplay
      :header="t('statsCard.stats.avgConfidence')"
      :number="avgConfidence * 100"
      :unit="t('common.unit.percent')"
    />
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
