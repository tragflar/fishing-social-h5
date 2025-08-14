import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pxtovw from 'postcss-px-to-viewport';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/fishing-social-h5/' : '/',
    plugins: [vue()],
    css: {
        postcss: {
            plugins: [
                pxtovw({
                    viewportWidth: 375,
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
        host: '0.0.0.0',
        port: 3000,
        open: true,
        cors: true,
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
        sourcemap: false,
        // 添加这些配置以确保GitHub Pages兼容性
        target: 'es2015',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', 'vue-router', 'pinia'],
                    vant: ['vant'],
                },
                // 确保文件名稳定
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },
        },
    },
});