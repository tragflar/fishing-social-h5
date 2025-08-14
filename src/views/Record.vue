<template>
    <div class="record-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="钓获记录" fixed>
            <template #right>
                <van-icon name="plus" @click="$router.push('/record/add')" />
            </template>
        </van-nav-bar>

        <div class="record-content">
            <!-- 统计卡片 -->
            <div class="stats-section">
                <div class="stats-card">
                    <div class="stat-item">
                        <div class="stat-value">{{ totalCatches }}</div>
                        <div class="stat-label">总钓获</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ totalWeight }}kg</div>
                        <div class="stat-label">总重量</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ uniqueSpecies }}</div>
                        <div class="stat-label">鱼种数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ uniqueSpots }}</div>
                        <div class="stat-label">钓点数</div>
                    </div>
                </div>
            </div>

            <!-- 筛选栏 -->
            <div class="filter-section">
                <van-dropdown-menu>
                    <van-dropdown-item 
                        v-model="filterType" 
                        :options="typeOptions" 
                        title="类型"
                    />
                    <van-dropdown-item 
                        v-model="sortBy" 
                        :options="sortOptions" 
                        title="排序"
                    />
                    <van-dropdown-item 
                        v-model="timeRange" 
                        :options="timeOptions" 
                        title="时间"
                    />
                </van-dropdown-menu>
            </div>

            <!-- 记录列表 -->
            <div class="records-list">
                <div 
                    v-for="record in filteredRecords" 
                    :key="record.id"
                    class="record-card"
                    @click="viewRecordDetail(record)"
                >
                    <!-- 记录头部 -->
                    <div class="record-header">
                        <div class="record-info">
                            <div class="fish-name">
                                {{ record.fishCatches.map(fc => `${fc.fishSpecies}(${fc.count}尾)`).join('、') }}
                            </div>
                            <div class="record-time">{{ formatDateTime(record.catchTime) }}</div>
                        </div>
                        <div class="record-weight">
                            {{ record.fishCatches.reduce((sum, fc) => sum + fc.weight, 0).toFixed(1) }}kg
                        </div>
                    </div>

                    <!-- 记录图片 -->
                    <div v-if="record.images.length > 0" class="record-images">
                        <img 
                            v-for="(image, index) in record.images.slice(0, 3)" 
                            :key="index"
                            :src="image" 
                            :alt="`钓获图片${index + 1}`"
                            class="record-image"
                            @click.stop="previewImages(record.images, index)"
                        />
                        <div v-if="record.images.length > 3" class="more-images">
                            +{{ record.images.length - 3 }}
                        </div>
                    </div>

                    <!-- 记录详情 -->
                    <div class="record-details">
                        <div class="detail-item">
                            <van-icon name="location-o" />
                            <span>{{ record.spotName }}</span>
                        </div>
                        <div class="detail-item">
                            <van-icon name="clock-o" />
                            <span>{{ record.duration }}小时</span>
                        </div>
                        <div class="detail-item">
                            <van-icon name="shopping-cart-o" />
                            <span>{{ record.bait }}</span>
                        </div>
                        <div v-if="record.weather" class="detail-item">
                            <van-icon name="sun-o" />
                            <span>{{ record.weather.weather }}</span>
                        </div>
                    </div>

                    <!-- 记录标签 -->
                    <div class="record-tags">
                        <van-tag 
                            v-if="record.isPersonalBest" 
                            type="danger"
                        >
                            个人最佳
                        </van-tag>
                        <van-tag 
                            v-if="record.isNewSpot" 
                            type="success"
                        >
                            新钓点
                        </van-tag>
                        <van-tag 
                            v-if="record.isNewSpecies" 
                            type="primary"
                        >
                            新鱼种
                        </van-tag>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="record-actions">
                        <van-button 
                            type="default" 
                            size="small" 
                            icon="share-o"
                            @click.stop="shareRecord(record)"
                        >
                            分享
                        </van-button>
                        <van-button 
                            type="default" 
                            size="small" 
                            icon="edit"
                            @click.stop="editRecord(record)"
                        >
                            编辑
                        </van-button>
                        <van-button 
                            type="default" 
                            size="small" 
                            icon="delete-o"
                            @click.stop="deleteRecord(record)"
                        >
                            删除
                        </van-button>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-if="filteredRecords.length === 0" class="empty-state">
                    <van-empty description="暂无钓获记录">
                        <van-button 
                            type="primary" 
                            @click="$router.push('/record/add')"
                        >
                            添加第一条记录
                        </van-button>
                    </van-empty>
                </div>
            </div>

            <!-- 月度统计图表 -->
            <div class="chart-section">
                <h3>月度钓获趋势</h3>
                <div class="chart-container">
                    <div class="chart-placeholder">
                        <div class="chart-bars">
                            <div 
                                v-for="(month, index) in monthlyStats" 
                                :key="index"
                                class="chart-bar"
                                :style="{ height: `${month.count * 10}px` }"
                            >
                                <div class="bar-value">{{ month.count }}</div>
                                <div class="bar-label">{{ month.month }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部导航 -->
        <van-tabbar v-model="activeTab" fixed>
            <van-tabbar-item icon="location-o" to="/map">地图</van-tabbar-item>
            <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
            <van-tabbar-item icon="trophy-o" to="/ranking">排行</van-tabbar-item>
            <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>

        <!-- 浮动添加按钮 -->
        <button class="fab-button" @click="$router.push('/record/add')">
            <van-icon name="plus" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showImagePreview, showConfirmDialog } from 'vant';
