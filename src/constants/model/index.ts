// 模型类型枚举
export const MODEL_TYPES = {
  STANDARD: 'standard',
  ADFNET: 'adfnet',
} as const;

// 模型类型列表（用于下拉选择）
export const MODEL_OPTIONS = [
  { value: MODEL_TYPES.STANDARD },
  { value: MODEL_TYPES.ADFNET },
] as const;
