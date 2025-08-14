<template>
    <div class="login-page">
        <!-- 顶部Logo区域 -->
        <div class="logo-section">
            <div class="logo-icon">🎣</div>
            <h1 class="app-title">渔友圈</h1>
            <p class="app-subtitle">钓鱼爱好者的专属社交平台</p>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
            <van-notice-bar
                mode="closeable"
                color="#1989fa"
                background="#ecf9ff"
                left-icon="info-o"
            >
                测试提示：输入任意手机号 + 验证码 123456 即可登录
            </van-notice-bar>

            <van-form @submit="handleLogin">
                <van-cell-group inset>
                    <van-field
                        v-model="phone"
                        name="phone"
                        label="手机号"
                        placeholder="请输入手机号"
                        :rules="[{ required: true, message: '请输入手机号' }]"
                        maxlength="11"
                        type="tel"
                    />
                    
                    <van-field
                        v-model="code"
                        name="code"
                        label="验证码"
                        placeholder="请输入验证码"
                        :rules="[{ required: true, message: '请输入验证码' }]"
                        maxlength="6"
                    >
                        <template #button>
                            <van-button
                                size="small"
                                type="primary"
                                :disabled="countdown > 0"
                                @click="sendCode"
                            >
                                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                            </van-button>
                        </template>
                    </van-field>
                </van-cell-group>

                <div class="login-actions">
                    <van-button
                        type="primary"
                        size="large"
                        block
                        :loading="loading"
                        native-type="submit"
                    >
                        立即登录
                    </van-button>
                </div>
            </van-form>

            <!-- 协议条款 -->
            <div class="agreement">
                <van-checkbox v-model="agreed" icon-size="14px">
                    我已阅读并同意
                    <span class="link">《用户协议》</span>
                    和
                    <span class="link">《隐私政策》</span>
                </van-checkbox>
            </div>
        </div>

        <!-- 底部装饰 -->
        <div class="bottom-decoration">
            <div class="wave-bg">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="var(--van-primary-color)" opacity="0.1"></path>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();

// 表单数据
const phone = ref('');
const code = ref('');
const agreed = ref(true);
const loading = ref(false);
const countdown = ref(0);

// 发送验证码
const sendCode = () => {
    if (!phone.value) {
        showToast('请先输入手机号');
        return;
    }

    // 模拟发送验证码
    showToast('验证码已发送');
    countdown.value = 60;
    
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
        }
    }, 1000);
};

// 处理登录
const handleLogin = async () => {
    if (!agreed.value) {
        showToast('请先同意用户协议和隐私政策');
        return;
    }

    loading.value = true;

    try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (code.value === '123456') {
            // 模拟登录成功，保存用户信息到本地存储
            const userData = {
                id: 'user_1',
                username: '钓鱼老司机',
                phone: phone.value,
                avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
                level: 'expert',
                experience: 2580,
                city: '北京',
                loginTime: new Date().getTime()
            };
            
            localStorage.setItem('fishing_user', JSON.stringify(userData));
            localStorage.setItem('fishing_token', 'mock_token_' + Date.now());
            
            showToast('登录成功');
            router.replace('/home');
        } else {
            showToast('验证码错误，请输入 123456');
        }
    } catch (error) {
        showToast('登录失败，请重试');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #E3F2FD 0%, #F8FFFE 100%);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.logo-section {
    text-align: center;
    padding: 60px 20px 40px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.logo-icon {
    font-size: 80px;
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.app-title {
    font-size: 32px;
    font-weight: bold;
    color: var(--van-primary-color);
    margin: 0 0 8px 0;
    text-shadow: 0 2px 4px rgba(30, 136, 229, 0.2);
}

.app-subtitle {
    font-size: 14px;
    color: var(--van-text-color-2);
    margin: 0;
    opacity: 0.8;
}

.login-form {
    padding: 20px;
    background: white;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
}

.login-form .van-notice-bar {
    margin-bottom: 20px;
    border-radius: 8px;
}

.van-cell-group {
    margin-bottom: 20px;
}

.login-actions {
    margin: 24px 0;
}

.agreement {
    text-align: center;
    padding: 16px 0;
    font-size: 12px;
    color: var(--van-text-color-3);
}

.agreement .link {
    color: var(--van-primary-color);
    text-decoration: none;
}

.bottom-decoration {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    z-index: 1;
}

.wave-bg svg {
    width: 100%;
    height: 100%;
}

:deep(.van-field__label) {
    font-weight: 500;
    color: var(--van-text-color);
}

:deep(.van-button--primary) {
    background: linear-gradient(45deg, var(--van-primary-color), var(--van-primary-color-dark));
    border: none;
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

:deep(.van-checkbox__label) {
    font-size: 12px;
    line-height: 1.4;
}
</style> 