<script setup lang="ts">
import PageHeader from '@/components/HomeHeader/index.vue'
import Hero from './components/Hero.vue'
const handleLogin = () => {
  // TODO: 跳转到登录页面
  // eslint-disable-next-line no-console
  console.log('handleLogin');
};
</script>

<template>
  <!-- 背景层 -->
  <div
    class="absolute inset-0 bg-[url(@/assets/img/HomePage/bg.png)] bg-center opacity-50 z-0s"
    style="background-size: cover;"
  />
  <div class="flex flex-col h-full">
    <PageHeader />
    <div class="flex w-full normal-bg h-full justify-center items-center">
      <Hero />
    </div>
  </div>
</template>
