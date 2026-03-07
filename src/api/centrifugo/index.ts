import { api } from '@/api/api';
import type { RefreshToken } from '@/types/devicePair';

// 获取获取通讯服务器及阿里云秘钥
export const getRefreshTokenApi = async (params: RefreshToken) => {
  try {
    const response = await api.get('/api/refresh_token', { params });
    return response.data.data;
  }
  catch (error) {
    console.error('获取通讯服务器及秘钥网络接口错误', error);
    throw error;
  }
};
