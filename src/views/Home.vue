<template>
    <div class="home-page">
        <!-- 地图主体区域 -->
        <div class="map-container">
            <div class="fishing-map">
                <!-- 模拟地图背景 -->
                <div class="map-background">
                    <div class="map-grid"></div>

                    <!-- 主要道路 -->
                    <div class="main-roads">
                        <div class="main-road" style="top: 20%; left: 10%; width: 80%; height: 4px;"></div>
                        <div class="main-road" style="top: 10%; left: 20%; width: 4px; height: 80%;"></div>
                        <div class="main-road" style="top: 60%; left: 30%; width: 60%; height: 4px;"></div>
                    </div>

                    <!-- 次要道路 -->
                    <div class="minor-roads">
                        <div class="minor-road" style="top: 30%; left: 15%; width: 70%; height: 2px;"></div>
                        <div class="minor-road" style="top: 15%; left: 40%; width: 2px; height: 70%;"></div>
                        <div class="minor-road" style="top: 45%; left: 25%; width: 50%; height: 2px;"></div>
                    </div>

                    <!-- 绿地区域 -->
                    <div class="green-areas">
                        <div class="green-area" style="top: 25%; left: 25%; width: 100px; height: 100px; border-radius: 10px;"></div>
                        <div class="green-area" style="top: 55%; left: 65%; width: 80px; height: 120px; border-radius: 8px;"></div>
                    </div>

                    <!-- 建筑物 -->
                    <div class="buildings">
                        <div class="building" style="top: 35%; left: 35%; width: 60px; height: 40px; border-radius: 4px;"></div>
                        <div class="building" style="top: 45%; left: 55%; width: 50px; height: 70px; border-radius: 4px;"></div>
                        <div class="building" style="top: 65%; left: 25%; width: 40px; height: 40px; border-radius: 4px;"></div>
                    </div>

                    <!-- 道路名称标注 -->
                    <div class="road-labels">
                        <div class="road-label" style="top: 22%; left: 50%;">九兴大道</div>
                        <div class="road-label" style="top: 50%; left: 22%; transform: rotate(-90deg) translate(-50%, -50%);">科园二路</div>
                        <div class="road-label" style="top: 62%; left: 60%;">紫瑞大道</div>
                    </div>

                    <!-- 钓点标记 -->
                    <div 
                        v-for="spot in filteredSpots" 
                        :key="spot.id"
                        class="spot-marker"
                        :class="{ active: selectedSpot?.id === spot.id }"
                        :style="getMarkerPosition(spot)"
                        @click="selectSpotOnMap(spot)"
                    >
                        <div class="marker-icon">
                            <van-icon :name="getSpotTypeIcon(spot.type)" />
                        </div>
                        <div class="marker-info">
                            {{ spot.name }} · {{ spot.distance }}km
                        </div>
                    </div>

                    <!-- 用户当前位置 -->
                    <div class="current-location">
                        <div class="location-pulse"></div>
                        <div class="location-dot"></div>
                    </div>
                </div>
                
                <!-- 地图缩放控件 -->
                <div class="zoom-controls">
                    <button class="zoom-btn" @click="zoomIn">
                        <van-icon name="plus" />
                    </button>
                    <button class="zoom-btn" @click="zoomOut">
                        <van-icon name="minus" />
                    </button>
                </div>

                <!-- 地图控制按钮 -->
                <div class="map-controls">
                    <van-button icon="aim" @click="locateMe" class="locate-btn" />
                    <van-button icon="apps-o" @click="toggleView" class="layers-btn" />
                    <van-button icon="plus" @click="goToAddSpot" class="add-spot-btn">
                        发布钓点
                    </van-button>
                </div>

                <!-- 地图比例尺 -->
                <div class="map-scale">
                    <div class="scale-line"></div>
                    <span>500m</span>
                </div>
            </div>
        </div>

        <!-- 底部筛选栏 -->
        <div class="filter-tabs">
            <div class="tab-scroll">
                <div 
                    v-for="filter in filterTabs" 
                    :key="filter.key"
                    class="filter-tab"
                    :class="{ active: activeFilter === filter.key }"
                    @click="setActiveFilter(filter.key)"
                >
                    {{ filter.label }}
                    <van-icon v-if="filter.hasDropdown" name="arrow-down" />
                </div>
            </div>
        </div>

        <!-- 底部钓点列表 -->
        <div class="spots-list-container" :class="{ 'list-hidden': !isListVisible }">
            <div class="hide-button" @click="toggleList">
                <div class="handle-bar"></div>
            </div>
            <div class="list-content">
                <div class="filter-section">
                    <div 
                        v-for="filter in filterTabs" 
                        :key="filter.key"
                        class="filter-button"
                        :class="{ active: activeFilter === filter.key }"
                        @click="setActiveFilter(filter.key)"
                    >
                        {{ filter.label }}
                        <van-icon v-if="filter.hasDropdown" name="arrow-down" />
                    </div>
                </div>
                <div class="list-header">
                    <div class="result-count">共{{ filteredSpots.length }}个钓点</div>
                </div>
                
                <div class="spots-list">
                    <div 
                        v-for="(spot, index) in displayedSpots" 
                        :key="spot.id"
                        class="spot-card-item"
                        @click="viewSpotDetail(spot)"
                    >
                        <!-- 钓点图片 -->
                        <div class="spot-image">
                            <img :src="spot.images[0]" alt="钓点图片" />
                        </div>
                        
                        <!-- 钓点信息 -->
                        <div class="spot-info">
                            <div class="spot-header">
                                <h3 class="spot-name">{{ spot.name }}</h3>
                            </div>
                            
                            <div class="spot-fish-species">
                                <span class="species-label">鱼种：</span>
                                <span class="species-list">{{ spot.fishSpecies.join('、') }}</span>
                            </div>
                            
                            <div class="spot-meta">
                                <span class="spot-type">{{ spot.type }}</span>
                                <span class="spot-distance">{{ spot.distance }}km</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选弹窗 -->
        <van-popup 
            v-model:show="showFilterPopup" 
            position="bottom" 
            :style="{ maxHeight: '70%' }"
        >
            <div class="filter-popup">
                <div class="popup-header">
                    <h3>{{ getFilterTitle(activeFilter) }}</h3>
                    <van-icon name="cross" @click="showFilterPopup = false" />
                </div>
                <div class="popup-content">
                    <!-- 附近筛选 -->
                    <div v-if="activeFilter === 'nearby'" class="filter-options">
                        <div 
                            v-for="option in distanceOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ active: selectedDistance === option.value }"
                            @click="selectDistance(option.value)"
                        >
                            {{ option.text }}
                        </div>
                    </div>
                    
                    <!-- 排序筛选 -->
                    <div v-if="activeFilter === 'sort'" class="filter-options">
                        <div 
                            v-for="option in sortOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ active: selectedSort === option.value }"
                            @click="selectSort(option.value)"
                        >
                            {{ option.text }}
                        </div>
                    </div>
                    
                    <!-- 类型筛选 -->
                    <div v-if="activeFilter === 'type'" class="filter-options">
                        <div 
                            v-for="option in typeOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ active: selectedType === option.value }"
                            @click="selectType(option.value)"
                        >
                            {{ option.text }}
                        </div>
                    </div>
                    
                    <!-- 鱼种筛选 -->
                    <div v-if="activeFilter === 'fish'" class="filter-options">
                        <div 
                            v-for="option in fishOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ active: selectedFish === option.value }"
                            @click="selectFish(option.value)"
                        >
                            {{ option.text }}
                        </div>
                    </div>
                </div>
            </div>
        </van-popup>
        
        <!-- 底部导航栏 -->
        <van-tabbar v-model="activeTab" @change="onTabChange" fixed placeholder>
            <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
            <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { UserLevel, type User } from '../types/fishing';

