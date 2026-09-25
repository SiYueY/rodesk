import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'agent-home',
      component: () => import('@/modules/agent/views/AgentView.vue'),
    },
    {
      path: '/teleoperation',
      name: 'teleoperation',
      component: () => import('@/modules/teleoperation/views/TeleoperationView.vue'),
    },
    { path: '/agent', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
