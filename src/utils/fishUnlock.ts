import { UserFishProgress, FishUnlockStatus } from '../types/fishing';
import { getFishById } from '../data/fishSpecies';
import { showToast } from 'vant';

// 本地存储键名
const FISH_PROGRESS_KEY = 'fishProgress';

// 获取用户鱼类解锁进度
export const getUserFishProgress = (userId: string): UserFishProgress => {
    try {
        const stored = localStorage.getItem(`${FISH_PROGRESS_KEY}_${userId}`);
        if (stored) {
            const data = JSON.parse(stored);
            // 转换日期字符串为Date对象
            Object.keys(data.unlockedFish).forEach(fishId => {
                if (data.unlockedFish[fishId].firstCatchDate) {
                    data.unlockedFish[fishId].firstCatchDate = new Date(data.unlockedFish[fishId].firstCatchDate);
                }
            });
            return data;
        }
    } catch (error) {
        console.error('读取鱼类解锁进度失败:', error);
    }
    
    return {
        userId,
        unlockedFish: {},
        totalUnlocked: 0
    };
};

// 保存用户鱼类解锁进度
export const saveUserFishProgress = (userId: string, progress: UserFishProgress): void => {
    try {
        localStorage.setItem(`${FISH_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    } catch (error) {
        console.error('保存鱼类解锁进度失败:', error);
    }
};

// 解锁鱼类
export const unlockFish = (userId: string, fishName: string, catchData: {
    date: Date;
    weight: number;
}): boolean => {
    const userProgress = getUserFishProgress(userId);
    
    // 使用鱼类名称作为ID
    const fishId = fishName;
    
    if (!userProgress.unlockedFish[fishId]?.isUnlocked) {
        // 首次解锁
        userProgress.unlockedFish[fishId] = {
            isUnlocked: true,
            firstCatchDate: catchData.date,
            totalCatchCount: 1
        };
        userProgress.totalUnlocked++;
        
        // 保存进度
        saveUserFishProgress(userId, userProgress);
        
        // 显示解锁动画
        showUnlockAnimation(fishName);
        
        return true;
    } else {
        // 已解锁，增加计数
        userProgress.unlockedFish[fishId].totalCatchCount++;
        saveUserFishProgress(userId, userProgress);
        return false;
    }
};

// 显示解锁动画
const showUnlockAnimation = (fishName: string): void => {
    showToast({
        message: `🎉 解锁新鱼类：${fishName}！`,
        type: 'success',
        duration: 3000
    });
};

// 获取鱼类解锁状态
export const getFishUnlockStatus = (userId: string, fishId: string): FishUnlockStatus => {
    const userProgress = getUserFishProgress(userId);
    const fishData = userProgress.unlockedFish[fishId];
    
    return {
        fishId,
        isUnlocked: fishData?.isUnlocked || false,
        firstCatchDate: fishData?.firstCatchDate,
        totalCatchCount: fishData?.totalCatchCount || 0
    };
};

// 获取用户解锁统计
export const getUserUnlockStats = (userId: string) => {
    const userProgress = getUserFishProgress(userId);
    const totalFish = 15; // 总鱼类数量，可以从fishSpeciesData.length获取
    
    return {
        totalUnlocked: userProgress.totalUnlocked,
        totalFish,
        unlockPercentage: Math.round((userProgress.totalUnlocked / totalFish) * 100)
    };
};

// 检查是否为新解锁
export const isNewUnlock = (userId: string, fishId: string): boolean => {
    const userProgress = getUserFishProgress(userId);
    return !userProgress.unlockedFish[fishId]?.isUnlocked;
};

// 重置用户解锁进度（用于测试）
export const resetUserFishProgress = (userId: string): void => {
    localStorage.removeItem(`${FISH_PROGRESS_KEY}_${userId}`);
}; 