import { type CatchRecord, type WeatherInfo } from '../types/fishing';

const router = useRouter();
const activeTab = ref(3);

// 筛选相关
const filterType = ref('all');
const sortBy = ref('time_desc');
const timeRange = ref('all');

// 筛选选项
const typeOptions = [
    { text: '全部类型', value: 'all' },
    { text: '淡水鱼', value: 'freshwater' },
    { text: '海水鱼', value: 'saltwater' }
];

const sortOptions = [
    { text: '时间倒序', value: 'time_desc' },
    { text: '时间正序', value: 'time_asc' },
    { text: '重量倒序', value: 'weight_desc' },
    { text: '重量正序', value: 'weight_asc' }
];

const timeOptions = [
    { text: '全部时间', value: 'all' },
    { text: '最近一周', value: 'week' },
    { text: '最近一月', value: 'month' },
    { text: '最近三月', value: 'quarter' }
];

// 记录数据
const records = ref<(CatchRecord & { 
    spotName: string; 
    duration: number; 
    bait: string;
    isPersonalBest: boolean;
    isNewSpot: boolean;
    isNewSpecies: boolean;
})[]>([]);

// 模拟数据
const mockRecords = [
    {
        id: 'record_1',
        userId: 'current_user',
        spotId: 'spot_1',
        spotName: '翠湖公园钓点',
        fishCatches: [
            { fishSpecies: '草鱼', count: 1, weight: 2.5 }
        ],
        images: [
            'https://img.yzcdn.cn/vant/apple-1.jpg',
            'https://img.yzcdn.cn/vant/apple-2.jpg'
        ],
        equipment: ['4.5米钓竿', '2号主线', '1号子线'],
        bait: '玉米粒',
        duration: 3.5,
        weather: {
            temperature: 22,
            humidity: 65,
            pressure: 1013,
            windSpeed: 3.2,
            windDirection: '东南风',
            weather: '多云',
            suitabilityIndex: 8
        } as WeatherInfo,
        notes: '今天天气不错，鱼口很好，用玉米粒钓到了一条不错的草鱼。',
        catchTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 23,
        comments: [],
        isPersonalBest: true,
        isNewSpot: false,
        isNewSpecies: false
    },
    {
        id: 'record_2',
        userId: 'current_user',
        spotId: 'spot_2',
        spotName: '野鸭湖水库',
        fishCatches: [
            { fishSpecies: '鲤鱼', count: 1, weight: 1.8 },
            { fishSpecies: '鲫鱼', count: 3, weight: 0.6 }
        ],
        images: ['https://img.yzcdn.cn/vant/apple-3.jpg'],
        equipment: ['5.4米钓竿', '3号主线', '2号子线'],
        bait: '蚯蚓',
        duration: 4,
        weather: {
            temperature: 18,
            humidity: 70,
            pressure: 1008,
            windSpeed: 2.1,
            windDirection: '北风',
            weather: '阴天',
            suitabilityIndex: 7
        } as WeatherInfo,
        notes: '阴天钓鱼，鱼儿比较活跃。',
        catchTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        likes: 15,
        comments: [],
        isPersonalBest: false,
        isNewSpot: true,
        isNewSpecies: false
    },
    {
        id: 'record_3',
        userId: 'current_user',
        spotId: 'spot_1',
        spotName: '翠湖公园钓点',
        fishCatches: [
            { fishSpecies: '鲫鱼', count: 2, weight: 0.8 }
        ],
        images: [],
        equipment: ['3.6米钓竿', '1号主线', '0.8号子线'],
        bait: '红虫',
        duration: 2,
        weather: {
            temperature: 25,
            humidity: 60,
            pressure: 1015,
            windSpeed: 1.5,
            windDirection: '微风',
            weather: '晴天',
            suitabilityIndex: 9
        } as WeatherInfo,
        notes: '晴天钓鲫鱼，收获不错。',
        catchTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        likes: 8,
        comments: [],
        isPersonalBest: false,
        isNewSpot: false,
        isNewSpecies: true
    },
    {
        id: 'record_4',
        userId: 'current_user',
        spotId: 'spot_2',
        spotName: '野鸭湖水库',
        fishCatches: [
            { fishSpecies: '黑鱼', count: 1, weight: 3.2 }
        ],
        images: [
            'https://img.yzcdn.cn/vant/apple-4.jpg',
            'https://img.yzcdn.cn/vant/apple-5.jpg',
            'https://img.yzcdn.cn/vant/apple-1.jpg',
            'https://img.yzcdn.cn/vant/apple-2.jpg'
        ],
        equipment: ['6.3米钓竿', '4号主线', '3号子线'],
        bait: '小鱼',
        duration: 5,
        weather: {
            temperature: 20,
            humidity: 75,
            pressure: 1010,
            windSpeed: 4.2,
            windDirection: '东风',
            weather: '小雨',
            suitabilityIndex: 6
        } as WeatherInfo,
        notes: '雨天钓黑鱼，意外收获一条大家伙！',
        catchTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        likes: 32,
        comments: [],
        isPersonalBest: true,
        isNewSpot: false,
        isNewSpecies: true
    }
];

