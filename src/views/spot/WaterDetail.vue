<template>
    <div class="water-detail">
        <van-nav-bar
            title="水文详情"
            left-text="返回"
            left-arrow
            @click-left="onClickLeft"
        />
        
        <div class="content">
            <!-- 当前水文信息 -->
            <div class="current-water">
                <div class="main-info">
                    <div class="temp-box">
                        <div class="temp-value">
                            <span class="current-temp">{{ waterInfo.waterTemp }}</span>
                            <span class="unit">°C</span>
                        </div>
                        <span class="label">当前水温</span>
                        <div class="temp-trend">
                            <van-icon name="arrow-up" v-if="waterInfo.waterTemp > 20" color="#ee0a24" />
                            <van-icon name="arrow-down" v-else-if="waterInfo.waterTemp < 15" color="#1989fa" />
                            <van-icon name="success" v-else color="#07c160" />
                            <span :class="['trend-text', getTempTrendClass()]">{{ getTempTrendText() }}</span>
                        </div>
                    </div>
                    <div class="quality-box">
                        <van-tag 
                            :type="getQualityType(waterInfo.waterQuality)"
                            size="large"
                            round
                        >
                            {{ waterInfo.waterQuality }}
                        </van-tag>
                        <span class="label">水质状况</span>
                    </div>
                </div>

                <!-- 水文指标 -->
                <div class="water-metrics">
                    <div class="metric-item">
                        <div class="metric-icon">
                            <van-icon name="chart-trending" />
                        </div>
                        <div class="metric-content">
                            <span class="label">水位</span>
                            <div class="value-container">
                                <span class="value">{{ waterInfo.waterLevel.current }}m</span>
                                <span :class="['trend', getTrendClass(waterInfo.waterLevel.change)]">
                                    {{ waterInfo.waterLevel.change }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-icon">
                            <van-icon name="water-drop" />
                        </div>
                        <div class="metric-content">
                            <span class="label">溶氧量</span>
                            <div class="value-container">
                                <span class="value">{{ waterInfo.oxygen }}mg/L</span>
                                <span :class="['quality-indicator', getOxygenClass()]">
                                    {{ getOxygenStatus() }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-icon">
                            <van-icon name="balance" />
                        </div>
                        <div class="metric-content">
                            <span class="label">pH值</span>
                            <div class="value-container">
                                <span class="value">{{ waterInfo.ph }}</span>
                                <span :class="['quality-indicator', getPhClass()]">
                                    {{ getPhStatus() }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 未来水文预报 -->
            <div class="forecast-section">
                <h3>未来水文预报</h3>
                <div class="forecast-list">
                    <div 
                        v-for="item in waterForecast" 
                        :key="item.date"
                        class="forecast-item"
                    >
                        <div class="date">{{ formatDate(item.date) }}</div>
                        <div class="forecast-data">
                            <div class="data-row">
                                <span class="label">水温:</span>
                                <span class="value">{{ item.waterTemp }}°</span>
                            </div>
                            <div class="data-row">
                                <span class="label">水位:</span>
                                <span class="value">{{ item.waterLevel.value }}m</span>
                                <span class="trend">{{ item.waterLevel.change }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 潮汐信息（如果有） -->
            <div v-if="waterInfo.tide" class="tide-section">
                <h3>潮汐信息</h3>
                <div class="tide-info">
                    <div class="tide-item">
                        <span class="label">下次涨潮</span>
                        <span class="time">{{ waterInfo.tide.nextHigh }}</span>
                    </div>
                    <div class="tide-item">
                        <span class="label">下次退潮</span>
                        <span class="time">{{ waterInfo.tide.nextLow }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const spotId = route.params.id;

// 当前水文数据
const waterInfo = ref({
    waterTemp: 22,
    waterQuality: '优' as const,
    waterLevel: {
        current: 3.5,
        change: '稳定'
    },
    oxygen: 8.5,
    ph: 7.2,
    tide: {
        nextHigh: '14:30',
        nextLow: '20:45'
    }
});

// 未来水文预报
const waterForecast = ref([
    {
        date: '2024-01-15',
        waterTemp: 22,
        waterLevel: { value: 3.5, change: '稳定' }
    },
    {
        date: '2024-01-16',
        waterTemp: 21,
        waterLevel: { value: 3.6, change: '上升' }
    },
    {
        date: '2024-01-17',
        waterTemp: 20,
        waterLevel: { value: 3.8, change: '上升' }
    },
    {
        date: '2024-01-18',
        waterTemp: 21,
        waterLevel: { value: 3.7, change: '下降' }
    },
    {
        date: '2024-01-19',
        waterTemp: 22,
        waterLevel: { value: 3.6, change: '下降' }
    },
    {
        date: '2024-01-20',
        waterTemp: 23,
        waterLevel: { value: 3.5, change: '稳定' }
    },
    {
        date: '2024-01-21',
        waterTemp: 22,
        waterLevel: { value: 3.4, change: '下降' }
    }
]);

// 获取水质标签类型
const getQualityType = (quality: '优' | '良' | '一般' | '差'): 'success' | 'primary' | 'warning' | 'danger' => {
    const types = {
        '优': 'success',
        '良': 'primary',
        '一般': 'warning',
        '差': 'danger'
    } as const;
    return types[quality];
};

// 格式化日期
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天';
    } else {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    }
};

// 获取水温趋势类名
const getTempTrendClass = () => {
    const temp = waterInfo.value.waterTemp;
    if (temp > 20) return 'high';
    if (temp < 15) return 'low';
    return 'normal';
};

// 获取水温趋势文本
const getTempTrendText = () => {
    const temp = waterInfo.value.waterTemp;
    if (temp > 20) return '偏高';
    if (temp < 15) return '偏低';
    return '适宜';
};

// 获取趋势类名
const getTrendClass = (trend: string) => {
    switch (trend) {
        case '上升': return 'rising';
        case '下降': return 'falling';
        default: return 'stable';
    }
};

// 获取溶氧状态类名
const getOxygenClass = () => {
    const oxygen = waterInfo.value.oxygen;
    if (oxygen >= 7) return 'good';
    if (oxygen >= 5) return 'normal';
    return 'bad';
};

// 获取溶氧状态文本
const getOxygenStatus = () => {
    const oxygen = waterInfo.value.oxygen;
    if (oxygen >= 7) return '充足';
    if (oxygen >= 5) return '一般';
    return '不足';
};

// 获取pH值状态类名
const getPhClass = () => {
    const ph = waterInfo.value.ph;
    if (ph >= 6.5 && ph <= 8.5) return 'good';
    if (ph >= 6.0 && ph <= 9.0) return 'normal';
    return 'bad';
};

// 获取pH值状态文本
const getPhStatus = () => {
    const ph = waterInfo.value.ph;
    if (ph >= 6.5 && ph <= 8.5) return '正常';
    if (ph >= 6.0 && ph <= 9.0) return '一般';
    return '异常';
};

// 返回上一页
const onClickLeft = () => {
    router.back();
};
</script>

<style lang="less" scoped>
.water-detail {
    min-height: 100vh;
    background: #f8f8f8;

    .content {
        padding: 16px;

        .current-water {
            background: linear-gradient(135deg, #4B8BF4 0%, #7BA7FF 100%);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            color: white;

            .main-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 32px;

                .temp-box {
                    .temp-value {
                        display: flex;
                        align-items: flex-start;

                        .current-temp {
                            font-size: 64px;
                            font-weight: 300;
                            line-height: 1;
                        }

                        .unit {
                            font-size: 20px;
                            margin-top: 12px;
                            margin-left: 4px;
                            opacity: 0.9;
                        }
                    }

                    .label {
                        font-size: 14px;
                        opacity: 0.8;
                        margin: 8px 0;
                        display: block;
                    }

                    .temp-trend {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        margin-top: 8px;

                        .trend-text {
                            font-size: 14px;

                            &.high { color: #ee0a24; }
                            &.low { color: #1989fa; }
                            &.normal { color: #07c160; }
                        }
                    }
                }

                .quality-box {
                    text-align: center;

                    .van-tag {
                        padding: 8px 16px;
                        font-size: 16px;
                    }

                    .label {
                        font-size: 14px;
                        opacity: 0.8;
                        margin-top: 8px;
                        display: block;
                    }
                }
            }

            .water-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;

                .metric-item {
                    .metric-icon {
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 12px;

                        .van-icon {
                            font-size: 24px;
                            color: white;
                        }
                    }

                    .metric-content {
                        .label {
                            font-size: 12px;
                            opacity: 0.8;
                            margin-bottom: 4px;
                        }

                        .value-container {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .value {
                                font-size: 16px;
                                font-weight: 500;
                            }

                            .trend {
                                font-size: 12px;
                                padding: 2px 8px;
                                border-radius: 10px;
                                background: rgba(255, 255, 255, 0.2);

                                &.rising { color: #ee0a24; }
                                &.falling { color: #1989fa; }
                                &.stable { opacity: 0.8; }
                            }

                            .quality-indicator {
                                font-size: 12px;
                                padding: 2px 8px;
                                border-radius: 10px;
                                background: rgba(255, 255, 255, 0.2);

                                &.good { color: #07c160; }
                                &.normal { opacity: 0.8; }
                                &.bad { color: #ee0a24; }
                            }
                        }
                    }
                }
            }
        }

        .forecast-section {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

            h3 {
                margin: 0 0 20px;
                font-size: 18px;
                color: #333;
                font-weight: 500;
            }

            .forecast-list {
                .forecast-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border-radius: 12px;
                    background: #f8f8f8;
                    margin-bottom: 12px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .date {
                        width: 80px;
                        font-size: 16px;
                        color: #333;
                        font-weight: 500;
                    }

                    .forecast-data {
                        flex: 1;

                        .data-row {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            margin-bottom: 8px;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .label {
                                font-size: 14px;
                                color: #666;
                                width: 50px;
                            }

                            .value {
                                font-size: 16px;
                                color: #333;
                                font-weight: 500;
                            }

                            .trend {
                                font-size: 12px;
                                padding: 2px 8px;
                                border-radius: 10px;
                                background: #e8f3ff;
                                color: #1890ff;
                            }
                        }
                    }
                }
            }
        }

        .tide-section {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

            h3 {
                margin: 0 0 20px;
                font-size: 18px;
                color: #333;
                font-weight: 500;
            }

            .tide-info {
                display: flex;
                flex-direction: column;
                gap: 16px;

                .tide-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-radius: 12px;
                    background: #f8f8f8;

                    .label {
                        font-size: 14px;
                        color: #666;
                    }

                    .time {
                        font-size: 18px;
                        color: #333;
                        font-weight: 500;
                    }
                }
            }
        }
    }
}
</style> 