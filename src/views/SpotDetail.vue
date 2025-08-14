<template>
    <div class="spot-detail-page">
        <!-- 顶部导航 -->
        <van-nav-bar 
            :title="spotInfo?.name || '钓点详情'" 
            left-arrow 
            @click-left="$router.back()"
        >
            <template #right>
                <van-icon name="share-o" @click="shareSpot" />
            </template>
        </van-nav-bar>

        <div v-if="loading" class="loading-container">
            <van-loading size="24px" vertical>加载中...</van-loading>
        </div>

        <div v-else-if="spotInfo" class="spot-content">
            <!-- 钓点图片展示 -->
            <div class="spot-images">
                <van-swipe 
                    v-if="spotInfo.images && spotInfo.images.length > 0"
                    :autoplay="3000" 
                    indicator-color="white"
                >
                    <van-swipe-item v-for="(image, index) in spotInfo.images" :key="index">
                        <img 
                            :src="image" 
                            :alt="`${spotInfo.name} 图片${index + 1}`"
                            class="spot-image"
                        />
                    </van-swipe-item>
                </van-swipe>
                <div v-else class="no-image">
                    <van-icon name="photo-o" size="48" />
                    <p>暂无图片</p>
                </div>
            </div>

            <!-- 基本信息 -->
            <div class="spot-basic-info">
                <div class="spot-header">
                    <h1 class="spot-name">{{ spotInfo.name }}</h1>
                    <div class="spot-type-badge" :class="spotInfo.type">
                        {{ getSpotTypeText(spotInfo.type) }}
                    </div>
                </div>

                <div class="address-section">
                    <van-icon name="location-o" />
                    <span class="address">{{ spotInfo.address }}</span>
                    <van-button 
                        type="primary" 
                        size="small" 
                        @click="navigateToSpot"
                    >
                        导航
                    </van-button>
                </div>
            </div>

            <!-- 鱼种信息 -->
            <div class="fish-species-section">
                <h3>可钓鱼种</h3>
                <div class="fish-tags">
                    <van-tag 
                        v-for="fish in spotInfo.fishSpecies" 
                        :key="fish" 
                        type="primary" 
                        plain
                        class="fish-tag"
                    >
                        🐟 {{ fish }}
                    </van-tag>
                </div>
            </div>

            <!-- 详细描述 -->
            <div class="description-section">
                <h3>钓点介绍</h3>
                <p class="description-text">{{ spotInfo.description }}</p>
            </div>

            <!-- 天气信息 -->
            <div class="weather-section">
                <h3>天气信息</h3>
                <div class="weather-card" @click="goToWeatherDetail">
                    <div class="weather-main">
                        <div class="weather-left">
                            <div class="temperature">{{ weather.temperature }}°C</div>
                            <div class="weather-desc">{{ weather.weather }}</div>
                        </div>
                        <div class="weather-right">
                            <div class="weather-icon">🌤️</div>
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="weather-item">
                            <span class="label">湿度</span>
                            <span class="value">{{ weather.humidity }}%</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">气压</span>
                            <span class="value">{{ weather.pressure }}hPa</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">风速</span>
                            <span class="value">{{ weather.windSpeed }}m/s</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">适钓指数</span>
                            <span class="value suitability" :class="getSuitabilityClass(weather.suitabilityIndex)">
                                {{ weather.suitabilityIndex }}/10
                            </span>
                        </div>
                    </div>
                    <div class="click-hint">
                        <van-icon name="arrow" />
                        <span>点击查看详细天气信息</span>
                    </div>
                </div>
            </div>

            <!-- 水文信息 -->
            <div v-if="spotInfo.hydrologyInfo" class="hydrology-section">
                <h3>水文信息</h3>
                <div class="hydrology-card" @click="goToWaterDetail">
                    <div class="hydrology-header">
                        <div class="update-time">
                            更新时间：{{ formatHydrologyTime(spotInfo.hydrologyInfo.updateTime) }}
                        </div>
                        <van-button 
                            type="primary" 
                            size="small" 
                            @click.stop="refreshHydrology"
                        >
                            刷新
                        </van-button>
                    </div>
                    
                    <div class="hydrology-main">
                        <div class="hydrology-item">
                            <div class="hydrology-icon">🌊</div>
                            <div class="hydrology-content">
                                <div class="hydrology-label">水位</div>
                                <div class="hydrology-value">{{ spotInfo.hydrologyInfo.waterLevel }}米</div>
                            </div>
                        </div>
                        <div class="hydrology-item">
                            <div class="hydrology-icon">🌡️</div>
                            <div class="hydrology-content">
                                <div class="hydrology-label">水温</div>
                                <div class="hydrology-value">{{ spotInfo.hydrologyInfo.waterTemperature }}°C</div>
                            </div>
                        </div>
                        <div class="hydrology-item">
                            <div class="hydrology-icon">💧</div>
                            <div class="hydrology-content">
                                <div class="hydrology-label">水质</div>
                                <div class="hydrology-value" :class="getWaterQualityClass(spotInfo.hydrologyInfo.waterQuality)">
                                    {{ spotInfo.hydrologyInfo.waterQuality }}
                                </div>
                            </div>
                        </div>
                        <div class="hydrology-item">
                            <div class="hydrology-icon">👁️</div>
                            <div class="hydrology-content">
                                <div class="hydrology-label">透明度</div>
                                <div class="hydrology-value">{{ spotInfo.hydrologyInfo.waterClarity }}cm</div>
                            </div>
                        </div>
                    </div>
                    <div class="click-hint">
                        <van-icon name="arrow" />
                        <span>点击查看详细水文信息</span>
                    </div>
                </div>
            </div>

            <!-- 钓点攻略 -->
            <div class="strategy-section">
                <div class="strategy-header">
                    <h3>钓点攻略 ({{ reviews.length }})</h3>
                    <van-button 
                        type="primary" 
                        size="small" 
                        @click="showReviewDialog = true"
                    >
                        分享攻略
                    </van-button>
                </div>

                <div class="strategy-list">
                    <div 
                        v-for="review in reviews" 
                        :key="review.id"
                        class="strategy-item"
                    >
                        <div class="review-header">
                            <img :src="review.avatar" alt="头像" class="reviewer-avatar" />
                            <div class="reviewer-info">
                                <div class="reviewer-name">{{ review.username }}</div>
                                <div class="review-time">{{ formatTime(review.createdAt) }}</div>
                            </div>
                        </div>
                        <div class="review-content">{{ review.content }}</div>
                        <div v-if="review.images?.length" class="review-images">
                            <img 
                                v-for="(image, index) in review.images" 
                                :key="index"
                                :src="image" 
                                alt="评价图片"
                                class="review-image"
                            />
                        </div>
                        <div class="review-actions">
                            <van-button 
                                type="default" 
                                size="mini" 
                                :icon="review.isLiked ? 'like' : 'like-o'"
                                @click="toggleReviewLike(review)"
                            >
                                {{ review.likes }}
                            </van-button>
                        </div>
                    </div>
                </div>

                <div v-if="reviews.length === 0" class="no-strategy">
                    <van-empty description="暂无攻略">
                        <van-button 
                            type="primary" 
                            @click="showReviewDialog = true"
                        >
                            分享第一条攻略
                        </van-button>
                    </van-empty>
                </div>
            </div>
        </div>

        <!-- 攻略弹窗 -->
        <van-popup v-model:show="showReviewDialog" position="bottom" :style="{ height: '70%' }">
            <div class="strategy-dialog">
                <div class="dialog-header">
                    <h3>分享攻略</h3>
                    <van-button type="primary" size="small" @click="submitReview">发布</van-button>
                </div>
                
                <van-field
                    v-model="newReview.content"
                    type="textarea"
                    placeholder="分享你的钓鱼攻略和技巧..."
                    rows="4"
                    maxlength="200"
                    show-word-limit
                />
                
                <div class="image-upload">
                    <van-uploader
                        v-model="newReview.images"
                        multiple
                        :max-count="3"
                        :after-read="afterRead"
                    />
                </div>
            </div>
        </van-popup>

        <div v-if="!loading && !spotInfo" class="error-container">
            <van-empty description="钓点信息加载失败" />
        </div>

        <!-- 底部操作栏 -->
        <div v-if="spotInfo" class="bottom-actions">
            <van-button 
                :icon="isCollected ? 'star' : 'star-o'"
                :type="isCollected ? 'warning' : 'default'"
                size="large"
                class="action-btn collect-btn"
                @click="toggleCollect"
            >
                {{ isCollected ? '已收藏' : '收藏' }}
            </van-button>
            <van-button 
                icon="guide-o"
                type="primary"
                size="large"
                class="action-btn navigate-btn"
                @click="navigateToSpot"
            >
                导航
            </van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { FishingSpotType, type FishingSpot, type WeatherInfo, type Comment } from '../types/fishing';

