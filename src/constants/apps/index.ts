export interface AppItem {
  name: string
  label: string
  add: string
  examType: 1 | 2 // 1: 笔试, 2: 面试
}

export const appList: AppItem[] = [
  {
    name: '笔试',
    label: '一键解析多种题目',
    add: '新建笔试',
    examType: 1,
  },
  {
    name: '面试',
    label: '实时分析，实时辅助',
    add: '新建面试',
    examType: 2,
  },
] as const
