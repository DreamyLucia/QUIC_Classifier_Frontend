import type { Router } from 'vue-router';
import { api } from '@/api/api';
import Cookies from 'js-cookie';

let router: Router | null = null;
// note: 设置路由实例，不能使用 useRouter 因为 这个API是在模块级上使用的，而这里是在TS文件上使用，因此需要在main.ts中加载实例化的router即可
export const setRouter = (r: Router) => {
  router = r;
};

// 获取公钥
export const getPublicKeyApi = async () => {
  try {
    const response: any = await api.get('/api/users/public-key', {
      headers: { skipToken: true },
    });
    return response.data;
  }
  catch (error) {
    console.error('获取公钥失败', error);
    throw error;
  }
};

// 注册
export const registerApi = async (username: string, password: string) => {
  try {
    const response: any = await api.post('/api/users/register',
      { username, password },
      { headers: { skipToken: true } },
    );
    const access_token = response.data.token;
    // 设置Cookie
    Cookies.set('access_token', access_token)
    return response.data;
  }
  catch (error) {
    console.error('账号密码注册网络接口错误', error);
    throw error;
  }
};

// 登录
export const loginApi = async (username: string, password: string) => {
  try {
    const response: any = await api.post('/api/users/login',
      { username, password },
      { headers: { skipToken: true } },
    );
    const access_token = response.data.token;
    // 设置Cookie
    Cookies.set('access_token', access_token)
    return response.data;
  }
  catch (error) {
    console.error('账号密码登录网络接口错误', error);
    throw error;
  }
};

// 重置
export const resetApi = async (username: string, password: string) => {
  try {
    const response: any = await api.post('/api/users/reset',
      { username, password },
      { headers: { skipToken: true } },
    );
    return response.data;
  }
  catch (error) {
    console.error('账号密码重置网络接口错误', error);
    throw error;
  }
};
