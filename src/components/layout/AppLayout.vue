<template>
    <div class="app-layout">
        <!-- 顶部导航栏 -->
        <van-nav-bar
            :title="pageTitle"
            fixed
            :left-text="showBack ? '返回' : ''"
            :left-arrow="showBack"
            @click-left="handleBack"
        />
        
        <!-- 内容区域 -->
        <div class="content-wrap">
            <slot />
        </div>
        
        <!-- 底部导航栏 -->
        <van-tabbar v-model="active" route safe-area-inset-bottom>
            <van-tabbar-item icon="home-o" to="/dashboard">首页</van-tabbar-item>
            <van-tabbar-item icon="balance-o" to="/recharge">充值</van-tabbar-item>
            <van-tabbar-item icon="exchange" to="/transfer">转账</van-tabbar-item>
            <van-tabbar-item icon="records" to="/records">记录</van-tabbar-item>
            <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 当前激活的导航项
const active = ref(0);

// 页面标题
const pageTitle = computed(() => {
    const titleMap: Record<string, string> = {
        '/dashboard': '控制台',
        '/recharge': '充值',
        '/transfer': '转账',
        '/records': '交易记录',
        '/profile': '我的',
        '/company-mgmt': '公司管理',
        '/account-mgmt': '账户管理',
    };
    
    return titleMap[route.path] || '广告充值系统';
});

// 是否显示返回按钮
const showBack = computed(() => {
    const noBackRoutes = ['/dashboard', '/login'];
    return !noBackRoutes.includes(route.path);
});

// 返回处理
const handleBack = () => {
    if (route.path === '/login') {
        router.push('/dashboard');
    } else {
        router.back();
    }
};
</script>

<style scoped>
.app-layout {
    min-height: 100vh;
    background-color: var(--van-background-color);
}

.content-wrap {
    padding: 12px;
    padding-top: 56px; /* 为固定导航栏留出空间 */
    padding-bottom: 80px; /* 为底部导航留出空间 */
    min-height: calc(100vh - 136px); /* 减去顶部和底部导航的高度 */
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
    .content-wrap {
        padding-bottom: max(80px, env(safe-area-inset-bottom));
    }
}
</style> 