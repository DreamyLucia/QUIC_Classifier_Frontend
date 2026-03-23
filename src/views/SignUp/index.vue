<script setup lang="ts">
import SingleLayout from '@/layouts/SingleLayout/index.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { t } from '@/locales';
import { getPublicKeyApi, registerApi } from '@/api/login';
import { message } from 'ant-design-vue';
import { encryptPassword, setPublicKey } from '@/utils/encrypt';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const recheckPassword = ref('')
const rememberMe = ref(false);

const remember = () => {
  rememberMe.value = !rememberMe.value
}

const gotoSignIn = () => {
  router.push({ name: 'SignInPage' });
}

// 获取公钥
const fetchPublicKey = async () => {
  try {
    const res = await getPublicKeyApi();
    setPublicKey(res.publicKey);
  }
  catch (error) {
    message.error(t('message.error.netError'));
    console.error('获取公钥失败', error);
  }
};

const handleSignUp = async () => {
  if (!username.value) {
    message.error(t('message.error.usernameEmpty'));
    return;
  }
  if (!password.value) {
    message.error(t('message.error.passwordEmpty'));
    return;
  }
  if (!recheckPassword.value) {
    message.error(t('message.error.recheckPasswordEmpty'));
    return;
  }
  if (password.value !== recheckPassword.value) {
    message.error(t('message.error.passwordMismatch'));
    return;
  }

  // 获取公钥
  await fetchPublicKey();

  // 加密密码
  const encryptedPassword = encryptPassword(password.value);

  const response = await registerApi(username.value, encryptedPassword);
  userStore.setUserInfo({
    userId: response.userId,
    username: response.username,
    roles: [response.role], // 将 role 字符串转为数组
  });
  userStore.syncLoginState();
  message.success(t('message.success.signUp'));
  router.push({ name: 'Home' });
};
</script>

<template>
  <SingleLayout>
    <template #content>
      <div class="flex flex-col items-center mx-8 mt-20">
        <!-- 标题 -->
        <h1 class="text-3xl md:text-5xl font-bold mb-2 text-primary">
          {{ t('signup.title') }} <span class="primary">{{ t('productName') }}</span>
        </h1>

        <!-- 注册表单 -->
        <div class="w-[400px] h-[400px] max-w-md flex flex-col body-bg items-center mt-4 px-8 py-4 rounded-[10px]">
          <p class="text-2xl font-bold text-secondary">
            {{ t('signup.label') }}
          </p>
          <!-- 输入框 -->
          <a-input
            v-model:value="username"
            type="text"
            :placeholder="t('signup.usernamePlaceholder')"
            class="w-full px-4 py-2 rounded-[10px] border-all custom-input"
          />
          <a-input-password
            v-model:value="password"
            type="password"
            :placeholder="t('signup.passwordPlaceholder')"
            class="w-full px-4 py-2 rounded-[10px] border-all custom-input mt-2"
          />
          <a-input-password
            v-model:value="recheckPassword"
            type="password"
            :placeholder="t('signup.recheckPlaceholder')"
            class="w-full px-4 py-2 rounded-[10px] border-all custom-input mt-2"
          />

          <!-- 记住我 -->
          <div class="w-full flex justify-start text-sm text-secondary mb-6 mx-2 px-2 mt-4">
            <a-checkbox @change="remember">
              {{ t('signup.remember') }}
            </a-checkbox>
          </div>

          <!-- 注册按钮 -->
          <button
            class="w-full py-2 font-bold rounded-[10px] border-none primary-button"
            @click="handleSignUp"
          >
            {{ t('signup.button') }}
          </button>

          <!-- 登录提示 -->
          <p class="text-center text-secondary mt-auto font-bold">
            {{ t('signup.signinLabel') }} <span class="primary underline-link" @click="gotoSignIn">{{ t('signup.signinButton') }}</span>
          </p>
        </div>
      </div>
    </template>
  </SingleLayout>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.custom-input:focus {
  transition: all 0.2s ease;
  border-color: var(--primary);
}
</style>
