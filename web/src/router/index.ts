import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { agentRoutes } from './modules/agent.routes'
import { robotRoutes } from './modules/robot.routes'
import { teleoperationRoutes } from './modules/teleoperation.routes'
import { workspaceRoutes } from './modules/workspace.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        workspaceRoutes,
        robotRoutes,
        agentRoutes,
        teleoperationRoutes,
      ],
    },
  ],
})

export default router
