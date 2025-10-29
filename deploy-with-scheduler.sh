#!/bin/bash

# 部署带定时重新打包功能的系统
echo "🚀 开始部署带定时重新打包功能的系统..."

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装，请先安装 PM2: npm install -g pm2"
    exit 1
fi

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf .next out 2>/dev/null || true

# 重新构建项目
echo "🔨 重新构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# 启动新的PM2配置
echo "▶️ 启动新的PM2配置..."
pm2 start ecosystem.config.js

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "📊 检查服务状态..."
pm2 status

# 显示日志
echo "📄 显示最新日志..."
pm2 logs --lines 10

echo "✅ 部署完成！"
echo ""
echo "📋 服务说明："
echo "  - gditc-nextjs: 静态文件服务器"
echo "  - gditc-updater: 增强增量更新器（每10分钟检查一次）"
echo "  - gditc-daily-rebuilder: 每日定时重新打包器（每天凌晨2点执行）"
echo ""
echo "🔧 管理命令："
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs"
echo "  - 重启服务: pm2 restart all"
echo "  - 停止服务: pm2 stop all"
echo "  - 手动执行每日重建: npm run daily-rebuild"
echo "  - 测试每日重建: node test-daily-rebuild.js"
echo ""
echo "📁 日志文件位置："
echo "  - 增量更新日志: logs/updater-*.log"
echo "  - 每日重建日志: logs/daily-rebuilder-*.log"
echo "  - 应用日志: logs/nextjs-*.log"

