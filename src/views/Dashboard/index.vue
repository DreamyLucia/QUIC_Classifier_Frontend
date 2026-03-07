<script setup lang="ts">
import Siderbar from './components/Siderbar.vue'
import Select from './components/Select.vue'
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4">
    <Siderbar />
    <Select />
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
