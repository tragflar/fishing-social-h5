<template>
    <div class="user-equipment">
        <!-- 装备列表 -->
        <div class="equipment-list">
            <div 
                v-for="equipment in equipmentList" 
                :key="equipment.id"
                class="equipment-item"
                @click="viewEquipmentDetail(equipment)"
            >
                <div class="equipment-image">
                    <img :src="equipment.image" :alt="equipment.name" />
                </div>
                
                <div class="equipment-info">
                    <div class="equipment-header">
                        <h3 class="equipment-name">{{ equipment.name }}</h3>
                        <span class="equipment-brand">{{ equipment.brand }}</span>
                    </div>
                    
                    <div class="equipment-rating">
                        <van-rate 
                            v-model="equipment.rating" 
                            :size="14" 
                            color="#ffd21e" 
                            void-color="#eee"
                            readonly
                        />
                        <span class="rating-text">({{ equipment.rating }})</span>
                    </div>
                    
                    <div class="equipment-meta">
                        <van-tag>
                            {{ getEquipmentTypeName(equipment.type) }}
                        </van-tag>
                        <span class="add-time">{{ formatTime(equipment.addTime) }}</span>
                    </div>
                </div>
                
                <van-icon name="arrow" class="arrow-icon" />
            </div>
        </div>
        
        <!-- 空状态 -->
        <van-empty 
            v-if="equipmentList.length === 0" 
            description="暂无装备"
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

// 模拟装备数据
const equipmentList = ref([
    {
        id: '1',
        name: '碳素钓鱼竿',
        brand: '迪佳',
        type: 'rod',
        image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        rating: 4.5,
        addTime: '2024-01-15'
    },
    {
        id: '2',
        name: '尼龙钓线',
        brand: '化氏',
        type: 'line',
        image: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        rating: 4.0,
        addTime: '2024-01-10'
    },
    {
        id: '3',
        name: '伊势尼鱼钩',
        brand: '欧娜',
        type: 'hook',
        image: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        rating: 4.8,
        addTime: '2024-01-08'
    },
    {
        id: '4',
        name: '蚯蚓饵料',
        brand: '自制',
        type: 'bait',
        image: 'https://img.yzcdn.cn/vant/apple-4.jpg',
        rating: 4.2,
        addTime: '2024-01-05'
    }
]);

// 获取装备类型名称
const getEquipmentTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
        rod: '鱼竿',
        line: '鱼线',
        hook: '鱼钩',
        bait: '饵料',
        accessory: '配件'
    };
    return typeMap[type] || type;
};

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
    } else if (days < 30) {
        return `${days}天前`;
    } else {
        return time.toLocaleDateString();
    }
};

// 查看装备详情
const viewEquipmentDetail = (equipment: any) => {
    showToast(`查看${equipment.name}详情`);
};

// 加载装备数据
const loadEquipmentData = async () => {
    try {
        console.log('加载用户装备:', props.userId);
    } catch (error) {
        showToast('加载失败');
    }
};

onMounted(() => {
    loadEquipmentData();
});
</script>

<style scoped>
.user-equipment {
    padding: 16px;
}

.equipment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.equipment-item {
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

.equipment-item:active {
    transform: scale(0.98);
}

.equipment-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
}

.equipment-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.equipment-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.equipment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.equipment-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.equipment-brand {
    font-size: 12px;
    color: #999;
}

.equipment-rating {
    display: flex;
    align-items: center;
    gap: 8px;
}

.rating-text {
    font-size: 12px;
    color: #666;
}

.equipment-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-time {
    font-size: 12px;
    color: #999;
}

.arrow-icon {
    color: #ccc;
    font-size: 16px;
}
</style> 