<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Siderbar from '@/components/SiderBar/index.vue'
import { getUserInfoApi } from '@/api/user';
import type { UserInfoType } from '@/types/user';
import { message } from 'ant-design-vue';
import Cookies from 'js-cookie';
import { t } from '@/locales';

const router = useRouter();

const user = ref<UserInfoType>({
  userId: '',
  username: '',
  roles: [],
});

const isLoading = ref(true)

const fetchUserInfo = async () => {
  try {
    user.value = await getUserInfoApi()
  }
  catch (error) {
    message.error(t('message.error.getUserInfoError'))
    console.error('获取用户信息失败:', error)
  }
  finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
}

onMounted(() => {
  const token = Cookies.get('access_token');
  if (!token) {
    router.push({ name: 'SignInPage' });
    return;
  }
  fetchUserInfo();
})
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4 ">
    <transition
      appear
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <Siderbar />
    </transition>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
