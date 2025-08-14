<template>
    <div class="add-record-page">
        <!-- 顶部导航 -->
        <van-nav-bar 
            title="添加记录" 
            left-arrow 
            @click-left="$router.back()"
        >
            <template #right>
                <van-button 
                    type="primary" 
                    size="small"
                    :loading="submitting"
                    @click="submitRecord"
                >
                    保存
                </van-button>
            </template>
        </van-nav-bar>

        <div class="add-record-content">
            <van-form @submit="submitRecord">
                <!-- 钓获心得（顶部，右侧图片icon上传） -->
                <div class="form-section note-section">
                    <h3>💭 钓获心得</h3>
                    <div class="note-upload-row">
                        <van-field
                            v-model="formData.notes"
                            type="textarea"
                            placeholder="分享你的钓鱼心得、技巧或感受..."
                            rows="4"
                            maxlength="300"
                            show-word-limit
                        />
                        <div class="note-upload-icons">
                            <van-icon 
                                name="photograph" 
                                size="28" 
                                class="upload-icon"
                                @click="showImageUploader = true"
                            />
                            <div class="note-images">
                                <img 
                                    v-for="(img, idx) in formData.images" 
                                    :key="idx" 
                                    :src="img.url || img" 
                                    class="note-thumb"
                                    @click="previewImage(idx)"
                                />
                                <van-icon 
                                    v-if="formData.images.length > 0" 
                                    name="close" 
                                    size="18" 
                                    class="img-remove"
                                    v-for="(img, idx) in formData.images"
                                    :key="'remove-'+idx"
                                    @click.stop="removeImage(idx)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 钓获信息 -->
                <div class="form-section">
                    <h3>🐟 钓获信息</h3>
                    
                    <!-- 鱼种选择器 -->
                    <van-field
                        v-model="selectedFishSpecies"
                        label="选择鱼种"
                        placeholder="请选择鱼种"
                        readonly
                        @click="showFishPicker = true"
                    />
                    
                    <!-- 已选择的鱼种列表 -->
                    <div v-if="formData.fishCatches.length > 0" class="fish-catches-list">
                        <div 
                            v-for="(fishCatch, index) in formData.fishCatches" 
                            :key="index"
                            class="fish-catch-item"
                        >
                            <div class="fish-catch-header">
                                <span class="fish-species-name">{{ fishCatch.fishSpecies }}</span>
                                <van-icon 
                                    name="close" 
                                    size="16" 
                                    class="remove-fish"
                                    @click="removeFishCatch(index)"
                                />
                            </div>
                            <div class="fish-catch-details">
                                <van-field
                                    :model-value="fishCatch.count.toString()"
                                    label="尾数"
                                    type="number"
                                    placeholder="尾数"
                                    :rules="[{ required: true, message: '请输入尾数' }]"
                                    @input="updateFishCatch(index, 'count', $event)"
                                />
                                <van-field
                                    :model-value="fishCatch.weight.toString()"
                                    label="重量(kg)"
                                    type="digit"
                                    placeholder="重量"
                                    :rules="[{ required: true, message: '请输入重量' }]"
                                    @input="updateFishCatch(index, 'weight', $event)"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- 添加鱼种按钮 -->
                    <van-button 
                        v-if="selectedFishSpecies && !isFishSpeciesAdded"
                        type="primary" 
                        size="small" 
                        block
                        @click="addFishCatch"
                        class="add-fish-btn"
                    >
                        添加 {{ selectedFishSpecies }}
                    </van-button>
                </div>

                <!-- 钓点信息 -->
                <div class="form-section">
                    <h3>📍 钓点信息</h3>
                    <van-field
                        v-model="formData.spotName"
                        label="钓点"
                        placeholder="请选择钓点"
                        readonly
                        required
                        @click="showSpotPicker = true"
                    />
                </div>
            </van-form>
        </div>

        <!-- 图片上传弹窗 -->
        <van-popup v-model:show="showImageUploader" position="bottom" :style="{ height: '40%' }">
            <div class="image-upload-popup">
                <van-uploader
                    v-model="formData.images"
                    multiple
                    :max-count="9"
                    :after-read="afterRead"
                    :before-delete="beforeDelete"
                >
                    <div class="upload-tip">
                        <van-icon name="photograph" size="24" />
                        <p>上传钓获照片 (最多9张)</p>
                    </div>
                </van-uploader>
            </div>
        </van-popup>

        <!-- 鱼种选择器 -->
        <van-popup v-model:show="showFishPicker" position="bottom">
            <van-picker
                :columns="fishSpeciesOptions"
                @confirm="onFishSpeciesConfirm"
                @cancel="showFishPicker = false"
            />
        </van-popup>

        <!-- 钓点选择器 -->
        <van-popup v-model:show="showSpotPicker" position="bottom">
            <van-picker
                :columns="spotOptions"
                @confirm="onSpotConfirm"
                @cancel="showSpotPicker = false"
            />
        </van-popup>

        <!-- 时间选择器 -->
        <van-popup v-model:show="showTimePicker" position="bottom">
            <van-date-picker
                v-model="selectedTime"
                type="datetime"
                title="选择钓获时间"
                @confirm="onTimeConfirm"
                @cancel="showTimePicker = false"
            />
        </van-popup>

        <!-- 勋章解锁动画 -->
        <MedalUnlockAnimation 
            v-if="showMedalAnimation"
            :medal="unlockedMedal"
            :show="showMedalAnimation"
            @close="showMedalAnimation = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify, showConfirmDialog } from 'vant';
