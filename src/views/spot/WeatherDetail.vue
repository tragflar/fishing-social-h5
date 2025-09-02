<template>
    <div class="weather-detail">
        <van-nav-bar
            :title="spotInfo?.name || '天气详情'"
            left-text="返回"
            left-arrow
            @click-left="onClickLeft"
            class="custom-nav"
        />
        
        <div class="content">
            <!-- 主要天气卡片 -->
            <div class="main-weather-card">
                <!-- 位置信息 -->
                <div class="location-header">
                    <van-icon name="location" class="location-icon" />
                    <span class="location-text">{{ todayWeather.location }}</span>
                    <div class="air-quality-badge">{{ todayWeather.airQuality }}</div>
                </div>
                
                <!-- 核心温度显示 -->
                <div class="temperature-display">
                    <div class="main-temp">
                        <span class="temp-number">{{ todayWeather.temperature.current }}</span>
                        <span class="temp-symbol">°</span>
                    </div>
                    <div class="temp-info">
                        <div class="weather-condition">{{ todayWeather.description }}</div>
                        <div class="temp-range">{{ todayWeather.temperature.high }}° / {{ todayWeather.temperature.low }}°</div>
                    </div>
                </div>
                

            </div>
            

            
            <!-- 详细指标网格 -->
            <div class="metrics-grid">
                <div class="metric-card pressure">
                    <div class="metric-icon">
                        <van-icon name="dashboard" />
                    </div>
                    <div class="metric-content">
                        <div class="metric-label">气压</div>
                        <div class="metric-value">{{ todayWeather.pressure }}<span class="unit">hPa</span></div>
                    </div>
                </div>
                
                <div class="metric-card humidity">
                    <div class="metric-icon">
                        <van-icon name="water-o" />
                    </div>
                    <div class="metric-content">
                        <div class="metric-label">湿度</div>
                        <div class="metric-value">{{ todayWeather.humidity }}<span class="unit">%</span></div>
                    </div>
                </div>
                
                <div class="metric-card fishing">
                    <div class="metric-icon">
                        <van-icon name="like" />
                    </div>
                    <div class="metric-content">
                        <div class="metric-label">钓鱼指数</div>
                        <div class="metric-value fishing-value">{{ todayWeather.fishingIndex }}</div>
                    </div>
                </div>
            </div>
            
            <!-- 24小时趋势卡片 -->
            <div class="chart-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <van-icon name="chart-trending-o" />
                        24小时趋势
                    </h3>
                    <span class="chart-hint">← 滑动查看</span>
                </div>
                
                <!-- 指标选择按钮 -->
                <div class="metric-selector">
                    <div 
                        class="metric-btn" 
                        :class="{ active: showTemperature }"
                        @click="toggleMetric('temperature')"
                    >
                        <van-icon name="fire" />
                        温度
                    </div>
                    <div 
                        class="metric-btn" 
                        :class="{ active: showPressure }"
                        @click="toggleMetric('pressure')"
                    >
                        <van-icon name="underway" />
                        气压
                    </div>
                    <div 
                        class="metric-btn" 
                        :class="{ active: showHumidity }"
                        @click="toggleMetric('humidity')"
                    >
                        <van-icon name="water-o" />
                        湿度
                    </div>
                </div>
                
                <div ref="chartContainer" class="chart-container"></div>
            </div>
            
            <!-- 未来7天预报列表 -->
            <div class="detailed-forecast">
                <div class="forecast-header">
                    <h3>未来7天预报</h3>
                </div>
                <div class="forecast-list">
                    <div 
                        v-for="(item, index) in weekForecast.slice(0, 7)" 
                        :key="item.date"
                        class="forecast-item"
                        :class="{ 'today': index === 1, 'tomorrow': index === 2 }"
                    >
                        <div class="forecast-date">
                            <div class="day-name">{{ formatDate(item.date) }}</div>
                            <div class="date-number">{{ formatFullDate(item.date) }}</div>
                        </div>
                        
                        <div class="forecast-weather">
                            <van-icon :name="getWeatherIcon(item.weather)" class="weather-icon" />
                            <span class="weather-desc">{{ item.weather }}</span>
                        </div>
                        
                        <div class="forecast-temp">
                            <span class="temp-high">{{ item.temperature.high }}°</span>
                            <div class="temp-bar">
                                <div class="temp-range-bar" :style="getTempBarStyle(item.temperature)"></div>
                            </div>
                            <span class="temp-low">{{ item.temperature.low }}°</span>
                        </div>
                        
                        <div class="forecast-wind">
                            <van-icon name="replay" class="wind-icon" />
                            <div class="wind-info">
                                <div class="wind-direction">{{ item.wind?.direction || '东南风' }}</div>
                                <div class="wind-level">{{ item.wind?.level || '1级' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import * as echarts from 'echarts';

const router = useRouter();
const route = useRoute();
const spotId = route.params.id;

// 图表实例
let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement>();

// 钓点信息
const spotInfo = ref({
    name: '',
    id: spotId
});

// 今日天气数据
const todayWeather = ref({
    location: '武侯区',
    temperature: {
        current: 31,
        high: 31,
        low: 21
    },
    description: '多云',
    airQuality: '空气优',

    comparison: '比今天热',
    wind: {
        direction: '东南风',
        speed: '3级'
    },
    humidity: 65,
    pressure: 1013,
    fishingIndex: '适宜'
});

// 24小时数据（扩展为包含气压和湿度）
const hourlyData = ref([
    { time: '17:00', temperature: 28, pressure: 1013, humidity: 65 },
    { time: '18:00', temperature: 27, pressure: 1014, humidity: 67 },
    { time: '19:00', temperature: 26, pressure: 1015, humidity: 70 },
    { time: '20:00', temperature: 25, pressure: 1016, humidity: 72 },
    { time: '21:00', temperature: 24, pressure: 1017, humidity: 75 },
    { time: '22:00', temperature: 23, pressure: 1018, humidity: 78 },
    { time: '23:00', temperature: 22, pressure: 1019, humidity: 80 },
    { time: '00:00', temperature: 21, pressure: 1020, humidity: 82 },
    { time: '01:00', temperature: 20, pressure: 1021, humidity: 85 },
    { time: '02:00', temperature: 19, pressure: 1022, humidity: 87 },
    { time: '03:00', temperature: 19, pressure: 1023, humidity: 88 },
    { time: '04:00', temperature: 18, pressure: 1024, humidity: 90 },
    { time: '05:00', temperature: 19, pressure: 1023, humidity: 88 },
    { time: '06:00', temperature: 21, pressure: 1022, humidity: 85 },
    { time: '07:00', temperature: 23, pressure: 1021, humidity: 82 },
    { time: '08:00', temperature: 25, pressure: 1020, humidity: 78 },
    { time: '09:00', temperature: 27, pressure: 1019, humidity: 75 },
    { time: '10:00', temperature: 29, pressure: 1018, humidity: 70 },
    { time: '11:00', temperature: 31, pressure: 1017, humidity: 65 },
    { time: '12:00', temperature: 32, pressure: 1016, humidity: 62 },
    { time: '13:00', temperature: 33, pressure: 1015, humidity: 60 },
    { time: '14:00', temperature: 34, pressure: 1014, humidity: 58 },
    { time: '15:00', temperature: 33, pressure: 1013, humidity: 60 },
    { time: '16:00', temperature: 31, pressure: 1012, humidity: 63 }
]);

// 指标显示控制
const showTemperature = ref(true);
const showPressure = ref(false);
const showHumidity = ref(false);

// 切换指标显示
const toggleMetric = (metric: string) => {
    switch (metric) {
        case 'temperature':
            showTemperature.value = !showTemperature.value;
            break;
        case 'pressure':
            showPressure.value = !showPressure.value;
            break;
        case 'humidity':
            showHumidity.value = !showHumidity.value;
            break;
    }
    updateChart();
};

// 更新图表
const updateChart = () => {
    if (!chartInstance) return;
    
    const series = [];
    
    // 温度系列
    if (showTemperature.value) {
        series.push({
            name: '温度',
            data: hourlyData.value.map(item => item.temperature),
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#FF6B6B',
                width: 3
            },
            itemStyle: {
                color: '#FF6B6B',
                borderColor: '#fff',
                borderWidth: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(255, 107, 107, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(255, 107, 107, 0.05)'
                    }]
                }
            },
            label: {
                show: true,
                position: 'top',
                formatter: '{c}°',
                color: '#FF6B6B',
                fontSize: 11,
                offset: [0, -8]
            }
        });
    }
    
    // 气压系列
    if (showPressure.value) {
        series.push({
            name: '气压',
            data: hourlyData.value.map(item => item.pressure),
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#4ECDC4',
                width: 3
            },
            itemStyle: {
                color: '#4ECDC4',
                borderColor: '#fff',
                borderWidth: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(78, 205, 196, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(78, 205, 196, 0.05)'
                    }]
                }
            },
            label: {
                show: true,
                position: 'top',
                formatter: '{c}hPa',
                color: '#4ECDC4',
                fontSize: 11,
                offset: [0, -8]
            }
        });
    }
    
    // 湿度系列
    if (showHumidity.value) {
        series.push({
            name: '湿度',
            data: hourlyData.value.map(item => item.humidity),
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#45B7D1',
                width: 3
            },
            itemStyle: {
                color: '#45B7D1',
                borderColor: '#fff',
                borderWidth: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(69, 183, 209, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(69, 183, 209, 0.05)'
                    }]
                }
            },
            label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
                color: '#45B7D1',
                fontSize: 11,
                offset: [0, -8]
            }
        });
    }
    
    const option = {
        grid: {
            left: '8%',
            right: '8%',
            top: '15%',
            bottom: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: hourlyData.value.map(item => item.time),
            axisLabel: {
                interval: 0,
                fontSize: 11,
                color: '#666',
                rotate: 0,
                margin: 8
            },
            axisLine: {
                lineStyle: {
                    color: '#e4e7ed'
                }
            },
            axisTick: {
                alignWithLabel: true,
                length: 4
            }
        },
        yAxis: {
            show: false  // 隐藏纵坐标
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 60,
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true
            }
        ],
        series: series,
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                let content = `<div style="padding: 10px; border-radius: 6px;">`;
                content += `<div style="font-weight: bold; margin-bottom: 6px; color: #333;">${params[0].name}</div>`;
                
                params.forEach((param: any) => {
                    let unit = '';
                    if (param.seriesName === '温度') unit = '°C';
                    else if (param.seriesName === '气压') unit = 'hPa';
                    else if (param.seriesName === '湿度') unit = '%';
                    
                    content += `<div style="color: ${param.color}; margin-bottom: 4px;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                        ${param.seriesName}: ${param.value}${unit}
                    </div>`;
                });
                
                content += `</div>`;
                return content;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e4e7ed',
            borderWidth: 1,
            textStyle: {
                color: '#333',
                fontSize: 12
            },
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
        }
    };
    
    chartInstance.setOption(option, true);
};

