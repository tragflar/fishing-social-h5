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