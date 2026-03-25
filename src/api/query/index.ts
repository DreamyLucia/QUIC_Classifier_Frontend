import { api } from '@/api/api';
import type {
  TaskResultsResponse,
  UserAllStats,
  UserDailyStatsResponse,
  UserTasksResponse,
} from '@/types/query';

/**
 * 获取用户总览统计
 */
export const getUserAllStatsApi = async (): Promise<UserAllStats> => {
  try {
    const response = await api.get('/api/results/user/all');
    return response.data;
  }
  catch (error) {
    console.error('获取用户总览统计接口错误', error);
    throw error;
  }
};

/**
 * 获取用户每日统计（用于折线图）
 * @param days - 最近N天，默认7天，范围1-90
 */
export const getUserDailyStatsApi = async (days = 7): Promise<UserDailyStatsResponse> => {
  try {
    const response = await api.get('/api/results/user/daily', { params: { days } });
    return response.data;
  }
  catch (error) {
    console.error('获取用户每日统计接口错误', error);
    throw error;
  }
};

/**
 * 获取当前用户的所有任务列表
 * @param status - 可选，按状态筛选 (pending/analyzing/completed/failed)
 */
export const getUserTasksApi = async (status?: string): Promise<UserTasksResponse> => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/api/results/tasks', { params });
    return response.data;
  }
  catch (error) {
    console.error('获取用户任务列表接口错误', error);
    throw error;
  }
};

/**
 * 获取单个任务的详细分析结果
 * @param taskId - 任务ID
 */
export const getTaskResultsApi = async (taskId: string): Promise<TaskResultsResponse> => {
  try {
    const response = await api.get(`/api/results/task/${taskId}`);
    return response.data;
  }
  catch (error) {
    console.error('获取任务详细结果接口错误', error);
    throw error;
  }
};
