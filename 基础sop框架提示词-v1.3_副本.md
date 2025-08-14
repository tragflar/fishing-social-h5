下面是为广告自助充值小程序设计的H5页面框架提示词，已根据需求优化为移动端方案，采用MD格式分步骤编写，适合与Cursor协作开发：

```markdown
# 广告自助充值H5系统框架提示词

## 第1步：项目初始化

### 项目概述
基于 Vite + Vue3 + TypeScript + Vant 的移动端广告充值系统，支持多公司/账户管理、返点计算和资金流转。

### 技术栈
- Vue 3 (Composition API)
- Vite 4
- TypeScript
- Vant 4 (移动端UI库)
- Vue Router
- Pinia
- Axios (API请求)

### 目录结构
src/
├── assets/
│   └── icons/ # SVG图标
├── components/
│   ├── layout/
│   ├── account/
│   └── transfer/
├── views/
│   ├── Login.vue
│   ├── Dashboard.vue        # 概览页
│   ├── CompanyMgmt.vue      # 公司管理
│   ├── AccountMgmt.vue      # 账户管理
│   ├── Recharge.vue         # 充值页
│   ├── Transfer.vue         # 转账页
│   └── Records.vue          # 交易记录
├── router/
│   └── index.ts
├── store/
│   ├── auth.ts
│   ├── account.ts           # 账户状态管理
│   └── transaction.ts       # 交易状态管理
├── types/
│   ├── account.d.ts         # 账户类型定义
│   └── transaction.d.ts     # 交易类型定义
├── utils/
│   ├── rebateCalculator.ts  # 返点计算工具
│   └── fifoLifoHandler.ts   # 先进先出/后进先出逻辑
├── styles/
│   └── vant.less            # Vant主题定制
└── App.vue

### 核心依赖
```bash
npm install vant axios pinia vue-router
npm install @vant/touch-emulator -D # 桌面端触控模拟
```

### 移动端适配
1. 配置viewport meta标签
2. 安装postcss-px-to-viewport插件
3. 配置vite.config.ts:
```ts
import pxtovw from 'postcss-px-to-viewport'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        pxtovw({
          viewportWidth: 375, // 设计稿宽度
          unitPrecision: 3
        })
      ]
    }
  }
})
```

## 第2步：布局与交互规范

### 全局布局
1. **底部导航栏** (使用Vant Tabbar组件)
   - 首页 / 充值 / 转账 / 记录 / 我的
2. **页面结构**：
   ```vue
   <template>
     <van-nav-bar :title="pageTitle" fixed />
     <div class="content-wrap">
       <!-- 页面内容 -->
     </div>
     <van-tabbar route v-model="active">
       <!-- 导航项 -->
     </van-tabbar>
   </template>
   ```

### 设计规范
1. **色彩体系**：
   - 主色：#1989fa (Vant默认蓝)
   - 成功色：#07c160
   - 警告色：#ff976a
   - 错误色：#ee0a24
2. **间距系统**：
   - 内容边距：12px
   - 元素间距：8px/16px/24px
3. **字体规范**：
   - 标题：18px bold
   - 正文：14px
   - 辅助文本：12px

### 交互特性
1. 表单使用Vant Field组件
2. 金额输入使用NumberKeyboard数字键盘
3. 列表项使用Cell组件带箭头反馈
4. 操作按钮固定底部（SafeAreaInsetBottom）

## 第3步：核心功能组件

### 账户选择器 (AccountSelector.vue)
```vue
<template>
  <van-field
    readonly
    clickable
    :value="selectedAccount"
    label="充值账户"
    placeholder="选择账户"
    @click="showPicker = true"
  />
  <van-popup v-model:show="showPicker" position="bottom">
    <van-picker
      :columns="accountOptions"
      @confirm="onConfirm"
      :columns-field-names="{ text: 'name', value: 'id' }"
    />
  </van-popup>
</template>

<script setup>
// 账户数据结构
interface AccountOption {
  id: string
  name: string
  rebate: number // 返点率
  companyId: string
}
</script>
```

### 返点计算器 (RebateCalculator.vue)
```ts
// utils/rebateCalculator.ts
export const calculateTransfer = (
  amount: number,
  fromRebate: number,
  toRebate: number
): { actualAmount: number; rebateDiff: number } => {
  const rebateDiff = toRebate - fromRebate
  const actualAmount = amount * (1 + rebateDiff / 100)
  return {
    actualAmount: parseFloat(actualAmount.toFixed(2)),
    rebateDiff
  }
}

// 退款计算（后进先出）
export const calculateRefund = (accountId: string, amount: number) => {
  // 实现LIFO逻辑
}
```

### 多账户充值表单 (MultiRechargeForm.vue)
```vue
<template>
  <div v-for="(item, index) in accounts" :key="item.id">
    <van-field 
      v-model="item.amount"
      type="number"
      label="充值金额"
      :placeholder="`账户 ${item.name}`"
    >
      <template #extra>
        <span>返点: {{ item.rebate }}%</span>
      </template>
    </van-field>
    <van-button 
      v-if="index > 0" 
      icon="delete" 
      @click="removeAccount(index)"
    />
  </div>
  <van-button block @click="addAccount">+ 添加账户</van-button>
