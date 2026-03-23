import { useUserStore } from '@/store/user'
import router from './index'
import Cookies from 'js-cookie';

const basePath = import.meta.env.VITE_PUBLIC_BASE || '/';

// 白名单：不需要登录就能访问的页面
const whiteList = [
  '/signin',
  '/signup',
  '/reset',
  '/',
];

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = Cookies.get('access_token');

  // 白名单检查
  if (whiteList.includes(to.path)) {
    next();
    return;
  }

  // 没有 token，跳转登录
  if (!token)
    next('/signin');
});
