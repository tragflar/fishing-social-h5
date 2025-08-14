<template>
    <div class="collected-spots-page">
        <van-nav-bar title="我收藏的钓点" left-arrow @click-left="$router.back()" />
        <div class="spots-list">
            <div v-if="spots.length === 0" class="empty-state">
                <van-empty description="暂无收藏钓点" />
            </div>
            <div v-else>
                <div 
                    v-for="spot in spots" 
                    :key="spot.id" 
                    class="spot-card"
                    @click="goToSpotDetail(spot.id)"
                >
                    <img :src="spot.images[0]" class="spot-img" v-if="spot.images && spot.images.length" />
                    <div class="spot-info">
                        <div class="spot-name">{{ spot.name }}</div>
                        <div class="spot-address">{{ spot.address }}</div>
                        <div class="spot-meta">
                            <span>{{ spot.city }}</span>
                            <span class="spot-type">{{ getSpotTypeText(spot.type) }}</span>
                        </div>
                    </div>
                    <van-icon name="arrow" class="arrow-icon" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { FishingSpotType } from '../types/fishing';

const router = useRouter();

// mock收藏钓点数据
const spots = ref([
    {
        id: 'spot_1',
        name: '翠湖公园钓点',
        address: '北京市海淀区翠湖公园内',
        city: '北京',
        type: FishingSpotType.LAKE,
        images: ['https://img.yzcdn.cn/vant/apple-1.jpg']
    },
    {
        id: 'spot_2',
        name: '野鸭湖水库',
        address: '北京市延庆区野鸭湖湿地公园',
        city: '北京',
        type: FishingSpotType.RESERVOIR,
        images: ['https://img.yzcdn.cn/vant/apple-4.jpg']
    }
]);

const goToSpotDetail = (id: string) => {
    router.push({ name: 'SpotDetail', params: { id } });
};

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
</script>

<style scoped>
.collected-spots-page {
    min-height: 100vh;
    background: var(--van-background-color);
    overflow-y: auto;
}

.spots-list {
    padding: 16px;
    height: calc(100vh - 46px); /* 减去顶部导航栏的高度 */
    overflow-y: auto;
}
.spot-card {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 10px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(30, 136, 229, 0.08);
    cursor: pointer;
    transition: box-shadow 0.2s;
    padding: 10px 12px;
}
.spot-card:hover {
    box-shadow: 0 4px 16px rgba(30, 136, 229, 0.15);
}
.spot-img {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 12px;
}
.spot-info {
    flex: 1;
    min-width: 0;
}
.spot-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.spot-address {
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.spot-meta {
    font-size: 12px;
    color: #999;
    display: flex;
    gap: 12px;
}
.spot-type {
    color: #1e88e5;
}
.arrow-icon {
    color: #ccc;
    font-size: 18px;
    margin-left: 8px;
}
.empty-state {
    margin-top: 60px;
}
</style> 