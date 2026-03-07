import { api } from '@/api/api';
import type { Exam } from '@/types/exam'

// 获取用户历史考场列表
export const getExamListApi = async () => {
  try {
    const response = await api.get('/api/exam/list');
    return response.data.data;
  }
  catch (error) {
    console.error('获取用户历史考场列表网络接口错误', error);
    throw error;
  }
};

// 创建/编辑考场
export const upsertExamApi = async (finalData: Exam) => {
  try {
    const response = await api.post('/api/exam/upsert', { ...finalData });
    return response.data.data;
  }
  catch (error) {
    console.error('创建/编辑考场网络接口错误', error);
    throw error;
  }
};