const router = useRouter();

// 钓点数据
interface SpotData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    images: string[];
    description: string;
    rating: number;
    distance: number;
    type: string;
    location: string;
    rank: number;
    recentCatches: number;
    currentPeople: number;
    fishSpecies: string[];
}

const spots = ref<SpotData[]>([
    {
        id: 'spot_1',
        name: '金鱼池钓点',
        latitude: 39.9042,
        longitude: 116.4074,
        images: ['https://img.yzcdn.cn/vant/apple-1.jpg'],
        description: '环境优美，水质清澈，适合各种钓法。',
        rating: 4.8,
        distance: 2.7,
        type: 'lake',
        location: '成都市锦江区',
        rank: 1,
        recentCatches: 152,
        currentPeople: 8,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼']
    },
    {
        id: 'spot_2',
        name: '天鹅湖钓点',
        latitude: 39.9142,
        longitude: 116.4174,
        images: ['https://img.yzcdn.cn/vant/apple-2.jpg'],
        description: '水库环境好，鱼获丰富。',
        rating: 4.8,
        distance: 2.7,
        type: 'reservoir',
        location: '成都市青羊区',
        rank: 2,
        recentCatches: 98,
        currentPeople: 5,
        fishSpecies: ['鲫鱼', '鲤鱼', '鲢鱼']
    },
    {
        id: 'spot_3',
        name: '翠湖公园钓点',
        latitude: 39.8942,
        longitude: 116.3974,
        images: ['https://img.yzcdn.cn/vant/apple-3.jpg'],
        description: '城市中心的休闲钓点。',
        rating: 4.9,
        distance: 4.9,
        type: 'lake',
        location: '成都市武侯区',
        rank: 3,
        recentCatches: 76,
        currentPeople: 12,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼']
    },
    {
        id: 'spot_4',
        name: '青羊湖钓点',
        latitude: 39.9242,
        longitude: 116.4274,
        images: ['https://img.yzcdn.cn/vant/apple-4.jpg'],
        description: '青羊区知名钓点，环境优美，鱼种丰富。',
        rating: 4.7,
        distance: 3.2,
        type: 'lake',
        location: '成都市青羊区',
        rank: 4,
        recentCatches: 89,
        currentPeople: 6,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼']
    },
    {
        id: 'spot_5',
        name: '锦江黑坑',
        latitude: 39.8842,
        longitude: 116.3874,
        images: ['https://img.yzcdn.cn/vant/apple-5.jpg'],
        description: '专业黑坑钓场，设备齐全，适合竞技钓鱼。',
        rating: 4.6,
        distance: 5.1,
        type: 'black_pit',
        location: '成都市锦江区',
        rank: 5,
        recentCatches: 134,
        currentPeople: 15,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '青鱼']
    },
    {
        id: 'spot_6',
        name: '双流水库',
        latitude: 39.9342,
        longitude: 116.4374,
        images: ['https://img.yzcdn.cn/vant/apple-6.jpg'],
        description: '大型水库钓点，水质优良，适合野钓。',
        rating: 4.9,
        distance: 8.3,
        type: 'reservoir',
        location: '成都市双流区',
        rank: 6,
        recentCatches: 67,
        currentPeople: 4,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼']
    },
    {
        id: 'spot_7',
        name: '龙泉山溪流',
        latitude: 39.8742,
        longitude: 116.3774,
        images: ['https://img.yzcdn.cn/vant/apple-7.jpg'],
        description: '山间溪流钓点，环境原始，适合溪流钓法。',
        rating: 4.5,
        distance: 12.7,
        type: 'river',
        location: '成都市龙泉驿区',
        rank: 7,
        recentCatches: 45,
        currentPeople: 3,
        fishSpecies: ['马口鱼', '溪石斑', '小鲫鱼']
    },
    {
        id: 'spot_8',
        name: '温江鱼塘',
        latitude: 39.9442,
        longitude: 116.4474,
        images: ['https://img.yzcdn.cn/vant/apple-8.jpg'],
        description: '专业鱼塘，鱼密度高，适合新手练习。',
        rating: 4.4,
        distance: 15.2,
        type: 'lake',
        location: '成都市温江区',
        rank: 8,
        recentCatches: 156,
        currentPeople: 18,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼']
    },
    {
        id: 'spot_9',
        name: '新都野钓场',
        latitude: 39.8642,
        longitude: 116.3674,
        images: ['https://img.yzcdn.cn/vant/apple-9.jpg'],
        description: '野钓天堂，环境自然，鱼获丰富。',
        rating: 4.8,
        distance: 18.9,
        type: 'lake',
        location: '成都市新都区',
        rank: 9,
        recentCatches: 78,
        currentPeople: 7,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼']
    },
    {
        id: 'spot_10',
        name: '郫都竞技池',
        latitude: 39.9542,
        longitude: 116.4574,
        images: ['https://img.yzcdn.cn/vant/apple-10.jpg'],
        description: '专业竞技钓场，举办各类钓鱼比赛。',
        rating: 4.7,
        distance: 22.1,
        type: 'black_pit',
        location: '成都市郫都区',
        rank: 10,
        recentCatches: 92,
        currentPeople: 12,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '青鱼']
    },
    {
        id: 'spot_11',
        name: '都江堰灌渠',
        latitude: 39.8442,
        longitude: 116.3574,
        images: ['https://img.yzcdn.cn/vant/apple-11.jpg'],
        description: '灌渠钓点，水流稳定，适合台钓。',
        rating: 4.3,
        distance: 25.6,
        type: 'river',
        location: '成都市都江堰市',
        rank: 11,
        recentCatches: 56,
        currentPeople: 5,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼']
    },
    {
        id: 'spot_12',
        name: '彭州山塘',
        latitude: 39.9642,
        longitude: 116.4674,
        images: ['https://img.yzcdn.cn/vant/apple-12.jpg'],
        description: '山间小塘，环境幽静，适合休闲钓鱼。',
        rating: 4.6,
        distance: 28.3,
        type: 'lake',
        location: '成都市彭州市',
        rank: 12,
        recentCatches: 43,
        currentPeople: 2,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼']
    },
    {
        id: 'spot_13',
        name: '崇州水库',
        latitude: 39.8342,
        longitude: 116.3474,
        images: ['https://img.yzcdn.cn/vant/apple-13.jpg'],
        description: '大型水库，水质清澈，适合各种钓法。',
        rating: 4.8,
        distance: 31.7,
        type: 'reservoir',
        location: '成都市崇州市',
        rank: 13,
        recentCatches: 89,
        currentPeople: 6,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '青鱼']
    },
    {
        id: 'spot_14',
        name: '大邑野钓场',
        latitude: 39.9742,
        longitude: 116.4774,
        images: ['https://img.yzcdn.cn/vant/apple-14.jpg'],
        description: '野钓胜地，环境优美，鱼种丰富。',
        rating: 4.7,
        distance: 34.2,
        type: 'lake',
        location: '成都市大邑县',
        rank: 14,
        recentCatches: 67,
        currentPeople: 4,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼']
    },
    {
        id: 'spot_15',
        name: '蒲江溪流',
        latitude: 39.8242,
        longitude: 116.3374,
        images: ['https://img.yzcdn.cn/vant/apple-15.jpg'],
        description: '溪流钓点，水流湍急，适合路亚钓法。',
        rating: 4.4,
        distance: 37.8,
        type: 'river',
        location: '成都市蒲江县',
        rank: 15,
        recentCatches: 38,
        currentPeople: 3,
        fishSpecies: ['马口鱼', '溪石斑', '小鲫鱼', '白条']
    },
    {
        id: 'spot_16',
        name: '新津鱼塘',
        latitude: 39.9842,
        longitude: 116.4874,
        images: ['https://img.yzcdn.cn/vant/apple-16.jpg'],
        description: '专业鱼塘，设备完善，适合新手。',
        rating: 4.5,
        distance: 41.3,
        type: 'lake',
        location: '成都市新津区',
        rank: 16,
        recentCatches: 123,
        currentPeople: 16,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼']
    },
    {
        id: 'spot_17',
        name: '简阳水库',
        latitude: 39.8142,
        longitude: 116.3274,
        images: ['https://img.yzcdn.cn/vant/apple-17.jpg'],
        description: '大型水库，环境优美，适合野钓。',
        rating: 4.6,
        distance: 44.9,
        type: 'reservoir',
        location: '成都市简阳市',
        rank: 17,
        recentCatches: 71,
        currentPeople: 5,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '青鱼']
    },
    {
        id: 'spot_18',
        name: '金堂野钓场',
        latitude: 39.9942,
        longitude: 116.4974,
        images: ['https://img.yzcdn.cn/vant/apple-18.jpg'],
        description: '野钓天堂，环境自然，鱼获丰富。',
        rating: 4.7,
        distance: 47.6,
        type: 'lake',
        location: '成都市金堂县',
        rank: 18,
        recentCatches: 58,
        currentPeople: 4,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼']
    },
    {
        id: 'spot_19',
        name: '邛崃山塘',
        latitude: 39.8042,
        longitude: 116.3174,
        images: ['https://img.yzcdn.cn/vant/apple-19.jpg'],
        description: '山间小塘，环境幽静，适合休闲钓鱼。',
        rating: 4.4,
        distance: 51.2,
        type: 'lake',
        location: '成都市邛崃市',
        rank: 19,
        recentCatches: 42,
        currentPeople: 2,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼']
    },
    {
        id: 'spot_20',
        name: '青白江钓场',
        latitude: 39.9942,
        longitude: 116.5074,
        images: ['https://img.yzcdn.cn/vant/apple-20.jpg'],
        description: '综合钓场，设施齐全，适合各种钓法。',
        rating: 4.8,
        distance: 54.8,
        type: 'lake',
        location: '成都市青白江区',
        rank: 20,
        recentCatches: 95,
        currentPeople: 8,
        fishSpecies: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '青鱼']
    }
]);

