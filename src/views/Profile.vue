<template>
    <div class="profile-page">
        <!-- 用户信息头部 -->
        <div class="profile-header">
            <div class="user-info">
                <img :src="userInfo.avatar" alt="头像" class="user-avatar" />
                <div class="user-details">
                    <div class="username">{{ userInfo.username }}</div>
                    <div class="user-stats">
                        <span>{{ userInfo.city }}</span>
                    </div>
                </div>
            </div>
            <div class="profile-actions">
                <van-button size="small" type="primary" plain @click="$router.push('/edit-profile')">编辑资料</van-button>
            </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-section">
            <!-- 我的记录 -->
            <van-cell-group title="我的记录">
                <van-cell 
                    title="我的钓获" 
                    value="查看记录"
                    icon="photo-o"
                    is-link 
                    @click="$router.push('/my-records')" 
                />
                <van-cell 
                    title="我收藏的钓点" 
                    :value="`${collectedSpotsCount}个钓点`"
                    icon="star-o"
                    is-link 
                    @click="$router.push('/collected-spots')" 
                />
                <van-cell 
                    title="钓鱼图鉴" 
                    value="查看图鉴"
                    icon="guide-o"
                    is-link 
                    @click="$router.push('/fish-guide')" 
                />
            </van-cell-group>



            <!-- 退出登录 -->
            <van-cell-group>
                <van-cell 
                    title="退出登录" 
                    icon="revoke"
                    @click="logout"
                    title-style="color: #ee0a24"
                />
            </van-cell-group>
        </div>

        <!-- 底部导航栏 -->
        <van-tabbar v-model="activeNavTab" @change="onNavTabChange" fixed placeholder>
            <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
            <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { type User } from '../types/fishing';

const router = useRouter();
// 底部导航栏
const activeNavTab = ref(1); // 我的页面对应索引1

// 模拟收藏钓点数量
const collectedSpotsCount = ref(3);

// 底部导航栏切换
const onNavTabChange = (index: number) => {
    switch (index) {
        case 0:
            router.push('/home');
            break;
        case 1:
            router.push('/profile');
            break;
    }
};

// 模拟用户数据
const userInfo = ref<User>({
    id: 'user_1',
    username: '钓鱼老司机',
    avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
    city: '北京',
    joinDate: new Date('2023-01-01'),
    bio: '热爱钓鱼的老司机，专攻野钓'
});



const logout = async () => {
    try {
        await showConfirmDialog({
            title: '确认退出',
            message: '确定要退出登录吗？'
        });
        
        // 清除本地存储
        localStorage.removeItem('fishing_token');
        localStorage.removeItem('fishing_user');
        
        // 跳转到登录页
        router.replace('/login');
        showToast('已退出登录');
    } catch {
        // 用户取消退出
    }
};

// 生命周期
onMounted(() => {
    // 初始化
});
</script>

<style scoped>
.profile-page {
    min-height: 100vh;
    padding-bottom: 60px;
    background: var(--van-background-color);
    overflow-y: auto;
}

.profile-header {
    background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-dark));
    color: white;
    padding: 20px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.user-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-details {
    flex: 1;
}

.username {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
}

.level-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    margin-bottom: 8px;
}

.user-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    opacity: 0.9;
}

.profile-actions {
    margin-left: 12px;
}

.menu-section {
    padding: 0;
    background: var(--van-background-color);
    height: calc(100vh - 200px); /* 减去头部和底部导航栏的高度 */
    overflow-y: auto;
}

/* Cell Group 样式优化 */
:deep(.van-cell-group) {
    margin: 12px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.van-cell-group__title) {
    padding: 12px 16px 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color-2);
    background: white;
}

:deep(.van-cell) {
    padding: 12px 16px;
    background: white;
}

:deep(.van-cell:not(:last-child)::after) {
    border-bottom: 1px solid var(--van-border-color);
    left: 16px;
    right: 0;
}

:deep(.van-cell__title) {
    font-size: 15px;
    color: var(--van-text-color);
}

:deep(.van-cell__value) {
    font-size: 13px;
    color: var(--van-text-color-3);
}

:deep(.van-cell__left-icon) {
    margin-right: 12px;
    color: var(--van-text-color-2);
}

/* 钓获记录区域 - 简化样式 */
.records-section {
    margin: 12px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--van-border-color);
}

.records-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
}

/* 记录列表 - 简化样式 */
.records-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.record-card {
    background: var(--van-background-color-light);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid var(--van-border-color);
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.fish-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--van-text-color);
}

.record-time {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.record-weight {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-primary-color);
}

.record-images {
    display: flex;
    gap: 6px;
    margin: 8px 0;
}

.record-image {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    object-fit: cover;
}

.more-images {
    position: absolute;
    right: 8px;
    top: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
}

.record-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 8px 0;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--van-text-color-2);
}

.detail-item .van-icon {
    color: var(--van-text-color-3);
}

.record-tags {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
}

.record-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--van-text-color-3);
}
</style> 