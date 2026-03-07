const mainAppRouters = [
  {
    path: '/written-test',
    name: 'WrittenTestPage',
    component: () => import('@/views/App/WrittenTest/index.vue'),
  },
  {
    path: '/interview-test',
    name: 'InterviewTestPage',
    component: () => import('@/views/App/Interview/index.vue'),
  },
];

export default mainAppRouters;
