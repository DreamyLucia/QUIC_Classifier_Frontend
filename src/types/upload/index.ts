export interface BatchUploadResult {
  task_id: string;
  task_name: string;
  total: number;
  success: number;
  failed: number;
  failed_files?: Array<{
    filename: string;
    error: string;
  }>;
}