// 月度统计数据
const monthlyStats = ref([
    { month: '1月', count: 5 },
    { month: '2月', count: 8 },
    { month: '3月', count: 12 },
    { month: '4月', count: 15 },
    { month: '5月', count: 18 },
    { month: '6月', count: 22 }
]);

// 计算属性
const filteredRecords = computed(() => {
    let filtered = [...records.value];
    
    // 按类型筛选
    if (filterType.value !== 'all') {
        filtered = filtered.filter(record => {
            const freshwaterFish = ['鲫鱼', '草鱼', '鲤鱼', '黑鱼'];
            const saltwaterFish = ['带鱼', '鲈鱼', '石斑鱼'];
            
            if (filterType.value === 'freshwater') {
                return record.fishCatches.some(fc => freshwaterFish.includes(fc.fishSpecies));
            } else if (filterType.value === 'saltwater') {
                return record.fishCatches.some(fc => saltwaterFish.includes(fc.fishSpecies));
            }
            return true;
        });
    }
    
    // 按时间筛选
    if (timeRange.value !== 'all') {
        const now = new Date();
        const timeLimit = {
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
            'quarter': 90 * 24 * 60 * 60 * 1000
        };
        
        const limit = timeLimit[timeRange.value as keyof typeof timeLimit];
        filtered = filtered.filter(record => 
            now.getTime() - record.catchTime.getTime() <= limit
        );
    }
    
    // 排序
    filtered.sort((a, b) => {
        switch (sortBy.value) {
            case 'time_desc':
                return b.catchTime.getTime() - a.catchTime.getTime();
            case 'time_asc':
                return a.catchTime.getTime() - b.catchTime.getTime();
            case 'weight_desc':
                const aWeight = a.fishCatches.reduce((sum, fc) => sum + fc.weight, 0);
                const bWeight = b.fishCatches.reduce((sum, fc) => sum + fc.weight, 0);
                return bWeight - aWeight;
            case 'weight_asc':
                const aWeightAsc = a.fishCatches.reduce((sum, fc) => sum + fc.weight, 0);
                const bWeightAsc = b.fishCatches.reduce((sum, fc) => sum + fc.weight, 0);
                return aWeightAsc - bWeightAsc;
            default:
                return 0;
        }
    });
    
    return filtered;
});

