const authRouters = [
  {
    path: '/reset-password',
    name: 'ResetPasswordPage',
    component: () => import('@/views/ResetPassword/index.vue'),
  },
  {
    path: '/login',
    name: 'SignInPage',
    component: () => import('@/views/SignIn/index.vue'),
  },
  {
    path: '/register',
    name: 'SignUpPage',
    component: () => import('@/views/SignUp/index.vue'),
  },
];

export default authRouters;
