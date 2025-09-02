

// 钓点类型
export enum FishingSpotType {
    FRESHWATER = 'freshwater',  // 淡水
    SALTWATER = 'saltwater',    // 海水
    BLACK_PIT = 'black_pit',    // 黑坑
    RESERVOIR = 'reservoir',     // 水库
    RIVER = 'river',            // 河流
    LAKE = 'lake'               // 湖泊
}

// 用户信息
export interface User {
    id: string;
    username: string;
    avatar: string;
    city: string;
    joinDate: Date;
    bio?: string;
}

// 钓点信息
export interface FishingSpot {
    id: string;
    name: string;
    type: FishingSpotType;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    description: string;
    images: string[];
    rating: number;
    reviewCount: number;

    fishSpecies: string[];     // 鱼种
    createdBy: string;
    createdAt: Date;
    approved: boolean;
    currentPeople?: number;    // 当前人数
    hydrologyInfo?: HydrologyInfo; // 水文信息
}

// 单个鱼种钓获信息
export interface FishCatch {
    fishSpecies: string;  // 鱼种名称
    count: number;        // 尾数
    weight: number;       // 重量(kg)
}

// 钓获记录
export interface CatchRecord {
    id: string;
    userId: string;
    spotId: string;
    fishCatches: FishCatch[];  // 改为支持多个鱼种
    images: string[];
    equipment: string[];       // 使用装备
    bait: string;             // 饵料
    weather: WeatherInfo;
    catchTime: Date;
    description?: string;
    likes: number;
    comments: Comment[];
}

// 天气信息
export interface WeatherInfo {
    temperature: number;
    humidity: number;
    pressure: number;          // 气压
    windSpeed: number;
    windDirection: string;
    weather: string;          // 天气状况
    suitabilityIndex: number; // 适钓指数 (1-10)
}

// 水文信息
export interface HydrologyInfo {
    waterLevel: number;        // 水位 (米)
    waterTemperature: number;  // 水温 (摄氏度)
    waterQuality: string;      // 水质等级 (优/良/中/差)
    waterClarity: number;      // 水透明度 (厘米)
    waterFlow: number;         // 水流速度 (m/s)
    waterDepth: number;        // 水深 (米)
    tideInfo?: TideInfo;       // 潮汐信息 (海钓)
    phValue: number;           // pH值
    dissolvedOxygen: number;   // 溶解氧 (mg/L)
    updateTime: Date;          // 更新时间
}

// 潮汐信息
export interface TideInfo {
    highTide: string[];        // 高潮时间
    lowTide: string[];         // 低潮时间
    tideHeight: number;        // 潮高 (米)
    tideType: 'rising' | 'falling' | 'high' | 'low'; // 潮汐状态
}

// 评论
export interface Comment {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    content: string;
    createdAt: Date;
    likes: number;
}

// 鱼类稀有度
export enum FishRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

// 鱼类分类
export enum FishCategory {
    FRESHWATER = 'freshwater',
    SALTWATER = 'saltwater',
    LAKE = 'lake',
    RIVER = 'river'
}

// 鱼类信息
export interface FishSpecies {
    id: string;
    name: string;
    icon: string;
    lockedIcon: string;
    category: FishCategory;
    rarity: FishRarity;
    description?: string;
    habitat?: string[];
    season?: string[];
}

// 勋章类型枚举
export enum MedalType {
    LEVEL_UP = 'level_up',                    // 等级提升
    FISH_UNLOCK = 'fish_unlock',              // 鱼类解锁
    FISH_COLLECT = 'fish_collect',            // 鱼类收集
    CATCH_MILESTONE = 'catch_milestone',      // 钓获里程碑
    WEIGHT_MILESTONE = 'weight_milestone',    // 重量里程碑
    DIVERSITY_MILESTONE = 'diversity_milestone', // 多样性里程碑
    SPOT_CHECKIN = 'spot_checkin',           // 钓点签到
    EQUIPMENT_COLLECT = 'equipment_collect',  // 装备收集
    COMMUNITY_ACTIVE = 'community_active'     // 社区活跃
}

// 勋章解锁条件
export interface MedalUnlockRequirement {
    type: string;
    value: number;
    description: string;
}

// 勋章信息
export interface Medal {
    id: string;
    name: string;
    description: string;
    type: MedalType;
    icon: string;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockCondition: string;
    unlockRequirement: MedalUnlockRequirement;
    isUnlocked: boolean;
    unlockedAt?: Date;
}

// 用户勋章数据
export interface UserMedals {
    userId: string;
    medals: Medal[];
    totalCount: number;
    unlockedCount: number;
    lastUpdated: Date;
}


// 装备类型枚举
export enum EquipmentType {
    ROD = 'rod',           // 钓竿
    REEL = 'reel',         // 渔轮
    LINE = 'line',         // 钓线
    HOOK = 'hook',         // 鱼钩
    BAIT = 'bait',         // 饵料
    ACCESSORY = 'accessory' // 配件
}

// 装备信息接口
export interface Equipment {
    id: string;
    name: string;
    type: EquipmentType;
    brand?: string;
    model?: string;
    description?: string;
    price?: number;
    purchaseDate?: Date;
    condition: 'new' | 'good' | 'fair' | 'poor';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// 用户装备接口
export interface UserEquipment {
    userId: string;
    equipment: Equipment[];
    totalCount: number;
    lastUpdated: Date;
}

 