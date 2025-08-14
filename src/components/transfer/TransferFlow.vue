<template>
    <div class="transfer-flow">
        <!-- 步骤指示器 -->
        <van-steps
            :active="currentStep"
            :items="stepItems"
            direction="horizontal"
            active-color="var(--van-primary-color)"
        />
        
        <!-- 步骤内容 -->
        <div class="step-content">
            <!-- 步骤1: 选择转出方 -->
            <div v-if="currentStep === 0" class="step-panel">
                <van-cell-group title="选择转出账户">
                    <account-selector
                        v-model="transferData.sourceAccounts"
                        :accounts="availableSourceAccounts"
                        label="转出账户"
                        placeholder="选择转出账户"
                        :multiple="false"
                    />
                </van-cell-group>
                
                <van-button
                    type="primary"
                    block
                    :disabled="!transferData.sourceAccounts.length"
                    @click="nextStep"
                >
                    下一步
                </van-button>
            </div>
            
            <!-- 步骤2: 选择转入方 -->
            <div v-if="currentStep === 1" class="step-panel">
                <van-cell-group title="选择转入账户">
                    <account-selector
                        v-model="transferData.targetAccounts"
                        :accounts="availableTargetAccounts"
                        label="转入账户"
                        placeholder="选择转入账户"
                        :multiple="false"
                    />
                </van-cell-group>
                
                <div class="step-actions">
                    <van-button plain @click="prevStep">上一步</van-button>
                    <van-button
                        type="primary"
                        :disabled="!transferData.targetAccounts.length"
                        @click="nextStep"
                    >
                        下一步
                    </van-button>
                </div>
            </div>
            
            <!-- 步骤3: 输入金额 -->
            <div v-if="currentStep === 2" class="step-panel">
                <van-cell-group title="转账金额">
                    <amount-input
                        v-model="transferData.amount"
                        label="转账金额"
                        placeholder="请输入转账金额"
                    />
                </van-cell-group>
                
                <!-- 返点计算器 -->
                <rebate-calculator
                    v-if="sourceAccount && targetAccount"
                    :amount="transferData.amount"
                    :from-rebate="sourceAccount.rebate"
                    :to-rebate="targetAccount.rebate"
                />
                
                <div class="step-actions">
                    <van-button plain @click="prevStep">上一步</van-button>
                    <van-button
                        type="primary"
                        :disabled="!transferData.amount"
                        @click="nextStep"
                    >
                        下一步
                    </van-button>
                </div>
            </div>
            
            <!-- 步骤4: 确认转账 -->
            <div v-if="currentStep === 3" class="step-panel">
                <van-cell-group title="转账确认">
                    <van-cell title="转出账户" :value="sourceAccountName" />
                    <van-cell title="转入账户" :value="targetAccountName" />
                    <van-cell title="转账金额" :value="`¥${transferData.amount}`" />
                    <van-cell
                        v-if="rebateDiff !== 0"
                        title="返点差异"
                        :value="`${rebateDiff > 0 ? '+' : ''}${rebateDiff}%`"
                        :class="rebateDiff > 0 ? 'positive' : 'negative'"
                    />
                    <van-cell
                        v-if="actualAmount"
                        title="实际到账"
                        :value="`¥${actualAmount}`"
                        class="amount-text"
                    />
                </van-cell-group>
                
                <div class="step-actions">
                    <van-button plain @click="prevStep">上一步</van-button>
                    <van-button
                        type="primary"
                        :loading="loading"
                        @click="confirmTransfer"
                    >
                        确认转账
                    </van-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import AccountSelector from '../account/AccountSelector.vue';
import AmountInput from '../account/AmountInput.vue';
import RebateCalculator from '../account/RebateCalculator.vue';
import { calculateTransfer } from '../../utils/rebateCalculator';
import { useAccountStore } from '../../store/account';
import type { Account } from '../../types/account';

const accountStore = useAccountStore();

// 转账步骤
const stepItems = [
    { text: '选择转出方' },
    { text: '选择转入方' },
    { text: '输入金额' },
    { text: '确认转账' },
];

// 当前步骤
const currentStep = ref(0);
const loading = ref(false);

// 转账数据
const transferData = ref({
    sourceAccounts: [] as Account[],
    targetAccounts: [] as Account[],
    amount: 0,
});

// 计算属性
const availableSourceAccounts = computed(() => accountStore.accounts);
const availableTargetAccounts = computed(() => {
    return accountStore.accounts.filter(account => 
        account.id !== transferData.value.sourceAccounts[0]?.id
    );
});

const sourceAccountName = computed(() => {
    return transferData.value.sourceAccounts[0]?.name || '';
});

const targetAccountName = computed(() => {
    return transferData.value.targetAccounts[0]?.name || '';
});

const sourceAccount = computed(() => transferData.value.sourceAccounts[0]);
const targetAccount = computed(() => transferData.value.targetAccounts[0]);

const rebateDiff = computed(() => {
    if (!sourceAccount.value || !targetAccount.value) return 0;
    return targetAccount.value.rebate - sourceAccount.value.rebate;
});

const actualAmount = computed(() => {
    if (!transferData.value.amount || !sourceAccount.value || !targetAccount.value) return 0;
    
    const result = calculateTransfer(
        transferData.value.amount,
        sourceAccount.value.rebate,
        targetAccount.value.rebate,
    );
    
    return result.actualAmount;
});

// 步骤控制
const nextStep = () => {
    if (currentStep.value < stepItems.length - 1) {
        currentStep.value++;
    }
};

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

// 确认转账
const confirmTransfer = async () => {
    if (!sourceAccount.value || !targetAccount.value || !transferData.value.amount) {
        showToast('请完善转账信息');
        return;
    }
    
    // 跨公司转账确认
    if (sourceAccount.value.companyId !== targetAccount.value.companyId) {
        const confirmed = await showConfirmDialog({
            title: '跨公司转账',
            message: '将产生额外手续费，是否继续？',
        });
        
        if (!confirmed) return;
    }
    
    loading.value = true;
    
    try {
        const result = await accountStore.transferFunds({
            amount: transferData.value.amount,
            fromRebate: sourceAccount.value.rebate,
            toRebate: targetAccount.value.rebate,
            fromAccountId: sourceAccount.value.id,
            toAccountId: targetAccount.value.id,
        });
        
        if (result.success) {
            showToast('转账成功');
            // 重置表单
            transferData.value = {
                sourceAccounts: [],
                targetAccounts: [],
                amount: 0,
            };
            currentStep.value = 0;
        } else {
            showToast('转账失败');
        }
    } catch (error) {
        showToast('转账失败');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.transfer-flow {
    padding: 16px;
}

.step-content {
    margin-top: 24px;
}

.step-panel {
    min-height: 300px;
}

.step-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.step-actions .van-button {
    flex: 1;
}

.positive {
    color: var(--van-success-color);
}

.negative {
    color: var(--van-danger-color);
}

.amount-text {
    font-weight: bold;
    color: var(--van-primary-color);
}

/* 步骤样式优化 */
:deep(.van-steps) {
    padding: 16px 0;
}

:deep(.van-step) {
    font-size: 14px;
}

:deep(.van-step--horizontal) {
    padding: 0 8px;
}
</style> 