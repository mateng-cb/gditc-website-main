const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 6001;

// 静态文件目录
const staticDir = path.join(__dirname, 'out');

// 检查out目录是否存在
if (!fs.existsSync(staticDir)) {
  console.error('❌ out目录不存在！请先运行 npm run build');
  process.exit(1);
}

// 检查index.html是否存在
const indexFile = path.join(staticDir, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.error('❌ index.html文件不存在！请检查构建结果');
  process.exit(1);
}

console.log('✅ 静态文件目录检查通过');
console.log(`📁 服务目录: ${staticDir}`);

// 设置静态文件服务
app.use(express.static(staticDir));

// 处理SPA路由 - 所有路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
  console.log(`🚀 静态文件服务器启动成功！`);
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`🌐 网络访问: http://192.168.3.106:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用！`);
  } else {
    console.error('❌ 服务器错误:', err);
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});
