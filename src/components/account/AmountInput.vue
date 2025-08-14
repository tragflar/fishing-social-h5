<template>
    <div class="amount-input-wrapper">
        <van-field
            v-model="displayValue"
            readonly
            clickable
            :label="label"
            :placeholder="placeholder"
            class="amount-input"
            @click="showKeyboard = true"
        >
            <template #extra>
                <span class="currency">¥</span>
            </template>
        </van-field>
        
        <!-- 数字键盘 -->
        <van-number-keyboard
            v-model="inputValue"
            :show="showKeyboard"
            :maxlength="10"
            decimal-length="2"
            @blur="showKeyboard = false"
            @input="handleInput"
            @delete="handleDelete"
            @close="showKeyboard = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
    modelValue: number;
    label?: string;
    placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: '金额',
    placeholder: '请输入金额',
});

const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

// 响应式数据
const inputValue = ref('');
const showKeyboard = ref(false);

// 格式化显示值
const displayValue = computed(() => {
    if (!props.modelValue) return '';
    return formatAmount(props.modelValue);
});

// 格式化金额
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// 处理输入
const handleInput = (value: string) => {
    const numValue = parseFloat(value) || 0;
    emit('update:modelValue', numValue);
};

// 处理删除
const handleDelete = () => {
    const currentValue = props.modelValue;
    const newValue = Math.floor(currentValue / 10) / 100;
    emit('update:modelValue', newValue);
};

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
    if (newValue > 0) {
        inputValue.value = newValue.toString();
    } else {
        inputValue.value = '';
    }
}, { immediate: true });
</script>

<style scoped>
.amount-input-wrapper {
    position: relative;
}

.amount-input {
    font-size: 18px;
    font-weight: bold;
}

.amount-input :deep(.van-field__control) {
    font-size: 18px;
    font-weight: bold;
    color: var(--van-primary-color);
}

.currency {
    font-size: 14px;
    color: var(--van-text-color-2);
    margin-right: 4px;
}

/* 数字键盘样式优化 */
:deep(.van-number-keyboard) {
    background-color: #f7f8fa;
}

:deep(.van-number-keyboard__body) {
    background-color: white;
}

:deep(.van-number-keyboard__keys) {
    background-color: white;
}
</style> 