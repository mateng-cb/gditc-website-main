# 🚀 服务器部署指南

## 部署步骤

### 1. 上传项目到服务器
```bash
# 在本地打包项目
tar -czf gditc-project.tar.gz gditc/code/

# 上传到服务器
scp gditc-project.tar.gz user@192.168.3.106:/home/user/

# 在服务器上解压
ssh user@192.168.3.106
cd /home/user/
tar -xzf gditc-project.tar.gz
cd gditc/code/
```

### 2. 安装依赖
```bash
# 安装Node.js (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装项目依赖
npm install
```

### 3. 配置环境变量
```bash
# 创建.env.local文件
nano .env.local
```

添加以下内容：
```env
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-url.com
STRAPI_API_TOKEN=your-api-token
```

### 4. 启动项目
```bash
# 使用PM2启动
npm run pm2:start

# 或者直接启动
npm run build
npm run start
```

### 5. 配置防火墙 (Linux)
```bash
# 开放6001端口
sudo ufw allow 6001

# 检查防火墙状态
sudo ufw status
```

### 6. 配置Nginx反向代理 (可选)
```bash
# 安装Nginx
sudo apt update
sudo apt install nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/gditc
```

Nginx配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/gditc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 快速部署脚本

创建 `deploy.sh` 脚本：

```bash
#!/bin/bash

echo "🚀 开始部署GDITC项目..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2未安装，正在安装..."
    sudo npm install -g pm2
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 启动服务
echo "🚀 启动服务..."
npm run pm2:start

# 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 6001 2>/dev/null || true

# 显示状态
echo "📊 服务状态："
pm2 status

echo "✅ 部署完成！"
echo "🌐 访问地址: http://192.168.3.106:6001"
```

## 管理命令

```bash
# 查看服务状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop

# 手动更新数据
npm run update
```

## 故障排除

### 1. 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :6001

# 杀死占用进程
sudo kill -9 <PID>
```

### 2. 权限问题
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 修复文件权限
sudo chown -R $USER:$USER .
```

### 3. 内存不足
```bash
# 查看内存使用
free -h

# 清理缓存
sudo apt clean
sudo apt autoremove
```

### 4. 服务无法启动
```bash
# 查看详细日志
pm2 logs gditc-nextjs

# 检查环境变量
cat .env.local
```

## 自动启动配置

```bash
# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup

# 按照提示执行命令
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## 监控和维护

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看网络连接
netstat -tlnp

# 查看PM2进程
pm2 monit
```

## 备份和恢复

```bash
# 备份项目
tar -czf gditc-backup-$(date +%Y%m%d).tar.gz gditc/

# 备份PM2配置
pm2 save
cp ~/.pm2/dump.pm2 ~/gditc-pm2-backup.pm2
```

## 更新项目

```bash
# 停止服务
pm2 stop all

# 更新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 启动服务
pm2 start all
```

## 性能优化

```bash
# 启用PM2集群模式
pm2 start "npm run start" --name "gditc-nextjs" -i max -- --port 6001 --hostname 0.0.0.0

# 设置内存限制
pm2 start "npm run start" --name "gditc-nextjs" --max-memory-restart 500M -- --port 6001 --hostname 0.0.0.0
```

## 安全建议

1. 使用HTTPS证书
2. 配置防火墙规则
3. 定期更新依赖
4. 监控日志文件
5. 设置访问限制
6. 备份重要数据

## 联系支持

如果遇到问题，请提供：
1. 服务器系统信息：`uname -a`
2. Node.js版本：`node --version`
3. PM2状态：`pm2 status`
4. 错误日志：`pm2 logs`
5. 系统资源：`free -h && df -h`