// 筛选相关
const filterTabs = [
    { key: 'nearby', label: '附近', hasDropdown: true },
    { key: 'sort', label: '排序', hasDropdown: true },
    { key: 'type', label: '类型', hasDropdown: true },
    { key: 'fish', label: '鱼种', hasDropdown: true }
];

const activeFilter = ref('');
const showFilterPopup = ref(false);

// 筛选选项
const distanceOptions = [
    { text: '全部', value: 'all' },
    { text: '1km内', value: '1' },
    { text: '3km内', value: '3' },
    { text: '5km内', value: '5' },
    { text: '10km内', value: '10' }
];

const sortOptions = [
    { text: '距离优先', value: 'distance' },
    { text: '人气优先', value: 'popularity' },
    { text: '评分优先', value: 'rating' }
];

const typeOptions = [
    { text: '全部', value: 'all' },
    { text: '淡水', value: 'freshwater' },
    { text: '海水', value: 'saltwater' },
    { text: '黑坑', value: 'black_pit' },
    { text: '水库', value: 'reservoir' },
    { text: '河流', value: 'river' },
    { text: '湖泊', value: 'lake' }
];

const fishOptions = [
    { text: '全部', value: 'all' },
    { text: '鲫鱼', value: 'crucian' },
    { text: '鲤鱼', value: 'carp' },
    { text: '草鱼', value: 'grass_carp' },
    { text: '鲢鱼', value: 'silver_carp' },
    { text: '鳙鱼', value: 'bighead_carp' },
    { text: '青鱼', value: 'black_carp' },
    { text: '马口鱼', value: 'opsariichthys' },
    { text: '溪石斑', value: 'stream_bass' },
    { text: '白条', value: 'white_striped' }
];

