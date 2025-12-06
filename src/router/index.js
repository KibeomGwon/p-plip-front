import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import PlanView from '@/views/PlanView.vue'
import MyInfoView from '@/views/MyInfoView.vue'
import BoardView from '@/views/board/BoardListView.vue'
import FreeBoardList from '@/components/board/list/FreeBoardList.vue'
import FreeBoardDetailView from '@/views/board/FreeBoardDetailView.vue'
import NoticeBoardList from '@/components/board/list/NoticeBoardList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainView
    },
    {
      path: '/plan',
      name: 'plan',
      component: PlanView
    },
    {
      path: '/profile',
      name: 'profile',
      component: MyInfoView
    },
    {
      path: '/board',
      name: 'board',
      component: BoardView,
      redirect: { name: 'freeboard' },
      children: [
        {
          path: 'freeboard',
          name: 'freeboard',
          component: FreeBoardList
        },
        {
          path: 'noticeboard',
          name: 'noticeboard',
          component: NoticeBoardList
        },
      ]
    },
    {
      path: '/board/freeboard/:id',
      name: 'freeboard-detail',
      component: FreeBoardDetailView
    },
    {
      path: '/board/noticeboard/:id',
      name: 'noticeboard-detail',
      component: () => import('@/views/board/NoticeBoardDetailView.vue')
    },
    {
      path: '/board/freeboard/write',
      name: 'freeboard-write',
      component: () => import('@/views/board/FreeBoardWriteView.vue')
    }
  ],
})

export default router
