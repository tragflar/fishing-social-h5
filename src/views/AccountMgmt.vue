<template>
    <app-layout>
        <!-- 账户统计 -->
        <div class="custom-card">
            <van-grid :column-num="3">
                <van-grid-item>
                    <div class="stat-item">
                        <div class="stat-value">{{ accounts.length }}</div>
                        <div class="stat-label">总账户数</div>
                    </div>
                </van-grid-item>
                <van-grid-item>
                    <div class="stat-item">
                        <div class="stat-value amount-text">¥{{ formatAmount(totalBalance) }}</div>
                        <div class="stat-label">总余额</div>
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
        
        <!-- 账户列表 -->
        <van-cell-group title="账户列表">
            <div
                v-for="account in accounts"
                :key="account.id"
                class="account-item"
            >
                <van-cell
                    :title="account.name"
                    :value="`¥${formatAmount(account.balance)}`"
                    is-link
                    @click="selectAccount(account)"
                >
                    <template #icon>
                        <van-icon
                            name="user-circle-o"
                            color="var(--van-primary-color)"
                            size="20"
                        />
                    </template>
                    <template #label>
                        <div class="account-info">
                            <span class="rebate-info">返点率: {{ account.rebate }}%</span>
                            <span class="transaction-info">交易: {{ account.transactions.length }}笔</span>
                        </div>
                    </template>
                    <template #right-icon>
                        <div class="account-actions">
                            <van-button
                                type="primary"
                                size="mini"
                                @click.stop="editAccount(account)"
                            >
                                编辑
                            </van-button>
                            <van-button
                                type="default"
                                size="mini"
                                @click.stop="viewAccountDetail(account)"
                            >
                                详情
                            </van-button>
                        </div>
                    </template>
                </van-cell>
            </div>
        </van-cell-group>
        
        <!-- 添加账户按钮 -->
        <van-button
            type="primary"
            block
            icon="plus"
            @click="showAddAccountDialog = true"
        >
            添加账户
        </van-button>
        
        <!-- 添加账户弹窗 -->
        <van-dialog
            v-model:show="showAddAccountDialog"
            title="添加账户"
            show-cancel-button
            @confirm="handleAddAccount"
        >
            <van-field
                v-model="newAccount.name"
                label="账户名称"
                placeholder="请输入账户名称"
                required
            />
            <van-field
                v-model.number="newAccount.rebate"
                type="number"
                label="返点率(%)"
                placeholder="请输入返点率"
                required
            />
            <van-field
                v-model.number="newAccount.balance"
                type="number"
                label="初始余额"
                placeholder="请输入初始余额"
            />
        </van-dialog>
        
        <!-- 编辑账户弹窗 -->
        <van-popup
            v-model:show="showEditAccount"
            position="bottom"
            :style="{ height: '70%' }"
        >
            <div class="account-edit">
                <div class="edit-header">
                    <h3>编辑账户</h3>
                    <van-button
                        type="default"
                        size="mini"
                        icon="cross"
                        @click="showEditAccount = false"
                    />
                </div>
                
                <van-cell-group title="基本信息">
                    <van-field
                        v-model="editingAccount.name"
                        label="账户名称"
                        placeholder="请输入账户名称"
                    />
                    <van-field
                        v-model.number="editingAccount.rebate"
                        type="number"
                        label="返点率(%)"
                        placeholder="请输入返点率"
                    />
                </van-cell-group>
                
                <van-cell-group title="返点历史">
                    <van-cell
                        v-for="(history, index) in editingAccount.rebateHistory"
                        :key="index"
                        :title="`${history.rate}%`"
                        :value="formatDate(history.effectiveDate)"
                    />
                </van-cell-group>
                
                <div class="edit-actions">
                    <van-button
                        type="primary"
                        block
                        @click="handleUpdateAccount"
                    >
                        保存修改
                    </van-button>
                    
                    <van-button
                        type="warning"
                        block
                        @click="showRebateHistoryDialog = true"
                    >
                        添加返点记录
                    </van-button>
                    
                    <van-button
                        type="danger"
                        block
                        @click="handleDeleteAccount"
                    >
                        删除账户
                    </van-button>
                </div>
            </div>
        </van-popup>
        
        <!-- 账户详情弹窗 -->
        <van-popup
            v-model:show="showAccountDetail"
            position="bottom"
            :style="{ height: '80%' }"
        >
            <div class="account-detail" v-if="selectedAccount">
                <div class="detail-header">
                    <h3>账户详情</h3>
                    <van-button
                        type="default"
                        size="mini"
                        icon="cross"
                        @click="showAccountDetail = false"
                    />
                </div>
                
                <!-- 账户余额卡片 -->
                <account-balance-card
                    :account="selectedAccount"
                    :company-name="currentCompany?.name"
                    @recharge="handleRecharge"
                    @transfer="handleTransfer"
                    @view-records="handleViewRecords"
                />
                
                <!-- 最近交易 -->
                <van-cell-group title="最近交易">
                    <van-cell
                        v-for="transaction in recentTransactions"
                        :key="transaction.id"
                        :title="getTransactionTitle(transaction)"
                        :value="`¥${formatAmount(transaction.amount)}`"
                        :label="formatDateTime(transaction.timestamp)"
                    >
                        <template #icon>
                            <van-icon
                                :name="getTransactionIcon(transaction.type)"
                                :color="getTransactionColor(transaction.type)"
                                size="16"
                            />
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>
        </van-popup>
        
        <!-- 返点历史弹窗 -->
        <van-dialog
            v-model:show="showRebateHistoryDialog"
            title="添加返点记录"
            show-cancel-button
            @confirm="handleAddRebateHistory"
        >
            <van-field
                v-model.number="newRebateHistory.rate"
                type="number"
                label="返点率(%)"
                placeholder="请输入新的返点率"
                required
            />
            <van-field
                v-model="newRebateHistory.effectiveDate"
                readonly
                clickable
                label="生效日期"
                placeholder="选择生效日期"
                @click="showDatePicker = true"
            />
        </van-dialog>
        
        <!-- 日期选择弹窗 -->
        <van-popup v-model:show="showDatePicker" position="bottom">
            <van-datetime-picker
                type="date"
                @confirm="onDateConfirm"
                @cancel="showDatePicker = false"
            />
        </van-popup>
    </app-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import AppLayout from '../components/layout/AppLayout.vue';
