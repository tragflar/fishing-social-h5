<template>
    <div class="user-records">
        <!-- 记录列表 -->
        <div class="records-list">
            <div 
                v-for="record in records" 
                :key="record.id"
                class="record-item"
                @click="viewRecordDetail(record)"
            >
                <div class="record-image">
                    <img :src="record.image" alt="钓获图片" />
                    <div v-if="record.isPersonalBest" class="best-badge">
                        个人最佳
                    </div>
                </div>
                
                <div class="record-info">
                    <div class="record-header">
                        <h3 class="fish-name">{{ record.fishName }}</h3>
                        <span class="record-time">{{ formatTime(record.time) }}</span>
                    </div>
                    
                    <div class="record-details">
                        <span class="weight-count">{{ record.weight }}kg × {{ record.count }}尾</span>
                        <span class="location">{{ record.location }}</span>
                    </div>
                    
                    <div class="record-tags">
                        <van-tag v-if="record.isPersonalBest" type="danger">
                            个人最佳
                        </van-tag>
                        <van-tag v-if="record.isNewSpecies" type="success">
                            新鱼种
                        </van-tag>
                    </div>
                </div>
                
                <van-icon name="arrow" class="arrow-icon" />
            </div>
        </div>
        
        <!-- 空状态 -->
        <van-empty 
            v-if="records.length === 0" 
            description="暂无钓获记录"
            image="https://img.yzcdn.cn/vant/custom-empty-image.png"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';

interface Props {
    userId: string;
}

const props = defineProps<Props>();

// 模拟钓获记录数据
const records = ref([
    {
        id: '1',
        fishName: '鲤鱼',
        weight: 2.5,
        count: 1,
        image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        time: '2024-01-15 14:30',
        location: '翠湖公园',
        isPersonalBest: true,
        isNewSpecies: false
    },
    {
        id: '2',
        fishName: '鲫鱼',
        weight: 0.8,
        count: 3,
        image: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        time: '2024-01-10 09:15',
        location: '金鱼池钓点',
        isPersonalBest: false,
        isNewSpecies: true
    },
    {
        id: '3',
        fishName: '草鱼',
        weight: 1.2,
        count: 2,
        image: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        time: '2024-01-08 16:45',
        location: '天鹅湖钓点',
        isPersonalBest: false,
        isNewSpecies: false
    }
]);

// 格式化时间
const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return '今天';
    } else if (days === 1) {
        return '昨天';
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return time.toLocaleDateString();
    }
};

// 查看记录详情
const viewRecordDetail = (record: any) => {
    showToast(`查看${record.fishName}记录详情`);
};

// 加载记录数据
const loadRecords = async () => {
    try {
        console.log('加载用户记录:', props.userId);
        // 这里可以调用API加载真实数据
    } catch (error) {
        showToast('加载失败');
    }
};

onMounted(() => {
    loadRecords();
});
</script>

<style scoped>
.user-records {
    padding: 16px;
}

.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.record-item {
    background: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s;
}

.record-item:active {
    transform: scale(0.98);
}

.record-image {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
}

.record-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.best-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #ff4444;
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
}

.record-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.fish-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.record-time {
    font-size: 12px;
    color: #999;
}

.record-details {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #666;
}

.record-tags {
    display: flex;
    gap: 8px;
}

.arrow-icon {
    color: #ccc;
    font-size: 16px;
}
</style> 