// 保持原有的hourlyTemperature兼容性
const hourlyTemperature = computed(() => 
    hourlyData.value.map(item => ({ time: item.time, temperature: item.temperature }))
);

// 多日预报数据
const weekForecast = ref([
    {
        date: '2024-08-30',
        weather: '小雨',
        temperature: { high: 27, low: 20 },
        rainProbability: 85,
        airQuality: '优',
        wind: { direction: '西北风', level: '1级' }
    },
    {
        date: '2024-08-31',
        weather: '多云',
        temperature: { high: 27, low: 21 },
        rainProbability: null,
        airQuality: '优',
        wind: { direction: '西南风', level: '1级' }
    },
    {
        date: '2024-09-01',
        weather: '小雨',
        temperature: { high: 30, low: 21 },
        rainProbability: null,
        airQuality: '优',
        wind: { direction: '东南风', level: '1级' }
    },
    {
        date: '2024-09-02',
        weather: '小雨',
        temperature: { high: 31, low: 23 },
        rainProbability: null,
        airQuality: '优',
        wind: { direction: '北风', level: '2级' }
    },
    {
        date: '2024-09-03',
        weather: '多云',
        temperature: { high: 30, low: 23 },
        rainProbability: 80,
        airQuality: '优',
        wind: { direction: '东北风', level: '1级' }
    },
    {
        date: '2024-09-04',
        weather: '多云',
        temperature: { high: 31, low: 24 },
        rainProbability: null,
        airQuality: '优',
        wind: { direction: '东风', level: '2级' }
    }
]);



