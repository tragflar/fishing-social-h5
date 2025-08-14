<template>
    <div class="transaction-list">
        <!-- 筛选器 -->
        <div class="filter-section">
            <van-cell-group>
                <van-field
                    v-model="filterType"
                    readonly
                    clickable
                    label="交易类型"
                    :placeholder="filterType || '全部类型'"
                    @click="showTypePicker = true"
                />
                <van-field
                    v-model="dateRange"
                    readonly
                    clickable
                    label="时间范围"
                    :placeholder="dateRange || '选择时间范围'"
                    @click="showDatePicker = true"
                />
            </van-cell-group>
        </div>
        
        <!-- 交易统计 -->
        <div class="statistics-section" v-if="filteredTransactions.length > 0">
            <div class="custom-card">
                <van-grid :column-num="3">
                    <van-grid-item>
                        <div class="stat-item">
                            <div class="stat-value">{{ filteredTransactions.length }}</div>
                            <div class="stat-label">交易笔数</div>
                        </div>
                    </van-grid-item>
                    <van-grid-item>
                        <div class="stat-item">
                            <div class="stat-value amount-text">¥{{ formatAmount(totalAmount) }}</div>
                            <div class="stat-label">交易总额</div>
                        </div>
                    </van-grid-item>
                    <van-grid-item>
                        <div class="stat-item">
                            <div class="stat-value">{{ averageRebate }}%</div>
                            <div class="stat-label">平均返点</div>
                        </div>
                    </van-grid-item>
                </van-grid>
            </div>
        </div>
        
        <!-- 交易列表 -->
        <van-cell-group title="交易记录">
            <div
                v-for="transaction in paginatedTransactions"
                :key="transaction.id"
                class="transaction-item"
                @click="showTransactionDetail(transaction)"
            >
                <van-cell
                    :title="getTransactionTitle(transaction)"
                    :value="`¥${formatAmount(transaction.amount)}`"
                    :label="formatDate(transaction.timestamp)"
                    is-link
                    class="custom-cell"
                >
                    <template #icon>
                        <van-icon
                            :name="getTransactionIcon(transaction.type)"
                            :color="getTransactionColor(transaction.type)"
                            size="20"
                        />
                    </template>
                    <template #right-icon>
                        <div class="transaction-status">
                            <span :class="['status-tag', getStatusClass(transaction)]">
                                {{ getStatusText(transaction) }}
                            </span>
                            <div class="rebate-info">
                                <span class="rebate-text">{{ transaction.rebateRate }}%</span>
                            </div>
                        </div>
                    </template>
                </van-cell>
            </div>
        </van-cell-group>
        
        <!-- 加载更多 -->
        <div class="load-more-section" v-if="hasMore">
            <van-button
                type="default"
                size="small"
                :loading="loadingMore"
                @click="loadMore"
            >
                加载更多
            </van-button>
        </div>
        
        <!-- 空状态 -->
        <van-empty
            v-if="filteredTransactions.length === 0"
            description="暂无交易记录"
            image="search"
        />
        
        <!-- 类型选择弹窗 -->
        <van-popup v-model:show="showTypePicker" position="bottom">
            <van-picker
                :columns="typeOptions"
                @confirm="onTypeConfirm"
                @cancel="showTypePicker = false"
            />
        </van-popup>
        
        <!-- 日期选择弹窗 -->
        <van-popup v-model:show="showDatePicker" position="bottom">
            <van-datetime-picker
                type="date"
                @confirm="onDateConfirm"
                @cancel="showDatePicker = false"
            />
        </van-popup>
        
        <!-- 交易详情弹窗 -->
        <van-popup
            v-model:show="showDetailPopup"
            position="bottom"
            :style="{ height: '60%' }"
        >
            <div class="transaction-detail" v-if="selectedTransaction">
                <div class="detail-header">
                    <h3>交易详情</h3>
                    <van-button
                        type="default"
                        size="mini"
                        icon="cross"
                        @click="showDetailPopup = false"
                    />
                </div>
                
                <van-cell-group>
                    <van-cell title="交易ID" :value="selectedTransaction.id" />
                    <van-cell title="交易类型" :value="getTransactionTypeText(selectedTransaction.type)" />
                    <van-cell title="交易金额" :value="`¥${formatAmount(selectedTransaction.amount)}`" />
                    <van-cell title="返点率" :value="`${selectedTransaction.rebateRate}%`" />
                    <van-cell title="交易时间" :value="formatDateTime(selectedTransaction.timestamp)" />
                    <van-cell
                        v-if="selectedTransaction.from"
                        title="转出账户"
                        :value="getAccountName(selectedTransaction.from)"
                    />
                    <van-cell
                        v-if="selectedTransaction.to"
                        title="转入账户"
                        :value="getAccountName(selectedTransaction.to)"
                    />
                </van-cell-group>
            </div>
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Transaction, Account } from '../../types/account';

