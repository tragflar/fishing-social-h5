import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true, title: '首页' },
    },

    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人中心' }
    },
    {
        path: '/my-records',
        name: 'MyRecords',
        component: () => import('../views/MyRecords.vue'),
        meta: { title: '我的钓获' }
    },
    {
        path: '/spot/:id',
        name: 'SpotDetail',
        component: () => import('../views/SpotDetail.vue'),
        meta: { title: '钓点详情' }
    },
    {
        path: '/spot/:id/weather',
        name: 'SpotWeatherDetail',
        component: () => import('../views/spot/WeatherDetail.vue'),
        meta: { title: '天气详情' }
    },
    {
        path: '/spot/:id/water',
        name: 'SpotWaterDetail',
        component: () => import('../views/spot/WaterDetail.vue'),
        meta: { title: '水文详情' }
    },

    {
        path: '/spot/add',
        name: 'AddSpot',
        component: () => import('../views/AddSpot.vue'),
        meta: { requiresAuth: true, title: '添加钓点' },
    },
    {
        path: '/weather',
        name: 'Weather',
        component: () => import('../views/Weather.vue'),
        meta: { requiresAuth: true, title: '天气水文' },
    },
    {
        path: '/collected-spots',
        name: 'CollectedSpots',
        component: () => import('../views/CollectedSpots.vue'),
        meta: { title: '我收藏的钓点' }
    },
    {
        path: '/edit-profile',
        name: 'EditProfile',
        component: () => import('../views/EditProfile.vue'),
        meta: { title: '编辑资料' }
    },
    {
        path: '/fish-guide',
        name: 'FishGuide',
        component: () => import('../views/FishGuide.vue'),
        meta: { title: '钓鱼图鉴' }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
    next();
});

export default router; 