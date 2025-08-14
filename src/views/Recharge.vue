<template>
    <app-layout>
        <!-- 充值类型切换 -->
        <van-cell-group>
            <van-field
                v-model="rechargeType"
                readonly
                clickable
                label="充值类型"
                placeholder="选择充值类型"
                @click="showTypePicker = true"
            />
        </van-cell-group>
        
        <!-- 多账户充值表单 -->
        <multi-recharge-form
            v-model="rechargeItems"
            :available-accounts="availableAccounts"
        />
        
        <!-- 银行信息 -->
        <van-cell-group title="收款信息">
            <van-cell title="收款银行" value="中国工商银行" />
            <van-cell title="收款账号" :value="bankAccount" />
            <van-cell title="收款户名" value="测试公司" />
        </van-cell-group>
        
        <!-- 充值按钮 -->
        <van-button
            type="primary"
            block
            :loading="loading"
            :disabled="!canRecharge"
            @click="handleRecharge"
        >
            确认充值
        </van-button>
    </app-layout>
    
    <!-- 充值类型选择 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
            :columns="typeOptions"
            @confirm="onTypeConfirm"
            @cancel="showTypePicker = false"
        />
    </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast } from 'vant';
import AppLayout from '../components/layout/AppLayout.vue';
import MultiRechargeForm from '../components/account/MultiRechargeForm.vue';
import { useAuthStore } from '../store/auth';
import { useAccountStore } from '../store/account';

const authStore = useAuthStore();
const accountStore = useAccountStore();

// 响应式数据
const rechargeType = ref('公司充值');
const loading = ref(false);
const showTypePicker = ref(false);
const rechargeItems = ref<Array<{ account: any; amount: number }>>([]);

// 充值类型选项
const typeOptions = [
    { text: '公司充值', value: 'company' },
    { text: '账户充值', value: 'account' },
];

// 银行账号
const bankAccount = computed(() => {
    return authStore.currentCompany?.bankAccount || '';
});

// 可选账户
const availableAccounts = computed(() => {
    return accountStore.accounts;
});

// 是否可以充值
const canRecharge = computed(() => {
    return rechargeItems.value.length > 0 && 
           rechargeItems.value.some(item => item.amount > 0);
});

// 充值类型确认
const onTypeConfirm = (value: any) => {
    rechargeType.value = value.text;
    showTypePicker.value = false;
};

// 处理充值
const handleRecharge = () => {
    if (rechargeItems.value.length === 0) {
        showToast('请选择充值账户');
        return;
    }
    
    const hasAmount = rechargeItems.value.some(item => item.amount > 0);
    if (!hasAmount) {
        showToast('请输入充值金额');
        return;
    }
    
    loading.value = true;
    
    // 模拟充值请求
    setTimeout(() => {
        loading.value = false;
        showToast('充值申请已提交');
        
        // 重置表单
        rechargeItems.value = [];
    }, 2000);
};
</script>

<style scoped>
.van-cell-group {
    margin-bottom: 12px;
}
</style> 