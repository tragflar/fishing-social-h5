import { FishSpecies, FishCategory, FishRarity } from '../types/fishing';

export const fishSpeciesData: FishSpecies[] = [
    // 常见淡水鱼类
    {
        id: 'crucian_carp',
        name: '鲫鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '常见的淡水鱼类，适应性强，分布广泛',
        habitat: ['湖泊', '水库', '河流'],
        season: ['春季', '秋季']
    },
    {
        id: 'grass_carp',
        name: '草鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '草食性鱼类，体型较大，肉质鲜美',
        habitat: ['湖泊', '水库', '河流'],
        season: ['夏季', '秋季']
    },
    {
        id: 'common_carp',
        name: '鲤鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '经典的淡水鱼类，钓获难度适中',
        habitat: ['湖泊', '水库', '河流'],
        season: ['春季', '秋季']
    },
    {
        id: 'silver_carp',
        name: '白鲢',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '滤食性鱼类，体型较大',
        habitat: ['湖泊', '水库'],
        season: ['夏季', '秋季']
    },
    {
        id: 'bighead_carp',
        name: '花鲢',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '头部较大，肉质鲜美',
        habitat: ['湖泊', '水库'],
        season: ['夏季', '秋季']
    },
    {
        id: 'white_striped_bass',
        name: '白条',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.COMMON,
        description: '小型鱼类，数量众多',
        habitat: ['河流', '溪流'],
        season: ['全年']
    },

    // 稀有淡水鱼类
    {
        id: 'black_fish',
        name: '黑鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.RARE,
        description: '肉食性鱼类，体型较大，钓获难度高',
        habitat: ['湖泊', '水库', '河流'],
        season: ['夏季', '秋季']
    },
    {
        id: 'snakehead',
        name: '鳢鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.RARE,
        description: '凶猛的肉食性鱼类',
        habitat: ['湖泊', '水库'],
        season: ['夏季', '秋季']
    },
    {
        id: 'mandarin_fish',
        name: '鳜鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.RARE,
        description: '珍贵的淡水鱼类，肉质鲜美',
        habitat: ['湖泊', '水库'],
        season: ['春季', '秋季']
    },
    {
        id: 'perch',
        name: '鲈鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.RARE,
        description: '肉食性鱼类，钓获难度较高',
        habitat: ['湖泊', '水库'],
        season: ['春季', '秋季']
    },

    // 史诗淡水鱼类
    {
        id: 'chinese_sturgeon',
        name: '中华鲟',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.EPIC,
        description: '国家一级保护动物，极其珍贵',
        habitat: ['长江'],
        season: ['春季']
    },
    {
        id: 'yangtze_sturgeon',
        name: '长江鲟',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.FRESHWATER,
        rarity: FishRarity.EPIC,
        description: '长江特有物种，极其稀有',
        habitat: ['长江'],
        season: ['春季']
    },

    // 海水鱼类
    {
        id: 'sea_bass',
        name: '海鲈',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.SALTWATER,
        rarity: FishRarity.RARE,
        description: '海水鱼类，肉质鲜美',
        habitat: ['近海', '海湾'],
        season: ['春季', '秋季']
    },
    {
        id: 'yellow_croaker',
        name: '黄鱼',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.SALTWATER,
        rarity: FishRarity.COMMON,
        description: '常见的海水鱼类',
        habitat: ['近海'],
        season: ['春季', '秋季']
    },
    {
        id: 'red_snapper',
        name: '红鲷',
        icon: '🐟',
        lockedIcon: '',
        category: FishCategory.SALTWATER,
        rarity: FishRarity.RARE,
        description: '珍贵的海水鱼类',
        habitat: ['深海'],
        season: ['全年']
    }
];

// 按稀有度分组
export const fishByRarity = {
    [FishRarity.COMMON]: fishSpeciesData.filter(fish => fish.rarity === FishRarity.COMMON),
    [FishRarity.RARE]: fishSpeciesData.filter(fish => fish.rarity === FishRarity.RARE),
    [FishRarity.EPIC]: fishSpeciesData.filter(fish => fish.rarity === FishRarity.EPIC),
    [FishRarity.LEGENDARY]: fishSpeciesData.filter(fish => fish.rarity === FishRarity.LEGENDARY)
};

// 按分类分组
export const fishByCategory = {
    [FishCategory.FRESHWATER]: fishSpeciesData.filter(fish => fish.category === FishCategory.FRESHWATER),
    [FishCategory.SALTWATER]: fishSpeciesData.filter(fish => fish.category === FishCategory.SALTWATER),
    [FishCategory.LAKE]: fishSpeciesData.filter(fish => fish.category === FishCategory.LAKE),
    [FishCategory.RIVER]: fishSpeciesData.filter(fish => fish.category === FishCategory.RIVER)
};

// 获取鱼类信息
export const getFishById = (id: string): FishSpecies | undefined => {
    return fishSpeciesData.find(fish => fish.id === id);
};

// 获取稀有度显示名称
export const getRarityDisplayName = (rarity: FishRarity): string => {
    const rarityMap = {
        [FishRarity.COMMON]: '常见',
        [FishRarity.RARE]: '稀有',
        [FishRarity.EPIC]: '史诗',
        [FishRarity.LEGENDARY]: '传说'
    };
    return rarityMap[rarity];
};

// 获取分类显示名称
export const getCategoryDisplayName = (category: FishCategory): string => {
    const categoryMap = {
        [FishCategory.FRESHWATER]: '淡水',
        [FishCategory.SALTWATER]: '海水',
        [FishCategory.LAKE]: '湖泊',
        [FishCategory.RIVER]: '河流'
    };
    return categoryMap[category];
}; 