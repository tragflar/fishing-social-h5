<template>
    <div class="account-balance-card">
        <div class="custom-card">
            <div class="card-header">
                <div class="account-basic-info">
                    <h3 class="account-name">{{ account.name }}</h3>
                    <span class="company-name">{{ companyName }}</span>
                </div>
                <div class="account-status">
                    <van-tag :type="statusType">
                        {{ statusText }}
                    </van-tag>
                </div>
            </div>
            
            <div class="balance-section">
                <div class="balance-main">
                    <span class="balance-label">账户余额</span>
                    <div class="balance-amount">
                        <span class="currency">¥</span>
                        <span class="amount">{{ formatAmount(account.balance) }}</span>
                    </div>
                </div>
                
                <div class="balance-details">
                    <div class="detail-item">
                        <span class="label">返点率</span>
                        <span class="value rebate-value">{{ account.rebate }}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">交易次数</span>
                        <span class="value">{{ account.transactions.length }}</span>
                    </div>
                </div>
            </div>
            
            <!-- 返点历史趋势 -->
            <div class="rebate-trend" v-if="account.rebateHistory.length > 1">
                <div class="trend-header">
                    <span class="trend-title">返点趋势</span>
                    <van-icon 
                        :name="rebateTrend > 0 ? 'arrow-up' : rebateTrend < 0 ? 'arrow-down' : 'minus'"
                        :color="rebateTrend > 0 ? 'var(--van-success-color)' : rebateTrend < 0 ? 'var(--van-danger-color)' : 'var(--van-text-color-3)'"
                        size="14"
                    />
                </div>
                <div class="trend-value">
                    <span :class="['trend-text', rebateTrend > 0 ? 'positive' : rebateTrend < 0 ? 'negative' : '']">
                        {{ rebateTrend > 0 ? '+' : '' }}{{ rebateTrend }}%
                    </span>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons">
                <van-button
                    type="primary"
                    size="small"
                    icon="balance-o"
                    @click="$emit('recharge', account)"
                >
                    充值
                </van-button>
                <van-button
                    type="default"
                    size="small"
                    icon="exchange"
                    @click="$emit('transfer', account)"
                >
                    转账
                </van-button>
                <van-button
                    type="default"
                    size="small"
                    icon="records"
                    @click="$emit('viewRecords', account)"
                >
                    记录
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Account } from '../../types/account';

interface Props {
    account: Account;
    companyName?: string;
}

const props = withDefaults(defineProps<Props>(), {
    companyName: '未知公司',
});

defineEmits<{
    recharge: [account: Account];
    transfer: [account: Account];
    viewRecords: [account: Account];
}>();

// 账户状态
const statusType = computed(() => {
    if (props.account.balance > 10000) return 'success';
    if (props.account.balance > 1000) return 'primary';
    if (props.account.balance > 0) return 'warning';
    return 'danger';
});

const statusText = computed(() => {
    if (props.account.balance > 10000) return '充足';
    if (props.account.balance > 1000) return '正常';
    if (props.account.balance > 0) return '偏低';
    return '不足';
});

// 返点趋势
const rebateTrend = computed(() => {
    const history = props.account.rebateHistory;
    if (history.length < 2) return 0;
    
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    
    return Number((latest.rate - previous.rate).toFixed(2));
});

// 格式化金额
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
</script>

<style scoped>
.account-balance-card {
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.account-basic-info {
    flex: 1;
}

.account-name {
    font-size: 18px;
    font-weight: bold;
    color: var(--van-text-color);
    margin: 0 0 4px 0;
}

.company-name {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.account-status {
    margin-left: 12px;
}

.balance-section {
    margin-bottom: 16px;
}

.balance-main {
    text-align: center;
    margin-bottom: 12px;
}

.balance-label {
    font-size: 12px;
    color: var(--van-text-color-3);
    display: block;
    margin-bottom: 4px;
}

.balance-amount {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
}

.currency {
    font-size: 16px;
    color: var(--van-text-color-2);
}

.amount {
    font-size: 28px;
    font-weight: bold;
    color: var(--van-primary-color);
}

.balance-details {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    border-top: 1px solid var(--van-border-color);
}

.detail-item {
    text-align: center;
}

.detail-item .label {
    font-size: 12px;
    color: var(--van-text-color-3);
    display: block;
    margin-bottom: 4px;
}

.detail-item .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--van-text-color);
}

.rebate-value {
    color: var(--van-success-color);
}

.rebate-trend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--van-background-color-light);
    border-radius: 6px;
    margin-bottom: 16px;
}

.trend-header {
    display: flex;
    align-items: center;
    gap: 4px;
}

.trend-title {
    font-size: 12px;
    color: var(--van-text-color-2);
}

.trend-text {
    font-size: 12px;
    font-weight: 500;
}

.trend-text.positive {
    color: var(--van-success-color);
}

.trend-text.negative {
    color: var(--van-danger-color);
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: space-around;
}

.action-buttons .van-button {
    flex: 1;
}

:deep(.van-tag) {
    border-radius: 12px;
}
</style> 