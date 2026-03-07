export const toBase64 = (str: string): Promise<string> => {
  // 创建一个 Blob 对象
  const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  // 使用 FileReader 读取 Blob 对象
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.onload = () => {
      if (!reader.result || typeof reader.result !== 'string') {
        reject(new Error('Invalid reader result'));
        return;
      }
      // 获取 Base64 编码的结果
      const base64 = reader.result.split(',')[1];
      if (!base64) {
        reject(new Error('Base64 encoding failed'));
        return;
      }
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

export const fromBase64 = (base64: string): Promise<string> => {
  // 验证输入
  if (!base64 || typeof base64 !== 'string')
    return Promise.reject(new Error('Invalid base64 input'));

  try {
    // 将 Base64 编码的字符串转换为二进制数据
    const binaryString = atob(base64);
    // 创建一个 Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++)
      bytes[i] = binaryString.charCodeAt(i);

    // 创建一个 Blob 对象
    const blob = new Blob([bytes], { type: 'text/plain;charset=utf-8' });
    // 使用 FileReader 读取 Blob 对象
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Invalid decoded result'));
          return;
        }
        // 获取解码后的字符串
        resolve(reader.result);
      };
      reader.readAsText(blob);
    });
  }
  catch (error) {
    return Promise.reject(error instanceof Error ? error : new Error('Decoding failed'));
  }
};
