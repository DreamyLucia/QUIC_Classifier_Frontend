<script setup lang="ts">
import { t } from '@/locales';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import type { UserInfoType } from '@/types/user';

const router = useRouter();

const userStore = useUserStore();

const user = computed(() => ({
  userId: userStore.getUserId,
  username: userStore.getUserName,
  roles: userStore.getRoles,
}));

const handleClickLogo = () => {
  router.push({ name: 'Home' })
};

const handleUserimg = () => {
  // router.push({ name: 'Space'})
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
    <div class="flex flex-col flex-1 items-center body-bg rounded-[10px] w-full mt-4">
      <div
        class="flex items-center gap-3 cursor-pointer justify-center"
        @click="handleUserimg"
      >
        <div class="h-12 w-12">
          <img src="@/assets/user.png" alt="user" class="h-full w-full object-contain">
        </div>
        <span class="text-3xl font-bold ml-2 primary">{{ user.username }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

</style>
