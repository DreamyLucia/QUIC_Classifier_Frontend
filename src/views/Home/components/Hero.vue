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
