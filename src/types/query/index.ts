/**
 * 用户总览统计
 */
export interface UserAllStats {
  total: number;
  category_stats: Record<string, number>;
  unknown_count: number;
  total_analysis_time: number;
  avg_confidence: number;
}

/**
 * 每日统计项
 */
export interface DailyStats {
  date: string;
  file_count: number;
  category_stats: Record<string, number>;
  unknown_count: number;
  avg_confidence: number;
  total_analysis_time: number;
}

/**
 * 用户每日统计响应
 */
export interface UserDailyStatsResponse {
  daily_stats: DailyStats[];
  start_date: string;
  end_date: string;
}

/**
 * 任务摘要信息
 */
export interface TaskInfo {
  task_id: string;
  task_name: string;
  file_count: number;
  status: string; // pending/analyzing/completed/failed
  category_stats: Record<string, number>;
  unknown_count: number;
  total_analysis_time: number;
  avg_confidence: number;
  created_at: string;
  updated_at: string;
}

/**
 * 用户任务列表响应
 */
export interface UserTasksResponse {
  total: number;
  tasks: TaskInfo[];
}

/**
 * 任务中单个文件的分析结果
 */
export interface TaskResultItem {
  filename: string;
  label: string;
  confidence: number;
  probabilities: number[];
  analysis_time?: number;
  created_at?: string;
}

/**
 * 任务详细结果响应
 */
export interface TaskResultsResponse {
  task_id: string;
  task_name: string;
  file_count: number;
  status: string;
  category_stats: Record<string, number>;
  unknown_count: number;
  total_analysis_time: number;
  avg_confidence: number;
  created_at: string;
  updated_at: string;
  results: TaskResultItem[];
}
