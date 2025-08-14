<template>
    <div class="add-equipment-form">
        <div class="form-header">
            <h3>添加装备</h3>
            <van-icon name="cross" @click="$emit('cancel')" />
        </div>

        <div class="form-content">
            <!-- 照片上传 -->
            <div class="upload-section">
                <div class="upload-title">装备照片</div>
                <van-uploader
                    v-model="form.images"
                    :max-count="5"
                    multiple
                    :after-read="onImageUpload"
                    :before-delete="onImageDelete"
                />
                <div class="upload-tip">最多上传5张照片</div>
            </div>

            <!-- 装备信息 -->
            <van-field
                v-model="form.name"
                label="装备名称"
                placeholder="请输入装备名称"
                required
                :error="!!errors.name"
                @blur="validateName"
            />

            <van-field
                v-model="form.type"
                label="装备类型"
                readonly
                placeholder="请选择装备类型"
                required
                :error="!!errors.type"
                @click="showTypeSelector = true"
            />

            <van-field
                v-model="form.brand"
                label="品牌型号"
                placeholder="请输入品牌和型号（可选）"
            />

            <van-field
                v-model="form.description"
                label="装备描述"
                type="textarea"
                placeholder="添加装备使用心得、特点等（可选）"
                rows="3"
                maxlength="200"
                show-word-limit
            />
        </div>

        <div class="form-actions">
            <van-button 
                type="primary" 
                block 
                :loading="submitting"
                @click="submitForm"
            >
                保存装备
            </van-button>
        </div>

        <!-- 装备类型选择器 -->
        <van-popup v-model:show="showTypeSelector" position="bottom">
            <van-picker
                :columns="equipmentTypeOptions"
                @confirm="onTypeSelect"
                @cancel="showTypeSelector = false"
            />
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { showToast } from 'vant';
import { EquipmentType } from '../types/fishing';
import { addEquipment, equipmentTypeOptions } from '../utils/equipmentManager';

const emit = defineEmits<{
    submit: [];
    cancel: [];
}>();

const showTypeSelector = ref(false);
const submitting = ref(false);

// 表单数据
const form = reactive({
    name: '',
    type: '',
    brand: '',
    description: '',
    images: [] as any[]
});

// 错误信息
const errors = reactive({
    name: '',
    type: ''
});

// 图片上传处理
const onImageUpload = (file: any) => {
    // 模拟图片上传，实际项目中应该上传到服务器
    const reader = new FileReader();
    reader.onload = (e) => {
        file.url = e.target?.result;
    };
    reader.readAsDataURL(file.file);
};

// 图片删除处理
const onImageDelete = (file: any, detail: any) => {
    form.images.splice(detail.index, 1);
};

// 装备类型选择
const onTypeSelect = (value: any) => {
    form.type = value.value;
    showTypeSelector.value = false;
    errors.type = '';
};

// 验证装备名称
const validateName = () => {
    if (!form.name.trim()) {
        errors.name = '请输入装备名称';
        return false;
    }
    errors.name = '';
    return true;
};

// 验证装备类型
const validateType = () => {
    if (!form.type) {
        errors.type = '请选择装备类型';
        return false;
    }
    errors.type = '';
    return true;
};

// 提交表单
const submitForm = async () => {
    // 验证表单
    const isNameValid = validateName();
    const isTypeValid = validateType();
    
    if (!isNameValid || !isTypeValid) {
        return;
    }

    if (form.images.length === 0) {
        showToast('请至少上传一张装备照片');
        return;
    }

    submitting.value = true;

    try {
        // 处理图片数据
        const images = form.images.map((item: any) => item.url || item.content);

        // 添加装备
        await addEquipment('current_user', {
            name: form.name.trim(),
            type: form.type as EquipmentType,
            brand: form.brand.trim() || undefined,
            description: form.description.trim() || undefined,
            images
        });

        // 重置表单
        resetForm();
        
        // 通知父组件
        emit('submit');
        
    } catch (error) {
        console.error('添加装备失败:', error);
        showToast('添加失败，请重试');
    } finally {
        submitting.value = false;
    }
};

// 重置表单
const resetForm = () => {
    form.name = '';
    form.type = '';
    form.brand = '';
    form.description = '';
    form.images = [];
    errors.name = '';
    errors.type = '';
};
</script>

<style scoped>
.add-equipment-form {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.form-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.form-header .van-icon {
    font-size: 20px;
    color: #999;
    cursor: pointer;
}

.form-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.upload-section {
    margin-bottom: 24px;
}

.upload-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

.form-actions {
    padding: 20px;
    border-top: 1px solid #eee;
}

:deep(.van-field__label) {
    color: #333;
    font-weight: 500;
}

:deep(.van-field__error-message) {
    font-size: 12px;
}

:deep(.van-uploader__upload) {
    background-color: #f5f5f5;
    border: 1px dashed #ddd;
}

:deep(.van-uploader__preview-image) {
    border-radius: 8px;
}
</style> 