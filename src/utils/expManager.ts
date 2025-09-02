// 钓点签到
export const spotCheckin = (userId: string, spotId: string, spotName: string): boolean => {
    // 简单的签到逻辑
    const key = `spot_checkin_${userId}_${spotId}_${new Date().toDateString()}`;
    if (localStorage.getItem(key)) {
        return false;
    }
    localStorage.setItem(key, 'true');
    return true;
};

// 获取用户经验信息
export const getUserExpInfo = (userId: string) => {
    // 从localStorage获取用户经验数据
    const expData = localStorage.getItem(`user_exp_${userId}`);
    
    if (expData) {
        return JSON.parse(expData);
    }
    
    // 默认返回新手等级
    const defaultExpInfo = {
        currentLevel: 'newbie',
        exp: 0,
        levelExp: 0,
        nextLevelExp: 100
    };
    
    // 保存默认数据
    localStorage.setItem(`user_exp_${userId}`, JSON.stringify(defaultExpInfo));
    
    return defaultExpInfo;
};

// 增加用户经验
export const addUserExp = (userId: string, expAmount: number) => {
    const userExpInfo = getUserExpInfo(userId);
    userExpInfo.exp += expAmount;
    userExpInfo.levelExp += expAmount;
    
    // 检查是否升级
    const levelThresholds = {
        'newbie': 100,
        'intermediate': 300,
        'advanced': 600,
        'expert': 1000,
        'master': 1500,
        'legend': 2500
    };
    
    const levels = ['newbie', 'intermediate', 'advanced', 'expert', 'master', 'legend'];
    const currentLevelIndex = levels.indexOf(userExpInfo.currentLevel);
    
    // 检查升级
    for (let i = currentLevelIndex + 1; i < levels.length; i++) {
        const level = levels[i];
        if (userExpInfo.exp >= levelThresholds[level as keyof typeof levelThresholds]) {
            userExpInfo.currentLevel = level;
            userExpInfo.levelExp = userExpInfo.exp - levelThresholds[level as keyof typeof levelThresholds];
        } else {
            break;
        }
    }
    
    // 设置下一级所需经验
    const nextLevelIndex = levels.indexOf(userExpInfo.currentLevel) + 1;
    if (nextLevelIndex < levels.length) {
        const nextLevel = levels[nextLevelIndex];
        userExpInfo.nextLevelExp = levelThresholds[nextLevel as keyof typeof levelThresholds] - userExpInfo.exp;
    } else {
        userExpInfo.nextLevelExp = 0; // 已达到最高等级
    }
    
    // 保存更新后的经验数据
    localStorage.setItem(`user_exp_${userId}`, JSON.stringify(userExpInfo));
    
    return userExpInfo;
};