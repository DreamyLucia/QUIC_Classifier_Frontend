<script setup lang="ts">
import { ArrowRightOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue'
import Typed from 'typed.js'
import { t } from '@/locales';

const router = useRouter();

const gotoSelect = () => {
  router.push({ name: 'Dashboard' });
};

const typedElement = ref(null)
const typedInstance = ref<any>(null)

const typedStrings = computed(() => [
  t('home.hero.titles.typed[0]'),
  t('home.hero.titles.typed[1]'),
  t('home.hero.titles.typed[2]'),
  t('home.hero.titles.typed[3]'),
])

const initTyped = () => {
  if (typedElement.value) {
    // 销毁旧实例
    typedInstance.value?.destroy()

    // 创建新实例
    typedInstance.value = new Typed(typedElement.value, {
      strings: typedStrings.value, // 使用计算属性
      typeSpeed: 80,
      backSpeed: 40,
      startDelay: 500,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
    })
  }
}

// 监听语言变化，重新初始化Typed
watch(() => t('home.hero.titles.typed[0]'), () => {
  initTyped()
})

onMounted(() => {
  initTyped()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center">
    <!-- 限时活动标签 -->
    <div class="rounded-full px-6 py-2 body-bg z-10 mb-4">
      <span class="text-text-secondary text-secondary">{{ t('home.hero.promotion.label') }}</span>
      <span class="ml-2 font-bold text-primary">{{ t('home.hero.promotion.highlight') }}</span>
    </div>

    <!-- 主标题 -->
    <h1 class="text-6xl font-bold primary">
      {{ t('productName') }}
    </h1>
    <h2 class="text-6xl font-bold text-primary">
      <span ref="typedElement" class="typed-animation" />
    </h2>

    <!-- 副标题 -->
    <p class="text-xl text-secondary mt-4">
      {{ t('home.hero.subtitle.line1') }}<br>
      {{ t('home.hero.subtitle.line2') }}
    </p>

    <!-- 按钮组 -->
    <div class="flex space-x-4 z-10 gap-8 mt-4">
      <button class="px-6 py-2 primary-button" @click="gotoSelect">
        {{ t('home.hero.buttons.primary') }}
        <ArrowRightOutlined />
      </button>
      <button class="px-6 py-2 secondary-button">
        {{ t('home.hero.buttons.secondary') }}
        <ArrowRightOutlined />
      </button>
    </div>

    <!-- 使用说明 -->
    <div class="text-sm z-10 mt-8">
      <p>
        <span class="font-bold text-secondary">{{ t('home.hero.instructions.core.label') }}</span>
        <span class="text-secondary mx-2">{{ t('home.hero.instructions.core.text') }}</span>
        <span class="font-bold primary cursor-pointer">{{ t('home.hero.instructions.core.action') }}</span>
      </p>
      <p>
        <span class="font-bold text-secondary">{{ t('home.hero.instructions.client.label') }}</span>
        <span class="text-secondary mx-2">{{ t('home.hero.instructions.client.text') }}</span>
        <span class="font-bold primary cursor-pointer">{{ t('home.hero.instructions.client.action') }}</span>
      </p>
    </div>

    <!-- 帮助说明 -->
    <div class="flex flex-col items-center justify-center rounded-full px-6 py-4 mt-4 tips-border gap-4">
      <p class="font-bold text-primary my-0">
        {{ t('home.hero.help.title') }}
      </p>
      <p class="text-secondary my-0">
        {{ t('home.hero.help.points[0]') }}
      </p>
      <p class="text-secondary my-0">
        {{ t('home.hero.help.points[1]') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .primary-button {
    border-style: solid;
    background-color: transparent;
    transition: all 0.2s ease;
    border-color: var(--primary);
    border-radius: 10px;
    color: var(--primary);
    cursor: pointer;

    &:hover {
      background-color: var(--primary);
      color: var(--normal-layout-text-color);
    }
  }

  .secondary-button {
    border-style: solid;
    background-color: transparent;
    transition: all 0.2s ease;
    border-color: var(--normal-layout-text-color);
    border-radius: 10px;
    color: var(--normal-layout-text-color);
    cursor: pointer;

    &:hover {
      background-color: var(--normal-layout-text-color);
      color: var(--normal-layout-text-invert-color);
    }
  }

  .tips-border {
    border: solid 1px;
    border-color: var(--normal-layout-text-secondary-color);
  }

  /* 打字动画容器 */
  .typed-animation {
    min-height: 1.5em; /* 防止高度跳动 */
    background: linear-gradient(to right, $left-color, $right-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent; /* 关键：让文字透明，渐变背景才能显示 */
  }
</style>
