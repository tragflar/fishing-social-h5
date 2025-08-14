<template>
    <app-layout>
        <!-- 当前公司信息 -->
        <div class="custom-card">
            <div class="current-company-header">
                <h3>当前公司</h3>
                <van-button
                    type="primary"
                    size="small"
                    @click="showCompanySelector = true"
                >
                    切换公司
                </van-button>
            </div>
            
            <van-cell-group>
                <van-cell
                    title="公司名称"
                    :value="currentCompany?.name || '未选择'"
                />
                <van-cell
                    title="公司余额"
                    :value="`¥${formatAmount(currentCompany?.balance || 0)}`"
                    class="amount-cell"
                />
                <van-cell
                    title="银行账号"
                    :value="currentCompany?.bankAccount || '未设置'"
                />
                <van-cell
                    title="账户数量"
                    :value="`${accountCount}个`"
                />
            </van-cell-group>
        </div>
        
        <!-- 公司列表 -->
        <van-cell-group title="我的公司">
            <van-cell
                v-for="company in companies"
                :key="company.id"
                :title="company.name"
                :value="`¥${formatAmount(company.balance)}`"
                is-link
                @click="selectCompany(company)"
            >
                <template #icon>
                    <van-icon
                        :name="company.id === currentCompanyId ? 'checked' : 'circle'"
                        :color="company.id === currentCompanyId ? 'var(--van-primary-color)' : 'var(--van-text-color-3)'"
                        size="20"
                    />
                </template>
                <template #label>
                    <div class="company-info">
                        <span class="bank-info">银行: {{ company.bankAccount }}</span>
                        <span class="status-info">
                            <van-tag
                                :type="getCompanyStatusType(company)"
                            >
                                {{ getCompanyStatusText(company) }}
                            </van-tag>
                        </span>
                    </div>
                </template>
            </van-cell>
        </van-cell-group>
        
        <!-- 操作按钮 -->
        <div class="action-section">
            <van-button
                type="primary"
                block
                icon="plus"
                @click="showAddCompanyDialog = true"
            >
                添加公司
            </van-button>
            
            <van-button
                v-if="currentCompany"
                type="default"
                block
                icon="setting-o"
                @click="showCompanySettings = true"
            >
                公司设置
            </van-button>
        </div>
        
        <!-- 公司选择弹窗 -->
        <van-popup v-model:show="showCompanySelector" position="bottom">
            <van-picker
                :columns="companyOptions"
                @confirm="onCompanyConfirm"
                @cancel="showCompanySelector = false"
            />
        </van-popup>
        
        <!-- 添加公司弹窗 -->
        <van-dialog
            v-model:show="showAddCompanyDialog"
            title="添加公司"
            show-cancel-button
            @confirm="handleAddCompany"
        >
            <van-field
                v-model="newCompany.name"
                label="公司名称"
                placeholder="请输入公司名称"
                required
            />
            <van-field
                v-model="newCompany.bankAccount"
                label="银行账号"
                placeholder="请输入银行账号"
                required
            />
        </van-dialog>
        
        <!-- 公司设置弹窗 -->
        <van-popup
            v-model:show="showCompanySettings"
            position="bottom"
            :style="{ height: '60%' }"
        >
            <div class="company-settings">
                <div class="settings-header">
                    <h3>公司设置</h3>
                    <van-button
                        type="default"
                        size="mini"
                        icon="cross"
                        @click="showCompanySettings = false"
                    />
                </div>
                
                <van-cell-group>
                    <van-field
                        v-model="editingCompany.name"
                        label="公司名称"
                        placeholder="请输入公司名称"
                    />
                    <van-field
                        v-model="editingCompany.bankAccount"
                        label="银行账号"
                        placeholder="请输入银行账号"
                    />
                </van-cell-group>
                
                <div class="settings-actions">
                    <van-button
                        type="primary"
                        block
                        @click="handleUpdateCompany"
                    >
                        保存设置
                    </van-button>
                    
                    <van-button
                        type="danger"
                        block
                        @click="handleDeleteCompany"
                    >
                        删除公司
                    </van-button>
                </div>
            </div>
        </van-popup>
    </app-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import AppLayout from '../components/layout/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useAccountStore } from '../store/account';
