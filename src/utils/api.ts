import axios from 'axios';
import { showToast } from 'vant';

// 创建axios实例
const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 添加认证token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    showToast('登录已过期，请重新登录');
                    // 跳转到登录页
                    window.location.href = '/login';
                    break;
                case 403:
                    showToast('权限不足');
                    break;
                case 404:
                    showToast('请求的资源不存在');
                    break;
                case 500:
                    showToast('服务器内部错误');
                    break;
                default:
                    showToast(data?.message || '请求失败');
            }
        } else {
            showToast('网络连接失败');
        }
        
        return Promise.reject(error);
    },
);

export default api; 