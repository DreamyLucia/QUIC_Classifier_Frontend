<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  maxWidth?: string; // 不传则自适应
  textClass?: string;
}>();

const maxWidth = computed(() => props.maxWidth || '100%');
</script>

<template>
  <div class="truncate-container" :style="{ maxWidth }">
    <span class="truncate-text" :class="textClass">
      {{ text }}
    </span>
  </div>
</template>

<style scoped>
.truncate-container {
  width: 100%;
  min-width: 0;
}

.truncate-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
