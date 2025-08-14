<template>
    <div class="rebate-calculator">
        <van-cell-group title="返点计算">
            <van-cell
                title="转出账户返点"
                :value="`${fromRebate}%`"
                class="rebate-cell"
            />
            <van-cell
                title="转入账户返点"
                :value="`${toRebate}%`"
                class="rebate-cell"
            />
            <van-cell
                title="返点差异"
                :value="`${rebateDiff > 0 ? '+' : ''}${rebateDiff}%`"
                :class="['rebate-cell', rebateDiff > 0 ? 'positive' : rebateDiff < 0 ? 'negative' : '']"
            />
        </van-cell-group>
        
        <van-cell-group title="计算结果" v-if="amount > 0">
            <van-cell
                title="转账金额"
                :value="`¥${formatAmount(amount)}`"
                class="amount-cell"
            />
            <van-cell
                title="实际到账"
                :value="`¥${formatAmount(actualAmount)}`"
                class="amount-cell result-amount"
            />
            <van-cell
                v-if="Math.abs(rebateDiff) > 0"
                :title="rebateDiff > 0 ? '增加金额' : '减少金额'"
                :value="`¥${formatAmount(Math.abs(actualAmount - amount))}`"
                :class="['amount-cell', rebateDiff > 0 ? 'positive' : 'negative']"
            />
        </van-cell-group>
        
        <!-- 计算说明 -->
        <div class="calculation-info" v-if="amount > 0 && Math.abs(rebateDiff) > 0">
            <van-notice-bar
                :text="calculationExplanation"
                background="var(--van-background-color-light)"
                color="var(--van-text-color-2)"
                left-icon="info-o"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { calculateTransfer } from '../../utils/rebateCalculator';

interface Props {
    amount: number;
    fromRebate: number;
    toRebate: number;
}

const props = withDefaults(defineProps<Props>(), {
    amount: 0,
    fromRebate: 0,
    toRebate: 0,
});

// 计算返点差异
const rebateDiff = computed(() => {
    return Number((props.toRebate - props.fromRebate).toFixed(2));
});

// 计算实际到账金额
const actualAmount = computed(() => {
    if (props.amount <= 0) return 0;
    
    const result = calculateTransfer(
        props.amount,
        props.fromRebate,
        props.toRebate,
    );
    
    return result.actualAmount;
});

// 格式化金额
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// 计算说明
const calculationExplanation = computed(() => {
    if (Math.abs(rebateDiff.value) === 0) return '';
    
    if (rebateDiff.value > 0) {
        return `由于转入账户返点率更高，实际到账金额增加了 ${rebateDiff.value}%`;
    } else {
        return `由于转入账户返点率更低，实际到账金额减少了 ${Math.abs(rebateDiff.value)}%`;
    }
});
</script>

<style scoped>
.rebate-calculator {
    margin-bottom: 16px;
}

.rebate-cell {
    font-weight: 500;
}

.amount-cell {
    font-weight: bold;
}

.result-amount {
    background-color: var(--van-background-color-light);
}

.positive {
    color: var(--van-success-color);
}

.negative {
    color: var(--van-danger-color);
}

.calculation-info {
    margin-top: 12px;
}

.van-cell-group {
    margin-bottom: 12px;
}

:deep(.van-notice-bar) {
    border-radius: 6px;
    font-size: 12px;
}
</style> 