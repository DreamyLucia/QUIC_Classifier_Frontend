<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Siderbar from '@/components/SiderBar/index.vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
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
  <LoadingWrapper :loading="isLoading" class="flex h-full w-full normal-bg px-8 py-4">
    <Siderbar />
  </LoadingWrapper>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
