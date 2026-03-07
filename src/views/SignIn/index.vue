<script setup lang="ts">
import SingleLayout from '@/layouts/SingleLayout/index.vue';
import { t } from '@/locales';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/utils/supabase';
import { message } from 'ant-design-vue'
import LoadingWrapper from '@/components/LoadingWrapper/index.vue'
import Vue3OtpInput from 'vue3-otp-input'

const router = useRouter();

const isSend = ref<Boolean>(false)
const email = ref<string>('');
const code = ref<string>('');
const isLoading = ref<boolean>(false); // 加载状态
const isVerifying = ref<boolean>(false);

const handleGetMagicLink = async () => {
  if (!email.value) {
    message.error('请输入邮箱地址')
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    isSend.value = true; // 显示成功状态
  }
  catch (error) {
    message.error('请求失败，请稍后再试')
  }
  finally {
    isLoading.value = false;
  }
};

// 验证验证码
const handleVerifyCode = async () => {
  if (!code.value || code.value.length < 6) {
    message.error('请输入完整验证码');
    return;
  }

  isVerifying.value = true;
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.value,
      token: code.value,
      type: 'email',
    });

    if (error)
      throw error;
    message.success('验证成功，正在跳转');
    router.push({ name: 'Dashboard' });
  }
  catch (error) {
    message.error('验证码无效或已过期');
  }
  finally {
    isVerifying.value = false;
  }
};

const handleBack = () => {
  code.value = ''
  isSend.value = false
}
</script>

<template>
  <SingleLayout>
    <template #content>
      <div class="flex w-[500px] h-[350px] body-bg border-all rounded-[10px]">
        <div class="flex flex-col w-full h-full p-4 items-center">
          <span class="text-3xl font-bold text-primary mb-4">登录 / 注册</span>
          <span class="text-sm text-secondary">通过邮箱验证码登录 / 注册</span>
          <LoadingWrapper :loading="isLoading" class="flex flex-col w-full">
            <div v-if="!isSend" class="flex flex-col w-full h-full">
              <div class="flex flex-col w-full justify-center my-auto space-y-2 px-4">
                <a-input v-model:value="email" size="large" placeholder="邮箱" allow-clear />
                <span class="text-secondary text-sm">*未注册邮箱将自动注册</span>
              </div>
              <div class="flex flex-col w-full px-4">
                <button
                  class="font-bold w-full py-2 px-8 login-button-bg text-primary"
                  @click="handleGetMagicLink"
                >
                  获取邮箱验证码
                </button>
              </div>
            </div>
            <div v-else class="flex flex-col w-full h-full">
              <div class="flex flex-col w-full justify-center my-auto space-y-2 px-4">
                <span class="text-center text-secondary">
                  已发送验证码至 <span class="font-bold text-primary">{{ email }}</span>
                  ，请输入验证码完成登录 / 注册
                </span>
                <Vue3OtpInput
                  v-model:value="code"
                  model-value-type="string"
                  input-classes="rounded-[10px] w-[32px] h-[40px] items-center text-center text-invert body-bg-invert border-all"
                  input-type="number"
                  :num-inputs="6"
                  :should-focus-order="true"
                  class="flex mx-auto space-x-4"
                />
              </div>
              <div class="flex flex-col w-full px-4 space-y-2">
                <button
                  class="font-bold w-full py-2 px-8 login-button-bg text-primary"
                  :disabled="isVerifying"
                  @click="handleVerifyCode"
                >
                  {{ isVerifying ? '验证邮箱中...' : '验证邮箱' }}
                </button>
                <button
                  class="font-bold w-full py-2 px-8 normal-button text-primary"
                  :disabled="isVerifying"
                  @click="handleBack"
                >
                  返回
                </button>
              </div>
            </div>
          </LoadingWrapper>
        </div>
      </div>
    </template>
  </SingleLayout>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
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
</style>
