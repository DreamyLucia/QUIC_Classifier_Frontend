/**
 * 通用 JSON 序列化函数，处理各种复杂对象
 * @param obj 要序列化的对象
 * @param space 格式化缩进（可选）
 * @returns JSON 字符串
 */
export function safeJsonStringify(obj: any, space?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    // 处理循环引用
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value))
        return '[Circular Reference]';

      seen.add(value);
    }

    // 处理 Error 对象 - 简化版本
    if (value instanceof Error) {
      return {
        type: value.constructor.name,
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    // 处理 Date 对象
    if (value instanceof Date)
      return value.toISOString();

    // 处理 undefined
    if (value === undefined)
      return '[undefined]';

    // 处理函数
    if (typeof value === 'function')
      return `[Function: ${value.name || 'anonymous'}]`;

    // 处理 Symbol
    if (typeof value === 'symbol')
      return value.toString();

    return value;
  }, space);
}