const router = useRouter();
const route = useRoute();

// 响应式数据
const loading = ref(true);
const spotInfo = ref<(FishingSpot & { 
    hydrologyInfo?: {
        updateTime: string;
        waterLevel: number;
        waterTemperature: number;
        waterQuality: string;
        waterClarity: number;
    };
}) | null>(null);
const showReviewDialog = ref(false);
const reviews = ref<(Comment & { avatar: string; username: string; images?: string[]; isLiked: boolean })[]>([]);
const newReview = ref({
    content: '',
    images: []
});
const isCollected = ref(false);
// 天气信息
const weather = ref<WeatherInfo>({
    temperature: 22,
    humidity: 65,
    pressure: 1013,
    windSpeed: 3.2,
    windDirection: '东南风',
    weather: '多云',
    suitabilityIndex: 8
});

// 计算属性
const spotId = computed(() => route.params.id as string);

// 模拟数据
const mockSpotData: Record<string, any> = {
    'spot_1': {
        id: 'spot_1',
        name: '翠湖公园钓点',
        type: FishingSpotType.LAKE,
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市海淀区翠湖公园内',
        city: '北京',
        description: '翠湖公园钓点位于北京市海淀区，是一个环境优美的城市湖泊钓点。湖水清澈，周围绿树成荫，空气清新，是休闲垂钓的绝佳选择。',
        images: [
            'https://img.yzcdn.cn/vant/apple-1.jpg',
            'https://img.yzcdn.cn/vant/apple-2.jpg',
            'https://img.yzcdn.cn/vant/apple-3.jpg'
        ],
        rating: 4.5,
        reviewCount: 128,
        fishSpecies: ['鲫鱼', '草鱼', '鲤鱼', '白条'],
        createdBy: 'user_1',
        createdAt: new Date(),
        approved: true,
        currentPeople: 8,
        distance: 2.3,
        hydrologyInfo: {
            updateTime: '2023-10-26 10:00',
            waterLevel: 1.2,
            waterTemperature: 22,
            waterQuality: '良好',
            waterClarity: 60
        }
    },
    'spot_2': {
        id: 'spot_2',
        name: '天鹅湖钓点',
        type: FishingSpotType.RESERVOIR,
        latitude: 39.9142,
        longitude: 116.4174,
        address: '北京市朝阳区天鹅湖公园',
        city: '北京',
        description: '天鹅湖钓点环境优美，水质清澈，是城市中难得的垂钓胜地。',
        images: [
            'https://img.yzcdn.cn/vant/apple-4.jpg',
            'https://img.yzcdn.cn/vant/apple-5.jpg'
        ],
        rating: 4.3,
        reviewCount: 89,
        fishSpecies: ['鲫鱼', '鲤鱼', '鲢鱼'],
        createdBy: 'user_2',
        createdAt: new Date(),
        approved: true,
        currentPeople: 5,
        distance: 3.1,
        hydrologyInfo: {
            updateTime: '2023-10-26 11:30',
            waterLevel: 1.8,
            waterTemperature: 20,
            waterQuality: '良好',
            waterClarity: 70
        }
    }
};

