<template>
    <div class="weather-page">
        <van-nav-bar title="天气水文" left-arrow @click-left="$router.back()" />
        
        <div class="content-wrap">
            <div class="placeholder">
                <div class="placeholder-icon">🌤️</div>
                <h3>天气水文</h3>
                <p>功能开发中...</p>
                <p class="feature-list">
                    将支持：<br>
                    • 7天天气预报<br>
                    • 气压变化曲线<br>
                    • 风向风力信息<br>
                    • 潮汐信息（海钓）<br>
                    • 智能适钓指数评估
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 功能开发中
</script>

<style scoped>
.weather-page {
    min-height: 100vh;
    background: var(--van-background-color);
}

.content-wrap {
    padding: 40px 20px;
}

.placeholder {
    text-align: center;
    color: var(--van-text-color-2);
}

.placeholder-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.placeholder h3 {
    margin: 0 0 12px 0;
    color: var(--van-text-color);
}

.feature-list {
    text-align: left;
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin-top: 20px;
    font-size: 14px;
    line-height: 1.6;
}
</style> 