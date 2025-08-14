<template>
    <div class="edit-profile-page">
        <van-nav-bar 
            title="编辑资料" 
            left-arrow 
            @click-left="$router.back()"
        >
            <template #right>
                <van-button 
                    type="primary" 
                    size="small"
                    :loading="saving"
                    @click="saveProfile"
                >
                    保存
                </van-button>
            </template>
        </van-nav-bar>

        <div class="edit-content">
            <van-form @submit="saveProfile">
                <!-- 头像上传 -->
                <div class="avatar-section">
                    <div class="avatar-wrapper">
                        <img :src="formData.avatar" alt="头像" class="avatar-preview" />
                        <van-icon 
                            name="photograph" 
                            class="avatar-upload-icon"
                            @click="showAvatarUploader = true"
                        />
                    </div>
                    <div class="avatar-tip">点击更换头像</div>
                </div>

                <!-- 基本信息 -->
                <van-cell-group title="基本信息">
                    <van-field
                        v-model="formData.username"
                        label="用户名"
                        placeholder="请输入用户名"
                        required
                        :rules="[{ required: true, message: '请输入用户名' }]"
                    />
                    <van-field
                        v-model="formData.bio"
                        label="个人简介"
                        type="textarea"
                        placeholder="介绍一下自己吧..."
                        rows="3"
                        maxlength="100"
                        show-word-limit
                    />
                    <van-field
                        v-model="formData.city"
                        label="所在城市"
                        placeholder="请选择城市"
                        readonly
                        @click="showCityPicker = true"
                    />
                </van-cell-group>

                <!-- 钓鱼偏好 -->
                <van-cell-group title="钓鱼偏好">
                    <van-field
                        v-model="formData.favoriteFish"
                        label="最爱鱼种"
                        placeholder="如：鲫鱼、鲤鱼、草鱼等"
                    />
                    <van-field
                        v-model="formData.favoriteSpot"
                        label="最爱钓点类型"
                        placeholder="如：野钓、黑坑、水库等"
                    />
                    <van-field
                        v-model="formData.fishingStyle"
                        label="钓鱼风格"
                        placeholder="如：台钓、路亚、传统钓等"
                    />
                </van-cell-group>
            </van-form>
        </div>

        <!-- 头像上传弹窗 -->
        <van-popup v-model:show="showAvatarUploader" position="bottom" :style="{ height: '40%' }">
            <div class="avatar-upload-popup">
                <van-uploader
                    v-model="avatarFile"
                    :max-count="1"
                    :after-read="afterAvatarRead"
                    :before-delete="beforeAvatarDelete"
                >
                    <div class="upload-tip">
                        <van-icon name="photograph" size="24" />
                        <p>上传头像</p>
                    </div>
                </van-uploader>
            </div>
        </van-popup>

        <!-- 城市选择器 -->
        <van-popup v-model:show="showCityPicker" position="bottom">
            <van-picker
                :columns="cityOptions"
                @confirm="onCityConfirm"
                @cancel="showCityPicker = false"
            />
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';
import { UserLevel } from '../types/fishing';

const router = useRouter();

// 表单数据
const formData = reactive({
    username: '钓鱼老司机',
    avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
    bio: '热爱钓鱼的老司机，专攻野钓，喜欢分享钓鱼心得',
    city: '北京',
    favoriteFish: '鲫鱼、鲤鱼',
    favoriteSpot: '野钓、水库',
    fishingStyle: '台钓'
});

// 表单状态
const saving = ref(false);
const showAvatarUploader = ref(false);
const showCityPicker = ref(false);
const avatarFile = ref([]);

// 城市选项
const cityOptions = [
    { text: '北京', value: '北京' },
    { text: '上海', value: '上海' },
    { text: '广州', value: '广州' },
    { text: '深圳', value: '深圳' },
    { text: '杭州', value: '杭州' },
    { text: '南京', value: '南京' },
    { text: '成都', value: '成都' },
    { text: '武汉', value: '武汉' },
    { text: '西安', value: '西安' },
    { text: '重庆', value: '重庆' }
];

// 事件处理
const onCityConfirm = ({ selectedOptions }: any) => {
    const selected = selectedOptions[0];
    formData.city = selected.text;
    showCityPicker.value = false;
};

const afterAvatarRead = (file: any) => {
    console.log('上传头像:', file);
    // 模拟上传成功
    formData.avatar = file.content || file.url;
    showToast('头像上传成功');
    showAvatarUploader.value = false;
};

const beforeAvatarDelete = (): Promise<boolean> => {
    return new Promise((resolve) => {
        resolve(true);
    });
};

const validateForm = (): boolean => {
    if (!formData.username.trim()) {
        showToast('请输入用户名');
        return false;
    }
    
    if (formData.username.length < 2) {
        showToast('用户名至少2个字符');
        return false;
    }
    
    if (formData.username.length > 20) {
        showToast('用户名不能超过20个字符');
        return false;
    }
    
    return true;
};

const saveProfile = async () => {
    if (!validateForm()) {
        return;
    }
    
    saving.value = true;
    
    try {
        // 模拟保存
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showNotify({
            type: 'success',
            message: '资料保存成功！'
        });
        
        // 返回个人中心
        router.back();
    } catch (error) {
        showToast('保存失败，请重试');
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
.edit-profile-page {
    min-height: 100vh;
    background: var(--van-background-color);
}

.edit-content {
    padding: 12px;
}

.avatar-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 12px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(30, 136, 229, 0.1);
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
}

.avatar-preview {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--van-primary-color);
}

.avatar-upload-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--van-primary-color);
    color: white;
    border-radius: 50%;
    padding: 6px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}

.avatar-tip {
    font-size: 14px;
    color: var(--van-text-color-3);
}

.avatar-upload-popup {
    padding: 20px;
}

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

:deep(.van-cell-group) {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.van-cell-group__title) {
    padding: 12px 16px 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color-2);
    background: white;
}

:deep(.van-cell) {
    padding: 12px 16px;
    background: white;
}

:deep(.van-cell:not(:last-child)::after) {
    border-bottom: 1px solid var(--van-border-color);
    left: 16px;
    right: 0;
}

:deep(.van-field__label) {
    width: 100px;
    color: var(--van-text-color);
}

:deep(.van-field__control) {
    color: var(--van-text-color);
}

:deep(.van-field__placeholder) {
    color: var(--van-text-color-3);
}
</style> 