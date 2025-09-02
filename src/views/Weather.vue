<template>
    <div class="weather-page">
        <van-nav-bar title="天气水文" left-arrow @click-left="$router.back()" />
        
        <div class="content-wrap">
            <!-- 当前天气概览 -->
            <div class="current-weather">
                <div class="weather-main">
                    <div class="weather-icon">{{ currentWeather.icon }}</div>
                    <div class="weather-info">
                        <div class="temperature">{{ currentWeather.temperature }}°C</div>
                        <div class="weather-desc">{{ currentWeather.description }}</div>
                        <div class="location">{{ currentWeather.location }}</div>
                    </div>
                </div>
                
                <!-- 详细天气信息 -->
                <div class="weather-details">
                    <div class="detail-item">
                        <div class="detail-label">气温</div>
                        <div class="detail-value">{{ currentWeather.temperature }}°C</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">气压</div>
                        <div class="detail-value">{{ currentWeather.pressure }} hPa</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">湿度</div>
                        <div class="detail-value">{{ currentWeather.humidity }}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">风速</div>
                        <div class="detail-value">{{ currentWeather.windSpeed }} m/s</div>
                    </div>
                </div>
            </div>
            
            <!-- 逐时天气折线图 -->
            <div class="hourly-weather">
                <div class="section-title">24小时气温走势</div>
                <div ref="chartContainer" class="chart-container"></div>
            </div>
            
            <!-- 适钓指数 -->
            <div class="fishing-index">
                <div class="section-title">适钓指数</div>
                <div class="index-content">
                    <div class="index-score">{{ currentWeather.suitabilityIndex }}/10</div>
                    <div class="index-desc">{{ getFishingIndexDesc(currentWeather.suitabilityIndex) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { WeatherInfo } from '../types/fishing';

// 图表实例
let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement>();

// 当前天气数据（模拟数据）
const currentWeather = ref<WeatherInfo & { icon: string; description: string; location: string }>({
    temperature: 22,
    humidity: 65,
    pressure: 1013,
    windSpeed: 3.2,
    windDirection: '东南风',
    weather: 'cloudy',
    suitabilityIndex: 7,
    icon: '⛅',
    description: '多云',
    location: '当前位置'
});

// 24小时天气数据（模拟数据）
const hourlyWeather = ref([
    { time: '00:00', temperature: 18, humidity: 70, pressure: 1012 },
    { time: '01:00', temperature: 17, humidity: 72, pressure: 1012 },
    { time: '02:00', temperature: 16, humidity: 75, pressure: 1011 },
    { time: '03:00', temperature: 16, humidity: 76, pressure: 1011 },
    { time: '04:00', temperature: 15, humidity: 78, pressure: 1010 },
    { time: '05:00', temperature: 16, humidity: 76, pressure: 1011 },
    { time: '06:00', temperature: 18, humidity: 72, pressure: 1012 },
    { time: '07:00', temperature: 20, humidity: 68, pressure: 1013 },
    { time: '08:00', temperature: 22, humidity: 65, pressure: 1013 },
    { time: '09:00', temperature: 24, humidity: 62, pressure: 1014 },
    { time: '10:00', temperature: 26, humidity: 58, pressure: 1015 },
    { time: '11:00', temperature: 28, humidity: 55, pressure: 1015 },
    { time: '12:00', temperature: 30, humidity: 52, pressure: 1016 },
    { time: '13:00', temperature: 31, humidity: 50, pressure: 1016 },
    { time: '14:00', temperature: 32, humidity: 48, pressure: 1017 },
    { time: '15:00', temperature: 31, humidity: 50, pressure: 1016 },
    { time: '16:00', temperature: 30, humidity: 52, pressure: 1016 },
    { time: '17:00', temperature: 28, humidity: 55, pressure: 1015 },
    { time: '18:00', temperature: 26, humidity: 58, pressure: 1014 },
    { time: '19:00', temperature: 24, humidity: 62, pressure: 1013 },
    { time: '20:00', temperature: 22, humidity: 65, pressure: 1013 },
    { time: '21:00', temperature: 21, humidity: 67, pressure: 1012 },
    { time: '22:00', temperature: 20, humidity: 68, pressure: 1012 },
    { time: '23:00', temperature: 19, humidity: 69, pressure: 1012 }
]);

// 初始化图表
const initChart = () => {
    if (!chartContainer.value) return;
    
    chartInstance = echarts.init(chartContainer.value);
    
    const option = {
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: hourlyWeather.value.map(item => item.time),
            axisLabel: {
                interval: 2, // 每隔2个显示一个标签
                fontSize: 12,
                color: '#666'
            },
            axisLine: {
                lineStyle: {
                    color: '#e4e7ed'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '温度(°C)',
            nameTextStyle: {
                color: '#666',
                fontSize: 12
            },
            axisLabel: {
                fontSize: 12,
                color: '#666'
            },
            axisLine: {
                lineStyle: {
                    color: '#e4e7ed'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#f5f7fa'
                }
            }
        },
        series: [{
            data: hourlyWeather.value.map(item => item.temperature),
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#1989fa',
                width: 3
            },
            itemStyle: {
                color: '#1989fa',
                borderColor: '#fff',
                borderWidth: 2
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(25, 137, 250, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(25, 137, 250, 0.05)'
                    }]
                }
            }
        }],
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const data = params[0];
                const hourData = hourlyWeather.value[data.dataIndex];
                return `
                    <div style="padding: 8px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
                        <div>气温: ${data.value}°C</div>
                        <div>湿度: ${hourData.humidity}%</div>
                        <div>气压: ${hourData.pressure} hPa</div>
                    </div>
                `;
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'transparent',
            textStyle: {
                color: '#fff',
                fontSize: 12
            }
        }
    };
    
    chartInstance.setOption(option);
};

// 获取适钓指数描述
const getFishingIndexDesc = (index: number): string => {
    if (index >= 8) return '非常适合钓鱼';
    if (index >= 6) return '比较适合钓鱼';
    if (index >= 4) return '一般适合钓鱼';
    return '不太适合钓鱼';
};

// 窗口大小变化时重新调整图表
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};

onMounted(() => {
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
.weather-page {
    min-height: 100vh;
    background: var(--van-background-color);
}

.content-wrap {
    padding: 16px;
}

.current-weather {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.weather-main {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.weather-icon {
    font-size: 64px;
    margin-right: 20px;
}

.weather-info {
    flex: 1;
}

.temperature {
    font-size: 36px;
    font-weight: bold;
    color: var(--van-text-color);
    margin-bottom: 4px;
}

.weather-desc {
    font-size: 16px;
    color: var(--van-text-color-2);
    margin-bottom: 4px;
}

.location {
    font-size: 14px;
    color: var(--van-text-color-3);
}

.weather-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.detail-item {
    text-align: center;
    padding: 12px;
    background: var(--van-background-color);
    border-radius: 8px;
}

.detail-label {
    font-size: 12px;
    color: var(--van-text-color-3);
    margin-bottom: 4px;
}

.detail-value {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-text-color);
}

.hourly-weather {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    color: var(--van-text-color);
    margin-bottom: 16px;
}

.chart-container {
    width: 100%;
    height: 300px;
}

.fishing-index {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.index-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.index-score {
    font-size: 32px;
    font-weight: bold;
    color: #1989fa;
}

.index-desc {
    font-size: 16px;
    color: var(--van-text-color-2);
}
</style>