// 当前选中的筛选值
const selectedDistance = ref('all');
const selectedSort = ref('distance');
const selectedType = ref('all');
const selectedFish = ref('all');

// 地图相关
const mapCenter = ref({ lat: 39.9042, lng: 116.3974 });
const selectedSpot = ref<any>(null);

// 底部导航栏
const activeTab = ref(0); // 首页页面对应索引0
const onTabChange = (index: number) => {
    switch (index) {
        case 0:
            router.push('/home');
            break;
        case 1:
            router.push('/profile');
            break;
    }
};

// 地图缩放相关
const mapZoom = ref(1);
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

const zoomIn = () => {
    if (mapZoom.value < MAX_ZOOM) {
        mapZoom.value = Math.min(mapZoom.value + 0.2, MAX_ZOOM);
        updateMapScale();
    }
};

const zoomOut = () => {
    if (mapZoom.value > MIN_ZOOM) {
        mapZoom.value = Math.max(mapZoom.value - 0.2, MIN_ZOOM);
        updateMapScale();
    }
};

const updateMapScale = () => {
    const baseScale = 500; // 基础比例尺长度（米）
    const currentScale = Math.round(baseScale / mapZoom.value);
    const scaleElement = document.querySelector('.map-scale span');
    if (scaleElement) {
        scaleElement.textContent = `${currentScale}m`;
    }
};