// 获取温度条样式
const getTempBarStyle = (temperature: { high: number; low: number }) => {
    const minTemp = 15;
    const maxTemp = 40;
    const range = maxTemp - minTemp;
    const lowPercent = ((temperature.low - minTemp) / range) * 100;
    const highPercent = ((temperature.high - minTemp) / range) * 100;
    
    return {
        left: `${lowPercent}%`,
        width: `${highPercent - lowPercent}%`,
        background: `linear-gradient(90deg, #4A90E2 0%, #FFE066 100%)`
    };
};

// 修改初始化图表函数
const initChart = () => {
    if (!chartContainer.value) return;
    
    chartInstance = echarts.init(chartContainer.value);
    updateChart();
};



// 窗口大小变化时重新调整图表
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};

// 获取天气图标
const getWeatherIcon = (weather: string): string => {
    const iconMap: Record<string, string> = {
        '晴': 'sunny-o',
        '多云': 'cloudy-o',
        '阴': 'weather-o',
        '小雨': 'weather-o',
        '中雨': 'weather-o',
        '大雨': 'weather-o',
        '降雨': 'weather-o',
        '雷阵雨': 'weather-o',
        '日落': 'sunny-o',
        '夜间多云': 'moon-o'
    };
    return iconMap[weather] || 'sunny-o';
};

// 格式化日期（周几）
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
    } else {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[date.getDay()];
    }
};

// 格式化完整日期
const formatFullDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 返回上一页
const onClickLeft = () => {
    router.back();
};

// 获取天气数据
const fetchWeatherData = async () => {
    try {
        // 这里调用天气API
        // const response = await fetch(...);
        // const data = await response.json();
        // 更新数据...
    } catch (error) {
        showToast('获取天气数据失败');
    }
};

