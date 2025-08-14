import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pxtovw from 'postcss-px-to-viewport-8-plugin';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/fishing-social-h5/' : '/',
    plugins: [vue()],
    css: {
        postcss: {
            plugins: [
                pxtovw({
                    viewportWidth: 375, // 设计稿宽度
                    unitPrecision: 3,
                    viewportUnit: 'vw',
                    selectorBlackList: ['.ignore', '.hairlines'],
                    minPixelValue: 1,
                    mediaQuery: false,
                }),
            ],
        },
    },
    server: {
        host: '0.0.0.0', // 允许所有IP访问
        port: 3000,
        open: true, // 自动打开浏览器
        cors: true, // 启用CORS
        hmr: true,
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
        open: true,
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false, // 生产环境不生成sourcemap
        minify: 'terser', // 明确指定使用terser
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', 'vue-router', 'pinia'],
                    vant: ['vant'],
                },
            },
        },
    },
});