// 计算属性
const filteredSpots = computed(() => {
    let result = spots.value;
    
    // 距离筛选
    if (selectedDistance.value !== 'all') {
        const maxDistance = parseInt(selectedDistance.value);
        result = result.filter(spot => spot.distance <= maxDistance);
    }
    
    // 类型筛选
    if (selectedType.value !== 'all') {
        result = result.filter(spot => spot.type === selectedType.value);
    }

    // 鱼种筛选
    if (selectedFish.value !== 'all') {
        const fishNameMap: Record<string, string> = {
            'crucian': '鲫鱼',
            'carp': '鲤鱼',
            'grass_carp': '草鱼',
            'silver_carp': '鲢鱼',
            'bighead_carp': '鳙鱼',
            'black_carp': '青鱼',
            'opsariichthys': '马口鱼',
            'stream_bass': '溪石斑',
            'white_striped': '白条'
        };
        const selectedFishName = fishNameMap[selectedFish.value];
        if (selectedFishName) {
            result = result.filter(spot => spot.fishSpecies.includes(selectedFishName));
        }
    }
    
    // 排序
    switch (selectedSort.value) {
        case 'distance':
            result.sort((a, b) => a.distance - b.distance);
            break;
        case 'popularity':
            result.sort((a, b) => b.currentPeople - a.currentPeople);
            break;
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    return result;
});

// 默认显示3个钓点
const displayedSpots = computed(() => {
    return filteredSpots.value.slice(0, 3);
});

// 方法
const setActiveFilter = (key: string) => {
    if (activeFilter.value === key) {
        activeFilter.value = '';
        showFilterPopup.value = false;
    } else {
        activeFilter.value = key;
        showFilterPopup.value = true;
    }
};

// 更新getMarkerPosition函数以支持缩放
const getMarkerPosition = (spot: any) => {
    // 模拟地图坐标转换
    const centerX = 50;
    const centerY = 50;
    
    const deltaLng = (spot.longitude - mapCenter.value.lng) * 1000 * mapZoom.value;
    const deltaLat = (spot.latitude - mapCenter.value.lat) * 1000 * mapZoom.value;
    
    const x = centerX + deltaLng;
    const y = centerY - deltaLat;
    
    return {
        left: `${Math.max(5, Math.min(95, x))}%`,
        top: `${Math.max(5, Math.min(95, y))}%`,
        transform: `scale(${1 / Math.sqrt(mapZoom.value)})`, // 标记大小随缩放调整
    };
};

const selectSpotOnMap = (spot: any) => {
    selectedSpot.value = spot;
    mapCenter.value = { lat: spot.latitude, lng: spot.longitude };
    showToast(`选中钓点: ${spot.name}`);
};

const locateMe = () => {
    mapCenter.value = { lat: 39.9042, lng: 116.3974 };
    selectedSpot.value = null;
    showToast('已定位到当前位置');
};

const toggleView = () => {
    showToast('切换视图');
};

const viewSpotDetail = (spot: any) => {
    router.push(`/spot/${spot.id}`);
};

const applyFilters = () => {
    showFilterPopup.value = false;
    showToast('筛选条件已应用');
};

const resetFilters = () => {
    selectedDistance.value = 'all';
    selectedType.value = 'all';
    selectedFish.value = 'all';
    showToast('筛选条件已重置');
};

const goToAddSpot = () => {
    router.push('/spot/add');
};

// 获取筛选标题
const getFilterTitle = (key: string): string => {
    const titleMap: Record<string, string> = {
        nearby: '选择距离',
        sort: '排序方式',
        type: '钓点类型',
        fish: '鱼种选择'
    };
    return titleMap[key] || '';
};

// 选择筛选选项
const selectDistance = (value: string) => {
    selectedDistance.value = value;
    showFilterPopup.value = false;
};

const selectSort = (value: string) => {
    selectedSort.value = value;
    showFilterPopup.value = false;
};

const selectType = (value: string) => {
    selectedType.value = value;
    showFilterPopup.value = false;
};

const selectFish = (value: string) => {
    selectedFish.value = value;
    showFilterPopup.value = false;
};

const isListVisible = ref(true);

const toggleList = () => {
    isListVisible.value = !isListVisible.value;
};

const getSpotTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
        'lake': 'location',
        'reservoir': 'guide-o',
        'river': 'water-o',
        'saltwater': 'flag-o',
        'black_pit': 'gem-o',
        'default': 'location-o'
    };
    return iconMap[type] || iconMap.default;
};