// 模拟评价数据
const mockReviews = [
    {
        id: 'review_1',
        userId: 'user_2',
        username: '钓鱼达人',
        avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        content: '这个钓点真的很不错！环境优美，鱼儿也很活跃。今天用玉米粒钓了3条草鱼，最大的有2.5公斤。推荐大家来试试！',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: 15,
        rating: 5,
        images: ['https://img.yzcdn.cn/vant/apple-1.jpg'],
        isLiked: false
    },
    {
        id: 'review_2',
        userId: 'user_3',
        username: '湖边老王',
        avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        content: '设施很完善，停车方便，就是人有点多。建议早点来占位置。',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: 8,
        rating: 4,
        isLiked: true
    }
];

// 工具函数
const getSpotTypeText = (type: FishingSpotType): string => {
    const typeMap = {
        [FishingSpotType.FRESHWATER]: '淡水',
        [FishingSpotType.SALTWATER]: '海水',
        [FishingSpotType.BLACK_PIT]: '黑坑',
        [FishingSpotType.RESERVOIR]: '水库',
        [FishingSpotType.RIVER]: '河流',
        [FishingSpotType.LAKE]: '湖泊'
    };
    return typeMap[type] || '未知';
};

const getSuitabilityClass = (index: number): string => {
    if (index >= 8) return 'excellent';
    if (index >= 6) return 'good';
    if (index >= 4) return 'fair';
    return 'poor';
};

