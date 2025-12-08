import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 学生端路由
  {
    path: '/student',
    component: () => import('../layout/StudentLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('../views/student/Home.vue')
      },
      {
        path: 'class/:id',
        name: 'StudentClassDetail',
        component: () => import('../views/student/ClassDetail.vue')
      },
      {
        path: 'homework/:id',
        name: 'StudentHomeworkDetail',
        component: () => import('../views/student/HomeworkDetail.vue')
      },
      {
        path: 'resources',
        name: 'StudentResources',
        component: () => import('../views/ResourceSquare.vue')
      }
    ]
  },
  // 教师端路由
  {
    path: '/teacher',
    component: () => import('../layout/TeacherLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/Home.vue')
      },
      {
        path: 'class/:id',
        name: 'TeacherClassDetail',
        component: () => import('../views/teacher/ClassDetail.vue')
      },
      {
        path: 'homework/:id/grade',
        name: 'TeacherHomeworkGrade',
        component: () => import('../views/teacher/HomeworkGrade.vue')
      },
      {
        path: 'resources/square',
        name: 'TeacherResourceSquare',
        component: () => import('../views/ResourceSquare.vue')
      },
      {
        path: 'resources/my',
        name: 'TeacherMyResources',
        component: () => import('../views/teacher/MyResources.vue')
      }
    ]
  },
  // 旧的 dashboard 路由作为兜底
  {
    path: '/dashboard',
    redirect: to => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'teacher') return '/teacher/dashboard'
      return '/student/dashboard'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
