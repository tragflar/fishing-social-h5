<template>
    <div v-if="show" class="medal-unlock-animation">
        <div class="medal-animation-container">
            <div class="medal-icon">{{ medal.icon }}</div>
            <div class="medal-name">{{ medal.name }}</div>
            <div class="medal-description">{{ medal.description }}</div>
            <div class="unlock-text">🎉 解锁成功！</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Medal } from '../types/fishing';

interface Props {
    medal: Medal;
    show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    close: [];
}>();

onMounted(() => {
    if (props.show) {
        setTimeout(() => {
            emit('close');
        }, 3000);
    }
});
</script>

<style scoped>
.medal-unlock-animation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-in-out;
}

.medal-animation-container {
    background: white;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.5s ease-out;
    max-width: 300px;
    width: 90%;
}

.medal-icon {
    font-size: 64px;
    margin-bottom: 16px;
    animation: bounce 1s ease-in-out;
}

.medal-name {
    font-size: 24px;
    font-weight: bold;
    color: var(--van-text-color);
    margin-bottom: 8px;
}

.medal-description {
    font-size: 14px;
    color: var(--van-text-color-2);
    margin-bottom: 16px;
}

.unlock-text {
    font-size: 16px;
    color: var(--van-primary-color);
    font-weight: 600;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-50px) scale(0.8);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-20px);
    }
    60% {
        transform: translateY(-10px);
    }
}
</style> 