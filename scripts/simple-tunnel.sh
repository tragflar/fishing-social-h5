#!/bin/bash

# 渔友圈 - 简单外网访问脚本
echo "🌐 渔友圈外网访问"
echo "=================="

# 检查本地服务器
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ 本地服务器未运行，请先启动：pnpm dev"
    exit 1
fi

echo "✅ 本地服务器运行正常"
echo ""

# 显示局域网访问地址
echo "📡 局域网访问地址："
echo "🌐 http://10.191.41.50:3000"
echo ""

# 启动 localtunnel
echo "🚀 启动外网隧道..."
echo "正在生成外网访问地址..."

# 使用随机域名启动 localtunnel
lt --port 3000 &
LT_PID=$!

# 等待隧道建立
sleep 3

echo ""
echo "✅ 外网访问地址已生成"
echo "📱 手机/电脑访问：查看上方输出的地址"
echo ""
echo "💡 提示："
echo "1. 如果访问需要密码，请尝试刷新页面"
echo "2. 如果无法访问，请等待几秒钟后重试"
echo "3. 按 Ctrl+C 停止外网访问"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止外网访问...'; kill $LT_PID 2>/dev/null; exit 0" INT
wait 