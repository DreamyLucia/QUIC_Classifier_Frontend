<script setup lang="ts">
import { t } from '@/locales';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { languageOptions } from '@/constants/language'
import TruncateText from '@/components/TruncateText/index.vue'
import type { Language } from '@/types/locales'
import {
  HistoryOutlined,
  LoginOutlined,
  PieChartOutlined,
  RightCircleOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

const appStore = useAppStore()
const userStore = useUserStore();
const dropdownTrigger = ref<HTMLLIElement | null>(null)
const dropdownWidth = ref('auto')
const navHeight = ref(0)
const isHovered = ref(false)

const toggleTheme = () => {
  appStore.setDarkMode(!appStore.isDarkMode)
}

interface ButtonItem {
  icon: any;
  title: string;
  action: () => void;
  routeName: string;
}

const appButtons = computed<ButtonItem[]>(() => {
  const buttons: ButtonItem[] = [
    {
      icon: UploadOutlined,
      title: t('siderbar.appButtons.upload'),
      action: () => router.push({ name: 'Dashboard' }),
      routeName: 'Dashboard',
    },
    {
      icon: HistoryOutlined,
      title: t('siderbar.appButtons.history'),
      action: () => router.push({ name: 'HistoryPage' }),
      routeName: 'HistoryPage',
    },
  ];

  if (userStore.isAdmin) {
    buttons.push({
      icon: UserOutlined,
      title: t('siderbar.appButtons.admin'),
      action: () => router.push({ name: 'ManagePage' }),
      routeName: 'ManagePage',
    });
  }

  return buttons;
});

const user = computed(() => ({
  userId: userStore.getUserId,
  username: userStore.getUserName,
  roles: userStore.getRoles,
}));

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

const isActive = (routeName: string) => {
  return route.name === routeName;
};

const handleClickLogo = () => {
  router.push({ name: 'Home' })
};

const handleLogout = () => {
  userStore.logout();
  message.success(t('message.success.logout'));
  router.push({ name: 'Home' });
};

const handleSettings = () => {
  router.push({ name: 'SettingsPage' })
}

const handleMouseEnter = () => {
  isHovered.value = true
  updateDimensions() // 确保尺寸更新
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<template>
  <div class="flex flex-col h-full w-[20%] items-center">
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
    <div class="flex flex-col flex-1 items-center body-bg rounded-[10px] w-full mt-2 relative">
      <div class="flex gap-3 w-[80%] mt-4 justify-center items-center">
        <div
          class="h-12 w-12 rounded-full overflow-hidden cursor-pointer "
          @click="handleSettings"
        >
          <img src="@/assets/user.png" alt="user" class="h-full w-full object-contain">
        </div>
        <div class="flex flex-col flex-1 min-w-0 ml-2">
          <TruncateText
            :text="user.username"
            text-class="text-2xl font-bold text-primary"
          />
          <span class="text-sm text-secondary">{{ t('siderbar.userId') }}{{ user.userId }}</span>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex flex-col w-full mt-8 px-4 space-y-2">
        <button
          v-for="(btn, index) in appButtons"
          :key="`buuton-${index}`"
          class="flex-1 flex items-center px-4 py-4 space-x-2 no-bg-button"
          :class="{ 'active-button': isActive(btn.routeName) }"
          @click="btn?.action"
        >
          <component :is="btn?.icon" />
          <span class="text-sm">{{ btn?.title }}</span>
        </button>
      </div>

      <!-- 底部 -->
      <div class="flex w-full mt-auto px-4 items-center">
        <LoginOutlined
          class="text-xl text-red-500 cursor-pointer transition-transform duration-200 hover:scale-110"
          @click="handleLogout"
        />
        <SettingOutlined
          class="text-xl text-secondary cursor-pointer transition-transform duration-200 hover:scale-110 ml-4"
          @click="handleSettings"
        />
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle ml-4" @click="toggleTheme">
          <g clip-path="url(#clip0_86_308)">
            <path d="M8.00033 0.666748V2.00008M8.00033 14.0001V15.3334M2.81366 2.81341L3.76033 3.76008M12.2403 12.2401L13.187 13.1867M0.666992 8.00008H2.00033M14.0003 8.00008H15.3337M2.81366 13.1867L3.76033 12.2401M12.2403 3.76008L13.187 2.81341M11.3337 8.00008C11.3337 9.84103 9.84127 11.3334 8.00033 11.3334C6.15938 11.3334 4.66699 9.84103 4.66699 8.00008C4.66699 6.15913 6.15938 4.66675 8.00033 4.66675C9.84127 4.66675 11.3337 6.15913 11.3337 8.00008Z" stroke="var(--normal-layout-text-secondary-color)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_86_308">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <li
          ref="dropdownTrigger"
          class="flex nav-item dropdown group cursor-pointer items-center px-3 py-2 text-sm h-full gap-2 text-primary ml-auto"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <span>语言/Language</span>
          <RightCircleOutlined class="ml-1 inline-block" />
          <ul
            class="dropdown-menu absolute left-0 box-bg list-none px-0"
            :style="{
              width: dropdownWidth,
              left: '100%',
              bottom: '0',
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
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.active-button {
  background-color: var(--normal-layout-bg-appear-color) !important;
  color: var(--primary) !important;
  font-weight: bold;
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
  transform: translateY(-10px);
  pointer-events: none;
  border: 1px solid var(--normal-layout-border-color);
  z-index: 50;
  margin-bottom: 0;
  margin-left: 4px;

  /* ✅ 添加一个透明的伪元素，连接触发元素和菜单 */
  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 0;
    bottom: 0;
    width: 20px;
    background: transparent;
  }
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
