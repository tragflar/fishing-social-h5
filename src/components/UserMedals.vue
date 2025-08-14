<template>
    <div class="user-medals">
        <!-- 勋章网格 -->
        <div class="medals-grid">
            <div 
                v-for="medal in medalsList" 
                :key="medal.id"
                class="medal-item"
                :class="{ 
                    unlocked: medal.isUnlocked,
                    rare: medal.isRare 
                }"
                @click="viewMedalDetail(medal)"
            >
                <div class="medal-icon">
                    <div v-if="medal.isUnlocked" class="medal-image">
                        <van-icon :name="medal.icon" :color="medal.color" />
                        <div v-if="medal.isRare" class="rare-glow"></div>
                    </div>
                    <div v-else class="locked-medal">
                        <van-icon name="lock" color="#ccc" />
                    </div>
                </div>
                
                <div class="medal-name">
                    {{ medal.isUnlocked ? medal.name : '???' }}
                </div>
                
                <div class="medal-description">
                    {{ medal.isUnlocked ? medal.description : '未解锁' }}
                </div>
                
                <div v-if="medal.isUnlocked && medal.unlockTime" class="unlock-time">
                    {{ formatTime(medal.unlockTime) }}
                </div>
                
                <div v-if="!medal.isUnlocked && medal.requirement" class="requirement">
                    {{ medal.requirement }}
                </div>
            </div>
        </div>
        
        <!-- 空状态 -->
        <van-empty 
            v-if="medalsList.length === 0" 
            description="暂无勋章"
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

// 模拟勋章数据
const medalsList = ref([
    {
        id: '1',
        name: '首次钓获',
        description: '成功钓到第一条鱼',
        icon: 'medal',
        color: '#FFD700',
        category: 'catch',
        isUnlocked: true,
        isRare: false,
        unlockTime: '2024-01-01',
        requirement: null
    },
    {
        id: '2',
        name: '钓鱼达人',
        description: '累计钓获100条鱼',
        icon: 'star',
        color: '#1E88E5',
        category: 'catch',
        isUnlocked: true,
        isRare: true,
        unlockTime: '2024-01-15',
        requirement: null
    },
    {
        id: '3',
        name: '夜钓专家',
        description: '夜间钓鱼10次',
        icon: 'moon-o',
        color: '#6B46C1',
        category: 'skill',
        isUnlocked: false,
        isRare: false,
        unlockTime: null,
        requirement: '夜间钓鱼10次'
    },
    {
        id: '4',
        name: '社交达人',
        description: '获得100个点赞',
        icon: 'like',
        color: '#F59E0B',
        category: 'social',
        isUnlocked: false,
        isRare: false,
        unlockTime: null,
        requirement: '获得100个点赞'
    },
    {
        id: '5',
        name: '传说钓手',
        description: '钓获稀有鱼类',
        icon: 'trophy',
        color: '#DC2626',
        category: 'special',
        isUnlocked: false,
        isRare: true,
        unlockTime: null,
        requirement: '钓获传说级别鱼类'
    }
]);

// 格式化时间
const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    return time.toLocaleDateString();
};

// 查看勋章详情
const viewMedalDetail = (medal: any) => {
    if (medal.isUnlocked) {
        showToast(`${medal.name}: ${medal.description}`);
    } else {
        showToast(`解锁条件: ${medal.requirement}`);
    }
};

// 加载勋章数据
const loadMedalsData = async () => {
    try {
        console.log('加载用户勋章:', props.userId);
    } catch (error) {
        showToast('加载失败');
    }
};

onMounted(() => {
    loadMedalsData();
});
</script>

<style scoped>
.user-medals {
    padding: 16px;
}

.medals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.medal-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.medal-item:active {
    transform: scale(0.95);
}

.medal-item.unlocked {
    border: 2px solid #1E88E5;
}

.medal-item.rare {
    background: linear-gradient(45deg, #fff 0%, #f8f9ff 100%);
    border: 2px solid #FFD700;
}

.medal-item.rare::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
    border-radius: 12px;
    z-index: -1;
    animation: shine 2s infinite;
}

@keyframes shine {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

.medal-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.medal-image {
    position: relative;
    font-size: 40px;
}

.rare-glow {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: glow 2s infinite;
}

@keyframes glow {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 1; }
}

.locked-medal {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.medal-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
}

.medal-description {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.4;
}

.unlock-time {
    font-size: 10px;
    color: #999;
}

.requirement {
    font-size: 10px;
    color: #999;
    line-height: 1.3;
}
</style> 