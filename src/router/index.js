import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import PlanView from '@/views/PlanView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import MyInfoView from '@/views/MyInfoView.vue'
import BoardView from '@/views/board/BoardListView.vue'
import FreeBoardList from '@/components/board/FreeBoardList.vue'
import NoticeBoardList from '@/components/board/NoticeBoardList.vue'

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
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView
    },
    {
      path: '/myinfo',
      name: 'myinfo',
      component: MyInfoView
    },
    {
      path: '/board',
      name: 'board',
      component: BoardView,
      children: [
        {
          path: 'freeboard',
          name: 'freeboard',
          component: FreeBoardList
        },
        {
          path: 'freeboard/:id',
          name: 'freeboard-detail',
          component: FreeBoardList
        },
        {
          path: 'noticeboard',
          name: 'noticeboard',
          component: NoticeBoardList
        },
        {
          path: 'noticeboard/:id',
          name: 'noticeboard-detail',
          component: NoticeBoardList
        }
      ]
    }
  ],
})

export default router
