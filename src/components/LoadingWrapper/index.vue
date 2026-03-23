<script setup lang="ts">
import {
  LoadingOutlined,
} from '@ant-design/icons-vue'

defineProps<{
  loading: boolean
  animated?: boolean
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
      <transition
        v-if="animated"
        appear
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <slot />
      </transition>
      <div v-else>
        <slot />
      </div>
    </template>
  </div>
</template>