import { type WeatherInfo, type FishCatch, type Medal } from '../types/fishing';
import { checkAndUpdateMedals } from '../utils/medalManager';
import { unlockFish } from '../utils/fishUnlock';
import MedalUnlockAnimation from '../components/MedalUnlockAnimation.vue';

const router = useRouter();

// 表单数据
const formData = ref({
    spotId: '',
    spotName: '',
    bait: '',
    duration: '',
    catchTime: '',
    equipment: [] as string[],
    weather: {
        temperature: 0,
        humidity: 0,
        pressure: 0,
        windSpeed: 0,
        weather: '',
        windDirection: '',
        suitabilityIndex: 8
    } as Partial<WeatherInfo>,
    images: [] as any[],
    notes: '',
    isPersonalBest: false,
    isNewSpot: false,
    isNewSpecies: false,
    fishCatches: [] as FishCatch[] // 新增鱼种捕获列表
});

// 表单状态
const submitting = ref(false);
const equipmentInput = ref('');
const selectedTime = ref(['2024', '01', '15', '12', '00']);
const selectedFishSpecies = ref(''); // 新增选中的鱼种

// 弹窗状态
const showSpotPicker = ref(false);
const showTimePicker = ref(false);
const showWeatherPicker = ref(false);
const showWindPicker = ref(false);
const showImageUploader = ref(false);
const showFishPicker = ref(false); // 新增鱼种选择器弹窗状态

// 勋章解锁动画状态
const showMedalAnimation = ref(false);
const unlockedMedal = ref<Medal | null>(null);

// 选项数据
const spotOptions = [
    { text: '翠湖公园钓点', value: 'spot_1' },
    { text: '野鸭湖水库', value: 'spot_2' },
    { text: '通州运河钓场', value: 'spot_3' },
    { text: '金海湖黑坑', value: 'spot_4' }
];

const fishSpeciesOptions = [
    { text: '鲫鱼', value: '鲫鱼' },
    { text: '鲤鱼', value: '鲤鱼' },
    { text: '草鱼', value: '草鱼' },
    { text: '鲢鱼', value: '鲢鱼' },
    { text: '青鱼', value: '青鱼' },
    { text: '鲈鱼', value: '鲈鱼' },
    { text: '鳊鱼', value: '鳊鱼' },
    { text: '鲶鱼', value: '鲶鱼' },
    { text: '黑鱼', value: '黑鱼' },
    { text: '白条', value: '白条' }
];

const weatherOptions = [
    { text: '晴天', value: '晴天' },
    { text: '多云', value: '多云' },
    { text: '阴天', value: '阴天' },
    { text: '小雨', value: '小雨' },
    { text: '中雨', value: '中雨' },
    { text: '大雨', value: '大雨' },
    { text: '雪天', value: '雪天' }
];

const windOptions = [
    { text: '无风', value: '无风' },
    { text: '微风', value: '微风' },
    { text: '东风', value: '东风' },
    { text: '南风', value: '南风' },
    { text: '西风', value: '西风' },
    { text: '北风', value: '北风' },
    { text: '东南风', value: '东南风' },
    { text: '西南风', value: '西南风' },
    { text: '东北风', value: '东北风' },
    { text: '西北风', value: '西北风' }
];

