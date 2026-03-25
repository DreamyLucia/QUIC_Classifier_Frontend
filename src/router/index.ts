import { createRouter, createWebHistory } from 'vue-router';
import authRouters from './auth';

const publicPath = import.meta.env.VITE_PUBLIC_BASE || '/';

const router = createRouter({
  history: createWebHistory(publicPath),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home/index.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard/index.vue'),
    },
    {
      path: '/history',
      name: 'HistoryPage',
      component: () => import('@/views/History/index.vue'),
    },
    {
      path: '/overview',
      name: 'OverviewPage',
      component: () => import('@/views/Overview/index.vue'),
    },
    {
      path: '/task/:task_id',
      name: 'TaskDetail',
      component: () => import('@/views/TaskDetails/index.vue'),
    },
    ...authRouters,
  ],
});

export default router;
