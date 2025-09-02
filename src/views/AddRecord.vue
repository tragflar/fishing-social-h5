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

                <!-- 鱼种信息 -->
                <div class="form-section">
                    <h3>🐟 鱼种信息</h3>
                    
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

                <!-- 钓点位置 -->
                <div class="form-section">
                    <h3>📍 钓点位置</h3>
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
import { type FishCatch, type Medal } from '../types/fishing';
import { checkAndUpdateMedals } from '../utils/medalManager';
import { unlockFish } from '../utils/fishUnlock';
import MedalUnlockAnimation from '../components/MedalUnlockAnimation.vue';

const router = useRouter();

// 简化的表单数据，只保留必要字段
const formData = ref({
    spotId: '',
    spotName: '',
    images: [] as any[],
    notes: '',
    fishCatches: [] as FishCatch[]
});

// 表单状态
const submitting = ref(false);
const selectedFishSpecies = ref('');

// 弹窗状态
const showSpotPicker = ref(false);
const showImageUploader = ref(false);
const showFishPicker = ref(false);

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
        selectedFishSpecies.value = '';
    } else {
        showToast('该鱼种已添加');
    }
};

const removeFishCatch = (index: number) => {
    const removedFish = formData.value.fishCatches.splice(index, 1)[0];
    showToast(`已移除 ${removedFish.fishSpecies}`);
};

// 简化的提交函数
const submitRecord = async () => {
    if (submitting.value) return;
    
    // 基本验证
    if (!formData.value.spotName) {
        showToast('请选择钓点');
        return;
    }
    
    if (formData.value.fishCatches.length === 0) {
        showToast('请至少添加一种鱼类');
        return;
    }
    
    submitting.value = true;
    
    try {
        // 模拟保存数据
        const recordData = {
            id: Date.now().toString(),
            userId: 'current_user',
            spotId: formData.value.spotId,
            spotName: formData.value.spotName,
            fishCatches: formData.value.fishCatches,
            images: formData.value.images,
            notes: formData.value.notes,
            createTime: new Date().toISOString()
        };
        
        // 保存到localStorage
        const existingRecords = JSON.parse(localStorage.getItem('fishing_records') || '[]');
        existingRecords.push(recordData);
        localStorage.setItem('fishing_records', JSON.stringify(existingRecords));
        
        // 解锁鱼类
        formData.value.fishCatches.forEach(fishCatch => {
            unlockFish('current_user', fishCatch.fishSpecies);
        });
        
        // 检查勋章解锁
        const newMedals = checkAndUpdateMedals('current_user');
        if (newMedals.length > 0) {
            unlockedMedal.value = newMedals[0];
            showMedalAnimation.value = true;
            
            setTimeout(() => {
                showToast('记录保存成功！');
                router.back();
            }, 3000);
        } else {
            showToast('记录保存成功！');
            router.back();
        }
        
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败，请重试');
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.add-record-page {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.add-record-content {
    padding: 16px;
}

.form-section {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.note-section .note-upload-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.note-upload-row .van-field {
    flex: 1;
}

.note-upload-icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.upload-icon {
    color: #1989fa;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    background: #f0f8ff;
}

.note-images {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 80px;
}

.note-thumb {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    object-fit: cover;
    cursor: pointer;
}

.img-remove {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4444;
    color: white;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
}

.fish-catches-list {
    margin-top: 12px;
}

.fish-catch-item {
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
    background: #fafafa;
}

.fish-catch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.fish-species-name {
    font-weight: 600;
    color: #333;
}

.remove-fish {
    color: #ff4444;
    cursor: pointer;
}

.add-fish-btn {
    margin-top: 12px;
}

.image-upload-popup {
    padding: 20px;
    text-align: center;
}

.upload-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #666;
    padding: 20px;
    border: 2px dashed #ddd;
    border-radius: 8px;
    cursor: pointer;
}

.upload-tip:hover {
    border-color: #1989fa;
    color: #1989fa;
}
</style>