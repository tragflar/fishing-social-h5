<template>
    <div class="my-records-page">
        <!-- 页面头部 -->
        <van-nav-bar title="我的钓获" left-arrow @click-left="$router.back()">
            <template #right>
                <van-button size="small" type="primary" @click="$router.push('/record/add')">
                    添加记录
                </van-button>
            </template>
        </van-nav-bar>

        <!-- 数据统计 -->
        <div class="stats-card">
            <div class="stats-grid">
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
                        <div class="fish-name">{{ record.fishSpecies }}</div>
                        <div class="record-time">{{ formatDateTime(record.createdAt) }}</div>
                    </div>
                    <div class="record-weight">{{ record.weight }}kg</div>
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog, showImagePreview } from 'vant';
import type { WeatherInfo } from '../types/fishing';

const router = useRouter();

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
const records = ref<any[]>([]);

// 模拟记录数据
const mockRecords: any[] = [
    {
        id: 'record_1',
        userId: 'current_user',
        spotId: 'spot_1',
        spotName: '翠湖公园钓点',
        fishSpecies: '草鱼',
        weight: 2.5,
        length: 45,
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
        isNewSpecies: false,
        description: '今天天气不错，鱼口很好，用玉米粒钓到了一条不错的草鱼。'
    },
    {
        id: 'record_2',
        userId: 'current_user',
        spotId: 'spot_2',
        spotName: '野鸭湖水库',
        fishSpecies: '鲤鱼',
        weight: 1.8,
        length: 38,
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
        isNewSpecies: false,
        description: '阴天钓鱼，鱼儿比较活跃。'
    },
    {
        id: 'record_3',
        userId: 'current_user',
        spotId: 'spot_1',
        spotName: '翠湖公园钓点',
        fishSpecies: '鲫鱼',
        weight: 0.8,
        length: 25,
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
        isNewSpecies: true,
        description: '晴天钓鲫鱼，收获不错。'
    }
];

// 计算属性
const filteredRecords = computed(() => {
    let filtered = [...records.value];
    
    // 按类型筛选
    if (filterType.value !== 'all') {
        filtered = filtered.filter(record => {
            const freshwaterFish = ['鲫鱼', '草鱼', '鲤鱼', '黑鱼'];
            const saltwaterFish = ['带鱼', '鲈鱼', '石斑鱼'];
            
            if (filterType.value === 'freshwater') {
                return freshwaterFish.includes(record.fishSpecies);
            } else if (filterType.value === 'saltwater') {
                return saltwaterFish.includes(record.fishSpecies);
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
            now.getTime() - record.createdAt.getTime() <= limit
        );
    }
    
    // 排序
    filtered.sort((a, b) => {
        switch (sortBy.value) {
            case 'time_desc':
                return b.createdAt.getTime() - a.createdAt.getTime();
            case 'time_asc':
                return a.createdAt.getTime() - b.createdAt.getTime();
            case 'weight_desc':
                return b.weight - a.weight;
            case 'weight_asc':
                return a.weight - b.weight;
            default:
                return 0;
        }
    });
    
    return filtered;
});

const totalCatches = computed(() => records.value.length);
const totalWeight = computed(() => 
    records.value.reduce((sum, record) => sum + record.weight, 0).toFixed(1)
);
const uniqueSpecies = computed(() => 
    new Set(records.value.map(record => record.fishSpecies)).size
);
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
    showToast(`分享${record.fishSpecies}钓获记录`);
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

onMounted(() => {
    records.value = mockRecords;
});
</script>

<style scoped>
.my-records-page {
    min-height: 100vh;
    background: var(--van-background-color);
    padding-top: 46px;
}

.stats-card {
    background: white;
    margin: 12px;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    text-align: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 18px;
    font-weight: bold;
    color: var(--van-primary-color);
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.filter-section {
    margin: 0 12px 12px 12px;
}

.records-list {
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.record-card {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    position: relative;
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
    margin: 8px 0;
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