onMounted(() => {
    // 页面初始化
    console.log('钓点数据:', spots.value);
    console.log('筛选后的钓点:', filteredSpots.value);
    console.log('显示的钓点:', displayedSpots.value);
});
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    padding-bottom: 60px;
}

.map-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100vh - 50px);
    background-color: #f5f5f5;
    z-index: 1;
}

.fishing-map {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.map-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f8f8f8;
    background-image: 
        /* 主要道路 */
        linear-gradient(90deg, #e4f1f6 2px, transparent 2px),
        linear-gradient(#e4f1f6 2px, transparent 2px),
        /* 次要道路 */
        linear-gradient(90deg, #f0f6f8 1px, transparent 1px),
        linear-gradient(#f0f6f8 1px, transparent 1px),
        /* 建筑物底色 */
        linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
        linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
    background-size: 
        100px 100px,
        100px 100px,
        20px 20px,
        20px 20px,
        40px 40px,
        40px 40px,
        40px 40px,
        40px 40px;
    background-position: 
        0 0,
        0 0,
        0 0,
        0 0,
        0 0,
        20px 0,
        20px -20px,
        0 20px;
}

.map-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* 添加绿地区域 */
.green-areas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.green-area {
    position: absolute;
    background: rgba(205, 235, 215, 0.3);
    border: 1px solid rgba(145, 199, 174, 0.3);
}

/* 添加建筑物 */
.buildings {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.building {
    position: absolute;
    background: rgba(240, 240, 240, 0.8);
    border: 1px solid rgba(200, 200, 200, 0.3);
}

/* 道路名称标注 */
.road-labels {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.road-label {
    position: absolute;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.8);
    padding: 2px 4px;
    border-radius: 2px;
}

/* 主要道路 */
.main-roads {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.main-road {
    position: absolute;
    background: #e4f1f6;
    border: 1px solid #d4e8f0;
}

/* 次要道路 */
.minor-roads {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.minor-road {
    position: absolute;
    background: #f0f6f8;
    border: 1px solid #e6f0f4;
}

.spot-marker {
    position: absolute;
    transform-origin: center bottom;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.marker-icon {
    width: 24px;
    height: 30px;
    background: #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: none;
    transition: all 0.3s ease;
}

.marker-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 50% 50% 50% 0;
    transform: scale(0.8);
}

.marker-icon .van-icon {
    font-size: 14px;
    color: #1890ff;
    transform: rotate(45deg);
    position: relative;
    z-index: 1;
}

.marker-info {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border: 1px solid #eee;
}

.spot-marker.active .marker-icon {
    transform: rotate(-45deg) scale(1.1);
    background: #1890ff;
}

.spot-marker.active .marker-icon::before {
    background: #1890ff;
}

.spot-marker.active .marker-icon .van-icon {
    color: white;
}

.spot-marker.active .marker-info {
    background: #1890ff;
    color: white;
    border-color: #1890ff;
}

.current-location {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
}

.location-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #1890ff;
    border: 2px solid white;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.3);
}

.location-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(24, 144, 255, 0.1);
    animation: pulse 2s infinite ease-out;
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(2.5);
        opacity: 0;
    }
}

.map-controls {
    position: absolute;
    right: 16px;
    bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 10;
}

.map-controls .van-button:not(.add-spot-btn) {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
}

.map-controls .van-button:not(.add-spot-btn):hover {
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
}

.map-controls .van-button:not(.add-spot-btn):active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.map-controls .van-button:not(.add-spot-btn) .van-icon {
    font-size: 20px;
    color: #333;
    transition: all 0.3s ease;
}

.map-controls .van-button:not(.add-spot-btn):hover .van-icon {
    color: #1890ff;
}

.add-spot-btn {
    background: linear-gradient(135deg, #1890ff, #40a9ff) !important;
    color: white !important;
    border: none !important;
    padding: 0 16px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25) !important;
    transition: all 0.3s ease !important;
    width: auto !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    backdrop-filter: blur(8px) !important;
}

.add-spot-btn:hover {
    background: linear-gradient(135deg, #40a9ff, #69c0ff) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35) !important;
}

.add-spot-btn:active {
    transform: translateY(0) !important;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25) !important;
}

.add-spot-btn .van-icon {
    font-size: 16px !important;
    color: white !important;
    margin-right: 2px !important;
}

/* 地图缩放控件 */
.zoom-controls {
    position: absolute;
    right: 16px;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.zoom-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.zoom-btn:hover {
    background: #f5f5f5;
}

.zoom-btn .van-icon {
    font-size: 20px;
    color: #1E88E5;
}

/* 添加地图比例尺 */
.map-scale {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.95);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
}

.scale-line {
    width: 50px;
    height: 2px;
    background: #666;
    position: relative;
}

.scale-line::before,
.scale-line::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 6px;
    background: #666;
    top: -2px;
}

.scale-line::before {
    left: 0;
}

.scale-line::after {
    right: 0;
}

/* 浮动发布按钮样式 */
.floating-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
}

.floating-btn-text {
    font-size: 10px;
    margin-top: 2px;
    white-space: nowrap;
}

.filter-tabs {
    display: none;
}

.tab-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-right: 10px;
    -webkit-overflow-scrolling: touch;
}

