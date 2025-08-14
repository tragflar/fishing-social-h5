<template>
    <app-layout>
        <transfer-flow />
    </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '../components/layout/AppLayout.vue';
import TransferFlow from '../components/transfer/TransferFlow.vue';
</script>

<style scoped>
.transfer-page {
    min-height: 100vh;
    background-color: var(--van-background-color);
}

.van-cell-group {
    margin-bottom: 12px;
}

.amount-input {
    margin-bottom: 8px;
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
</style> 