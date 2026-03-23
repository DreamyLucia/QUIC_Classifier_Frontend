import { api } from '@/api/api';

// 获取用户信息
export const getUserInfoApi = async () => {
  try {
    const response = await api.get('/api/users/info');
    return response.data;
  }
  catch (error) {
    console.error('获取用户信息网络接口错误', error);
    throw error;
  }
};
