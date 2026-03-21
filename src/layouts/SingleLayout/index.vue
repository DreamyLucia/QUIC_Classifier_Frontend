<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { t } from '@/locales';
import { useAppStore } from '@/store/app';

const router = useRouter();

const appStore = useAppStore()

const gotoHome = () => {
  router.push({ name: 'Home' });
};

const toggleTheme = () => {
  appStore.setDarkMode(!appStore.isDarkMode)
}
</script>

<template>
  <a-layout style="height: 100vh;" class="overflow-auto normal-bg">
    <div class="flex justify-start items-center my-4 gap-2 mx-8 z-50">
      <div class="h-12 w-12">
        <img src="@/assets/logo.png" alt="Logo" class="h-full w-full object-contain cursor-pointer" @click="gotoHome">
      </div>
      <span class="text-3xl font-bold ml-2 primary cursor-pointer" @click="gotoHome">{{ t('productName') }}</span>
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle ml-auto" @click="toggleTheme">
        <g clip-path="url(#clip0_86_308)">
          <path d="M8.00033 0.666748V2.00008M8.00033 14.0001V15.3334M2.81366 2.81341L3.76033 3.76008M12.2403 12.2401L13.187 13.1867M0.666992 8.00008H2.00033M14.0003 8.00008H15.3337M2.81366 13.1867L3.76033 12.2401M12.2403 3.76008L13.187 2.81341M11.3337 8.00008C11.3337 9.84103 9.84127 11.3334 8.00033 11.3334C6.15938 11.3334 4.66699 9.84103 4.66699 8.00008C4.66699 6.15913 6.15938 4.66675 8.00033 4.66675C9.84127 4.66675 11.3337 6.15913 11.3337 8.00008Z" stroke="var(--normal-layout-text-secondary-color)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_86_308">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
    <div class="absolute inset-0 flex justify-center items-center">
      <slot name="content" />
    </div>
  </a-layout>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.theme-toggle {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}
</style>
