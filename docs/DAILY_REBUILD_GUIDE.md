# 每日定时重新打包系统使用指南

## 概述

本系统为您的GDITE项目添加了每天定时重新打包的功能，解决了首页swiper更新检测问题，并提供了更可靠的数据更新机制。

## 系统架构

### 1. 增强增量更新器 (`enhanced-incremental-updater.js`)
- **功能**: 每10分钟检查数据变化，特别优化了首页swiper和Training数据的检测
- **特点**: 
  - 深度比较数据内容，不仅仅是长度变化
  - 特别关注轮播图的标题、描述、图片等变化
  - 监测Training数据（英文和中文版本）
  - 生成数据指纹，提高检测准确性

### 2. 每日定时重新打包器 (`daily-rebuilder.js`)
- **功能**: 每天凌晨2点自动执行全量重新构建
- **特点**:
  - 验证API连接状态
  - 清理旧的构建文件
  - 执行完整的项目重建
  - 自动重启静态服务器
  - 记录详细的执行日志

### 3. PM2进程管理
- **gditc-nextjs**: 静态文件服务器
- **gditc-updater**: 增强增量更新器
- **gditc-daily-rebuilder**: 每日定时重新打包器

## 安装和部署

### 方法1: 使用部署脚本（推荐）

#### Windows系统:
```bash
# 运行Windows部署脚本
deploy-with-scheduler.bat
```

#### Linux/Mac系统:
```bash
# 给脚本执行权限
chmod +x deploy-with-scheduler.sh

# 运行部署脚本
./deploy-with-scheduler.sh
```

### 方法2: 手动部署

```bash
# 1. 停止现有服务
pm2 stop all
pm2 delete all

# 2. 重新构建项目
npm run build

# 3. 启动新的PM2配置
pm2 start ecosystem.config.js

# 4. 检查服务状态
pm2 status
```

## 管理命令

### 基本管理
```bash
# 查看所有服务状态
pm2 status

# 查看实时日志
pm2 logs

# 重启所有服务
pm2 restart all

# 停止所有服务
pm2 stop all
```

### 手动操作
```bash
# 手动执行每日重建
npm run daily-rebuild

# 手动执行增量更新
npm run update

# 测试每日重建功能
node test-daily-rebuild.js
```

### 日志查看
```bash
# 查看特定服务日志
pm2 logs gditc-updater
pm2 logs gditc-daily-rebuilder
pm2 logs gditc-nextjs

# 查看日志文件
tail -f logs/daily-rebuild.log
tail -f logs/updater-out.log
```

## 配置说明

### 环境变量
在 `.env.local` 文件中配置：
```env
# Strapi API配置
NEXT_PUBLIC_STRAPI_API_URL=https://your-strapi-url.com/api
STRAPI_API_TOKEN=your_api_token

# 更新间隔（毫秒，默认10分钟）
UPDATE_INTERVAL=600000
```

### 定时任务配置
在 `ecosystem.config.js` 中：
```javascript
{
  name: 'gditc-daily-rebuilder',
  cron_restart: '0 2 * * *', // 每天凌晨2点执行
  // 其他配置...
}
```

## 故障排除

### 常见问题

1. **首页swiper不更新**
   - 检查增量更新器是否正常运行
   - 查看 `logs/updater-out.log` 确认是否检测到变化
   - 手动执行 `npm run update` 测试

2. **Training数据不更新**
   - 检查Training API端点是否可访问
   - 查看增量更新日志中的Training数据统计
   - 运行 `node test-training-monitoring.js` 测试Training监测功能

3. **每日重建不执行**
   - 检查PM2进程状态: `pm2 status`
   - 查看每日重建日志: `pm2 logs gditc-daily-rebuilder`
   - 手动测试: `node test-daily-rebuild.js`

4. **构建失败**
   - 检查Node.js版本兼容性
   - 查看构建日志: `pm2 logs gditc-daily-rebuilder`
   - 手动执行构建: `npm run build`

5. **API连接问题**
   - 验证环境变量配置
   - 检查网络连接
   - 确认Strapi服务状态

### 日志文件位置
```
logs/
├── daily-rebuild.log              # 每日重建详细日志
├── last-daily-rebuild.json        # 最后重建时间记录
├── incremental-cache.json         # 增量更新缓存
├── last-incremental-update.json   # 最后增量更新时间
├── updater-out.log               # 增量更新器输出日志
├── updater-error.log             # 增量更新器错误日志
├── nextjs-out.log                # 应用输出日志
└── nextjs-error.log              # 应用错误日志
```

## 监控和维护

### 定期检查
1. **每日检查**: 查看每日重建是否成功执行
2. **每周检查**: 检查日志文件大小，必要时清理
3. **每月检查**: 验证API连接和权限

### 性能优化
- 监控内存使用: `pm2 monit`
- 调整更新间隔: 修改 `UPDATE_INTERVAL` 环境变量
- 优化构建时间: 考虑使用构建缓存

## 安全注意事项

1. **API Token安全**: 确保 `STRAPI_API_TOKEN` 不被泄露
2. **日志文件**: 定期清理敏感信息
3. **权限管理**: 限制PM2进程的权限范围

## 技术支持

如遇到问题，请：
1. 查看相关日志文件
2. 运行测试脚本诊断
3. 检查系统资源使用情况
4. 联系技术支持团队

---

**版本**: 1.0.0  
**更新日期**: 2025-10-14  
**维护者**: GDITE开发团队
