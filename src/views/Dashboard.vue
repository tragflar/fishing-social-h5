<template>
    <app-layout>
        <!-- 概览卡片 -->
        <div class="custom-card">
            <van-grid :column-num="2">
                <van-grid-item>
                    <div class="grid-item">
                        <div class="label caption-text">公司余额</div>
                        <div class="amount amount-text">¥{{ currentCompany?.balance || 0 }}</div>
                    </div>
                </van-grid-item>
                <van-grid-item>
                    <div class="grid-item">
                        <div class="label caption-text">账户总数</div>
                        <div class="amount body-text">{{ accounts.length }}</div>
                    </div>
                </van-grid-item>
            </van-grid>
        </div>
        
        <!-- 账户余额卡片列表 -->
        <div class="accounts-section">
            <account-balance-card
                v-for="account in accounts"
                :key="account.id"
                :account="account"
                :company-name="currentCompany?.name"
                @recharge="handleRecharge"
                @transfer="handleTransfer"
                @view-records="handleViewRecords"
            />
        </div>
        
        <!-- 快捷操作 -->
        <van-cell-group title="快捷操作">
            <van-grid :column-num="3">
                <van-grid-item
                    icon="balance-o"
                    text="充值"
                    @click="$router.push('/recharge')"
                />
                <van-grid-item
                    icon="exchange"
                    text="转账"
                    @click="$router.push('/transfer')"
                />
                <van-grid-item
                    icon="records"
                    text="记录"
                    @click="$router.push('/records')"
                />
            </van-grid>
        </van-cell-group>
    </app-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import AppLayout from '../components/layout/AppLayout.vue';
import AccountBalanceCard from '../components/account/AccountBalanceCard.vue';
import { useAuthStore } from '../store/auth';
import { useAccountStore } from '../store/account';
import type { Account } from '../types/account';

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

// 计算属性
const currentCompany = computed(() => authStore.currentCompany);
const accounts = computed(() => accountStore.accounts);

// 账户操作处理
const handleRecharge = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/recharge');
    showToast(`准备为${account.name}充值`);
};

const handleTransfer = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/transfer');
    showToast(`准备从${account.name}转账`);
};

const handleViewRecords = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/records');
    showToast(`查看${account.name}的交易记录`);
};

// 页面加载
onMounted(async () => {
    // 检查登录状态
    if (!authStore.isLoggedIn) {
        router.push('/login');
        return;
    }
    
    if (authStore.currentCompanyId) {
        await accountStore.loadAccounts(authStore.currentCompanyId);
    }
});
</script>

<style scoped>
.grid-item {
    text-align: center;
}

.grid-item .label {
    margin-bottom: 4px;
}

.grid-item .amount {
    font-weight: bold;
}

.grid-item .amount.amount-text {
    color: var(--van-primary-color);
}

.accounts-section {
    margin-bottom: 16px;
}
</style> 