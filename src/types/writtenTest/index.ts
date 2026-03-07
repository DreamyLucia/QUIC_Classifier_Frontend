export interface writtenTestQuestion {
  id: string,
  question_type: string,
  question_title: string,
  create_time: number | Date
}

export interface writtenTestSolution {
  id: string,
  model: string,
  answer_text: string,
  text_type: number,
  create_time: number | Date
}

export interface writtenTestQuestionDetail {
  id: string,
  question_text: string,
  question_type: string,
  question_title: string,
  create_time: number | Date,
  image_url: Array<string>,
  question_status: number,
  solutions: Array<writtenTestSolution>
}
