<template>
    <div class="user-fish-guide">
        <!-- 鱼类网格 -->
        <div class="fish-grid">
            <div 
                v-for="fish in fishList" 
                :key="fish.id"
                class="fish-item"
                :class="{ unlocked: fish.isUnlocked }"
                @click="viewFishDetail(fish)"
            >
                <div class="fish-icon">
                    <img v-if="fish.isUnlocked" :src="fish.icon" :alt="fish.name" />
                    <div v-else class="locked-icon">
                        <van-icon name="question" />
                    </div>
                </div>
                <div class="fish-name">
                    {{ fish.isUnlocked ? fish.name : '???' }}
                </div>
                <div v-if="fish.isUnlocked && fish.unlockTime" class="unlock-time">
                    {{ formatUnlockTime(fish.unlockTime) }}
                </div>
            </div>
        </div>
        
        <!-- 空状态 -->
        <van-empty 
            v-if="fishList.length === 0" 
            description="暂无鱼类数据"
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

// 模拟鱼类数据
const fishList = ref([
    {
        id: '1',
        name: '鲤鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        category: 'freshwater',
        isUnlocked: true,
        unlockTime: '2024-01-15'
    },
    {
        id: '2',
        name: '鲫鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        category: 'freshwater',
        isUnlocked: true,
        unlockTime: '2024-01-10'
    },
    {
        id: '3',
        name: '草鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        category: 'freshwater',
        isUnlocked: true,
        unlockTime: '2024-01-08'
    },
    {
        id: '4',
        name: '带鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-4.jpg',
        category: 'saltwater',
        isUnlocked: false,
        unlockTime: null
    },
    {
        id: '5',
        name: '黄鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-5.jpg',
        category: 'saltwater',
        isUnlocked: false,
        unlockTime: null
    },
    {
        id: '6',
        name: '金鱼',
        icon: 'https://img.yzcdn.cn/vant/apple-6.jpg',
        category: 'ornamental',
        isUnlocked: false,
        unlockTime: null
    }
]);

// 格式化解锁时间
const formatUnlockTime = (timeStr: string) => {
    const time = new Date(timeStr);
    return time.toLocaleDateString();
};

// 查看鱼类详情
const viewFishDetail = (fish: any) => {
    if (fish.isUnlocked) {
        showToast(`查看${fish.name}详情`);
    } else {
        showToast('该鱼类尚未解锁');
    }
};

// 加载鱼类数据
const loadFishData = async () => {
    try {
        console.log('加载用户鱼类图鉴:', props.userId);
    } catch (error) {
        showToast('加载失败');
    }
};

onMounted(() => {
    loadFishData();
});
</script>

<style scoped>
.user-fish-guide {
    padding: 16px;
}

.fish-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.fish-item {
    background: white;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
}

.fish-item:active {
    transform: scale(0.95);
}

.fish-item.unlocked {
    border: 2px solid #1E88E5;
}

.fish-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 8px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fish-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.locked-icon {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 24px;
}

.fish-name {
    font-size: 12px;
    color: #333;
    margin-bottom: 4px;
    font-weight: 500;
}

.unlock-time {
    font-size: 10px;
    color: #999;
}
</style> 