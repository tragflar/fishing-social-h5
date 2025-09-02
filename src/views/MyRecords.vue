<template>
    <div class="my-records-page">
        <!-- 页面头部 -->
        <van-nav-bar title="我的钓获" left-arrow @click-left="$router.back()">
            <template #right>
                <van-button size="small" type="primary" @click="$router.push('/add-record')">
                    添加记录
                </van-button>
            </template>
        </van-nav-bar>

        <!-- 记录列表 -->
        <div class="records-list">
            <div 
                v-for="record in sortedRecords" 
                :key="record.id"
                class="record-card"
                @click="viewRecordDetail(record)"
            >
                <!-- 钓获内容 -->
                <div v-if="record.notes" class="record-content">
                    {{ record.notes }}
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

                <!-- 鱼种标签 -->
                <div class="record-tags">
                    <van-tag
                        v-for="(name, idx) in (record.fishCatches && record.fishCatches.length
                            ? record.fishCatches.map(fc => fc.fishSpecies)
                            : [record.fishSpecies])"
                        :key="idx"
                        type="primary"
                        plain
                        round
                        class="fish-tag"
                    >
                        {{ name }}
                    </van-tag>
                </div>

                <!-- 位置 -->
                <div class="record-details">
                    <div class="detail-item">
                        <van-icon name="location-o" />
                        <span>{{ record.spotName }}</span>
                    </div>
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
            <div v-if="sortedRecords.length === 0" class="empty-state">
                <van-empty description="暂无钓获记录">
                    <van-button 
                        type="primary" 
                        @click="$router.push('/add-record')"
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

// 记录数据
const records = ref<any[]>([]);

// 模拟记录数据 - 更新为支持多种鱼类
const mockRecords: any[] = [
    {
        id: 'record_1',
        userId: 'current_user',
        spotId: 'spot_1',
        spotName: '翠湖公园钓点',
        fishCatches: [
            { fishSpecies: '草鱼', count: 1, weight: 2.5 },
            { fishSpecies: '鲫鱼', count: 2, weight: 1.2 }
        ],
        // 保持向后兼容
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
        notes: '今天天气不错，鱼口很好，用玉米粒钓到了草鱼和鲫鱼。',
        catchTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 23,
        comments: [],
        isPersonalBest: true,
        isNewSpot: false,
        isNewSpecies: false,
        description: '今天天气不错，鱼口很好，用玉米粒钓到了草鱼和鲫鱼。'
    },
    {
        id: 'record_2',
        userId: 'current_user',
        spotId: 'spot_2',
        spotName: '野鸭湖水库',
        fishCatches: [
            { fishSpecies: '鲤鱼', count: 1, weight: 1.8 }
        ],
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
        fishCatches: [
            { fishSpecies: '鲫鱼', count: 3, weight: 0.8 },
            { fishSpecies: '白条', count: 5, weight: 0.3 }
        ],
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
        notes: '晴天钓鲫鱼，收获不错，还钓到了几条白条。',
        catchTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        likes: 8,
        comments: [],
        isPersonalBest: false,
        isNewSpot: false,
        isNewSpecies: true,
        description: '晴天钓鲫鱼，收获不错，还钓到了几条白条。'
    }
];

// 按创建时间倒序排序的计算属性
const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
});

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

const deleteRecord = (record: any) => {
    showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这条钓获记录吗？'
    }).then(() => {
        const index = records.value.findIndex(r => r.id === record.id);
        if (index > -1) {
            records.value.splice(index, 1);
            showToast('删除成功');
        }
    }).catch(() => {
        // 用户取消删除
    });
};

// 加载数据
const loadRecords = () => {
    // 从localStorage加载数据
    const savedRecords = localStorage.getItem('fishing_records');
    if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
            ...record,
            createdAt: new Date(record.createTime || record.createdAt),
            catchTime: new Date(record.catchTime)
        }));
        records.value = parsedRecords;
    } else {
        // 使用模拟数据
        records.value = mockRecords;
    }
};

onMounted(() => {
    loadRecords();
});
</script>

<style scoped>
.my-records-page {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.records-list {
    padding: 16px;
}

.record-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s ease;
}

.record-card:hover {
    transform: translateY(-2px);
}

/* 新：钓获内容 */
.record-content {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 12px;
    white-space: pre-wrap;
    word-break: break-word;
}

/* 图片区域保持不变 */
.record-images {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    overflow-x: auto;
}

.record-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
    flex-shrink: 0;
}

.more-images {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: #f5f5f5;
    border-radius: 8px;
    color: #666;
    font-size: 14px;
    flex-shrink: 0;
}

/* 新：鱼种标签 */
.record-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.fish-tag {
    padding: 2px 8px;
    font-size: 12px;
}

/* 位置与操作保持 */
.record-details {
    margin-bottom: 12px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 14px;
    color: #666;
}

.detail-item .van-icon {
    color: #1989fa;
    flex-shrink: 0;
}

.record-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
}

.record-actions .van-button {
    flex: 1;
    max-width: 80px;
}

.empty-state {
    padding: 40px 20px;
    text-align: center;
}

/* 正确的注释写法（如需保留说明就用这种写法） */
 /* 移除旧的头部/时间/重量风格 */
 /* .record-header, .record-info, .fish-name, .record-time, .record-weight { } */

/* 响应式 */
@media (max-width: 480px) {
    .records-list {
        padding: 12px;
    }
    
    .record-card {
        padding: 12px;
        margin-bottom: 12px;
    }
    
    .record-content {
        font-size: 15px;
    }
    
    .record-image {
        width: 60px;
        height: 60px;
    }
    
    .more-images {
        width: 60px;
        height: 60px;
    }
}
</style>