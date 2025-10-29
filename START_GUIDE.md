# 🚀 GDITC项目启动指南

## 📋 可用命令

### 开发模式
```bash
npm run dev
```
- 启动开发服务器
- 支持热重载
- 访问: http://localhost:6001

### 生产模式
```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```
- 使用优化后的生产版本
- 访问: http://localhost:6001

### PM2模式 (推荐用于生产)
```bash
npm run pm2:start
```
- 启动Next.js项目 + 增量更新器
- 自动重启和故障恢复
- 每10分钟自动更新内容

## 🔧 PM2管理命令

```bash
# 查看服务状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop

# 手动触发更新
npm run update
```

## 🎯 推荐使用方式

### 开发阶段
```bash
npm run dev
```

### 生产部署
```bash
npm run pm2:start
```

## 📁 项目结构

```
gditc/code/
├── scripts/
│   ├── start-pm2.js           # PM2启动脚本
│   └── incremental-updater.js # 增量更新器
├── logs/                      # 日志文件目录
└── out/                       # 静态文件输出目录
```

## 🚨 故障排除

### 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :6001

# 杀死占用进程
taskkill /PID <进程ID> /F
```

### PM2进程异常
```bash
# 重启所有进程
npm run pm2:restart

# 停止所有进程
npm run pm2:stop
```

### 清理项目
```bash
npm run clean
```
