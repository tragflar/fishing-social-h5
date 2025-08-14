<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
    // 检查登录状态
    const token = localStorage.getItem('fishing_token');
    const user = localStorage.getItem('fishing_user');

    // 如果当前在根路径，重定向到适当的页面
    if (router.currentRoute.value.path === '/') {
        if (token && user) {
            router.replace('/home');
        } else {
            router.replace('/login');
        }
    }
});
</script>

<style>
#app {
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    background: linear-gradient(180deg, #E3F2FD 0%, #F8FFFE 100%);
    min-height: 100vh;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
}
</style> 