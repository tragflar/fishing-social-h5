import { Medal, MedalType, UserMedals } from '../types/fishing';
import { getUserFishProgress } from './fishUnlock';
import { getUserExpInfo } from './expManager';
import { getEquipmentStats } from './equipmentManager';

// 勋章配置
export const medalConfigs: Medal[] = [
    // 鱼类解锁勋章
    {
        id: 'first_fish_unlock',
        name: '首次钓获',
        description: '首次钓获某种鱼类',
        type: MedalType.FISH_UNLOCK,
        icon: '🎣',
        color: '#4CAF50',
        rarity: 'common',
        unlockCondition: '首次钓获任意鱼类',
        unlockRequirement: {
            type: 'first_fish_unlock',
            value: 1,
            description: '首次钓获任意鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'fish_collect_5',
        name: '初级收集者',
        description: '解锁5种鱼类',
        type: MedalType.FISH_COLLECT,
        icon: '🐟',
        color: '#2196F3',
        rarity: 'common',
        unlockCondition: '累计解锁5种鱼类',
        unlockRequirement: {
            type: 'fish_collect',
            value: 5,
            description: '累计解锁5种鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'fish_collect_15',
        name: '中级收集者',
        description: '解锁15种鱼类',
        type: MedalType.FISH_COLLECT,
        icon: '🐠',
        color: '#9C27B0',
        rarity: 'rare',
        unlockCondition: '累计解锁15种鱼类',
        unlockRequirement: {
            type: 'fish_collect',
            value: 15,
            description: '累计解锁15种鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'fish_collect_30',
        name: '高级收集者',
        description: '解锁30种鱼类',
        type: MedalType.FISH_COLLECT,
        icon: '🐡',
        color: '#FF9800',
        rarity: 'epic',
        unlockCondition: '累计解锁30种鱼类',
        unlockRequirement: {
            type: 'fish_collect',
            value: 30,
            description: '累计解锁30种鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'fish_collect_50',
        name: '鱼类大师',
        description: '解锁50种鱼类',
        type: MedalType.FISH_COLLECT,
        icon: '🐋',
        color: '#F44336',
        rarity: 'legendary',
        unlockCondition: '累计解锁50种鱼类',
        unlockRequirement: {
            type: 'fish_collect',
            value: 50,
            description: '累计解锁50种鱼类'
        },
        isUnlocked: false
    },
    // 钓获里程碑勋章
    {
        id: 'catch_100',
        name: '新手钓手',
        description: '累计钓获100尾鱼',
        type: MedalType.CATCH_MILESTONE,
        icon: '🎯',
        color: '#4CAF50',
        rarity: 'common',
        unlockCondition: '累计钓获100尾鱼',
        unlockRequirement: {
            type: 'total_catch',
            value: 100,
            description: '累计钓获100尾鱼'
        },
        isUnlocked: false
    },
    {
        id: 'catch_500',
        name: '熟练钓手',
        description: '累计钓获500尾鱼',
        type: MedalType.CATCH_MILESTONE,
        icon: '🎯',
        color: '#2196F3',
        rarity: 'rare',
        unlockCondition: '累计钓获500尾鱼',
        unlockRequirement: {
            type: 'total_catch',
            value: 500,
            description: '累计钓获500尾鱼'
        },
        isUnlocked: false
    },
    {
        id: 'catch_1000',
        name: '资深钓手',
        description: '累计钓获1000尾鱼',
        type: MedalType.CATCH_MILESTONE,
        icon: '🎯',
        color: '#9C27B0',
        rarity: 'epic',
        unlockCondition: '累计钓获1000尾鱼',
        unlockRequirement: {
            type: 'total_catch',
            value: 1000,
            description: '累计钓获1000尾鱼'
        },
        isUnlocked: false
    },
    {
        id: 'catch_5000',
        name: '钓鱼大师',
        description: '累计钓获5000尾鱼',
        type: MedalType.CATCH_MILESTONE,
        icon: '🎯',
        color: '#F44336',
        rarity: 'legendary',
        unlockCondition: '累计钓获5000尾鱼',
        unlockRequirement: {
            type: 'total_catch',
            value: 5000,
            description: '累计钓获5000尾鱼'
        },
        isUnlocked: false
    },
    // 重量里程碑勋章
    {
        id: 'weight_5',
        name: '小有收获',
        description: '单次钓获重量达到5公斤',
        type: MedalType.WEIGHT_MILESTONE,
        icon: '⚖️',
        color: '#4CAF50',
        rarity: 'common',
        unlockCondition: '单次钓获重量达到5公斤',
        unlockRequirement: {
            type: 'single_weight',
            value: 5,
            description: '单次钓获重量达到5公斤'
        },
        isUnlocked: false
    },
    {
        id: 'weight_10',
        name: '满载而归',
        description: '单次钓获重量达到10公斤',
        type: MedalType.WEIGHT_MILESTONE,
        icon: '⚖️',
        color: '#2196F3',
        rarity: 'rare',
        unlockCondition: '单次钓获重量达到10公斤',
        unlockRequirement: {
            type: 'single_weight',
            value: 10,
            description: '单次钓获重量达到10公斤'
        },
        isUnlocked: false
    },
    {
        id: 'weight_20',
        name: '大丰收',
        description: '单次钓获重量达到20公斤',
        type: MedalType.WEIGHT_MILESTONE,
        icon: '⚖️',
        color: '#9C27B0',
        rarity: 'epic',
        unlockCondition: '单次钓获重量达到20公斤',
        unlockRequirement: {
            type: 'single_weight',
            value: 20,
            description: '单次钓获重量达到20公斤'
        },
        isUnlocked: false
    },
    {
        id: 'weight_50',
        name: '巨物钓手',
        description: '单次钓获重量达到50公斤',
        type: MedalType.WEIGHT_MILESTONE,
        icon: '⚖️',
        color: '#F44336',
        rarity: 'legendary',
        unlockCondition: '单次钓获重量达到50公斤',
        unlockRequirement: {
            type: 'single_weight',
            value: 50,
            description: '单次钓获重量达到50公斤'
        },
        isUnlocked: false
    },
    // 多样性里程碑勋章
    {
        id: 'diversity_3',
        name: '多样化',
        description: '单次钓获3种不同鱼类',
        type: MedalType.DIVERSITY_MILESTONE,
        icon: '🌈',
        color: '#4CAF50',
        rarity: 'common',
        unlockCondition: '单次钓获3种不同鱼类',
        unlockRequirement: {
            type: 'single_diversity',
            value: 3,
            description: '单次钓获3种不同鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'diversity_5',
        name: '丰富收获',
        description: '单次钓获5种不同鱼类',
        type: MedalType.DIVERSITY_MILESTONE,
        icon: '🌈',
        color: '#2196F3',
        rarity: 'rare',
        unlockCondition: '单次钓获5种不同鱼类',
        unlockRequirement: {
            type: 'single_diversity',
            value: 5,
            description: '单次钓获5种不同鱼类'
        },
        isUnlocked: false
    },
    {
        id: 'diversity_8',
        name: '全能钓手',
        description: '单次钓获8种不同鱼类',
        type: MedalType.DIVERSITY_MILESTONE,
        icon: '🌈',
        color: '#9C27B0',
        rarity: 'epic',
        unlockCondition: '单次钓获8种不同鱼类',
        unlockRequirement: {
            type: 'single_diversity',
            value: 8,
            description: '单次钓获8种不同鱼类'
        },
        isUnlocked: false
    }
];

// 获取用户勋章数据
export const getUserMedals = (userId: string): UserMedals => {
    const stored = localStorage.getItem(`user_medals_${userId}`);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // 初始化用户勋章数据
    const userMedals: UserMedals = {
        userId,
        medals: [...medalConfigs],
        totalMedals: medalConfigs.length,
        unlockedCount: 0
    };
    
    localStorage.setItem(`user_medals_${userId}`, JSON.stringify(userMedals));
    return userMedals;
};

// 保存用户勋章数据
export const saveUserMedals = (userId: string, userMedals: UserMedals): void => {
    localStorage.setItem(`user_medals_${userId}`, JSON.stringify(userMedals));
};

// 检查并更新勋章
export const checkAndUpdateMedals = (userId: string): Medal[] => {
    const userMedals = getUserMedals(userId);
    const userExpInfo = getUserExpInfo(userId);
    const fishUnlockStats = getUserFishProgress(userId);
    const equipmentStats = getEquipmentStats(userId);
    
    const unlockedMedals: Medal[] = [];
    
    // 遍历所有勋章配置
    medalConfigs.forEach(medal => {
        if (!userMedals.medals.find(m => m.id === medal.id)?.isUnlocked) {
            let shouldUnlock = false;
            
            switch (medal.type) {
                case MedalType.LEVEL_UP:
                    shouldUnlock = checkLevelUpMedal(medal, userExpInfo);
                    break;
                case MedalType.FISH_UNLOCK:
                    shouldUnlock = checkFishUnlockMedal(medal, fishUnlockStats);
                    break;
                case MedalType.FISH_COLLECT:
                    shouldUnlock = checkFishCollectMedal(medal, fishUnlockStats);
                    break;
                case MedalType.CATCH_MILESTONE:
                    shouldUnlock = checkCatchMilestoneMedal(medal, userId);
                    break;
                case MedalType.WEIGHT_MILESTONE:
                    shouldUnlock = checkWeightMilestoneMedal(medal, userId);
                    break;
                case MedalType.DIVERSITY_MILESTONE:
                    shouldUnlock = checkDiversityMilestoneMedal(medal, userId);
                    break;
                case MedalType.SPOT_CHECKIN:
                    shouldUnlock = checkSpotCheckinMedal(medal, userId);
                    break;
                case MedalType.EQUIPMENT_COLLECT:
                    shouldUnlock = checkEquipmentCollectMedal(medal, equipmentStats);
                    break;
                case MedalType.COMMUNITY_ACTIVE:
                    shouldUnlock = checkCommunityActiveMedal(medal, userId);
                    break;
            }
            
            if (shouldUnlock) {
                const unlockedMedal = {
                    ...medal,
                    isUnlocked: true,
                    unlockedAt: new Date()
                };
                unlockedMedals.push(unlockedMedal);
                
                // 保存到用户勋章数据
                userMedals.medals.push(unlockedMedal);
                userMedals.unlockedCount++;
                saveUserMedals(userId, userMedals);
            }
        }
    });
    
    return unlockedMedals;
};

// 检查等级升级勋章
const checkLevelUpMedal = (medal: Medal, userExpInfo: any): boolean => {
    const levelMap: Record<string, number> = {
        'newbie': 1,
        'intermediate': 2,
        'advanced': 3,
        'expert': 4,
        'master': 5,
        'legend': 6
    };
    
    const requiredLevel = medal.unlockRequirement?.value || 1;
    const currentLevel = levelMap[userExpInfo.currentLevel] || 0;
    
    return currentLevel >= requiredLevel;
};

// 检查鱼类解锁勋章
const checkFishUnlockMedal = (medal: Medal, fishUnlockStats: any): boolean => {
    if (medal.unlockRequirement?.type === 'first_fish_unlock') {
        return fishUnlockStats.totalUnlocked > 0;
    }
    return false;
};

// 检查鱼类收集勋章
const checkFishCollectMedal = (medal: Medal, fishUnlockStats: any): boolean => {
    if (medal.unlockRequirement?.type === 'fish_collect') {
        const requiredCount = medal.unlockRequirement.value;
        return fishUnlockStats.totalUnlocked >= requiredCount;
    }
    return false;
};

// 检查钓获里程碑勋章
const checkCatchMilestoneMedal = (medal: Medal, userId: string): boolean => {
    if (medal.unlockRequirement?.type === 'total_catch') {
        const requiredCount = medal.unlockRequirement.value;
        const totalCatches = getTotalCatches(userId);
        return totalCatches >= requiredCount;
    }
    return false;
};

// 检查重量里程碑勋章
const checkWeightMilestoneMedal = (medal: Medal, userId: string): boolean => {
    if (medal.unlockRequirement?.type === 'single_weight') {
        const requiredWeight = medal.unlockRequirement.value;
        const maxSingleWeight = getMaxSingleWeight(userId);
        return maxSingleWeight >= requiredWeight;
    }
    return false;
};

// 检查多样性里程碑勋章
const checkDiversityMilestoneMedal = (medal: Medal, userId: string): boolean => {
    if (medal.unlockRequirement?.type === 'single_diversity') {
        const requiredDiversity = medal.unlockRequirement.value;
        const maxSingleDiversity = getMaxSingleDiversity(userId);
        return maxSingleDiversity >= requiredDiversity;
    }
    return false;
};

// 检查钓点签到勋章
const checkSpotCheckinMedal = (medal: Medal, userId: string): boolean => {
    // 实现钓点签到检查逻辑
    return false;
};

// 检查装备收集勋章
const checkEquipmentCollectMedal = (medal: Medal, equipmentStats: any): boolean => {
    const requiredCount = medal.unlockRequirement?.value || 0;
    return equipmentStats.totalEquipment >= requiredCount;
};

// 检查社区活跃勋章
const checkCommunityActiveMedal = (medal: Medal, userId: string): boolean => {
    // 实现社区活跃检查逻辑
    return false;
};

// 获取用户总钓获数量
const getTotalCatches = (userId: string): number => {
    const records = JSON.parse(localStorage.getItem(`fishing_records_${userId}`) || '[]');
    return records.reduce((total: number, record: any) => {
        return total + record.fishCatches.reduce((sum: number, fc: any) => sum + fc.count, 0);
    }, 0);
};

// 获取用户单次最大重量
const getMaxSingleWeight = (userId: string): number => {
    const records = JSON.parse(localStorage.getItem(`fishing_records_${userId}`) || '[]');
    let maxWeight = 0;
    
    records.forEach((record: any) => {
        const recordWeight = record.fishCatches.reduce((sum: number, fc: any) => sum + fc.weight, 0);
        if (recordWeight > maxWeight) {
            maxWeight = recordWeight;
        }
    });
    
    return maxWeight;
};

// 获取用户单次最大多样性
const getMaxSingleDiversity = (userId: string): number => {
    const records = JSON.parse(localStorage.getItem(`fishing_records_${userId}`) || '[]');
    let maxDiversity = 0;
    
    records.forEach((record: any) => {
        const diversity = record.fishCatches.length;
        if (diversity > maxDiversity) {
            maxDiversity = diversity;
        }
    });
    
    return maxDiversity;
};

// 获取勋章统计信息
export const getMedalStats = (userId: string) => {
    const userMedals = getUserMedals(userId);
    const unlockedMedals = userMedals.medals.filter(m => m.isUnlocked);
    
    return {
        totalMedals: userMedals.totalMedals,
        unlockedCount: userMedals.unlockedCount,
        unlockRate: Math.round((userMedals.unlockedCount / userMedals.totalMedals) * 100),
        rarityStats: {
            common: unlockedMedals.filter(m => m.rarity === 'common').length,
            rare: unlockedMedals.filter(m => m.rarity === 'rare').length,
            epic: unlockedMedals.filter(m => m.rarity === 'epic').length,
            legendary: unlockedMedals.filter(m => m.rarity === 'legendary').length
        }
    };
};

// 获取勋章显示名称
export const getMedalDisplayName = (medal: Medal): string => {
    return medal.name;
};

// 获取勋章图标
export const getMedalIcon = (medal: Medal): string => {
    return medal.icon;
};

// 获取勋章颜色
export const getMedalColor = (medal: Medal): string => {
    return medal.color;
};

// 获取稀有度显示名称
export const getRarityDisplayName = (rarity: string): string => {
    const rarityMap = {
        'common': '普通',
        'rare': '稀有',
        'epic': '史诗',
        'legendary': '传说'
    };
    return rarityMap[rarity as keyof typeof rarityMap] || '未知';
}; 