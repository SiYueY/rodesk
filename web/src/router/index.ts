import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import WorkspaceView from '@/modules/workspace/WorkspaceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'workspace',
          component: WorkspaceView,
        },
      ],
    },
  ],
})

export default router
