import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// 引入Vant全量
import Vant from 'vant';
import 'vant/lib/index.css';

// 引入自定义样式
import './styles/vant.less';

// 桌面端触控模拟
import '@vant/touch-emulator';

const app = createApp(App);

// 使用Vant全量组件
app.use(Vant);

app.use(createPinia());
app.use(router);

app.mount('#app'); 