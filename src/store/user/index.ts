// 用户基本信息store
import { defineStore } from 'pinia';
import type { UserInfoType } from '@/types/user';
import Cookies from 'js-cookie';

interface UserStateType {
  userInfo: UserInfoType;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserStateType => ({
    userInfo: {
      username: '',
      userId: '',
      roles: [],
    },
    // 登录态以 cookie 是否存在为准
    isLoggedIn: Boolean(Cookies.get('access_token')),
  }),
  actions: {
    syncLoginState() {
      const token = Cookies.get('access_token');
      this.isLoggedIn = Boolean(token);

      // 没有 token 时清空用户信息，避免展示脏数据
      if (!this.isLoggedIn) {
        this.userInfo = {
          username: '',
          userId: '',
          roles: [],
        };
      }
    },
    setUserInfo(userInfo: UserInfoType) {
      this.userInfo = userInfo;
      // 设置了用户信息就认为已登录（同时也会由 cookie 最终兜底）
      this.isLoggedIn = true;
    },
    logout() {
      Cookies.remove('access_token');
      this.isLoggedIn = false;
      this.userInfo = {
        username: '',
        userId: '',
        roles: [],
      };
    },
  },
  getters: {
    getUserName(): string {
      return this.userInfo.username;
    },
    getUserId(): string {
      return this.userInfo.userId;
    },
    getRoles(): string[] {
      return this.userInfo.roles;
    },
    isAdmin(): boolean {
      return this.userInfo.roles.includes('user');
    },
  },
  // 持久化
  persist: true,
});