const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
};

const formatHydrologyTime = (time: string): string => {
    const date = new Date(time);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const getWaterQualityClass = (quality: string): string => {
    switch (quality) {
        case '良好':
            return 'good';
        case '一般':
            return 'fair';
        case '较差':
            return 'poor';
        default:
            return '';
    }
};

const shareSpot = () => {
    showToast('分享功能开发中');
};



const goToWeatherDetail = () => {
    if (spotInfo.value) {
        router.push(`/spot/${spotInfo.value.id}/weather`);
    }
};

const goToWaterDetail = () => {
    if (spotInfo.value) {
        router.push(`/spot/${spotInfo.value.id}/water`);
    }
};

const refreshHydrology = () => {
    showToast('水文信息刷新功能开发中');
};

const toggleReviewLike = (review: any) => {
    review.isLiked = !review.isLiked;
    review.likes += review.isLiked ? 1 : -1;
    showToast(review.isLiked ? '点赞成功' : '取消点赞');
};

const afterRead = (file: any) => {
    console.log('上传文件:', file);
    showToast('图片上传功能开发中');
};

// 收藏功能
const toggleCollect = () => {
    isCollected.value = !isCollected.value;
    showToast(isCollected.value ? '收藏成功' : '取消收藏');
};

// 导航功能
const navigateToSpot = () => {
    if (spotInfo.value) {
        const { latitude, longitude } = spotInfo.value;
        // 使用高德地图导航
        const url = `https://uri.amap.com/navigation?to=${longitude},${latitude}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=0`;
        window.open(url, '_blank');
        showToast('正在打开导航');
    }
};

const submitReview = () => {
    if (!newReview.value.content.trim()) {
        showToast('请输入评价内容');
        return;
    }
    
    const review = {
        id: `review_${Date.now()}`,
        userId: 'current_user',
        username: '我',
        avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        content: newReview.value.content,
        createdAt: new Date(),
        likes: 0,
        rating: 5,
        images: [],
        isLiked: false
    };
    
    reviews.value.unshift(review);
    showReviewDialog.value = false;
    showToast('评价发布成功');
    
    // 重置表单
    newReview.value = {
        content: '',
        images: []
    };
};

// 生命周期
onMounted(async () => {
    try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const spot = mockSpotData[spotId.value];
        if (spot) {
            spotInfo.value = spot;
            reviews.value = [...mockReviews];
        } else {
            showToast('钓点信息未找到');
        }
    } catch (error) {
        showToast('加载失败');
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.spot-detail-page {
    min-height: 100vh;
    background: var(--van-background-color);
    padding-bottom: 80px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
}

.spot-content {
    padding-bottom: 20px;
}

/* 钓点图片展示 */
.spot-images {
    position: relative;
    width: 100%;
    height: 200px;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spot-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--van-text-color-2);
    font-size: 14px;
}

.no-image .van-icon {
    margin-bottom: 8px;
}

/* 基本信息 */
.spot-basic-info {
    padding: 16px;
    background: white;
    margin-bottom: 12px;
}

.spot-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.spot-name {
    font-size: 20px;
    font-weight: bold;
    color: var(--van-text-color);
    margin: 0;
    flex: 1;
}

.spot-type-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: white;
}

.spot-type-badge.lake {
    background: linear-gradient(45deg, #42A5F5, #1E88E5);
}

.spot-type-badge.reservoir {
    background: linear-gradient(45deg, #66BB6A, #4CAF50);
}

.spot-type-badge.river {
    background: linear-gradient(45deg, #26C6DA, #00BCD4);
}

.spot-type-badge.black_pit {
    background: linear-gradient(45deg, #78909C, #607D8B);
}

.address-section {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--van-text-color-2);
    font-size: 14px;
}

.address {
    flex: 1;
    margin-right: 8px;
}

/* 鱼种信息 */
.fish-species-section,
.description-section,
.weather-section,
.hydrology-section,
.strategy-section {
    background: white;
    margin-bottom: 8px;
    padding: 16px;
}

.fish-species-section h3,
.description-section h3,
.weather-section h3,
.hydrology-section h3,
.strategy-section h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--van-text-color);
}

.fish-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.fish-tag {
    margin-bottom: 4px;
}

/* 描述 */
.description-text {
    line-height: 1.6;
    color: var(--van-text-color-2);
    margin: 0;
}

.error-container {
    padding: 50px 20px;
    text-align: center;
}

/* 天气信息 */
.weather-card {
    background: linear-gradient(135deg, #42A5F5, #1E88E5);
    color: white;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.weather-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(66, 165, 245, 0.3);
}

.weather-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.temperature {
    font-size: 28px;
    font-weight: bold;
}

.weather-desc {
    font-size: 14px;
    opacity: 0.9;
}

.weather-icon {
    font-size: 32px;
}

.weather-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
}

.weather-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

.weather-item .label {
    opacity: 0.8;
}

.suitability.excellent {
    color: #4CAF50;
    font-weight: bold;
}

.suitability.good {
    color: #FF9800;
    font-weight: bold;
}

.suitability.fair {
    color: #FFC107;
}

.suitability.poor {
    color: #F44336;
}

/* 水文信息 */
.hydrology-card {
    background: linear-gradient(135deg, #42A5F5, #1E88E5);
    color: white;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.hydrology-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(66, 165, 245, 0.3);
}

.hydrology-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.update-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
}

.hydrology-main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
}

.hydrology-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.hydrology-icon {
    font-size: 24px;
}

.hydrology-content {
    flex: 1;
}

.hydrology-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2px;
}

