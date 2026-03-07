import type { ExamType } from '@/types/exam';

export interface StartDevicePairParam {
  copilot_client_id: string;
  exam_id: string,
  exam_type: ExamType;
  token?: string;
  channel_id?: string;
}

export interface AckDevicePairParam {
  device_type: 1 | 2,
  copilot_client_id: string,
  interview_client_id: string
}

export interface EndDevicePairParam {
  exam_id: string,
  exam_type: ExamType,
  client_id: string,
  channel_id?: string
}

export interface RefreshToken {
  from_end: number,
  exam_type: ExamType,
  need_rtc: boolean
}
