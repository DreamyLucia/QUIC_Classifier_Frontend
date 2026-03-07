import type { Router } from 'vue-router';

let router: Router | null = null;
// note: 设置路由实例，不能使用 useRouter 因为 这个API是在模块级上使用的，而这里是在TS文件上使用，因此需要在main.ts中加载实例化的router即可
export const setRouter = (r: Router) => {
  router = r;
};
