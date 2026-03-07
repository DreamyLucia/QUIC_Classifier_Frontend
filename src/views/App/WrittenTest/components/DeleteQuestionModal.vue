<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { writtenTestQuestion } from '@/types/writtenTest'

const modalOpen = ref(false)
const question = ref<writtenTestQuestion | null>(null)

// 打开弹窗并设置要删除的题
const open = (q: writtenTestQuestion) => {
  question.value = q
  modalOpen.value = true
}

// 取消
const handleCancel = () => {
  message.info("取消删除")
  modalOpen.value = false
}

// 确认删除
const handleDelete = async () => {
  message.success("删除成功")
  modalOpen.value = false
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="modalOpen"
    destroy-on-close
  >
    <template #title>
      <div class="flex justify-center text-xl mb-4">
        <span>
          确认删除
          <span class="font-bold primary">“{{ question?.question_title }}”</span>
          ？
        </span>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" danger @click="handleDelete">
          确认
        </a-button>
      </div>
    </template>
  </a-modal>
</template>
