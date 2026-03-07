<script setup lang="ts">
import { ref } from 'vue'
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { HistoryRecord } from '@/types/history'
import ExamModal from '@/components/ExamModal/index.vue'
import { useRouter } from 'vue-router'
import { toBase64 } from '@/utils/base64';

const props = defineProps<{
  selectedAppIndex: number,
  record: HistoryRecord
}>()

const emit = defineEmits(['refresh'])

const router = useRouter();

const showMenu = ref(false)
const modalRef = ref<InstanceType<typeof ExamModal>>()

// 操作菜单列表
const operationList = [
  {
    label: '修改',
    icon: EditOutlined,
    action: (record: HistoryRecord) => {
      modalRef.value?.open(record) // 传入当前记录
    },
  },
  {
    label: '删除',
    icon: DeleteOutlined,
    action: (record: HistoryRecord) => {
      message.success(`删除考试记录，ID: ${record.exam_id}`)
    },
  },
]

const handleSubmit = () => {
  emit('refresh')
}

const handleClick = async () => {
  try {
    // 将 finalData 转换为 JSON 字符串
    const data = JSON.stringify(props.record);
    // 使用 toBase64 函数进行 Base64 编码
    const encodedData = await toBase64(data);
    // 跳转到目标页面
    if (props.record.exam_type === 1) {
      router.push({
        name: 'WrittenTestPage',
        query: {
          examData: encodedData,
        },
      });
    }
    else if (props.record.exam_type === 2) {
      router.push({
        name: 'InterviewTestPage',
        query: {
          examData: encodedData,
        },
      });
    }
    else {
      message.error('考试类型错误')
    }
  }
  catch (error) {
    message.error('打开失败')
    throw error
  }
}
</script>

<template>
  <ExamModal ref="modalRef" :selected-app-index="selectedAppIndex" @submit="handleSubmit" />
  <div class="p-4 rounded-[10px] cursor-pointer change-item space-y-2" @click="handleClick">
    <div class="change-item-name text-primary font-bold text-ellipsis-single-line">
      {{ record.exam_name }}
    </div>
    <div class="change-item-label text-secondary">
      {{ record.exam_hour }}
    </div>
    <div class="flex change-item-label text-secondary justify-between">
      <span class="text-ellipsis-single-line">{{ record.lang }} / {{ record.coding_lang }}</span>
      <div
        class="relative"
        @mouseenter="showMenu = true"
        @mouseleave="showMenu = false"
      >
        <EllipsisOutlined
          class="mx-2 hover:text-blue-500 transition-colors"
        />
        <!-- 操作菜单 -->
        <div
          v-if="showMenu"
          class="flex flex-col absolute right-0 rounded-[10px] box-bg border-all"
        >
          <div
            v-for="(item, index) in operationList"
            :key="index"
            class="flex px-4 py-2 justify-between items-center text-secondary menu-item rounded-[10px]"
            @click.stop="item.action(record)"
          >
            <component :is="item.icon" class="menu-item-label" />
            <span class="whitespace-nowrap ml-4 menu-item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.change-item {
  transition: all 0.2s ease;
  background-color: var(--normal-layout-box-bg-color);

  &:hover {
    background-color: var(--normal-layout-body-bg-invert-color);

    .change-item-name {
      color: var(--normal-layout-text-invert-color);
    }

    .change-item-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}

.menu-item {
  transition: all 0.2s ease;
  background-color: var(--normal-layout-box-bg-color);

  &:hover {
    background-color: var(--normal-layout-body-bg-invert-color);

    .menu-item-label {
      color: var(--normal-layout-text-secondary-invert-color);
    }
  }
}
</style>
