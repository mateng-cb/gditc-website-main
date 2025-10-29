@echo off
chcp 65001 >nul

REM 部署带定时重新打包功能的系统
echo 🚀 开始部署带定时重新打包功能的系统...

REM 检查PM2是否安装
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 未安装，请先安装 PM2: npm install -g pm2
    pause
    exit /b 1
)

REM 停止现有进程
echo 🛑 停止现有进程...
pm2 stop all >nul 2>&1
pm2 delete all >nul 2>&1

REM 清理旧的构建文件
echo 🧹 清理旧的构建文件...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

REM 重新构建项目
echo 🔨 重新构建项目...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

REM 启动新的PM2配置
echo ▶️ 启动新的PM2配置...
pm2 start ecosystem.config.js

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查服务状态
echo 📊 检查服务状态...
pm2 status

REM 显示日志
echo 📄 显示最新日志...
pm2 logs --lines 10

echo ✅ 部署完成！
echo.
echo 📋 服务说明：
echo   - gditc-nextjs: 静态文件服务器
echo   - gditc-updater: 增强增量更新器（每10分钟检查一次）
echo   - gditc-daily-rebuilder: 每日定时重新打包器（每天凌晨2点执行）
echo.
echo 🔧 管理命令：
echo   - 查看状态: pm2 status
echo   - 查看日志: pm2 logs
echo   - 重启服务: pm2 restart all
echo   - 停止服务: pm2 stop all
echo   - 手动执行每日重建: npm run daily-rebuild
echo   - 测试每日重建: node test-daily-rebuild.js
echo.
echo 📁 日志文件位置：
echo   - 增量更新日志: logs/updater-*.log
echo   - 每日重建日志: logs/daily-rebuilder-*.log
echo   - 应用日志: logs/nextjs-*.log

pause