onMounted(() => {
    fetchWeatherData();
    initChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.weather-detail {
    min-height: 100vh;
    background: linear-gradient(180deg, #f0f4f8 0%, #e8f0fe 100%);
}

.custom-nav {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.custom-nav :deep(.van-nav-bar__title) {
    color: white;
}

.custom-nav :deep(.van-nav-bar__text) {
    color: white;
}

.custom-nav :deep(.van-icon) {
    color: white;
}

.content {
    padding: 16px;
    padding-top: 8px;
}

/* 主要天气卡片 */
.main-weather-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
    color: white;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.location-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.location-icon {
    font-size: 18px;
    margin-right: 8px;
}

.location-text {
    font-size: 16px;
    font-weight: 500;
    flex: 1;
}

.air-quality-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    backdrop-filter: blur(10px);
}

.temperature-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.main-temp {
    display: flex;
    align-items: flex-start;
}

.temp-number {
    font-size: 80px;
    font-weight: 200;
    line-height: 0.8;
}

.temp-symbol {
    font-size: 32px;
    font-weight: 300;
    margin-top: 8px;
}

.temp-info {
    text-align: right;
}

.weather-condition {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
}

.temp-range {
    font-size: 16px;
    opacity: 0.8;
}



/* 指标网格 */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.metric-card {
    background: white;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
}

.metric-card:active {
    transform: scale(0.98);
}

.metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    font-size: 20px;
}

.pressure .metric-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

.humidity .metric-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
}

.fishing .metric-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: white;
}

.metric-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.metric-value {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.fishing-value {
    color: #fa709a;
}

.unit {
    font-size: 12px;
    font-weight: normal;
    color: #999;
    margin-left: 2px;
}

/* 图表卡片 */
.chart-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.chart-hint {
    font-size: 12px;
    color: #999;
    animation: slideHint 2s ease-in-out infinite;
}

@keyframes slideHint {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
}

.chart-container {
    width: 100%;
    height: 280px;
    position: relative;
    overflow: hidden;
}



/* 详细预报 */
.detailed-forecast {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
}

.forecast-header h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.forecast-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.forecast-item {
    display: grid;
    grid-template-columns: 80px 1fr 120px 80px;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s ease;
}

.forecast-item:last-child {
    border-bottom: none;
}

.forecast-item.today {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 12px;
    padding: 16px 12px;
    margin: 4px 0;
}

.forecast-item.tomorrow {
    background: linear-gradient(90deg, rgba(74, 144, 226, 0.08) 0%, rgba(53, 122, 189, 0.08) 100%);
    border-radius: 12px;
    padding: 16px 12px;
    margin: 4px 0;
}

.forecast-date {
    text-align: left;
}

.day-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
}

.date-number {
    font-size: 12px;
    color: #999;
}

.forecast-weather {
    display: flex;
    align-items: center;
    gap: 8px;
}

.weather-icon {
    font-size: 20px;
    color: #4A90E2;
}

.weather-desc {
    font-size: 14px;
    color: #666;
}

.forecast-temp {
    display: flex;
    align-items: center;
    gap: 8px;
}

.temp-high {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    min-width: 32px;
}

.temp-low {
    font-size: 14px;
    color: #999;
    min-width: 32px;
}

.temp-bar {
    flex: 1;
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    position: relative;
    margin: 0 8px;
}

.temp-range-bar {
    height: 100%;
    border-radius: 2px;
    position: absolute;
    top: 0;
}

.forecast-wind {
    display: flex;
    align-items: center;
    gap: 6px;
}

.wind-icon {
    font-size: 16px;
    color: #999;
}

.wind-info {
    text-align: center;
}

.wind-direction {
    font-size: 12px;
    color: #666;
    margin-bottom: 2px;
}

.wind-level {
    font-size: 11px;
    color: #999;
}

/* 响应式优化 */
@media (max-width: 375px) {
    .content {
        padding: 12px;
    }
    
    .main-weather-card {
        padding: 20px;
    }
    
    .temp-number {
        font-size: 64px;
    }
    
    .metrics-grid {
        gap: 8px;
    }
    
    .metric-card {
        padding: 16px 12px;
    }
    
    .chart-container {
        height: 250px;
    }
    
    .forecast-chart {
        height: 200px;
    }
    
    .forecast-item {
        grid-template-columns: 70px 1fr 100px 70px;
        padding: 12px 0;
    }
}

/* 触摸优化 */
.chart-container,
.forecast-chart {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* 新增样式 */
.metric-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding: 0 16px;
}

.metric-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 20px;
    background: #f7f8fa;
    color: #969799;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.metric-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    transform: translateY(-1px);
}

.metric-btn:hover {
    background: #ebedf0;
    transform: translateY(-1px);
}

.metric-btn.active:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-btn .van-icon {
    font-size: 14px;
}
</style>