<script setup lang="ts">
import {
  LoadingOutlined,
} from '@ant-design/icons-vue'
defineProps<{
  loading: boolean
}>()
</script>

<template>
  <div class="flex flex-1">
    <template v-if="loading">
      <div class="flex flex-col flex-1 justify-center items-center space-y-8">
        <LoadingOutlined class="text-5xl primary" />
        <span class="text-2xl font-bold text-primary">加载中</span>
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>
