<template>
    <div class="weather-detail">
        <van-nav-bar
            :title="spotInfo?.name || '天气详情'"
            left-text="返回"
            left-arrow
            @click-left="onClickLeft"
        />
        
        <div class="content">
            <!-- 今日天气概览 -->
            <div class="today-weather">
                <div class="location">
                    <van-icon name="location" />
                    <span>{{ todayWeather.location }}</span>
                </div>
                <div class="main-info">
                    <div class="temp-box">
                        <span class="current-temp">{{ todayWeather.temperature.current }}</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <div class="temp-range">{{ todayWeather.temperature.current }} / {{ todayWeather.temperature.low }}°C</div>
                    <div class="weather-desc">
                        <span>{{ todayWeather.description }}</span>
                        <span>{{ todayWeather.airQuality }}</span>
                    </div>
                </div>
                
                <div class="weather-alert" v-if="todayWeather.alert">
                    <van-icon name="bell" />
                    <span>{{ todayWeather.alert }}</span>
                </div>

                <div class="weather-forecast">
                    <div class="forecast-title">当前{{ todayWeather.description }}，明天比今天{{ todayWeather.comparison }}</div>
                </div>
            </div>

            <!-- 24小时天气预报 -->
            <div class="hourly-forecast">
                <div 
                    v-for="item in hourlyForecast" 
                    :key="item.time"
                    class="hourly-item"
                >
                    <div class="time">{{ item.time }}</div>
                    <div class="icon">
                        <van-icon :name="getWeatherIcon(item.weather)" />
                    </div>
                    <div class="temp">{{ item.temperature }}°C</div>
                </div>
            </div>

            <!-- 多日预报 -->
            <div class="forecast-section">
                <div class="section-header">
                    <h3>多日预报</h3>
                    <van-icon name="ellipsis" />
                </div>
                <div class="forecast-list">
                    <div 
                        v-for="item in weekForecast" 
                        :key="item.date"
                        class="forecast-item"
                    >
                        <div class="forecast-date">
                            <div class="day">{{ formatDate(item.date) }}</div>
                            <div class="date">{{ formatFullDate(item.date) }}</div>
                        </div>
                        <div class="forecast-weather">
                            <van-icon :name="getWeatherIcon(item.weather)" />
                            <div class="weather-text">{{ item.weather }}</div>
                            <div v-if="item.rainProbability" class="rain-probability">
                                {{ item.rainProbability }}%
                            </div>
                        </div>
                        <div class="forecast-temp">
                            <span class="high">{{ item.temperature.high }}°C</span>
                            <span class="low">{{ item.temperature.low }}°C</span>
                        </div>
                        <div class="air-quality">
                            {{ item.airQuality || '优' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const spotId = route.params.id;

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
    alert: '来2天无降水。',
    comparison: '比今天热',
    wind: {
        direction: '东南风',
        speed: '3级'
    },
    humidity: 65,
    pressure: 1013
});

// 24小时预报
const hourlyForecast = ref([
    { time: '傍晚5:00', weather: '多云', temperature: 28 },
    { time: '傍晚6:00', weather: '多云', temperature: 27 },
    { time: '晚上7:00', weather: '多云', temperature: 26 },
    { time: '晚上7:50', weather: '日落', temperature: 25 },
    { time: '晚上8:00', weather: '夜间多云', temperature: 24 }
]);

// 多日预报数据
const weekForecast = ref([
    {
        date: '2024-08-11',
        weather: '小雨',
        temperature: { high: 31, low: 21 },
        rainProbability: 85,
        airQuality: '优'
    },
    {
        date: '2024-08-12',
        weather: '晴',
        temperature: { high: 34, low: 22 },
        rainProbability: null,
        airQuality: '优'
    },
    {
        date: '2024-08-13',
        weather: '多云',
        temperature: { high: 34, low: 24 },
        rainProbability: null,
        airQuality: '优'
    },
    {
        date: '2024-08-14',
        weather: '多云',
        temperature: { high: 33, low: 23 },
        rainProbability: null,
        airQuality: '优'
    },
    {
        date: '2024-08-15',
        weather: '降雨',
        temperature: { high: 31, low: 22 },
        rainProbability: 80,
        airQuality: '优'
    }
]);

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
    
    if (date.toDateString() === today.toDateString()) {
        return '今天';
    } else if (date.toDateString() === new Date(today.getTime() + 86400000).toDateString()) {
        return '明天';
    } else {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    }
};

// 格式化完整日期（月/日）
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
});
</script>

<style lang="less" scoped>
.weather-detail {
    min-height: 100vh;
    background: #f8f8f8;

    .content {
        padding: 16px;

        .today-weather {
            background: linear-gradient(180deg, #4B8BF4 0%, #7BA7FF 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            color: white;

            .location {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-bottom: 16px;
                font-size: 16px;

                .van-icon {
                    font-size: 18px;
                }
            }

            .main-info {
                text-align: center;
                margin-bottom: 20px;

                .temp-box {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin-bottom: 8px;

                    .current-temp {
                        font-size: 72px;
                        font-weight: 300;
                        line-height: 1;
                    }

                    .temp-unit {
                        font-size: 24px;
                        margin-top: 12px;
                    }
                }

                .temp-range {
                    font-size: 16px;
                    margin-bottom: 8px;
                }

                .weather-desc {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 16px;
                }
            }

            .weather-alert {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 12px;
                border-radius: 20px;
                margin-bottom: 16px;
                font-size: 14px;

                .van-icon {
                    font-size: 16px;
                }
            }

            .weather-forecast {
                font-size: 14px;
                opacity: 0.9;
            }
        }

        .hourly-forecast {
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            overflow-x: auto;

            .hourly-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                min-width: 60px;

                .time {
                    font-size: 12px;
                    color: #666;
                }

                .icon {
                    .van-icon {
                        font-size: 24px;
                        color: #1890ff;
                    }
                }

                .temp {
                    font-size: 14px;
                    color: #333;
                }
            }
        }

        .forecast-section {
            background: linear-gradient(180deg, #4B8BF4 0%, #7BA7FF 100%);
            border-radius: 16px;
            padding: 20px;
            color: white;

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 0 10px;

                h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: normal;
                    opacity: 0.9;
                }

                .van-icon {
                    font-size: 20px;
                    opacity: 0.8;
                }
            }

            .forecast-list {
                .forecast-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

                    &:last-child {
                        border-bottom: none;
                    }

                    .forecast-date {
                        width: 100px;

                        .day {
                            font-size: 16px;
                            margin-bottom: 4px;
                        }

                        .date {
                            font-size: 12px;
                            opacity: 0.8;
                        }
                    }

                    .forecast-weather {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .van-icon {
                            font-size: 24px;
                        }

                        .weather-text {
                            font-size: 14px;
                        }

                        .rain-probability {
                            font-size: 14px;
                            background: rgba(255, 255, 255, 0.2);
                            padding: 2px 8px;
                            border-radius: 10px;
                        }
                    }

                    .forecast-temp {
                        width: 120px;
                        display: flex;
                        gap: 8px;
                        justify-content: flex-end;
                        font-size: 16px;

                        .high {
                            font-weight: 500;
                        }

                        .low {
                            opacity: 0.8;
                        }
                    }

                    .air-quality {
                        width: 40px;
                        text-align: center;
                        font-size: 14px;
                        background: rgba(255, 255, 255, 0.2);
                        padding: 2px 8px;
                        border-radius: 10px;
                        margin-left: 16px;
                    }
                }
            }
        }
    }
}
</style> 