// 计算属性
const isFishSpeciesAdded = computed(() => {
    return formData.value.fishCatches.some(fc => fc.fishSpecies === selectedFishSpecies.value);
});

// 事件处理
const onSpotConfirm = ({ selectedOptions }: any) => {
    const selected = selectedOptions[0];
    formData.value.spotId = selected.value;
    formData.value.spotName = selected.text;
    showSpotPicker.value = false;
};

const onFishSpeciesConfirm = ({ selectedOptions }: any) => {
    selectedFishSpecies.value = selectedOptions[0].text;
    showFishPicker.value = false;
};

const onTimeConfirm = () => {
    const [year, month, day, hour, minute] = selectedTime.value;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    formData.value.catchTime = date.toLocaleString('zh-CN');
    showTimePicker.value = false;
};

const onWeatherConfirm = ({ selectedOptions }: any) => {
    formData.value.weather.weather = selectedOptions[0].text;
    showWeatherPicker.value = false;
};

const onWindConfirm = ({ selectedOptions }: any) => {
    formData.value.weather.windDirection = selectedOptions[0].text;
    showWindPicker.value = false;
};

const addEquipment = () => {
    const equipment = equipmentInput.value.trim();
    if (equipment && !formData.value.equipment.includes(equipment)) {
        formData.value.equipment.push(equipment);
        equipmentInput.value = '';
        showToast(`已添加 ${equipment}`);
    } else if (formData.value.equipment.includes(equipment)) {
        showToast('该装备已存在');
    }
};

const removeEquipment = (index: number) => {
    const equipment = formData.value.equipment[index];
    formData.value.equipment.splice(index, 1);
    showToast(`已移除 ${equipment}`);
};

const afterRead = (file: any) => {
    console.log('上传文件:', file);
    showToast('图片上传功能开发中');
};

const beforeDelete = (): Promise<boolean> => {
    return new Promise((resolve) => {
        showConfirmDialog({
            title: '确认删除',
            message: '确定要删除这张图片吗？'
        }).then(() => {
            resolve(true);
        }).catch(() => {
            resolve(false);
        });
    });
};

const previewImage = (index: number) => {
    if (formData.value.images[index] && formData.value.images[index].url) {
        showToast(`预览图片: ${formData.value.images[index].url}`);
    } else {
        showToast(`预览图片: ${formData.value.images[index]}`);
    }
};

const removeImage = (index: number) => {
    formData.value.images.splice(index, 1);
    showToast('图片已移除');
};

const addFishCatch = () => {
    if (selectedFishSpecies.value && !formData.value.fishCatches.some(fc => fc.fishSpecies === selectedFishSpecies.value)) {
        formData.value.fishCatches.push({
            fishSpecies: selectedFishSpecies.value,
            count: 1,
            weight: 0
        });
        showToast(`已添加 ${selectedFishSpecies.value}`);
        selectedFishSpecies.value = ''; // 清空选择框
    } else {
        showToast('该鱼种已添加');
    }
};

const removeFishCatch = (index: number) => {
    const removedFish = formData.value.fishCatches.splice(index, 1)[0];
    showToast(`已移除 ${removedFish.fishSpecies}`);
};

const updateFishCatch = (index: number, field: 'count' | 'weight', value: string | number) => {
    let numValue: number;
    
    if (typeof value === 'string') {
        numValue = parseFloat(value);
    } else {
        numValue = value;
    }
    
    if (!isNaN(numValue) && numValue >= 0) {
        formData.value.fishCatches[index][field] = numValue;
    } else {
        formData.value.fishCatches[index][field] = 0;
    }
};

const validateForm = (): boolean => {
    if (formData.value.fishCatches.length === 0) {
        showToast('请至少添加一条鱼种捕获信息');
        return false;
    }
    
    // 验证每个鱼种的尾数和重量
    for (const fishCatch of formData.value.fishCatches) {
        if (fishCatch.count <= 0) {
            showToast(`请输入${fishCatch.fishSpecies}的有效尾数`);
            return false;
        }
        if (fishCatch.weight <= 0) {
            showToast(`请输入${fishCatch.fishSpecies}的有效重量`);
            return false;
        }
    }
    
    if (!formData.value.spotId) {
        showToast('请选择钓点');
        return false;
    }
    
    return true;
};

