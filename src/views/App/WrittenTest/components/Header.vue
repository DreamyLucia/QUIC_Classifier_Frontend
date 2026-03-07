<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DisconnectOutlined,
  EditOutlined,
  LeftOutlined,
  LinkOutlined,
  LoadingOutlined,
  SettingOutlined,
  SmileOutlined,
} from '@ant-design/icons-vue'
import type { Exam } from '@/types/exam'
import { useRouter } from 'vue-router'
import ExamSettingModal from '@/components/ExamSettingModal/index.vue'
import { devicePairManager } from '@/utils/devicePair'
import { PairingState } from '@/constants/pairingState'

const props = defineProps<{
  examData: Exam
}>()

const emit = defineEmits(['link', 'unlink'])

const router = useRouter();

const modalRef = ref<InstanceType<typeof ExamSettingModal>>()
const stateRef = devicePairManager.getStateRef();
const isLinkHovered = ref(false)

const handleClick = () => {
  router.push({ name: 'Dashboard' });
}

const openExamModal = () => {
  modalRef.value?.open(props.examData) // 传入当前记录
}

const linkButton = computed(() => {
  if (stateRef.value === 'Established') {
    return {
      icon: isLinkHovered.value ? DisconnectOutlined : SmileOutlined,
      title: isLinkHovered.value ? '断开连接' : '已连接',
      action: () => emit('unlink'),
    }
  }
  else if (stateRef.value === 'SyncRevd') {
    return {
      icon: LoadingOutlined,
      title: '连接中',
      disabled: true,
    }
  }
  else {
    // PairingState.Listen 或默认
    return {
      icon: LinkOutlined,
      title: '双端互联',
      action: () => emit('link'),
    }
  }
})

// Header按钮数据
const headerButtons = [
  {
    icon: SettingOutlined,
    title: '设置',
    action: () => {
      openExamModal()
    },
  },
];
</script>

<template>
  <ExamSettingModal ref="modalRef" />
  <div class="flex justify-between w-full border-bottom px-4 py-2">
    <!-- 左侧内容 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center text-4xl p-2 return-button" @click="handleClick">
        <LeftOutlined />
      </div>
      <div class="flex flex-col justify-center h-full space-y-2 ml-4">
        <div class="flex text-primary">
          <span class="text-xl max-w-[400px] text-ellipsis-single-line">{{ examData.exam_name }}</span>
          <EditOutlined class="ml-2 cursor-pointer active-icon" @click="openExamModal" />
        </div>
        <span class="text-secondary max-w-[400px] text-ellipsis-single-line">{{ examData.lang }} / {{ examData.coding_lang }}</span>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="flex space-x-2">
      <button
        class="flex px-4 py-2 items-center justify-center normal-button h-10 self-center space-x-2 w-[150px]"
        :disabled="linkButton.disabled"
        @click="linkButton.action"
        @mouseenter="isLinkHovered = true"
        @mouseleave="isLinkHovered = false"
      >
        <component
          :is="linkButton.icon"
          :class="{
            'text-green-600': stateRef === 'Established' && !isLinkHovered,
            'text-red-600': stateRef === 'Established' && isLinkHovered,
            'primary': stateRef === 'SyncRevd',
          }"
        />
        <span
          class="text-xl whitespace-nowrap"
          :class="{
            'text-green-600': stateRef === 'Established' && !isLinkHovered,
            'text-red-600': stateRef === 'Established' && isLinkHovered,
            'primary': stateRef === 'SyncRevd',
          }"
        >{{ linkButton.title }}</span>
      </button>
      <button
        v-for="(btn, index) in headerButtons" :key="`header-${index}`"
        class="flex items-center justify-center px-4 py-2 normal-button space-x-2 h-10 self-center" @click="btn.action"
      >
        <component :is="btn.icon" />
        <span class="text-xl whitespace-nowrap">{{ btn.title }}</span>
      </button>
      <div class="flex flex-col body-bg space-y-2 py-2 px-4 rounded-[10px] border-all">
        <div class="flex items-end">
          <span class="text-primary font-bold">150</span>
          <span class="text-secondary ml-2 text-sm">ACE 点</span>
        </div>
        <span class="text-secondary text-sm">3 次快答 / 8 道笔试题</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.return-button {
  background-color: var(--normal-layout-body-bg-color);
  transition: all 0.2s ease;
  border-radius: 10px;
  border: solid 2px var(--normal-layout-border-color);
  color: var(--normal-layout-text-color);
  cursor: pointer;
  &:hover {
    background-color: var(--normal-layout-body-bg-invert-color);
    color: var(--normal-layout-invert-text-color);
    border: solid 2px var(--normal-layout-border-invert-color);
  }
}

.active-icon {
  transition: all 0.2s ease;
  &:hover {
    color: var(--primary);
  }
}
</style>
