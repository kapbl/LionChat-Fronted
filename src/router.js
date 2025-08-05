import { createRouter, createWebHistory } from 'vue-router'
import Chat from './Chat.vue'
import LoginRegister from './LoginRegister.vue'

const routes = [
  {
    path: '/',
    component: LoginRegister,
  },
  {
    path: '/chat',
    name: 'Chat', 
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginRegister
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  // 从URL参数获取sessionKey
  const sessionKey = to.query.session // 修改这里
  // 根据sessionKey获取token
  const token = sessionKey ? localStorage.getItem(`token_${sessionKey}`) : null
  // console.log('当前路由:', to.path)
  // console.log('sessionKey:', sessionKey)
  // console.log('token:', token)
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login' })
  } else if (to.path === '/login' && token) {
    next({ path: '/chat', query: { session: sessionKey } })
  } else {
    next()
  }
})

export default router