.filter-tab {
    background-color: var(--van-background-color-light);
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 14px;
    color: var(--van-text-color);
    white-space: nowrap;
    border: 1px solid transparent;
}

.filter-tab.active {
    background-color: var(--van-primary-color);
    color: white;
    border-color: var(--van-primary-color);
}

.sort-button, .filter-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 20px;
    background-color: var(--van-background-color-light);
    color: var(--van-text-color);
    font-size: 14px;
    cursor: pointer;
}

.sort-button:active, .filter-button:active {
    background-color: var(--van-border-color);
}

.spots-list-container {
    padding: 0;
    background-color: white;
    position: fixed;
    bottom: 50px;
    left: 0;
    width: 100%;
    height: calc(100vh - 340px);
    z-index: 9;
    border-radius: 16px 16px 0 0;
    transition: transform 0.3s ease-in-out;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.list-content {
    height: 100%;
    overflow-y: auto;
    padding-top: 24px;
}

.list-hidden {
    transform: translateY(calc(100% - 24px));
}

.hide-button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 16px 16px 0 0;
    cursor: pointer;
    z-index: 12;
}

.handle-bar {
    width: 40px;
    height: 4px;
    background-color: #ddd;
    border-radius: 2px;
    margin-top: 8px;
}

.filter-section {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    display: flex;
    gap: 24px;
}