.hydrology-value {
    font-size: 16px;
    font-weight: 600;
    color: white;
}

.hydrology-value.good {
    color: #4CAF50;
}

.hydrology-value.fair {
    color: #FF9800;
}

.hydrology-value.poor {
    color: #F44336;
}

/* 点击提示 */
.click-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 12px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.weather-card:hover .click-hint,
.hydrology-card:hover .click-hint {
    opacity: 1;
}

/* 钓点攻略 */
.strategy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.strategy-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.strategy-item {
    border: 1px solid var(--van-border-color);
    border-radius: 8px;
    padding: 12px;
}

.review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.reviewer-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
}

.reviewer-info {
    flex: 1;
}

.reviewer-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color);
}

.review-time {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.review-content {
    line-height: 1.5;
    color: var(--van-text-color-2);
    margin-bottom: 8px;
}

.review-images {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.review-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
    cursor: pointer;
}

.review-actions {
    display: flex;
    justify-content: flex-end;
}

/* 攻略弹窗 */
.strategy-dialog {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.dialog-header h3 {
    margin: 0;
    color: var(--van-text-color);
}

.image-upload {
    margin-top: 16px;
}

/* 底部操作栏 */
.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 12px 16px;
    border-top: 1px solid var(--van-border-color);
    display: flex;
    gap: 12px;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    font-weight: 600;
}

.collect-btn {
    background: var(--van-gray-1);
    border: 1px solid var(--van-border-color);
    color: var(--van-text-color);
}

.collect-btn.van-button--warning {
    background: #fff7e6;
    border-color: #ffa940;
    color: #fa8c16;
}

.navigate-btn {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    border: none;
    color: white;
}

/* 为底部操作栏预留空间 */
.spot-content {
    padding-bottom: 80px;
}
</style>