import { Equipment, UserEquipment, EquipmentType } from '../types/fishing';
import { showToast } from 'vant';

const EQUIPMENT_STORAGE_KEY = 'userEquipment';

// 获取用户装备数据
export const getUserEquipment = (userId: string): Equipment[] => {
    try {
        const data = localStorage.getItem(`${EQUIPMENT_STORAGE_KEY}_${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('获取装备数据失败:', error);
        return [];
    }
};

// 保存用户装备数据
export const saveUserEquipment = (userId: string, equipment: Equipment[]): void => {
    try {
        localStorage.setItem(`${EQUIPMENT_STORAGE_KEY}_${userId}`, JSON.stringify(equipment));
    } catch (error) {
        console.error('保存装备数据失败:', error);
        showToast('保存失败，请重试');
    }
};

// 添加装备
export const addEquipment = (userId: string, equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment => {
    const newEquipment: Equipment = {
        ...equipmentData,
        id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const userEquipment = getUserEquipment(userId);
    userEquipment.push(newEquipment);
    saveUserEquipment(userId, userEquipment);
    
    showToast('装备添加成功');
    return newEquipment;
};

// 更新装备
export const updateEquipment = (userId: string, equipmentId: string, updates: Partial<Equipment>): boolean => {
    const userEquipment = getUserEquipment(userId);
    const index = userEquipment.findIndex(eq => eq.id === equipmentId);
    
    if (index === -1) {
        showToast('装备不存在');
        return false;
    }
    
    userEquipment[index] = {
        ...userEquipment[index],
        ...updates,
        updatedAt: new Date()
    };
    
    saveUserEquipment(userId, userEquipment);
    showToast('装备更新成功');
    return true;
};

// 删除装备
export const deleteEquipment = (userId: string, equipmentId: string): boolean => {
    const userEquipment = getUserEquipment(userId);
    const filteredEquipment = userEquipment.filter(eq => eq.id !== equipmentId);
    
    if (filteredEquipment.length === userEquipment.length) {
        showToast('装备不存在');
        return false;
    }
    
    saveUserEquipment(userId, filteredEquipment);
    showToast('装备删除成功');
    return true;
};

// 获取装备统计信息
export const getEquipmentStats = (userId: string) => {
    const equipment = getUserEquipment(userId);
    const stats = {
        totalEquipment: equipment.length,
        byType: {} as Record<EquipmentType, number>
    };
    
    // 初始化各类型数量
    Object.values(EquipmentType).forEach(type => {
        stats.byType[type] = 0;
    });
    
    // 统计各类型数量
    equipment.forEach(eq => {
        stats.byType[eq.type]++;
    });
    
    return stats;
};

// 按类型获取装备
export const getEquipmentByType = (userId: string, type: EquipmentType): Equipment[] => {
    const equipment = getUserEquipment(userId);
    return equipment.filter(eq => eq.type === type);
};

// 获取装备类型显示名称
export const getEquipmentTypeDisplayName = (type: EquipmentType): string => {
    const typeNames = {
        [EquipmentType.ROD]: '钓竿',
        [EquipmentType.REEL]: '渔轮',
        [EquipmentType.LINE]: '钓线',
        [EquipmentType.HOOK]: '鱼钩',
        [EquipmentType.BAIT]: '饵料',
        [EquipmentType.ACCESSORY]: '配件'
    };
    return typeNames[type] || '未知类型';
};

// 获取装备类型图标
export const getEquipmentTypeIcon = (type: EquipmentType): string => {
    const typeIcons = {
        [EquipmentType.ROD]: '🎣',
        [EquipmentType.REEL]: '⚙️',
        [EquipmentType.LINE]: '🔄',
        [EquipmentType.HOOK]: '🎯',
        [EquipmentType.BAIT]: '🪱',
        [EquipmentType.ACCESSORY]: '🛠️'
    };
    return typeIcons[type] || '📦';
};

// 装备类型选项
export const equipmentTypeOptions = [
    { text: '钓竿', value: EquipmentType.ROD },
    { text: '渔轮', value: EquipmentType.REEL },
    { text: '钓线', value: EquipmentType.LINE },
    { text: '鱼钩', value: EquipmentType.HOOK },
    { text: '饵料', value: EquipmentType.BAIT },
    { text: '配件', value: EquipmentType.ACCESSORY }
]; 