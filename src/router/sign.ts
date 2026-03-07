const mainAppRouters = [
  {
    path: '/sign-in',
    name: 'SignInPage',
    component: () => import('@/views/SignIn/index.vue'),
  },
];

export default mainAppRouters;
