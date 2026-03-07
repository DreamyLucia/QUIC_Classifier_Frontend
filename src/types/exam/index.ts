export enum ExamType {
  Written = 1, // 笔试
  Interview = 2, // 面试
}

export interface Exam {
  exam_id: string;
  exam_name: string;
  coding_lang: string;
  lang: string;
  exam_type: ExamType;
}
