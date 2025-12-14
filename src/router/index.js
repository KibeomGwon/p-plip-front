import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import PlanView from '@/views/attraction/PlanView.vue'
import MyInfoView from '@/views/myinfo/MyInfoView.vue'
import BoardView from '@/views/board/BoardListView.vue'
import FreeBoardList from '@/components/board/list/FreeBoardList.vue'
import FreeBoardDetailView from '@/views/board/FreeBoardDetailView.vue'
import NoticeBoardList from '@/components/board/list/NoticeBoardList.vue'
import PlaceDetailView from '@/views/attraction/PlaceDetailView.vue'
import MyPostListView from '@/views/myinfo/MyPostListView.vue'

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
      path: '/roulette',
      name: 'roulette',
      component: () => import('@/views/RouletteView.vue')
    },
    {
      path: '/my-plans/:id/todo',
      name: 'todo-list',
      component: () => import('@/views/myinfo/ToDoListView.vue')
    },
    {
      path: '/my-posts',
      name: 'my-posts',
      component: MyPostListView
    },
    {
      path: '/my-reviews',
      name: 'my-reviews',
      component: () => import('@/views/myinfo/MyReviewListView.vue')
    },
    {
      path: '/place/:id',
      name: 'place-detail',
      component: PlaceDetailView
    },
    {
      path: '/place/:id/reviews',
      name: 'place-reviews',
      component: () => import('@/views/attraction/PlaceReviewView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: MyInfoView
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/myinfo/ProfileEditView.vue')
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
    },
    {
      path: '/board/noticeboard/write',
      name: 'noticeboard-write',
      component: () => import('@/views/board/NoticeBoardWriteView.vue')
    },
    {
      path: '/board/freeboard/:id/modify',
      name: 'freeboard-modify',
      component: () => import('@/views/board/FreeBoardModifyView.vue')
    },
    {
      path: '/board/noticeboard/:id/modify',
      name: 'noticeboard-modify',
      component: () => import('@/views/board/NoticeBoardModifyView.vue')
    }
  ],
})

export default router
