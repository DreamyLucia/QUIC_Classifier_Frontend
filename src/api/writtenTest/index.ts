import { api } from '@/api/api';

// 查询笔试题目历史
export const getQuestionListApi = async (exam_id: string) => {
  try {
    const response = await api.get(`/api/written_exam/get_question_list?exam_id=${exam_id}`);
    return response.data.data.question_list;
  }
  catch (error) {
    console.error('获取考场笔试题目历史网络接口错误', error);
    throw error;
  }
};

// 查询笔试题目详情
export const getQuestionDetailApi = async (id: string) => {
  try {
    const response = await api.get(`/api/written_exam/get_question_detail?id=${id}`);
    return response.data.data;
  }
  catch (error) {
    console.error('获取考场笔试题目详情网络接口错误', error);
    throw error;
  }
};

interface StreamCallbacks {
  onOcr?: (text: string) => void;
  onCreated?: (data: any) => void;
  onSolving?: (answer: string) => void;
  onFinish?: (data: any) => void;
  onError?: (error: any) => void;
}

export const postCopilotImageSolverStreamApi = async (
  params: {
    model_name: string;
    image_urls: string[];
    exam_id: string;
    question_type: string;
  },
  callbacks: StreamCallbacks = {},
) => {
  let processedLength = 0

  try {
    const response = await api.post('/api/copilot/chat/image_solver', params, {
      responseType: 'stream',
      timeout: 60000,
      onDownloadProgress: (progressEvent: any) => {
        const data = progressEvent.event.target.response
        const newData = data.slice(processedLength)
        processedLength = data.length

        const events = newData.split(/\r?\n\r?\n/);
        for (const evtStr of events) {
          if (!evtStr.trim())
            continue
          try {
            const lines = evtStr.split(/\r?\n/);
            const eventObj: Record<string, any> = {};
            for (const line of lines) {
              const idx = line.indexOf(':');
              if (idx !== -1) {
                const key = line.slice(0, idx).trim();
                const val = line.slice(idx + 1).trim();
                eventObj[key] = val;
              }
            }
            // console.log(eventObj)
            switch (eventObj.event) {
              case 'problem_ocr':
                callbacks.onOcr?.(eventObj.data)
                break
              case 'problem_created':
                try {
                  const createdData
                    = typeof eventObj.data === 'string'
                      ? JSON.parse(eventObj.data)
                      : eventObj.data
                  callbacks.onCreated?.(createdData)
                }
                catch {
                  callbacks.onCreated?.(eventObj.data)
                }
                break
              case 'problem_solving':
                callbacks.onSolving?.(eventObj.data)
                break
              case 'finish':
                try {
                  const finishData
                    = typeof eventObj.data === 'string'
                      ? JSON.parse(eventObj.data)
                      : eventObj.data;
                  callbacks.onFinish?.(finishData);
                }
                catch {
                  callbacks.onFinish?.(eventObj.data);
                }
                break;
              case 'error':
                callbacks.onError?.(eventObj.data)
                break
              default:
                break
            }
          }
          catch (err) {
            // 当前行不是完整json，等待下一轮处理即可
            // console.log('Chunk parse error:', err)
          }
        }
      },
    })

    return response
  }
  catch (error: any) {
    callbacks.onError?.(error)
    throw error
  }
};

// 操作指令
export const postCommandApi = async (command_type: number, exam_id: string) => {
  try {
    const response = await api.post('/api/copilot/command', {
      command_type,
      exam_id,
    })
    return response.data.data
  }
  catch (error) {
    console.error('操作指令网络接口错误', error)
  }
}
