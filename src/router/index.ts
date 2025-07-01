// src/router/index.ts
import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';

// RouteRecordRaw[] 타입으로 라우트 배열 정의
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/su/:id', // 동적 라우트
    name: 'Redirect',
    component: () => import('../views/RedirectPage.vue'),
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatPage.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;