<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Siderbar from '@/components/SiderBar/index.vue'
import { uploadBatchPcapApi } from '@/api/upload';
import type { UserInfoType } from '@/types/user';
import { Upload, message } from 'ant-design-vue';
import Cookies from 'js-cookie';
import { t } from '@/locales';
import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
import {
  DeleteOutlined,
  FrownOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const abortControllers = ref<Map<string, AbortController>>(new Map());

const router = useRouter();

const fileList = ref<UploadFile[]>([]);
const uploading = ref(false);

const user = ref<UserInfoType>({
  userId: '',
  username: '',
  roles: [],
});

const isLoading = ref(true)

const generateTaskId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
};

const beforeUpload = (file: UploadFile) => {
  const isPcap = file.name.endsWith('.pcap') || file.name.endsWith('.cap');
  if (!isPcap) {
    message.error(`${file.name} ${t('message.error.uploadFileType')}`);
    // 返回 Upload.LIST_IGNORE，文件不会出现在列表中
    return Upload.LIST_IGNORE;
  }

  const isLt100M = (file.size || 0) <= MAX_FILE_SIZE;
  if (!isLt100M) {
    message.error(t('message.error.uploadFileSize'));
    return Upload.LIST_IGNORE;
  }

  return false;
};

const handleChange = (info: UploadChangeParam) => {
  fileList.value = info.fileList;
};

const customRequest = ({ file, onSuccess, onError, onProgress }: any) => {
  // 不立即上传，只是添加到列表
  // 实际上传在 handleUpload 中统一处理
  onSuccess?.({}, file);
};

// 移除文件
const removeFile = (file: UploadFile) => {
  // 如果正在上传，先取消
  const controller = abortControllers.value.get(file.uid);
  if (controller) {
    controller.abort();
    abortControllers.value.delete(file.uid);
  }

  fileList.value = fileList.value.filter((f: UploadFile) => f.uid !== file.uid);
  message.success(t('message.success.uploadFileClear'));
};

// 清空所有文件
const clearAll = () => {
  if (uploading.value) {
    // 取消所有正在上传的请求
    abortControllers.value.forEach(controller => controller.abort());
    abortControllers.value.clear();
  }

  fileList.value = [];
  uploading.value = false;
  message.success(t('message.success.uploadAllFileClear'));
};

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning(t('message.error.noFile'));
    return;
  }

  uploading.value = true;

  const taskId = generateTaskId();
  const files = fileList.value.map(f => f.originFileObj as File);

  try {
    const result = await uploadBatchPcapApi(files, taskId);
    const { task_name, total, success, failed } = result;

    if (success === total && failed === 0) {
      message.success(`${t('dashboard.upload.common.task')} ${task_name}: ${t('dashboard.upload.common.all')} ${success} ${t('dashboard.upload.common.file')} ${t('dashboard.upload.common.upload')} ${t('dashboard.upload.common.success')}`);
      fileList.value = [];
      uploading.value = false;
    }
    else if (success > 0 && failed > 0) {
      message.warning(`${t('dashboard.upload.common.task')} ${task_name}: ${success} ${t('dashboard.upload.common.unit')} ${t('dashboard.upload.common.success')}, ${failed} ${t('dashboard.upload.common.unit')} ${t('dashboard.upload.common.fail')}`);
      // 保留失败的文件
      const failedFiles = result.failed_files || [];
      fileList.value = fileList.value.filter(f =>
        failedFiles.some(ff => ff.filename === f.name),
      );
    }
    else {
      message.error(`${t('dashboard.upload.common.task')} ${task_name}: ${t('dashboard.upload.common.all')} ${failed} ${t('dashboard.upload.common.file')} ${t('dashboard.upload.common.upload')} ${t('dashboard.upload.common.fail')}`);
    }
  }
  catch (error) {
    console.error('上传失败:', error);
    message.error(t('dashboard.upload.uploadError'));
  }
  finally {
    uploading.value = false;
  }
};

onMounted(() => {
  const token = Cookies.get('access_token');
  if (!token) {
    router.push({ name: 'SignInPage' });
    return;
  }

  window.addEventListener('beforeunload', (e) => {
    if (uploading.value)
      e.preventDefault();
  });
})
</script>

<template>
  <div class="flex h-full w-full normal-bg px-8 py-4 ">
    <div class="flex h-full w-full">
      <Siderbar />
      <transition
        appear
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div class="flex flex-col flex-1 justify-center items-center">
          <a-upload-dragger
            v-model:file-list="fileList"
            name="file"
            :multiple="true"
            :before-upload="beforeUpload"
            :custom-request="customRequest"
            :show-upload-list="false"
            :directory="true"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            class="px-8 py-4"
            @change="handleChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">
              {{ t('dashboard.dragText') }}
            </p>
            <p class="ant-upload-hint">
              {{ t('dashboard.hint') }}
            </p>
          </a-upload-dragger>

          <!-- 自定义上传列表 -->
          <span class="text-sm text-primary">
            {{ t('dashboard.upload.pending') }} ({{ fileList.length }})
          </span>
          <div
            v-if="fileList.length > 0"
            class="flex flex-col max-h-[400px] w-[60%] overflow-y-auto custom-scrollbar mt-4 rounded-[10px] body-bg py-2 px-4"
          >
            <div
              v-for="file in fileList"
              :key="file.uid"
              class="flex items-center justify-between p-2 no-bg-button transition-colors"
            >
              <span class="flex-1 text-sm text-secondary truncate mr-3">
                {{ file.name }}
              </span>

              <DeleteOutlined
                class="cursor-pointer text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
                @click="removeFile(file)"
              />
            </div>
          </div>
          <div v-if="fileList.length > 0" class="flex justify-between items-center mt-4 space-x-4">
            <button
              class="px-4 py-2 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="uploading"
              @click="handleUpload"
            >
              <UploadOutlined class="mr-2" />
              {{ uploading ? t('dashboard.upload.uploadingStatus') : t('dashboard.upload.startUpload') }}
            </button>
            <button
              class="px-4 py-2 delete-button disabled:opacity-50 disabled:cursor-not-allowed"
              @click="clearAll"
            >
              <FrownOutlined class="mr-2" />
              {{ t('dashboard.upload.clearAll') }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
