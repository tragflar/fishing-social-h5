#!/bin/bash

# 渔友圈 - 外网部署脚本
echo "🌐 渔友圈外网部署脚本"
echo "================================"

# 检查本地服务器是否运行
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ 本地服务器未运行，请先启动：pnpm dev"
    exit 1
fi

echo "✅ 本地服务器运行正常"

# 方案1：使用 localtunnel
echo ""
echo "📡 方案1：使用 localtunnel（推荐）"
echo "--------------------------------"
echo "正在启动 localtunnel..."

# 检查是否已安装 localtunnel
if ! command -v lt &> /dev/null; then
    echo "📦 安装 localtunnel..."
    npm install -g localtunnel
fi

# 启动 localtunnel
echo "🚀 启动外网隧道..."
lt --port 3000 --subdomain fishing-social-h5 &
LT_PID=$!

# 等待隧道建立
sleep 5

echo ""
echo "✅ 外网访问地址："
echo "🌐 https://fishing-social-h5.loca.lt"
echo ""
echo "📱 手机访问：https://fishing-social-h5.loca.lt"
echo "💻 电脑访问：https://fishing-social-h5.loca.lt"
echo ""
echo "按 Ctrl+C 停止外网访问"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止外网访问...'; kill $LT_PID 2>/dev/null; exit 0" INT
wait 