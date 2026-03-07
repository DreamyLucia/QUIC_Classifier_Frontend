<script setup lang="ts">
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/hooks/useTheme'
// 设定为中文环境
const { language } = useLanguage();

// 设置主题颜色,执行useTheme()会自动设置theme
const { theme } = useTheme()
</script>

<template>
  <a-config-provider :locale="language" :theme="theme">
    <div class="app h-screen w-screen no-select">
      <!-- 页面内容会通过 RouterView 动态渲染 -->
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Dashboard']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </a-config-provider>
</template>