const submitRecord = async () => {
    if (!validateForm()) {
        return;
    }
    
    submitting.value = true;
    
    try {
        // 构建记录数据
        const recordData = {
            id: `record_${Date.now()}`,
            userId: 'current_user',
            spotId: formData.value.spotId,
            spotName: formData.value.spotName,
            fishCatches: formData.value.fishCatches,
            images: formData.value.images.map(img => img.url || img),
            equipment: formData.value.equipment,
            bait: formData.value.bait,
            weather: formData.value.weather,
            catchTime: new Date(),
            createdAt: new Date(),
            notes: formData.value.notes,
            likes: 0,
            comments: [],
            isPersonalBest: false,
            isNewSpot: false,
            isNewSpecies: false
        };
        
        // 保存到localStorage
        const existingRecords = JSON.parse(localStorage.getItem('fishing_records_current_user') || '[]');
        existingRecords.push(recordData);
        localStorage.setItem('fishing_records_current_user', JSON.stringify(existingRecords));
        
        // 模拟提交
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showNotify({
            type: 'success',
            message: '钓获记录保存成功！'
        });
        
        // 解锁鱼类和勋章
        await unlockFishAndMedals();
        
        // 跳转到记录页面
        router.replace('/record');
        
    } catch (error) {
        showToast('保存失败，请重试');
    } finally {
        submitting.value = false;
    }
};

// 解锁鱼类和勋章
const unlockFishAndMedals = async () => {
    const userId = 'current_user'; // 这里应该从用户状态获取
    
    try {
        // 解锁鱼类
        for (const fishCatch of formData.value.fishCatches) {
            unlockFish(userId, fishCatch.fishSpecies, {
                date: new Date(),
                weight: fishCatch.weight
            });
        }
        
        // 检查并解锁勋章
        const unlockedMedals = checkAndUpdateMedals(userId);
        
        // 显示解锁提示
        if (unlockedMedals.length > 0) {
            showUnlockNotification(unlockedMedals);
        }
        
    } catch (error) {
        console.error('解锁失败:', error);
    }
};

// 显示解锁通知
const showUnlockNotification = (medals: any[]) => {
    if (medals.length === 1) {
        showNotify({
            type: 'success',
            message: `🎉 恭喜解锁勋章：${medals[0].name}！`
        });
        unlockedMedal.value = medals[0];
        showMedalAnimation.value = true;
    } else {
        showNotify({
            type: 'success',
            message: `🎉 恭喜解锁 ${medals.length} 个勋章！`
        });
        unlockedMedal.value = medals[0]; // 假设第一个是代表
        showMedalAnimation.value = true;
    }
};
</script>

<style scoped>
.add-record-page {
    min-height: 100vh;
    background: var(--van-background-color);
}

.add-record-content {
    padding: 12px;
}

.form-section {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
}

.form-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--van-text-color);
    font-weight: 600;
}

/* 装备标签 */
.equipment-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    min-height: 32px;
    align-items: center;
}

.empty-tip {
    color: var(--van-text-color-3);
    font-size: 14px;
}

/* 天气网格 */
.weather-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
}

/* 上传提示 */
.upload-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--van-text-color-3);
}

.upload-tip p {
    margin: 8px 0 0 0;
    font-size: 14px;
}

/* 成就选项 */
.achievement-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

:deep(.van-field__label) {
    width: 100px;
}

:deep(.van-uploader) {
    margin-top: 8px;
}

/* 新增样式 */
.note-section {
    position: relative;
}

.note-upload-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.note-upload-icons {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: var(--van-background-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.note-images {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
}

.note-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
}

.img-remove {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--van-background-color);
    border-radius: 50%;
    border: 1px solid var(--van-border-color);
    color: var(--van-text-color-3);
    font-size: 14px;
    padding: 2px;
    cursor: pointer;
    z-index: 10;
}

.image-upload-popup {
    padding: 10px;
}

/* 鱼种捕获列表样式 */
.fish-catches-list {
    margin-top: 12px;
    padding: 12px;
    background-color: var(--van-background-color-light);
    border-radius: 8px;
    border: 1px solid var(--van-border-color);
}

.fish-catch-item {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.fish-catch-item:last-child {
    margin-bottom: 0;
}

.fish-catch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--van-border-color-light);
}

.fish-species-name {
    font-weight: 600;
    color: var(--van-text-color);
    font-size: 16px;
}

.remove-fish {
    color: var(--van-danger-color);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.remove-fish:hover {
    background-color: var(--van-danger-color-light);
}

.fish-catch-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.add-fish-btn {
    margin-top: 12px;
}
</style> 