<script setup lang="ts">
import { t } from '@/locales';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleClickLogo = () => {
  router.push({ name: 'Home' })
};
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div
      class="flex items-center gap-3 cursor-pointer justify-center"
      @click="handleClickLogo"
    >
      <div class="h-12 w-12">
        <img src="@/assets/logo.png" alt="Logo" class="h-full w-full object-contain">
      </div>
      <span class="text-3xl font-bold ml-2 primary">{{ t('productName') }}</span>
    </div>

    <!-- 主要部分 -->
    <div class="flex flex-col flex-1 items-center" />
  </div>
</template>

<style lang="scss">

</style>
