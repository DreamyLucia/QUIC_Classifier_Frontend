import { api } from '@/api/api';
import type { AckDevicePairParam, EndDevicePairParam, StartDevicePairParam } from '@/types/devicePair';

// 开始双端互联
export const startPairApi = async (params: StartDevicePairParam) => {
  try {
    // 如果考试类型为面试，token和channel_id是必需的
    if (params.exam_type === 2) {
      if (!params.token)
        throw new Error('面试类型考试，token 必传');
      if (!params.channel_id)
        throw new Error('面试类型考试，channel_id 必传');
    }

    const response = await api.post('/api/copilot/start_device_pair', { ...params });

    return response.data.data;
  }
  catch (error) {
    console.error('开始双端互联网络接口错误', error);
    throw error;
  }
};

// 响应双端互联
export const ackPairApi = async (params: AckDevicePairParam) => {
  try {
    const response = await api.post('/api/copilot/ack_device_pair', { ...params });
    return response.data.data;
  }
  catch (error) {
    console.error('响应双端互联网络接口错误', error);
    throw error;
  }
};

// 主动停止双端互联
export const endPairApi = async (params: EndDevicePairParam) => {
  try {
    const response = await api.post('/api/copilot/end_pair', { ...params });
    return response.data.data;
  }
  catch (error) {
    console.error('停止双端互联网络接口错误', error);
    throw error;
  }
}