.filter-button {
    flex: 1;
    padding: 0;
    font-size: 14px;
    color: #666;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
}

.filter-button.active {
    color: var(--van-primary-color);
    background: transparent;
    font-weight: 500;
}

.filter-button .van-icon {
    font-size: 12px;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.result-count {
    font-size: 16px;
    color: var(--van-text-color);
}

.spots-list {
    padding: 12px;
}

.spot-card-item {
    display: flex;
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 12px;
}

.spot-image {
    width: 100px;
    height: 100px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    margin: 12px;
}

.spot-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.spot-info {
    flex: 1;
    padding: 12px 16px 12px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.spot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.spot-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    flex: 1;
    margin-right: 10px;
}

.spot-rating {
    display: flex;
    align-items: center;
    gap: 4px;
}

.spot-rating .van-icon {
    font-size: 14px;
    color: var(--van-warning-color);
}

.spot-rating span {
    font-size: 14px;
    color: var(--van-warning-color);
    font-weight: 500;
}

.spot-fish-species {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.species-label {
    color: var(--van-text-color-2);
    font-weight: 500;
}

.species-list {
    color: var(--van-text-color);
    flex: 1;
}

.spot-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
}

.spot-type {
    background-color: var(--van-primary-color);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.spot-distance {
    color: var(--van-text-color-3);
}

.rating-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--van-text-color-2);
}

.rating-score {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-warning-color);
}

.rating-label {
    font-size: 12px;
    color: var(--van-warning-color);
}

.spot-category {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.recent-activity {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.spot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.location-tag, .rank-tag, .feature-tag, .user-tag, .price-tag {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.spot-description {
    font-size: 13px;
    color: var(--van-text-color-2);
    line-height: 1.4;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.spot-operation {
    margin-bottom: 8px;
}

.operation-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--van-text-color-3);
}

.status-open {
    color: var(--van-success-color);
    font-weight: bold;
}

.time-range {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.spot-pricing {
    display: flex;
    gap: 10px;
    margin-top: 8px;
}

.price-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--van-text-color-2);
}

.price-label {
    font-size: 10px;
    color: var(--van-text-color-3);
}

.price-value {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-text-color);
}

.original-price {
    font-size: 10px;
    color: var(--van-text-color-3);
    text-decoration: line-through;
}

.price-type {
    font-size: 10px;
    color: var(--van-text-color-3);
}

.service-type {
    font-size: 10px;
    color: var(--van-text-color-3);
}

.empty-state {
    padding: 40px 0;
    text-align: center;
}

.empty-state .van-empty__description {
    color: var(--van-text-color-2);
}

.sort-popup, .filter-popup {
    padding: 20px;
    background-color: white;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.sort-popup .popup-header, .filter-popup .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.sort-popup h3, .filter-popup h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.sort-popup .popup-actions, .filter-popup .popup-actions {
    display: flex;
    gap: 10px;
}

.sort-popup .sort-options, .filter-popup .filter-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sort-option, .filter-group h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: var(--van-text-color-2);
}

.sort-option {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 13px;
    cursor: pointer;
}

.sort-option.active {
    background-color: var(--van-primary-color);
    color: white;
}

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-option {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 13px;
    cursor: pointer;
}

.filter-option.active {
    background-color: var(--van-primary-color);
    color: white;
}

.price-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.price-options .filter-option {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 13px;
    cursor: pointer;
}

.price-options .filter-option.active {
    background-color: var(--van-primary-color);
    color: white;
}

.fishing-index-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.fishing-index-options .filter-option {
    background-color: var(--van-background-color-light);
    color: var(--van-text-color-2);
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 13px;
    cursor: pointer;
}

.fishing-index-options .filter-option.active {
    background-color: var(--van-primary-color);
    color: white;
}

.range-label {
    font-size: 12px;
    color: var(--van-text-color-3);
    text-align: center;
    margin-top: 5px;
}

.filter-popup {
    padding: 16px;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.popup-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
}

.popup-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.filter-option {
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 14px;
    color: var(--van-text-color);
    background: var(--van-background-color);
    cursor: pointer;
}

.filter-option.active {
    color: var(--van-primary-color);
    background: var(--van-primary-color-light);
}
</style> 