import type { Company } from '../types/account';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const accountStore = useAccountStore();
const router = useRouter();

// 响应式数据
const showCompanySelector = ref(false);
const showAddCompanyDialog = ref(false);
const showCompanySettings = ref(false);
const newCompany = ref({
    name: '',
    bankAccount: '',
});
const editingCompany = ref({
    name: '',
    bankAccount: '',
});

// 计算属性
const currentCompany = computed(() => authStore.currentCompany);
const currentCompanyId = computed(() => authStore.currentCompanyId);
const companies = computed(() => authStore.user?.companies || []);
const accountCount = computed(() => accountStore.accounts.length);

// 公司选择器选项
const companyOptions = computed(() => {
    return companies.value.map(company => ({
        text: company.name,
        value: company.id,
    }));
});

// 工具函数
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getCompanyStatusType = (company: Company) => {
    if (company.balance > 50000) return 'success';
    if (company.balance > 10000) return 'primary';
    if (company.balance > 0) return 'warning';
    return 'danger';
};

const getCompanyStatusText = (company: Company) => {
    if (company.balance > 50000) return '余额充足';
    if (company.balance > 10000) return '余额正常';
    if (company.balance > 0) return '余额偏低';
    return '余额不足';
};

// 事件处理
const selectCompany = (company: Company) => {
    authStore.switchCompany(company.id);
    showToast(`已切换到: ${company.name}`);
};

const onCompanyConfirm = (value: any) => {
    authStore.switchCompany(value.value);
    showCompanySelector.value = false;
    showToast(`已切换到: ${value.text}`);
};

const handleAddCompany = () => {
    if (!newCompany.value.name || !newCompany.value.bankAccount) {
        showToast('请填写完整信息');
        return;
    }
    
    // 这里应该调用API添加公司
    showToast('公司添加成功');
    showAddCompanyDialog.value = false;
    
    // 重置表单
    newCompany.value = {
        name: '',
        bankAccount: '',
    };
};

const handleUpdateCompany = () => {
    if (!editingCompany.value.name || !editingCompany.value.bankAccount) {
        showToast('请填写完整信息');
        return;
    }
    
    // 这里应该调用API更新公司信息
    showToast('公司信息更新成功');
    showCompanySettings.value = false;
};

const handleDeleteCompany = async () => {
    const confirmed = await showConfirmDialog({
        title: '确认删除',
        message: '删除公司将同时删除所有相关账户，此操作不可恢复，确定要删除吗？',
    });
    
    if (confirmed) {
        // 这里应该调用API删除公司
        showToast('公司删除成功');
        showCompanySettings.value = false;
    }
};

// 页面加载
onMounted(async () => {
    // 检查登录状态
    if (!authStore.isLoggedIn) {
        router.push('/login');
        return;
    }
    
    if (currentCompanyId.value) {
        await accountStore.loadAccounts(currentCompanyId.value);
    }
    
    // 初始化编辑表单
    if (currentCompany.value) {
        editingCompany.value = {
            name: currentCompany.value.name,
            bankAccount: currentCompany.value.bankAccount,
        };
    }
});
</script>

<style scoped>
.current-company-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.current-company-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--van-text-color);
}

.company-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.bank-info {
    font-size: 12px;
    color: var(--van-text-color-3);
}

.status-info {
    display: flex;
    align-items: center;
}

.amount-cell {
    color: var(--van-primary-color);
    font-weight: bold;
}

.action-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.company-settings {
    padding: 16px;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--van-border-color);
}

.settings-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--van-text-color);
}

.settings-actions {
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
</style> 