const totalCatches = computed(() => records.value.length);
const totalWeight = computed(() => {
    const total = records.value.reduce((sum, record) => {
        return sum + record.fishCatches.reduce((fishSum, fc) => fishSum + fc.weight, 0);
    }, 0);
    return total.toFixed(1);
});
const uniqueSpecies = computed(() => {
    const speciesSet = new Set<string>();
    records.value.forEach(record => {
        record.fishCatches.forEach(fc => speciesSet.add(fc.fishSpecies));
    });
    return speciesSet.size;
});
const uniqueSpots = computed(() => 
    new Set(records.value.map(record => record.spotId)).size
);

// 工具函数
const formatDateTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
};

// 事件处理
const previewImages = (images: string[], startIndex: number) => {
    showImagePreview({
        images,
        startPosition: startIndex
    });
};

const viewRecordDetail = (record: any) => {
    showToast('记录详情功能开发中');
};

const shareRecord = (record: any) => {
    const fishNames = record.fishCatches.map((fc: any) => fc.fishSpecies).join('、');
    showToast(`分享${fishNames}钓获记录`);
};

const editRecord = (record: any) => {
    showToast('编辑记录功能开发中');
};

const deleteRecord = async (record: any) => {
    try {
        await showConfirmDialog({
            title: '确认删除',
            message: '确定要删除这条钓获记录吗？'
        });
        
        const index = records.value.findIndex(r => r.id === record.id);
        if (index > -1) {
            records.value.splice(index, 1);
            showToast('删除成功');
        }
    } catch {
        // 用户取消删除
    }
};

// 生命周期
onMounted(() => {
    records.value = [...mockRecords];
});
</script>

<style scoped>
.record-page {
    min-height: 100vh;
    background: var(--van-background-color);
    padding-top: 46px;
    padding-bottom: 60px;
    overflow-y: auto;
}

.record-content {
    padding: 12px;
    height: calc(100vh - 106px); /* 减去顶部导航栏和底部导航栏的高度 */
    overflow-y: auto;
}

/* 统计卡片 */
.stats-section {
    margin-bottom: 12px;
}

.stats-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-around;
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--van-primary-color);
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: var(--van-text-color-3);
}

/* 筛选栏 */
.filter-section {
    margin-bottom: 12px;
}

/* 记录列表 */
.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.record-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
}

.record-card:active {
    transform: scale(0.98);
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.fish-name {
    font-size: 18px;
    font-weight: bold;
    color: var(--van-text-color);
    margin-bottom: 4px;
}

.record-time {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.record-weight {
    font-size: 20px;
    font-weight: bold;
    color: var(--van-primary-color);
}

.record-images {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    position: relative;
}

.record-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
}

.more-images {
    position: absolute;
    right: 8px;
    top: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.record-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
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
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
}

/* 图表区域 */
.chart-section {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
}

.chart-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--van-text-color);
}

.chart-container {
    height: 120px;
}

.chart-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    height: 100px;
}

.chart-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 20px;
    background: linear-gradient(to top, var(--van-primary-color), var(--van-primary-color-light));
    border-radius: 4px 4px 0 0;
    width: 30px;
    position: relative;
}

.bar-value {
    position: absolute;
    top: -20px;
    font-size: 10px;
    color: var(--van-text-color-2);
    font-weight: 500;
}

.bar-label {
    margin-top: 8px;
    font-size: 10px;
    color: var(--van-text-color-3);
}

:deep(.van-dropdown-menu) {
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
}
</style>