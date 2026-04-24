import { api } from '@/api/api';
import type { BatchUploadResult } from '@/types/upload';
import { MODEL_TYPES } from '@/constants/model';

export const uploadBatchPcapApi = async (
  files: File[],
  taskId: string,
  modelType: string = MODEL_TYPES.STANDARD,
  onProgress?: (percent: number) => void,
): Promise<BatchUploadResult> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/api/upload/batch', formData, {
    params: {
      task_id: taskId,
      model_type: modelType,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};
