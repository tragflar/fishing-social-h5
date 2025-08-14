<template>
    <div class="add-spot-page">
        <!-- 顶部导航 -->
        <van-nav-bar 
            title="添加钓点" 
            left-arrow 
            @click-left="$router.back()"
        >
            <template #right>
                <van-button 
                    type="primary" 
                    size="small"
                    :loading="submitting"
                    @click="submitSpot"
                >
                    提交
                </van-button>
            </template>
        </van-nav-bar>

        <div class="add-spot-content">
            <van-form @submit="submitSpot">
                <!-- 基本信息 -->
                <div class="form-section">
                    <h3>基本信息</h3>
                    
                    <van-field
                        v-model="formData.name"
                        label="钓点名称"
                        placeholder="请输入钓点名称"
                        required
                        :rules="[{ required: true, message: '请输入钓点名称' }]"
                    />

                    <van-field
                        v-model="formData.typeText"
                        label="钓点类型"
                        placeholder="请选择钓点类型"
                        readonly
                        required
                        @click="showTypePicker = true"
                    />

                    <van-field
                        v-model="formData.description"
                        label="钓点描述"
                        type="textarea"
                        placeholder="请详细描述钓点特色、环境、鱼情等信息..."
                        rows="3"
                        maxlength="200"
                        show-word-limit
                        required
                        :rules="[{ required: true, message: '请输入钓点描述' }]"
                    />
                </div>

                <!-- 位置信息 -->
                <div class="form-section">
                    <h3>位置信息</h3>
                    
                    <div class="location-section">
                        <van-button 
                            type="primary" 
                            block 
                            icon="location-o"
                            @click="selectLocation"
                        >
                            {{ locationText }}
                        </van-button>
                        
                        <div v-if="formData.latitude && formData.longitude" class="location-info">
                            <div class="location-item">
                                <span class="label">纬度:</span>
                                <span class="value">{{ formData.latitude.toFixed(6) }}</span>
                            </div>
                            <div class="location-item">
                                <span class="label">经度:</span>
                                <span class="value">{{ formData.longitude.toFixed(6) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 鱼种信息 -->
                <div class="form-section">
                    <h3>鱼种信息</h3>
                    
                    <van-field
                        v-model="fishSpeciesInput"
                        label="可钓鱼种"
                        placeholder="输入鱼种名称后回车添加"
                        @keyup.enter="addFishSpecies"
                    >
                        <template #button>
                            <van-button 
                                size="small" 
                                type="primary"
                                @click="addFishSpecies"
                            >
                                添加
                            </van-button>
                        </template>
                    </van-field>

                    <div class="fish-species-tags">
                        <van-tag
                            v-for="(species, index) in formData.fishSpecies"
                            :key="index"
                            type="primary"
                            closeable
                            @close="removeFishSpecies(index)"
                        >
                            🐟 {{ species }}
                        </van-tag>
                        <div v-if="formData.fishSpecies.length === 0" class="empty-tip">
                            请添加可钓鱼种
                        </div>
                    </div>
                </div>



                <!-- 图片上传 -->
                <div class="form-section">
                    <h3>钓点图片</h3>
                    
                    <van-uploader
                        v-model="formData.images"
                        multiple
                        :max-count="6"
                        :after-read="afterRead"
                        :before-delete="beforeDelete"
                    >
                        <div class="upload-tip">
                            <van-icon name="photograph" size="24" />
                            <p>上传钓点图片 (最多6张)</p>
                        </div>
                    </van-uploader>
                </div>
            </van-form>
        </div>

        <!-- 钓点类型选择器 -->
        <van-popup v-model:show="showTypePicker" position="bottom">
            <van-picker
                :columns="typeOptions"
                @confirm="onTypeConfirm"
                @cancel="showTypePicker = false"
            />
        </van-popup>

        <!-- 地图选点弹窗 -->
        <van-popup 
            v-model:show="showLocationPicker" 
            position="bottom" 
            :style="{ height: '70%' }"
        >
            <div class="location-picker">
                <div class="picker-header">
                    <h3>选择钓点位置</h3>
                    <van-button 
                        type="primary" 
                        size="small"
                        @click="confirmLocation"
                    >
                        确认位置
                    </van-button>
                </div>
                
                <div class="map-container">
                    <!-- 模拟地图 -->
                    <div class="mock-map" @click="onMapClick">
                        <div class="map-background">
                            <div class="map-grid"></div>
                            
                            <!-- 选中的位置标记 -->
                            <div 
                                v-if="selectedLocation.lat && selectedLocation.lng"
                                class="selected-marker"
                                :style="getMarkerStyle(selectedLocation)"
                            >
                                <div class="marker-icon">📍</div>
                                <div class="marker-pulse"></div>
                            </div>
                            
                            <!-- 地图提示 -->
                            <div class="map-tip">
                                点击地图选择钓点位置
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="location-actions">
                    <van-button 
                        type="default" 
                        block
                        icon="aim"
                        @click="getCurrentLocation"
                    >
                        使用当前位置
                    </van-button>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify, showConfirmDialog } from 'vant';
import { FishingSpotType } from '../types/fishing';

const router = useRouter();

// 表单数据
const formData = ref({
    name: '',
    type: '',
    typeText: '',
    description: '',
    latitude: 0,
    longitude: 0,
    fishSpecies: [] as string[],

    images: [] as any[]
});

// 表单状态
const submitting = ref(false);
const fishSpeciesInput = ref('');

// 弹窗状态
const showTypePicker = ref(false);
const showLocationPicker = ref(false);

// 选中的位置
const selectedLocation = ref({ lat: 0, lng: 0 });

// 钓点类型选项
const typeOptions = [
    { text: '湖泊', value: FishingSpotType.LAKE },
    { text: '河流', value: FishingSpotType.RIVER },
    { text: '水库', value: FishingSpotType.RESERVOIR },
    { text: '黑坑', value: FishingSpotType.BLACK_PIT },
    { text: '海钓', value: FishingSpotType.SALTWATER },
    { text: '淡水', value: FishingSpotType.FRESHWATER }
];



// 计算属性
const locationText = computed(() => {
    if (formData.value.latitude && formData.value.longitude) {
        return '已选择位置 (点击重新选择)';
    }
    return '点击选择钓点位置';
});

// 事件处理
const onTypeConfirm = ({ selectedOptions }: any) => {
    const selected = selectedOptions[0];
    formData.value.type = selected.value;
    formData.value.typeText = selected.text;
    showTypePicker.value = false;
};

const selectLocation = () => {
    showLocationPicker.value = true;
    if (formData.value.latitude && formData.value.longitude) {
        selectedLocation.value = {
            lat: formData.value.latitude,
            lng: formData.value.longitude
        };
    }
};

const onMapClick = (event: MouseEvent) => {
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // 模拟经纬度转换
    const lat = 40.0 - (y - 0.5) * 0.1;
    const lng = 116.0 + (x - 0.5) * 0.1;
    
    selectedLocation.value = { lat, lng };
    showToast('位置已选择');
};

const getCurrentLocation = () => {
    // 模拟获取当前位置
    selectedLocation.value = {
        lat: 39.9042 + (Math.random() - 0.5) * 0.01,
        lng: 116.4074 + (Math.random() - 0.5) * 0.01
    };
    showToast('已获取当前位置');
};

const confirmLocation = () => {
    if (selectedLocation.value.lat && selectedLocation.value.lng) {
        formData.value.latitude = selectedLocation.value.lat;
        formData.value.longitude = selectedLocation.value.lng;
        showLocationPicker.value = false;
        showToast('位置已确认');
    } else {
        showToast('请先选择位置');
    }
};

const getMarkerStyle = (location: { lat: number; lng: number }) => {
    // 模拟位置转换为CSS位置
    const x = ((location.lng - 116.0) / 0.1 + 0.5) * 100;
    const y = ((40.0 - location.lat) / 0.1 + 0.5) * 100;
    
    return {
        left: `${Math.max(5, Math.min(95, x))}%`,
        top: `${Math.max(5, Math.min(95, y))}%`
    };
};

const addFishSpecies = () => {
    const species = fishSpeciesInput.value.trim();
    if (species && !formData.value.fishSpecies.includes(species)) {
        formData.value.fishSpecies.push(species);
        fishSpeciesInput.value = '';
        showToast(`已添加 ${species}`);
    } else if (formData.value.fishSpecies.includes(species)) {
        showToast('该鱼种已存在');
    }
};

const removeFishSpecies = (index: number) => {
    const species = formData.value.fishSpecies[index];
    formData.value.fishSpecies.splice(index, 1);
    showToast(`已移除 ${species}`);
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

const validateForm = (): boolean => {
    if (!formData.value.name.trim()) {
        showToast('请输入钓点名称');
        return false;
    }
    
    if (!formData.value.type) {
        showToast('请选择钓点类型');
        return false;
    }
    
    if (!formData.value.description.trim()) {
        showToast('请输入钓点描述');
        return false;
    }
    
    if (!formData.value.latitude || !formData.value.longitude) {
        showToast('请选择钓点位置');
        return false;
    }
    
    if (formData.value.fishSpecies.length === 0) {
        showToast('请至少添加一种鱼种');
        return false;
    }
    
    return true;
};

const submitSpot = async () => {
    if (!validateForm()) {
        return;
    }
    
    submitting.value = true;
    
    try {
        // 模拟提交
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotify({
            type: 'success',
            message: '钓点提交成功！等待管理员审核'
        });
        
        // 跳转回地图页面
        router.replace('/map');
    } catch (error) {
        showToast('提交失败，请重试');
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.add-spot-page {
    min-height: 100vh;
    background: var(--van-background-color);
}

.add-spot-content {
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

/* 位置信息 */
.location-section {
    margin-top: 12px;
}

.location-info {
    margin-top: 12px;
    padding: 12px;
    background: var(--van-background-color-light);
    border-radius: 8px;
}

.location-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 14px;
}

.location-item:last-child {
    margin-bottom: 0;
}

.label {
    color: var(--van-text-color-2);
}

.value {
    color: var(--van-text-color);
    font-weight: 500;
}

/* 鱼种标签 */
.fish-species-tags {
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

/* 地图选点 */
.location-picker {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--van-border-color);
}

.picker-header h3 {
    margin: 0;
    color: var(--van-text-color);
}

.map-container {
    flex: 1;
    position: relative;
}

.mock-map {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: crosshair;
}

.map-background {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #e8f4f8 25%, transparent 25%), 
                linear-gradient(-45deg, #e8f4f8 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #e8f4f8 75%), 
                linear-gradient(-45deg, transparent 75%, #e8f4f8 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    position: relative;
}

.map-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        linear-gradient(rgba(30, 136, 229, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30, 136, 229, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
}

.selected-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 10;
}

.marker-icon {
    font-size: 24px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.marker-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--van-primary-color);
    opacity: 0.3;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.3;
    }
    100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
    }
}

.map-tip {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
}

.location-actions {
    padding: 16px;
    border-top: 1px solid var(--van-border-color);
}

:deep(.van-field__label) {
    width: 80px;
}

:deep(.van-uploader) {
    margin-top: 8px;
}
</style> 