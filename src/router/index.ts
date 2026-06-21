import { createRouter, createWebHistory } from 'vue-router'
import FileViewer from '../views/FileViewer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'file-viewer',
      component: FileViewer,
    },
  ],
})

export default router