import AccountBalanceCard from '../components/account/AccountBalanceCard.vue';
import { useAuthStore } from '../store/auth';
import { useAccountStore } from '../store/account';
import type { Account, Transaction } from '../types/account';

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

// 响应式数据
const showAddAccountDialog = ref(false);
const showEditAccount = ref(false);
const showAccountDetail = ref(false);
const showRebateHistoryDialog = ref(false);
const showDatePicker = ref(false);
const selectedAccount = ref<Account | null>(null);

const newAccount = ref({
    name: '',
    rebate: 0,
    balance: 0,
});

const editingAccount = ref({
    id: '',
    name: '',
    rebate: 0,
    rebateHistory: [] as any[],
});

const newRebateHistory = ref({
    rate: 0,
    effectiveDate: '',
});

// 计算属性
const currentCompany = computed(() => authStore.currentCompany);
const accounts = computed(() => accountStore.accounts);

const totalBalance = computed(() => {
    return accounts.value.reduce((sum, account) => sum + account.balance, 0);
});

const averageRebate = computed(() => {
    if (accounts.value.length === 0) return 0;
    const totalRebate = accounts.value.reduce((sum, account) => sum + account.rebate, 0);
    return Number((totalRebate / accounts.value.length).toFixed(2));
});

const recentTransactions = computed(() => {
    if (!selectedAccount.value) return [];
    return selectedAccount.value.transactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
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

// 事件处理
const selectAccount = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    showToast(`已选择账户: ${account.name}`);
};

const editAccount = (account: Account) => {
    editingAccount.value = {
        id: account.id,
        name: account.name,
        rebate: account.rebate,
        rebateHistory: [...account.rebateHistory],
    };
    showEditAccount.value = true;
};

const viewAccountDetail = (account: Account) => {
    selectedAccount.value = account;
    showAccountDetail.value = true;
};

const handleAddAccount = () => {
    if (!newAccount.value.name || newAccount.value.rebate <= 0) {
        showToast('请填写完整信息');
        return;
    }
    
    // 这里应该调用API添加账户
    showToast('账户添加成功');
    showAddAccountDialog.value = false;
    
    // 重置表单
    newAccount.value = {
        name: '',
        rebate: 0,
        balance: 0,
    };
};

const handleUpdateAccount = () => {
    if (!editingAccount.value.name || editingAccount.value.rebate <= 0) {
        showToast('请填写完整信息');
        return;
    }
    
    // 这里应该调用API更新账户信息
    showToast('账户信息更新成功');
    showEditAccount.value = false;
};

const handleDeleteAccount = async () => {
    const confirmed = await showConfirmDialog({
        title: '确认删除',
        message: '删除账户将清空所有交易记录，此操作不可恢复，确定要删除吗？',
    });
    
    if (confirmed) {
        // 这里应该调用API删除账户
        showToast('账户删除成功');
        showEditAccount.value = false;
    }
};

const handleAddRebateHistory = () => {
    if (!newRebateHistory.value.rate || !newRebateHistory.value.effectiveDate) {
        showToast('请填写完整信息');
        return;
    }
    
    // 添加到编辑中的账户
    editingAccount.value.rebateHistory.push({
        rate: newRebateHistory.value.rate,
        effectiveDate: new Date(newRebateHistory.value.effectiveDate),
    });
    
    showToast('返点记录添加成功');
    showRebateHistoryDialog.value = false;
    
    // 重置表单
    newRebateHistory.value = {
        rate: 0,
        effectiveDate: '',
    };
};

const onDateConfirm = (value: any) => {
    newRebateHistory.value.effectiveDate = value.toLocaleDateString();
    showDatePicker.value = false;
};

// 账户操作处理
const handleRecharge = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/recharge');
    showAccountDetail.value = false;
};

const handleTransfer = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/transfer');
    showAccountDetail.value = false;
};

const handleViewRecords = (account: Account) => {
    accountStore.setCurrentAccount(account.id);
    router.push('/records');
    showAccountDetail.value = false;
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

.account-item {
    border-bottom: 1px solid var(--van-border-color);
}

.account-item:last-child {
    border-bottom: none;
}

.account-info {
    display: flex;
    gap: 12px;
}

.rebate-info,
.transaction-info {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.account-actions {
    display: flex;
    gap: 8px;
}

.account-edit,
.account-detail {
    padding: 16px;
}

.edit-header,
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--van-border-color);
}

.edit-header h3,
.detail-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--van-text-color);
}

.edit-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}

.van-cell-group {
    margin-bottom: 12px;
}

:deep(.van-cell__left-icon) {
    margin-right: 12px;
}

:deep(.van-button--mini) {
    padding: 2px 8px;
    font-size: 10px;
}
</style> 