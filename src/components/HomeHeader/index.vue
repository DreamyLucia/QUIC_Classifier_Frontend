<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@/locales';
import { useAppStore } from '@/store/app';
import type { Language } from '@/types/locales'
import { DownCircleOutlined } from '@ant-design/icons-vue';
import { languageOptions } from '@/constants/language'

const route = useRoute();
const router = useRouter();

const appStore = useAppStore()
const dropdownTrigger = ref<HTMLLIElement | null>(null)
const dropdownWidth = ref('auto')
const navHeight = ref(0)
const isHovered = ref(false)

const toggleTheme = () => {
  appStore.setDarkMode(!appStore.isDarkMode)
}

const currentLanguage = computed({
  get: () => appStore.language,
  set: val => appStore.setLanguage(val),
})

const handleLanguageChange = (lang: Language) => {
  currentLanguage.value = lang
}

// 获取宽度和高度
const updateDimensions = () => {
  if (dropdownTrigger.value) {
    dropdownWidth.value = `${dropdownTrigger.value.offsetWidth}px`
    const nav = document.querySelector('header') // 获取header高度
    if (nav)
      navHeight.value = nav.offsetHeight
  }
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})

const pageList = computed(() => [
  { name: 'Price', title: t('home.header.pageList.price') },
  { name: 'Demo', title: t('home.header.pageList.demo') },
  { name: 'Changelog', title: t('home.header.pageList.changelog') },
  { name: 'Contact', title: t('home.header.pageList.contact') },
]);

const handleClickPage = (name: string) => {
  router.push({ name })
};
const handleClickLogo = () => {
  router.push({ name: 'HomePage' })
};
const handleLogin = () => {
  router.push({ name: 'SignInPage' });
};

const handleMouseEnter = () => {
  isHovered.value = true
  updateDimensions() // 确保尺寸更新
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full body-bg">
    <!-- 容器约束 -->
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- 左侧Logo和名称 -->
        <div
          class="flex items-center gap-3 cursor-pointer"
          @click="handleClickLogo"
        >
          <div class="h-8 w-8">
            <img src="@/assets/logo.png" alt="Logo" class="h-full w-full object-contain">
          </div>
          <span class="text-xl font-bold ml-2 primary">{{ t('productName') }}</span>
        </div>

        <!-- 右侧导航菜单 -->
        <div class="flex items-center gap-6 h-full">
          <nav class="flex h-full">
            <ul class="flex gap-6 list-none h-full justify-between items-center my-0 text-secondary">
              <li
                v-for="page in pageList"
                :key="page.name"
                class="relative cursor-pointer px-3 py-2 text-sm"
                :class="{ 'text-select border-b-2 border-primary': route.name === page.name }"
                @click="handleClickPage(page.name)"
              >
                {{ page.title }}
              </li>
              <li
                ref="dropdownTrigger"
                class="flex nav-item dropdown group relative cursor-pointer items-center px-3 py-2 text-sm h-full gap-2"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
              >
                语言/Language
                <DownCircleOutlined
                  :style="{
                    transform: `rotate(${isHovered ? 0 : -90}deg)`,
                    transition: 'transform 0.2s ease',
                  }"
                  class="ml-1 inline-block"
                />
                <ul
                  class="dropdown-menu absolute left-0 box-bg list-none px-0"
                  :style="{
                    width: dropdownWidth,
                    top: `${navHeight}px`,
                  }"
                >
                  <li
                    v-for="item in languageOptions"
                    :key="item.key"
                    class="nav-item"
                  >
                    <a
                      class="dropdown-item block px-4 py-2"
                      :class="{ 'text-select': currentLanguage === item.key }"
                      @click="handleLanguageChange(item.key)"
                    >
                      {{ item.label }}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle" @click="toggleTheme">
            <g clip-path="url(#clip0_86_308)">
              <path d="M8.00033 0.666748V2.00008M8.00033 14.0001V15.3334M2.81366 2.81341L3.76033 3.76008M12.2403 12.2401L13.187 13.1867M0.666992 8.00008H2.00033M14.0003 8.00008H15.3337M2.81366 13.1867L3.76033 12.2401M12.2403 3.76008L13.187 2.81341M11.3337 8.00008C11.3337 9.84103 9.84127 11.3334 8.00033 11.3334C6.15938 11.3334 4.66699 9.84103 4.66699 8.00008C4.66699 6.15913 6.15938 4.66675 8.00033 4.66675C9.84127 4.66675 11.3337 6.15913 11.3337 8.00008Z" stroke="var(--normal-layout-text-secondary-color)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_86_308">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <button
            class="font-bold py-2 px-8 login-button-bg text-secondary"
            @click="handleLogin"
          >
            {{ t('home.header.login') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
li {
  transition: color 0.2s, border-color 0.2s;
  border-bottom: 2px solid transparent; /* 默认透明边框（避免布局抖动） */

  &:hover:not(.nav-item) { /* 排除语言选择项 */
    color: var(--primary);
    border-bottom-color: var(--primary); /* 悬浮时显示边框 */
  }

  /* 选中状态 */
  &.text-select {
    color: var(--primary);
    border-bottom-color: var(--primary); /* 确保选中时边框显示 */
  }
}

.login-button-bg {
  transition: opacity 0.2s, border-color 0.2s;
  background: linear-gradient(
    to right,
    $left-color 0%,
    $right-color 100%
  );
  border-radius: 10px;
  border: none;

  &:hover {
    opacity: 0.9;
    border-color: var(--colorPrimary);
    box-shadow: var(--boxShadowSecondary);
    cursor: pointer;
  }
}

.theme-toggle {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.dropdown-menu {
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  transition: all 0.3s;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  border: 1px solid var(--normal-layout-border-color);
  z-index: 50;
}

.group:hover .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* 语言选项样式 */
.nav-item {
  .dropdown-item {
    transition: all 0.2s ease;
    border-left: 2px solid transparent;

    &:hover {
      color: var(--normal-layout-text-color);
      border-left-color: var(--normal-layout-text-color);
    }

    &.text-select {
      color: var(--primary);
      border-left-color: var(--primary);
    }
  }
}
</style>
