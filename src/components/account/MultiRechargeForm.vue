<template>
    <div class="multi-recharge-form">
        <!-- 充值账户列表 -->
        <van-cell-group title="充值账户">
            <div
                v-for="(item, index) in rechargeItems"
                :key="item.account.id"
                class="recharge-item"
            >
                <div class="account-header">
                    <van-cell
                        :title="item.account.name"
                        :value="`余额: ¥${formatAmount(item.account.balance)}`"
                        class="account-info-cell"
                    >
                        <template #label>
                            <span class="rebate-text">返点率: {{ item.account.rebate }}%</span>
                        </template>
                        <template #right-icon>
                            <van-button
                                v-if="rechargeItems.length > 1"
                                type="danger"
                                size="mini"
                                icon="cross"
                                @click="removeAccount(index)"
                            />
                        </template>
                    </van-cell>
                </div>
                
                <div class="amount-input-wrapper">
                    <amount-input
                        v-model="item.amount"
                        :label="`充值金额`"
                        :placeholder="`请输入${item.account.name}的充值金额`"
                    />
                </div>
                
                <!-- 充值后预计余额 -->
                <van-cell
                    v-if="item.amount > 0"
                    title="充值后余额"
                    :value="`¥${formatAmount(item.account.balance + item.amount)}`"
                    class="preview-cell"
                />
            </div>
            
            <!-- 添加账户按钮 -->
            <div class="add-account-section">
                <van-button
                    type="primary"
                    size="small"
                    icon="plus"
                    :disabled="availableAccounts.length === 0"
                    @click="showAccountPicker = true"
                >
                    添加账户
                </van-button>
                
                <span v-if="availableAccounts.length === 0" class="no-more-accounts">
                    已添加所有账户
                </span>
            </div>
        </van-cell-group>
        
        <!-- 充值汇总 -->
        <van-cell-group title="充值汇总" v-if="totalAmount > 0">
            <van-cell
                title="充值账户数"
                :value="`${rechargeItems.length}个`"
                class="summary-cell"
            />
            <van-cell
                title="充值总金额"
                :value="`¥${formatAmount(totalAmount)}`"
                class="summary-cell total-amount"
            />
            <van-cell
                title="平均返点率"
                :value="`${averageRebate}%`"
                class="summary-cell"
            />
        </van-cell-group>
        
        <!-- 账户选择弹窗 -->
        <van-popup v-model:show="showAccountPicker" position="bottom">
            <van-picker
                :columns="accountPickerOptions"
                @confirm="onAccountConfirm"
                @cancel="showAccountPicker = false"
                :columns-field-names="{ text: 'name', value: 'id' }"
            />
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showToast } from 'vant';
import AmountInput from './AmountInput.vue';
import type { Account } from '../../types/account';

interface RechargeItem {
    account: Account;
    amount: number;
}

interface Props {
    modelValue: RechargeItem[];
    availableAccounts: Account[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: RechargeItem[]];
}>();

// 响应式数据
const showAccountPicker = ref(false);
const rechargeItems = ref<RechargeItem[]>([]);

// 可选账户（排除已添加的）
const availableAccounts = computed(() => {
    return props.availableAccounts.filter(account =>
        !rechargeItems.value.find(item => item.account.id === account.id)
    );
});

// 账户选择器选项
const accountPickerOptions = computed(() => {
    return availableAccounts.value.map(account => ({
        id: account.id,
        name: `${account.name} (${account.rebate}%)`,
        account,
    }));
});

// 充值总金额
const totalAmount = computed(() => {
    return rechargeItems.value.reduce((total, item) => total + item.amount, 0);
});

// 平均返点率
const averageRebate = computed(() => {
    if (rechargeItems.value.length === 0) return 0;
    
    const totalRebate = rechargeItems.value.reduce(
        (total, item) => total + item.account.rebate,
        0
    );
    
    return Number((totalRebate / rechargeItems.value.length).toFixed(2));
});

// 格式化金额
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// 初始化数据
watch(() => props.modelValue, (newValue) => {
    rechargeItems.value = [...newValue];
}, { immediate: true, deep: true });

// 监听变化并同步到父组件
watch(rechargeItems, (newValue) => {
    emit('update:modelValue', [...newValue]);
}, { deep: true });

// 确认选择账户
const onAccountConfirm = (value: any) => {
    const selectedAccount = value.account;
    
    if (selectedAccount) {
        rechargeItems.value.push({
            account: selectedAccount,
            amount: 0,
        });
        
        showToast(`已添加账户: ${selectedAccount.name}`);
    }
    
    showAccountPicker.value = false;
};

// 移除账户
const removeAccount = (index: number) => {
    const removedAccount = rechargeItems.value[index];
    rechargeItems.value.splice(index, 1);
    showToast(`已移除账户: ${removedAccount.account.name}`);
};

// 初始化时如果有可用账户且没有充值项，自动添加第一个
watch(() => props.availableAccounts, (accounts) => {
    if (accounts.length > 0 && rechargeItems.value.length === 0) {
        rechargeItems.value.push({
            account: accounts[0],
            amount: 0,
        });
    }
}, { immediate: true });
</script>

<style scoped>
.multi-recharge-form {
    margin-bottom: 16px;
}

.recharge-item {
    margin-bottom: 16px;
    border: 1px solid var(--van-border-color);
    border-radius: 8px;
    overflow: hidden;
}

.account-header {
    background-color: var(--van-background-color-light);
}

.account-info-cell {
    padding: 12px 16px;
}

.amount-input-wrapper {
    padding: 0 16px 12px;
}

.preview-cell {
    background-color: var(--van-background-color-light);
    border-top: 1px solid var(--van-border-color);
}

.add-account-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
}

.no-more-accounts {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.summary-cell {
    font-weight: 500;
}

.total-amount {
    background-color: var(--van-background-color-light);
    color: var(--van-primary-color);
    font-weight: bold;
}

.rebate-text {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.van-cell-group {
    margin-bottom: 12px;
}

:deep(.van-button--mini) {
    padding: 2px 6px;
    font-size: 10px;
}
</style> 