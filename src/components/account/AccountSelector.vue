<template>
    <div class="account-selector">
        <van-field
            v-model="selectedText"
            readonly
            clickable
            :label="label"
            :placeholder="placeholder"
            @click="showPicker = true"
        >
            <template #extra>
                <span v-if="selectedAccounts.length > 0" class="count">
                    {{ selectedAccounts.length }}个账户
                </span>
            </template>
        </van-field>
        
        <!-- 账户选择弹窗 -->
        <van-popup v-model:show="showPicker" position="bottom" :style="{ height: '60%' }">
            <van-picker
                :columns="accountOptions"
                @confirm="onConfirm"
                @cancel="showPicker = false"
                :columns-field-names="{ text: 'name', value: 'id' }"
            />
        </van-popup>
        
        <!-- 已选账户列表 -->
        <div v-if="selectedAccounts.length > 0" class="selected-accounts">
            <van-cell-group title="已选账户">
                <van-cell
                    v-for="account in selectedAccounts"
                    :key="account.id"
                    :title="account.name"
                    :value="`¥${account.balance} (${account.rebate}%)`"
                    is-link
                    @click="removeAccount(account)"
                >
                    <template #label>
                        <div class="account-info">
                            <span class="rebate-text">返点率: {{ account.rebate }}%</span>
                        </div>
                    </template>
                </van-cell>
            </van-cell-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Account } from '../../types/account';

interface Props {
    modelValue: Account[];
    accounts: Account[];
    label?: string;
    placeholder?: string;
    multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    label: '选择账户',
    placeholder: '请选择账户',
    multiple: true,
});

const emit = defineEmits<{
    'update:modelValue': [value: Account[]];
}>();

// 响应式数据
const showPicker = ref(false);

// 已选账户
const selectedAccounts = computed(() => props.modelValue);

// 可选账户（排除已选的）
const availableAccounts = computed(() => {
    return props.accounts.filter(account => 
        !selectedAccounts.value.find(selected => selected.id === account.id)
    );
});

// 账户选项
const accountOptions = computed(() => {
    return availableAccounts.value.map(account => ({
        id: account.id,
        name: `${account.name} (${account.rebate}%)`,
        balance: account.balance,
        rebate: account.rebate,
    }));
});

// 选中文本显示
const selectedText = computed(() => {
    if (selectedAccounts.value.length === 0) return '';
    if (selectedAccounts.value.length === 1) {
        return selectedAccounts.value[0].name;
    }
    return `${selectedAccounts.value.length}个账户`;
});

// 确认选择
const onConfirm = (value: any) => {
    const selectedAccount = props.accounts.find(acc => acc.id === value.id);
    if (selectedAccount) {
        if (props.multiple) {
            // 多选模式
            const newSelected = [...selectedAccounts.value, selectedAccount];
            emit('update:modelValue', newSelected);
        } else {
            // 单选模式
            emit('update:modelValue', [selectedAccount]);
        }
    }
    showPicker.value = false;
};

// 移除账户
const removeAccount = (account: Account) => {
    const newSelected = selectedAccounts.value.filter(acc => acc.id !== account.id);
    emit('update:modelValue', newSelected);
};
</script>

<style scoped>
.account-selector {
    margin-bottom: 12px;
}

.count {
    font-size: 12px;
    color: var(--van-primary-color);
}

.selected-accounts {
    margin-top: 8px;
}

.account-info {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.rebate-text {
    font-size: 12px;
    color: var(--van-text-color-3);
}

/* 弹窗样式优化 */
:deep(.van-picker) {
    background-color: white;
}

:deep(.van-picker__toolbar) {
    border-bottom: 1px solid var(--van-border-color);
}

:deep(.van-picker-column__item) {
    padding: 12px 16px;
}
</style> 