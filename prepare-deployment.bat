@echo off
echo 🚀 准备GDITC项目部署包...

REM 创建部署目录
if not exist "deployment" mkdir deployment

REM 复制项目文件
echo 📦 复制项目文件...
xcopy /E /I /Y "gditc\code" "deployment\gditc-code"

REM 复制部署脚本
echo 📝 复制部署脚本...
copy "deployment\gditc-code\deploy.sh" "deployment\"
copy "deployment\gditc-code\SERVER_DEPLOYMENT_GUIDE.md" "deployment\"

REM 创建压缩包
echo 📦 创建压缩包...
cd deployment
tar -czf gditc-deployment.tar.gz gditc-code deploy.sh SERVER_DEPLOYMENT_GUIDE.md
cd ..

echo ✅ 部署包准备完成！
echo 📁 部署文件位置: deployment\gditc-deployment.tar.gz
echo 📋 部署步骤:
echo    1. 上传 gditc-deployment.tar.gz 到服务器
echo    2. 在服务器上解压: tar -xzf gditc-deployment.tar.gz
echo    3. 进入目录: cd gditc-code
echo    4. 给脚本执行权限: chmod +x deploy.sh
echo    5. 运行部署脚本: ./deploy.sh
echo    6. 访问: http://192.168.3.106:6001

pause
