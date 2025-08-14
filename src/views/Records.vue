<template>
    <app-layout>
        <!-- 交易记录列表 -->
        <transaction-list
            :transactions="transactions"
            :accounts="accounts"
        />
    </app-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import TransactionList from '../components/transaction/TransactionList.vue';
import { useAccountStore } from '../store/account';
import type { Transaction } from '../types/account';

const accountStore = useAccountStore();

// 模拟交易记录数据
const transactions = ref<Transaction[]>([
    {
        id: 'tx_1',
        type: 'recharge',
        amount: 1000,
        rebateRate: 3.5,
        timestamp: new Date('2023-12-01 10:30:00'),
    },
    {
        id: 'tx_2',
        type: 'transfer',
        amount: 500,
        rebateRate: 3.5,
        timestamp: new Date('2023-12-01 14:20:00'),
        from: 'acc1',
        to: 'acc2',
    },
    {
        id: 'tx_3',
        type: 'refund',
        amount: 200,
        rebateRate: 4.0,
        timestamp: new Date('2023-12-01 16:45:00'),
    },
]);

// 账户列表
const accounts = computed(() => accountStore.accounts);

// 页面加载
onMounted(async () => {
    // 这里可以加载真实的交易记录数据
});
</script>

<style scoped>
.records-page {
    min-height: 100vh;
    background-color: var(--van-background-color);
}

.van-cell-group {
    margin-bottom: 12px;
}

.status-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-tag.success {
    background-color: var(--van-success-color);
    color: white;
}

.status-tag.warning {
    background-color: var(--van-warning-color);
    color: white;
}

.status-tag.error {
    background-color: var(--van-danger-color);
    color: white;
}
</style> 