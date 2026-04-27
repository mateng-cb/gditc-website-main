const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class DailyRebuilder {
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api';
    this.logFile = path.join(__dirname, '..', 'logs', 'daily-rebuild.log');
    this.lastRebuildFile = path.join(__dirname, '..', 'logs', 'last-daily-rebuild.json');
    
    // 确保日志目录存在
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // 写入日志文件
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async fetchData(endpoint) {
    try {
      const response = await axios.get(`${this.apiUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.STRAPI_API_TOKEN && {
            'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
          }),
        },
        timeout: 30000, // 30秒超时
      });
      
      return response.data;
    } catch (error) {
      this.log(`获取数据失败 ${endpoint}: ${error.message}`);
      return null;
    }
  }

  async performDailyRebuild() {
    this.log('开始执行每日定时重新打包...');
    
    try {
      // 1. 获取最新数据以验证API连接
      this.log('验证API连接...');
      const [home, about, events, certifications, standards, joinus, trainingEn, trainingZh] = await Promise.all([
        this.fetchData('/home?populate=*'),
        this.fetchData('/about?populate=*'),
        this.fetchData('/events?populate=*&sort=createdAt:desc&pagination[limit]=12'),
        this.fetchData('/certifications?populate=*&sort=createdAt:desc&pagination[limit]=12'),
        this.fetchData('/standards?populate=*&sort=createdAt:desc&pagination[limit]=12'),
        this.fetchData('/joinus?populate=*'),
        this.fetchData('/trainings?populate=*&sort=createdAt:desc&locale=en'),
        this.fetchData('/trainings?populate=*&sort=createdAt:desc&locale=zh-Hans'),
      ]);

      if (!home || !about || !events || !certifications || !standards || !joinus || !trainingEn || !trainingZh) {
        this.log('API数据获取失败，但继续执行重新打包');
      } else {
        this.log('API连接验证成功，数据获取正常');
        this.log(`数据统计: Home(${home.data?.id || 'N/A'}), About(${about.data?.id || 'N/A'}), Events(${events.data?.length || 0}), Certifications(${certifications.data?.length || 0}), Standards(${standards.data?.length || 0}), Training EN(${trainingEn.data?.length || 0}), Training ZH(${trainingZh.data?.length || 0}), JoinUs(${joinus.data?.id || 'N/A'})`);
      }

      // 2. 清理旧的构建文件
      this.log('清理旧的构建文件...');
      try {
        const isWindows = process.platform === 'win32';
        const removeCommand = isWindows ? 'rmdir /s /q' : 'rm -rf';
        
        if (fs.existsSync(path.join(__dirname, '..', '.next'))) {
          if (isWindows) {
            execSync('rmdir /s /q .next', { 
              stdio: 'pipe',
              cwd: path.join(__dirname, '..')
            });
          } else {
            execSync('rm -rf .next', { 
              stdio: 'pipe',
              cwd: path.join(__dirname, '..')
            });
          }
          this.log('已清理 .next 目录');
        }
        
        if (fs.existsSync(path.join(__dirname, '..', 'out'))) {
          if (isWindows) {
            execSync('rmdir /s /q out', { 
              stdio: 'pipe',
              cwd: path.join(__dirname, '..')
            });
          } else {
            execSync('rm -rf out', { 
              stdio: 'pipe',
              cwd: path.join(__dirname, '..')
            });
          }
          this.log('已清理 out 目录');
        }
      } catch (cleanError) {
        this.log(`清理构建文件时出现警告: ${cleanError.message}`);
      }

      // 3. 重新构建项目
      this.log('开始重新构建项目...');
      const buildStartTime = Date.now();
      
      execSync('npm run build', { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      const buildEndTime = Date.now();
      const buildDuration = Math.round((buildEndTime - buildStartTime) / 1000);
      this.log(`项目构建完成，耗时: ${buildDuration}秒`);
      
      // 4. 重启静态服务器
      this.log('重启静态服务器...');
      execSync('pm2 restart gditc-nextjs', { 
        stdio: 'pipe'
      });
      
      this.log('静态服务器重启成功');
      
      // 5. 更新最后重建时间记录
      await this.updateLastRebuildTime();
      
      this.log('每日定时重新打包完成');
      
      return {
        success: true,
        buildDuration,
        timestamp: Date.now()
      };
      
    } catch (error) {
      this.log(`每日重新打包失败: ${error.message}`);
      
      // 如果构建失败，尝试重启服务器
      try {
        this.log('尝试重启服务器...');
        execSync('pm2 restart gditc-nextjs', { stdio: 'pipe' });
        this.log('服务器重启成功');
      } catch (restartError) {
        this.log(`服务器重启失败: ${restartError.message}`);
      }
      
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async updateLastRebuildTime() {
    try {
      const rebuildInfo = {
        timestamp: Date.now(),
        status: 'success',
        type: 'daily_rebuild'
      };
      
      fs.writeFileSync(this.lastRebuildFile, JSON.stringify(rebuildInfo, null, 2));
      this.log('已更新最后重建时间记录');
    } catch (error) {
      this.log(`更新重建时间记录失败: ${error.message}`);
    }
  }

  // 检查是否需要执行每日重建
  shouldPerformDailyRebuild() {
    try {
      if (!fs.existsSync(this.lastRebuildFile)) {
        this.log('无最后重建记录，执行每日重建');
        return true;
      }

      const lastRebuildData = JSON.parse(fs.readFileSync(this.lastRebuildFile, 'utf8'));
      const lastRebuildTime = lastRebuildData.timestamp;
      const now = Date.now();
      const timeDiff = now - lastRebuildTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // 如果距离上次重建超过20小时，则执行重建
      if (hoursDiff >= 20) {
        this.log(`距离上次重建已过去 ${hoursDiff.toFixed(1)} 小时，执行每日重建`);
        return true;
      } else {
        this.log(`距离上次重建仅过去 ${hoursDiff.toFixed(1)} 小时，跳过本次重建`);
        return false;
      }
    } catch (error) {
      this.log(`检查重建时间失败: ${error.message}，执行重建`);
      return true;
    }
  }

  async run() {
    this.log('每日重建器启动');
    
    if (this.shouldPerformDailyRebuild()) {
      await this.performDailyRebuild();
    }
    
    this.log('每日重建器检查完成');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const rebuilder = new DailyRebuilder();
  rebuilder.run().catch(error => {
    console.error('每日重建器启动失败:', error);
    process.exit(1);
  });
}

module.exports = DailyRebuilder;
