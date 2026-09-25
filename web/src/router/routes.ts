import type { RouteRecordRaw } from 'vue-router'

import WorkspaceLayout from '@/layouts/WorkspaceLayout.vue'
import WorkspaceView from '@/modules/workspace/WorkspaceView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: WorkspaceLayout,
    children: [
      {
        path: '',
        name: 'workspace',
        component: WorkspaceView,
      },
    ],
  },
]
