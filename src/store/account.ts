import { defineStore } from 'pinia';
import { calculateTransfer, calculateRefund, calculateFifoConsumption } from '../utils/rebateCalculator';
import type { Account, Transaction, TransferPayload } from '../types/account';

interface AccountState {
    accounts: Account[];
    currentAccountId: string;
    loading: boolean;
    error: string | null;
    lastUpdateTime: Date | null;
    transactionHistory: Transaction[];
    accountCache: Map<string, Account[]>; // 按公司ID缓存账户
}

export const useAccountStore = defineStore('accounts', {
    state: (): AccountState => ({
        accounts: [],
        currentAccountId: '',
        loading: false,
        error: null,
        lastUpdateTime: null,
        transactionHistory: [],
        accountCache: new Map(),
    }),

    getters: {
        // 当前选中的账户
        currentAccount(): Account | null {
            return this.accounts.find(account => account.id === this.currentAccountId) || null;
        },

        // 按公司分组的账户
        accountsByCompany(): Record<string, Account[]> {
            const grouped: Record<string, Account[]> = {};
            this.accounts.forEach(account => {
                if (!grouped[account.companyId]) {
                    grouped[account.companyId] = [];
                }
                grouped[account.companyId].push(account);
            });
            return grouped;
        },

        // 账户总余额
        totalBalance(): number {
            return this.accounts.reduce((sum, account) => sum + account.balance, 0);
        },

        // 平均返点率
        averageRebate(): number {
            if (this.accounts.length === 0) return 0;
            const totalRebate = this.accounts.reduce((sum, account) => sum + account.rebate, 0);
            return Number((totalRebate / this.accounts.length).toFixed(2));
        },

        // 获取特定账户的交易记录
        getAccountTransactions: (state) => (accountId: string): Transaction[] => {
            return state.transactionHistory.filter(transaction => 
                transaction.from === accountId || transaction.to === accountId
            );
        },

        // 获取余额不足的账户
        lowBalanceAccounts(): Account[] {
            return this.accounts.filter(account => account.balance < 1000);
        },

        // 获取高返点率的账户
        highRebateAccounts(): Account[] {
            return this.accounts.filter(account => account.rebate >= 5);
        },

        // 检查账户是否可以转账
        canAccountTransfer: (state) => (accountId: string, amount: number): boolean => {
            const account = state.accounts.find(acc => acc.id === accountId);
            return account ? account.balance >= amount : false;
        },

        // 获取账户统计信息
        accountStats(): {
            totalAccounts: number;
            totalBalance: number;
            averageBalance: number;
            activeAccounts: number;
        } {
            const totalAccounts = this.accounts.length;
            const totalBalance = this.totalBalance;
            const averageBalance = totalAccounts > 0 ? totalBalance / totalAccounts : 0;
            const activeAccounts = this.accounts.filter(acc => acc.balance > 0).length;

            return {
                totalAccounts,
                totalBalance,
                averageBalance: Number(averageBalance.toFixed(2)),
                activeAccounts,
            };
        },
    },

    actions: {
        // 加载指定公司的账户
        async loadAccounts(companyId: string, forceRefresh = false): Promise<void> {
            // 检查缓存
            if (!forceRefresh && this.accountCache.has(companyId)) {
                const cachedAccounts = this.accountCache.get(companyId);
                if (cachedAccounts) {
                    this.accounts = [...cachedAccounts];
                    return;
                }
            }

            this.loading = true;
            this.error = null;

            try {
                // 模拟API调用
                const response = await this.mockLoadAccountsAPI(companyId);
                
                if (response.success) {
                    this.accounts = response.accounts;
                    this.lastUpdateTime = new Date();
                    
                    // 缓存账户数据
                    this.accountCache.set(companyId, [...response.accounts]);
                    
                    // 如果没有当前账户，选择第一个
                    if (!this.currentAccountId && this.accounts.length > 0) {
                        this.currentAccountId = this.accounts[0].id;
                    }
                } else {
                    this.error = response.message || '加载账户失败';
                }
            } catch (error) {
                console.error('Load accounts error:', error);
                this.error = '网络错误，请重试';
            } finally {
                this.loading = false;
            }
        },

        // 设置当前账户
        setCurrentAccount(accountId: string): boolean {
            const account = this.accounts.find(acc => acc.id === accountId);
            if (account) {
                this.currentAccountId = accountId;
                return true;
            }
            return false;
        },

        // 转账操作
        async transferFunds(payload: TransferPayload): Promise<{ success: boolean; message?: string; transaction?: Transaction }> {
            this.loading = true;
            this.error = null;

            try {
                // 验证转账参数
                const fromAccount = this.accounts.find(acc => acc.id === payload.fromAccountId);
                const toAccount = this.accounts.find(acc => acc.id === payload.toAccountId);

                if (!fromAccount || !toAccount) {
                    return { success: false, message: '账户不存在' };
                }

                if (fromAccount.balance < payload.amount) {
                    return { success: false, message: '余额不足' };
                }

                // 计算转账结果
                const transferResult = calculateTransfer(
                    payload.amount,
                    payload.fromRebate,
                    payload.toRebate
                );

                // 模拟API调用
                const response = await this.mockTransferAPI(payload, transferResult);

                if (response.success) {
                    // 更新账户余额
                    fromAccount.balance -= payload.amount;
                    toAccount.balance += transferResult.actualAmount;

                    // 创建交易记录
                    const transaction: Transaction = {
                        id: `tx_${Date.now()}`,
                        type: 'transfer',
                        amount: payload.amount,
                        rebateRate: payload.fromRebate,
                        timestamp: new Date(),
                        from: payload.fromAccountId,
                        to: payload.toAccountId,
                    };

                    // 添加交易记录到历史
                    this.transactionHistory.unshift(transaction);
                    fromAccount.transactions.unshift(transaction);
                    toAccount.transactions.unshift(transaction);

                    // 更新缓存
                    this.updateAccountCache(fromAccount.companyId);
                    if (fromAccount.companyId !== toAccount.companyId) {
                        this.updateAccountCache(toAccount.companyId);
                    }

                    return { 
                        success: true, 
                        message: '转账成功',
                        transaction 
                    };
                } else {
                    return { success: false, message: response.message || '转账失败' };
                }
            } catch (error) {
                console.error('Transfer error:', error);
                return { success: false, message: '网络错误，请重试' };
            } finally {
                this.loading = false;
            }
        },

        // 充值操作
        async rechargeAccount(accountId: string, amount: number): Promise<{ success: boolean; message?: string }> {
            this.loading = true;
            this.error = null;

            try {
                const account = this.accounts.find(acc => acc.id === accountId);
                if (!account) {
                    return { success: false, message: '账户不存在' };
                }

                // 模拟API调用
                const response = await this.mockRechargeAPI(accountId, amount);

                if (response.success) {
                    // 更新账户余额
                    account.balance += amount;

                    // 创建交易记录
                    const transaction: Transaction = {
                        id: `tx_${Date.now()}`,
                        type: 'recharge',
                        amount: amount,
                        rebateRate: account.rebate,
                        timestamp: new Date(),
                        to: accountId,
                    };

                    // 添加交易记录
                    this.transactionHistory.unshift(transaction);
                    account.transactions.unshift(transaction);

                    // 更新缓存
                    this.updateAccountCache(account.companyId);

                    return { success: true, message: '充值成功' };
                } else {
                    return { success: false, message: response.message || '充值失败' };
                }
            } catch (error) {
                console.error('Recharge error:', error);
                return { success: false, message: '网络错误，请重试' };
            } finally {
                this.loading = false;
            }
        },

        // 更新账户缓存
        updateAccountCache(companyId: string): void {
            const companyAccounts = this.accounts.filter(acc => acc.companyId === companyId);
            this.accountCache.set(companyId, [...companyAccounts]);
        },

        // 清除缓存
        clearCache(): void {
            this.accountCache.clear();
        },

        // 清除错误状态
        clearError(): void {
            this.error = null;
        },

        // 模拟API调用
        async mockLoadAccountsAPI(companyId: string): Promise<any> {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockAccounts: Account[] = [
                {
                    id: 'acc_1',
                    name: '广告账户A',
                    balance: 15000,
                    rebate: 3.5,
                    companyId: companyId,
                    rebateHistory: [
                        { rate: 3.0, effectiveDate: new Date('2023-01-01') },
                        { rate: 3.5, effectiveDate: new Date('2023-06-01') },
                    ],
                    transactions: [],
                },
                {
                    id: 'acc_2',
                    name: '广告账户B',
                    balance: 8500,
                    rebate: 4.0,
                    companyId: companyId,
                    rebateHistory: [
                        { rate: 3.5, effectiveDate: new Date('2023-01-01') },
                        { rate: 4.0, effectiveDate: new Date('2023-03-01') },
                    ],
                    transactions: [],
                },
            ];

            return { success: true, accounts: mockAccounts };
        },

        async mockTransferAPI(payload: TransferPayload, result: any): Promise<any> {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { success: true, result };
        },

        async mockRechargeAPI(accountId: string, amount: number): Promise<any> {
            await new Promise(resolve => setTimeout(resolve, 1200));
            return { success: true };
        },
    },
}); 