interface Props {
    transactions: Transaction[];
    accounts?: Account[];
    pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
    accounts: () => [],
    pageSize: 10,
});

// 响应式数据
const filterType = ref('');
const dateRange = ref('');
const showTypePicker = ref(false);
const showDatePicker = ref(false);
const showDetailPopup = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const currentPage = ref(1);
const loadingMore = ref(false);

// 类型选项
const typeOptions = [
    { text: '全部类型', value: '' },
    { text: '充值', value: 'recharge' },
    { text: '转账', value: 'transfer' },
    { text: '退款', value: 'refund' },
];

// 筛选后的交易
const filteredTransactions = computed(() => {
    let filtered = props.transactions;
    
    if (filterType.value) {
        filtered = filtered.filter(t => t.type === filterType.value);
    }
    
    // 这里可以添加日期筛选逻辑
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
});

// 分页后的交易
const paginatedTransactions = computed(() => {
    const endIndex = currentPage.value * props.pageSize;
    return filteredTransactions.value.slice(0, endIndex);
});

// 是否有更多数据
const hasMore = computed(() => {
    return paginatedTransactions.value.length < filteredTransactions.value.length;
});

// 交易统计
const totalAmount = computed(() => {
    return filteredTransactions.value.reduce((sum, t) => sum + t.amount, 0);
});

const averageRebate = computed(() => {
    if (filteredTransactions.value.length === 0) return 0;
    
    const totalRebate = filteredTransactions.value.reduce((sum, t) => sum + t.rebateRate, 0);
    return Number((totalRebate / filteredTransactions.value.length).toFixed(2));
});

// 工具函数
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN');
};

const formatDateTime = (date: Date): string => {
    return date.toLocaleString('zh-CN');
};

const getTransactionTitle = (transaction: Transaction): string => {
    switch (transaction.type) {
        case 'recharge':
            return '账户充值';
        case 'transfer':
            return '账户转账';
        case 'refund':
            return '资金退款';
        default:
            return '未知交易';
    }
};

const getTransactionTypeText = (type: string): string => {
    switch (type) {
        case 'recharge':
            return '充值';
        case 'transfer':
            return '转账';
        case 'refund':
            return '退款';
        default:
            return '未知';
    }
};

const getTransactionIcon = (type: string): string => {
    switch (type) {
        case 'recharge':
            return 'balance-o';
        case 'transfer':
            return 'exchange';
        case 'refund':
            return 'replay';
        default:
            return 'records';
    }
};

const getTransactionColor = (type: string): string => {
    switch (type) {
        case 'recharge':
            return 'var(--van-success-color)';
        case 'transfer':
            return 'var(--van-primary-color)';
        case 'refund':
            return 'var(--van-warning-color)';
        default:
            return 'var(--van-text-color-3)';
    }
};

const getStatusClass = (transaction: Transaction): string => {
    // 这里可以根据交易状态返回不同的样式类
    return 'success';
};

const getStatusText = (transaction: Transaction): string => {
    // 这里可以根据交易状态返回不同的文本
    return '成功';
};

const getAccountName = (accountId: string): string => {
    const account = props.accounts.find(a => a.id === accountId);
    return account?.name || '未知账户';
};

// 事件处理
const onTypeConfirm = (value: any) => {
    filterType.value = value.value;
    showTypePicker.value = false;
    currentPage.value = 1; // 重置分页
};

const onDateConfirm = (value: any) => {
    dateRange.value = value.toLocaleDateString();
    showDatePicker.value = false;
    currentPage.value = 1; // 重置分页
};

const showTransactionDetail = (transaction: Transaction) => {
    selectedTransaction.value = transaction;
    showDetailPopup.value = true;
};

const loadMore = () => {
    loadingMore.value = true;
    
    // 模拟加载延迟
    setTimeout(() => {
        currentPage.value++;
        loadingMore.value = false;
    }, 500);
};
</script>

<style scoped>
.transaction-list {
    margin-bottom: 16px;
}

.filter-section {
    margin-bottom: 12px;
}

.statistics-section {
    margin-bottom: 12px;
}

.stat-item {
    text-align: center;
    padding: 8px;
}

.stat-value {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-text-color);
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.transaction-item {
    border-bottom: 1px solid var(--van-border-color);
}

.transaction-item:last-child {
    border-bottom: none;
}

.transaction-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.load-more-section {
    text-align: center;
    padding: 16px;
}

.transaction-detail {
    padding: 16px;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--van-border-color);
}

.detail-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--van-text-color);
}

.van-cell-group {
    margin-bottom: 12px;
}

:deep(.van-cell__left-icon) {
    margin-right: 12px;
}
</style> 