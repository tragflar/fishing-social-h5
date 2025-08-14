import { defineStore } from 'pinia';
import type { User, Company } from '../types/account';

interface AuthState {
    user: User | null;
    currentCompanyId: string;
    isLoggedIn: boolean;
    token: string;
    loginTime: Date | null;
    lastActivity: Date | null;
    permissions: string[];
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        currentCompanyId: '',
        isLoggedIn: false,
        token: '',
        loginTime: null,
        lastActivity: null,
        permissions: [],
    }),

    getters: {
        // 当前公司信息
        currentCompany(): Company | null {
            if (!this.user || !this.currentCompanyId) return null;
            return this.user.companies.find(company => company.id === this.currentCompanyId) || null;
        },

        // 是否为主账号
        isMainAccount(): boolean {
            return this.user?.isMainAccount || false;
        },

        // 用户可访问的公司列表
        availableCompanies(): Company[] {
            return this.user?.companies || [];
        },

        // 检查是否有特定权限
        hasPermission: (state) => (permission: string): boolean => {
            if (state.user?.isMainAccount) return true; // 主账号拥有所有权限
            return state.permissions.includes(permission);
        },

        // 检查是否可以管理公司
        canManageCompanies(): boolean {
            return this.isMainAccount || this.hasPermission('manage_companies');
        },

        // 检查是否可以管理账户
        canManageAccounts(): boolean {
            return this.isMainAccount || this.hasPermission('manage_accounts');
        },

        // 检查是否可以进行转账
        canTransfer(): boolean {
            return this.isMainAccount || this.hasPermission('transfer_funds');
        },

        // 检查是否可以充值
        canRecharge(): boolean {
            return this.isMainAccount || this.hasPermission('recharge_funds');
        },

        // 登录状态检查
        isSessionValid(): boolean {
            if (!this.isLoggedIn || !this.loginTime) return false;
            
            // 检查会话是否过期（24小时）
            const sessionTimeout = 24 * 60 * 60 * 1000; // 24小时
            const now = new Date().getTime();
            const loginTime = this.loginTime.getTime();
            
            return (now - loginTime) < sessionTimeout;
        },

        // 用户显示名称
        userDisplayName(): string {
            if (!this.user) return '';
            return `${this.user.name}${this.user.isMainAccount ? '(主账号)' : '(子账号)'}`;
        },
    },

    actions: {
        // 登录
        async login(phone: string, code: string, companyId?: string): Promise<{ success: boolean; message?: string }> {
            try {
                // 模拟API调用
                const response = await this.mockLoginAPI(phone, code);
                
                if (response.success) {
                    this.user = response.user;
                    this.token = response.token;
                    this.isLoggedIn = true;
                    this.loginTime = new Date();
                    this.lastActivity = new Date();
                    this.permissions = response.permissions || [];
                    
                    // 设置当前公司
                    if (companyId && this.user?.companies.find(c => c.id === companyId)) {
                        this.currentCompanyId = companyId;
                    } else if (this.user?.companies.length && this.user.companies.length > 0) {
                        this.currentCompanyId = this.user.companies[0].id;
                    }
                    
                    // 保存到本地存储
                    this.saveToLocalStorage();
                    
                    return { success: true };
                } else {
                    return { success: false, message: response.message };
                }
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: '登录失败，请重试' };
            }
        },

        // 切换公司
        switchCompany(companyId: string): boolean {
            if (!this.user) return false;
            
            const company = this.user.companies.find(c => c.id === companyId);
            if (!company) return false;
            
            this.currentCompanyId = companyId;
            this.updateLastActivity();
            this.saveToLocalStorage();
            
            return true;
        },

        // 退出登录
        logout(): void {
            this.user = null;
            this.currentCompanyId = '';
            this.isLoggedIn = false;
            this.token = '';
            this.loginTime = null;
            this.lastActivity = null;
            this.permissions = [];
            
            // 清除本地存储
            this.clearLocalStorage();
        },

        // 更新用户信息
        updateUserInfo(userInfo: Partial<User>): void {
            if (this.user) {
                this.user = { ...this.user, ...userInfo };
                this.updateLastActivity();
                this.saveToLocalStorage();
            }
        },

        // 添加公司
        addCompany(company: Company): void {
            if (this.user) {
                this.user.companies.push(company);
                this.updateLastActivity();
                this.saveToLocalStorage();
            }
        },

        // 更新公司信息
        updateCompany(companyId: string, companyInfo: Partial<Company>): boolean {
            if (!this.user) return false;
            
            const companyIndex = this.user.companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return false;
            
            this.user.companies[companyIndex] = { 
                ...this.user.companies[companyIndex], 
                ...companyInfo 
            };
            
            this.updateLastActivity();
            this.saveToLocalStorage();
            return true;
        },

        // 删除公司
        removeCompany(companyId: string): boolean {
            if (!this.user) return false;
            
            const companyIndex = this.user.companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return false;
            
            this.user.companies.splice(companyIndex, 1);
            
            // 如果删除的是当前公司，切换到第一个公司
            if (this.currentCompanyId === companyId && this.user.companies.length > 0) {
                this.currentCompanyId = this.user.companies[0].id;
            }
            
            this.updateLastActivity();
            this.saveToLocalStorage();
            return true;
        },

        // 更新最后活动时间
        updateLastActivity(): void {
            this.lastActivity = new Date();
        },

        // 检查并刷新会话
        async refreshSession(): Promise<boolean> {
            if (!this.isSessionValid) {
                this.logout();
                return false;
            }
            
            try {
                // 模拟刷新token的API调用
                const response = await this.mockRefreshTokenAPI(this.token);
                if (response.success) {
                    this.token = response.token;
                    this.updateLastActivity();
                    this.saveToLocalStorage();
                    return true;
                }
            } catch (error) {
                console.error('Refresh session error:', error);
            }
            
            return false;
        },

        // 从本地存储恢复状态
        restoreFromLocalStorage(): void {
            try {
                const authData = localStorage.getItem('auth_store');
                if (authData) {
                    const parsed = JSON.parse(authData);
                    this.user = parsed.user;
                    this.currentCompanyId = parsed.currentCompanyId;
                    this.isLoggedIn = parsed.isLoggedIn;
                    this.token = parsed.token;
                    this.loginTime = parsed.loginTime ? new Date(parsed.loginTime) : null;
                    this.lastActivity = parsed.lastActivity ? new Date(parsed.lastActivity) : null;
                    this.permissions = parsed.permissions || [];
                    
                    // 检查会话是否仍然有效
                    if (!this.isSessionValid) {
                        this.logout();
                    }
                }
            } catch (error) {
                console.error('Restore from localStorage error:', error);
                this.clearLocalStorage();
            }
        },

        // 保存到本地存储
        saveToLocalStorage(): void {
            try {
                const authData = {
                    user: this.user,
                    currentCompanyId: this.currentCompanyId,
                    isLoggedIn: this.isLoggedIn,
                    token: this.token,
                    loginTime: this.loginTime?.toISOString(),
                    lastActivity: this.lastActivity?.toISOString(),
                    permissions: this.permissions,
                };
                localStorage.setItem('auth_store', JSON.stringify(authData));
            } catch (error) {
                console.error('Save to localStorage error:', error);
            }
        },

        // 清除本地存储
        clearLocalStorage(): void {
            localStorage.removeItem('auth_store');
        },

        // 模拟登录API
        async mockLoginAPI(phone: string, code: string): Promise<any> {
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 模拟登录验证
            if (phone && code === '123456') {
                return {
                    success: true,
                    user: {
                        id: 'user_1',
                        name: '张三',
                        phone: phone,
                        isMainAccount: true,
                        companies: [
                            {
                                id: 'company_1',
                                name: '测试公司A',
                                bankAccount: '6222021234567890',
                                balance: 50000,
                            },
                            {
                                id: 'company_2',
                                name: '测试公司B',
                                bankAccount: '6222021234567891',
                                balance: 30000,
                            },
                        ],
                    } as User,
                    token: 'mock_token_' + Date.now(),
                    permissions: ['manage_companies', 'manage_accounts', 'transfer_funds', 'recharge_funds'],
                };
            }
            
            return {
                success: false,
                message: '手机号或验证码错误',
            };
        },

        // 模拟刷新token API
        async mockRefreshTokenAPI(token: string): Promise<any> {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                token: 'refreshed_token_' + Date.now(),
            };
        },
    },
}); 