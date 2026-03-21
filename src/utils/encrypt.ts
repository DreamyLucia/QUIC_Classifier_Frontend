import JSEncrypt from 'jsencrypt';

let publicKey: string | null = null;

// 设置公钥
export const setPublicKey = (key: string) => {
  publicKey = key;
};

// 获取公钥（用于判断是否已设置）
export const hasPublicKey = () => {
  return publicKey !== null;
};

// 加密密码
export const encryptPassword = (plainPassword: string): string => {
  if (!publicKey) {
    console.error('公钥未设置，请先调用 setPublicKey');
    return plainPassword;
  }

  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(plainPassword);

  if (!encrypted) {
    console.error('密码加密失败');
    return plainPassword;
  }

  return encrypted;
};
