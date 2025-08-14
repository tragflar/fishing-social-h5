<template>
    <div class="fish-guide-page">
        <!-- 顶部导航 -->
        <van-nav-bar 
            title="钓鱼图鉴" 
            left-arrow 
            @click-left="$router.back()"
        >
            <template #right>
                <van-icon name="setting-o" @click="showSettings" />
            </template>
        </van-nav-bar>

        <!-- 解锁进度 -->
        <div class="progress-section">
            <div class="progress-header">
                <h3>解锁进度</h3>
                <span class="progress-text">{{ stats.totalUnlocked }}/{{ stats.totalFish }}</span>
            </div>
            <div class="progress-bar">
                <div 
                    class="progress-fill" 
                    :style="{ width: `${stats.unlockPercentage}%` }"
                ></div>
            </div>
            <div class="progress-percentage">{{ stats.unlockPercentage }}%</div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <van-search
                v-model="searchKeyword"
                placeholder="搜索鱼类名称"
                @search="onSearch"
            />
            <div class="filter-tabs">
                <van-tabs v-model:active="activeTab" @change="onTabChange">
                    <van-tab title="全部" name="all">
                        <div class="fish-grid">
                            <div 
                                v-for="fish in filteredFish" 
                                :key="fish.id"
                                class="fish-card"
                                :class="{ 'unlocked': getFishUnlockStatus('current_user', fish.id).isUnlocked }"
                                @click="showFishDetail(fish)"
                            >
                                <div class="fish-icon">
                                    {{ getFishUnlockStatus('current_user', fish.id).isUnlocked ? fish.icon : '' }}
                                </div>
                                <div class="fish-name">{{ fish.name }}</div>
                                <div class="fish-rarity" :class="fish.rarity">
                                    {{ getRarityDisplayName(fish.rarity) }}
                                </div>
                                <div v-if="getFishUnlockStatus('current_user', fish.id).isUnlocked" class="unlock-badge">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </van-tab>
                    <van-tab title="常见" name="common">
                        <div class="fish-grid">
                            <div 
                                v-for="fish in commonFish" 
                                :key="fish.id"
                                class="fish-card"
                                :class="{ 'unlocked': getFishUnlockStatus('current_user', fish.id).isUnlocked }"
                                @click="showFishDetail(fish)"
                            >
                                <div class="fish-icon">
                                    {{ getFishUnlockStatus('current_user', fish.id).isUnlocked ? fish.icon : '' }}
                                </div>
                                <div class="fish-name">{{ fish.name }}</div>
                                <div class="fish-rarity" :class="fish.rarity">
                                    {{ getRarityDisplayName(fish.rarity) }}
                                </div>
                                <div v-if="getFishUnlockStatus('current_user', fish.id).isUnlocked" class="unlock-badge">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </van-tab>
                    <van-tab title="稀有" name="rare">
                        <div class="fish-grid">
                            <div 
                                v-for="fish in rareFish" 
                                :key="fish.id"
                                class="fish-card"
                                :class="{ 'unlocked': getFishUnlockStatus('current_user', fish.id).isUnlocked }"
                                @click="showFishDetail(fish)"
                            >
                                <div class="fish-icon">
                                    {{ getFishUnlockStatus('current_user', fish.id).isUnlocked ? fish.icon : '' }}
                                </div>
                                <div class="fish-name">{{ fish.name }}</div>
                                <div class="fish-rarity" :class="fish.rarity">
                                    {{ getRarityDisplayName(fish.rarity) }}
                                </div>
                                <div v-if="getFishUnlockStatus('current_user', fish.id).isUnlocked" class="unlock-badge">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </van-tab>
                    <van-tab title="史诗" name="epic">
                        <div class="fish-grid">
                            <div 
                                v-for="fish in epicFish" 
                                :key="fish.id"
                                class="fish-card"
                                :class="{ 'unlocked': getFishUnlockStatus('current_user', fish.id).isUnlocked }"
                                @click="showFishDetail(fish)"
                            >
                                <div class="fish-icon">
                                    {{ getFishUnlockStatus('current_user', fish.id).isUnlocked ? fish.icon : '' }}
                                </div>
                                <div class="fish-name">{{ fish.name }}</div>
                                <div class="fish-rarity" :class="fish.rarity">
                                    {{ getRarityDisplayName(fish.rarity) }}
                                </div>
                                <div v-if="getFishUnlockStatus('current_user', fish.id).isUnlocked" class="unlock-badge">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </van-tab>
                </van-tabs>
            </div>
        </div>

        <!-- 鱼类详情弹窗 -->
        <van-popup v-model:show="showDetail" position="bottom" :style="{ height: '70%' }">
            <div v-if="selectedFish" class="fish-detail">
                <div class="detail-header">
                    <div class="fish-info">
                        <div class="fish-icon-large">
                            {{ getFishUnlockStatus('current_user', selectedFish.id).isUnlocked ? selectedFish.icon : '' }}
                        </div>
                        <div class="fish-details">
                            <h3>{{ selectedFish.name }}</h3>
                            <div class="fish-rarity-badge" :class="selectedFish.rarity">
                                {{ getRarityDisplayName(selectedFish.rarity) }}
                            </div>
                        </div>
                    </div>
                    <van-icon name="cross" @click="showDetail = false" />
                </div>

                <div class="detail-content">
                    <div v-if="getFishUnlockStatus('current_user', selectedFish.id).isUnlocked" class="unlock-info">
                        <div class="info-item">
                            <span class="label">首次钓获：</span>
                            <span class="value">{{ formatDate(getFishUnlockStatus('current_user', selectedFish.id).firstCatchDate) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">总钓获：</span>
                            <span class="value">{{ getFishUnlockStatus('current_user', selectedFish.id).totalCatchCount }}条</span>
                        </div>
                    </div>
                    <div v-else class="locked-info">
                        <p>尚未解锁此鱼类</p>
                        <p>钓获此鱼类即可解锁</p>
                    </div>

                    <div v-if="selectedFish.description" class="fish-description">
                        <h4>鱼类介绍</h4>
                        <p>{{ selectedFish.description }}</p>
                    </div>

                    <div v-if="selectedFish.habitat" class="fish-habitat">
                        <h4>栖息地</h4>
                        <div class="habitat-tags">
                            <van-tag 
                                v-for="habitat in selectedFish.habitat" 
                                :key="habitat"
                                type="primary" 
                                plain
                            >
                                {{ habitat }}
                            </van-tag>
                        </div>
                    </div>

                    <div v-if="selectedFish.season" class="fish-season">
                        <h4>最佳钓鱼季节</h4>
                        <div class="season-tags">
                            <van-tag 
                                v-for="season in selectedFish.season" 
                                :key="season"
                                type="success" 
                                plain
                            >
                                {{ season }}
                            </van-tag>
                        </div>
                    </div>
                </div>
            </div>
        </van-popup>

        <!-- 设置弹窗 -->
        <van-action-sheet v-model:show="showSettingsSheet" :actions="settingsActions" @select="onSettingSelect" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { fishSpeciesData, fishByRarity, getRarityDisplayName } from '../data/fishSpecies';
import { getUserUnlockStats, getFishUnlockStatus } from '../utils/fishUnlock';
import { FishRarity } from '../types/fishing';

const router = useRouter();

// 响应式数据
const searchKeyword = ref('');
const activeTab = ref('all');
const showDetail = ref(false);
const showSettingsSheet = ref(false);
const selectedFish = ref<any>(null);

// 设置选项
const settingsActions = [
    { name: '重置解锁进度', color: '#ee0a24' },
    { name: '关于图鉴', color: '#1989fa' }
];

// 计算属性
const stats = computed(() => {
    return getUserUnlockStats('current_user');
});

const filteredFish = computed(() => {
    if (!searchKeyword.value) return fishSpeciesData;
    return fishSpeciesData.filter(fish => 
        fish.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
});

const commonFish = computed(() => fishByRarity[FishRarity.COMMON]);
const rareFish = computed(() => fishByRarity[FishRarity.RARE]);
const epicFish = computed(() => fishByRarity[FishRarity.EPIC]);

// 方法
const onSearch = () => {
    // 搜索功能已通过计算属性实现
};

const onTabChange = (name: string) => {
    activeTab.value = name;
};

const showFishDetail = (fish: any) => {
    selectedFish.value = fish;
    showDetail.value = true;
};

const showSettings = () => {
    showSettingsSheet.value = true;
};

const onSettingSelect = async (action: any) => {
    if (action.name === '重置解锁进度') {
        const result = await showConfirmDialog({
            title: '确认重置',
            message: '这将清除所有解锁进度，确定要继续吗？'
        });
        
        if (result) {
            // 这里可以调用重置函数
            showToast('重置功能开发中');
        }
    } else if (action.name === '关于图鉴') {
        showToast('图鉴功能说明开发中');
    }
};

const formatDate = (date: Date | undefined): string => {
    if (!date) return '未知';
    return date.toLocaleDateString();
};

// 生命周期
onMounted(() => {
    // 页面初始化
});
</script>

<style scoped>
.fish-guide-page {
    min-height: 100vh;
    background: var(--van-background-color);
    padding-bottom: 20px;
}

/* 进度区域 */
.progress-section {
    background: white;
    margin: 12px;
    padding: 16px;
    border-radius: 12px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.progress-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--van-text-color);
}

.progress-text {
    font-size: 14px;
    color: var(--van-text-color-3);
}

.progress-bar {
    height: 8px;
    background: var(--van-background-color-light);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #66BB6A);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-percentage {
    text-align: center;
    font-size: 12px;
    color: var(--van-text-color-3);
}

/* 筛选区域 */
.filter-section {
    background: white;
    margin: 12px;
    border-radius: 12px;
    overflow: hidden;
}

.filter-tabs {
    padding: 0 12px;
}

/* 鱼类网格 */
.fish-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
}

.fish-card {
    background: white;
    border: 2px solid var(--van-border-color);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.fish-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fish-card.unlocked {
    border-color: #4CAF50;
    background: linear-gradient(135deg, #f8fff8, #ffffff);
}

.fish-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.3;
}

.fish-card.unlocked .fish-icon {
    opacity: 1;
}

.fish-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 4px;
}

.fish-rarity {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
    color: white;
}

.fish-rarity.common {
    background: #9E9E9E;
}

.fish-rarity.rare {
    background: #2196F3;
}

.fish-rarity.epic {
    background: #9C27B0;
}

.fish-rarity.legendary {
    background: #FF9800;
}

.unlock-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

/* 鱼类详情 */
.fish-detail {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--van-border-color);
}

.fish-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.fish-icon-large {
    font-size: 48px;
}

.fish-details h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: var(--van-text-color);
}

.fish-rarity-badge {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    color: white;
    display: inline-block;
}

.fish-rarity-badge.common {
    background: #9E9E9E;
}

.fish-rarity-badge.rare {
    background: #2196F3;
}

.fish-rarity-badge.epic {
    background: #9C27B0;
}

.fish-rarity-badge.legendary {
    background: #FF9800;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.unlock-info {
    background: var(--van-background-color-light);
    padding: 16px;
    border-radius: 8px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.label {
    color: var(--van-text-color-3);
    font-size: 14px;
}

.value {
    color: var(--van-text-color);
    font-size: 14px;
    font-weight: 500;
}

.locked-info {
    text-align: center;
    padding: 40px 20px;
    color: var(--van-text-color-3);
}

.locked-info p {
    margin: 8px 0;
}

.fish-description h4,
.fish-habitat h4,
.fish-season h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--van-text-color);
}

.fish-description p {
    line-height: 1.6;
    color: var(--van-text-color-2);
    margin: 0;
}

.habitat-tags,
.season-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

:deep(.van-tabs__content) {
    padding: 0;
}

:deep(.van-tab__pane) {
    padding: 0;
}
</style> 