</template>
```

### 转账流程组件 (TransferFlow.vue)
```ts
// 转账状态定义
enum TransferStep {
  SELECT_SOURCE,   // 选择转出方
  SELECT_TARGET,   // 选择转入方
  INPUT_AMOUNT,    // 输入金额
  CONFIRM_REBATE,  // 确认返点差异
  COMPLETE         // 完成
}
```

## 第4步：页面功能规范

### 1. 登录页 (Login.vue)
- 公司选择下拉菜单（用户关联的多公司）
- 手机号+验证码登录
- 主账号/子账号权限区分

### 2. 控制台页 (Dashboard.vue)
```vue
<template>
  <van-grid :column-num="2">
    <van-grid-item>
      <div>公司余额</div>
      <div class="amount">¥{{ currentCompany.balance }}</div>
    </van-grid-item>
    <van-grid-item>
      <div>账户总数</div>
      <div>{{ accounts.length }}</div>
    </van-grid-item>
  </van-grid>
  
  <van-cell-group title="我的账户">
    <van-cell 
      v-for="acc in accounts" 
      :key="acc.id"
      :title="acc.name"
      :value="`¥${acc.balance} (${acc.rebate}%)`"
    />
  </van-cell-group>
</template>
```

### 3. 充值页 (Recharge.vue)
- 切换按钮：公司充值 / 账户充值
- 多账户选择（支持添加多个）
- 银行账号显示（根据所选公司展示）
- 充值记录实时同步

### 4. 转账页 (Transfer.vue)
```ts
// 转账流程状态机
const transferState = reactive({
  step: TransferStep.SELECT_SOURCE,
  source: null as Account | Company | null,
  target: null as Account | Company | null,
  amount: 0,
  rebateDiff: 0,
  actualAmount: 0
})

// 跨公司转账校验
const validateCrossCompany = () => {
  if (source.value?.companyId !== target.value?.companyId) {
    showConfirmDialog({
      title: '跨公司转账',
      message: '将产生额外手续费，是否继续？'
    })
  }
}
```

### 5. 交易记录页 (Records.vue)
- 分类筛选：充值/转账/退款
- 时间范围选择
- 列表项显示返点变化
- 状态标签：成功/处理中/失败

## 第5步：状态管理方案

### auth.store.ts
```ts
interface User {
  id: string
  name: string
  isMainAccount: boolean
  companies: Array<{
    id: string
    name: string
    bankAccount: string
    balance: number
  }>
}

const authStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    currentCompanyId: ''
  }),
  actions: {
    async login(phone: string, code: string) {
      // 登录逻辑
    },
    switchCompany(companyId: string) {
      this.currentCompanyId = companyId
    }
  }
})
```

### account.store.ts
```ts
interface Account {
  id: string
  name: string
  balance: number
  rebate: number // 当前返点率
  rebateHistory: Array<{ // 返点变更历史
    rate: number
    effectiveDate: Date
  }>
  transactions: Transaction[] // 资金流水（FIFO/LIFO依据）
}

const useAccountStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
    currentAccountId: ''
  }),
  actions: {
    async loadAccounts(companyId: string) {
      // 加载指定公司下的账户
    },
    async transferFunds(payload: TransferPayload) {
      // 转账核心逻辑
      const result = calculateTransfer(
        payload.amount,
        payload.fromRebate,
        payload.toRebate
      )
      
      // 更新账户余额
      // 记录交易流水
    }
  }
})
```

## 第6步：路由与API规范

### 路由配置
```ts
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/recharge',
    component: Recharge,
    meta: { 
      requiresAuth: true,
      keepAlive: true 
    }
  },
  // 其他路由...
]

// 路由守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }
  
  // 子账号权限检查
  if (to.meta.requiresMainAccount && !authStore.user?.isMainAccount) {
    showToast('需要主账号权限')
    return false
  }
})
```

### API接口模拟
```ts
// api/account.ts
export const rechargeAccount = (payload: {
  companyId: string
  accountIds: string[]
  amounts: number[]
}) => {
  // 模拟银行API回调
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `TX${Date.now()}`
      })
    }, 1500)
  })
}

// 返点变更历史
export const getRebateHistory = (accountId: string) => {
  return [
    { rate: 3.5, effectiveDate: '2023-01-01' },
    { rate: 4.0, effectiveDate: '2023-06-01' }
  ]
}
```

### 银行接口集成
```ts
// utils/bankService.ts
export const verifyBankTransfer = (transactionId: string) => {
  // 实际对接银行API
  return axios.post(BANK_API_URL, {
    transactionId,
    merchantId: CONFIG.merchantId
  })
}
```

## 补充要求
1. 返点变化处理：
   - 账户详情页显示返点变更历史折线图
   - 转账时自动计算新旧返点差异
   - 退款时根据交易时间戳应用对应返点率

2. 资金流水追踪：
   ```ts
   interface Transaction {
     id: string
     type: 'recharge' | 'transfer' | 'refund'
     amount: number
     rebateRate: number // 交易时的返点率
     timestamp: Date
     from?: string      // 转出账户ID
     to?: string        // 转入账户ID
   }
   ```

3. 权限控制：
   - 主账号：完整权限
   - 子账号：仅查看/操作指定公司
   - 敏感操作（如返点修改）需要二次验证

4. 响应式处理：
   - 使用Vant的Grid系统实现响应式布局
   - 复杂表单使用Steps组件分步引导
   - 金额输入增加千位分隔符格式化

5. 测试要求：
   - 编写返点计算器的单元测试
   - 模拟不同返点组合的转账场景
   - 验证FIFO消耗/LIFO退款逻辑
```

这个提示词针对广告充值系统的核心需求进行了移动端适配，重点关注：
1. 多公司/账户管理体系
2. 动态返点计算逻辑
3. 资金流转的FIFO/LIFO处理
4. 跨公司转账的特殊处理
5. 主/子账号权限控制

提示词已按功能模块分层，包含具体实现细节和交互规范，可直接用于Cursor生成代码。

