const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class EnhancedIncrementalUpdater {
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://wonderful-serenity-47deffe3a2.strapiapp.com/api';
    this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 600000; // 10分钟
    this.isUpdating = false;
    this.cacheFile = path.join(__dirname, '..', 'logs', 'incremental-cache.json');
    this.lastUpdateFile = path.join(__dirname, '..', 'logs', 'last-incremental-update.json');
    
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
    console.log(`[${timestamp}] ${message}`);
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

  // 深度比较对象，特别关注swiper内容
  deepCompareObjects(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepCompareObjects(obj1[i], obj2[i])) return false;
      }
      return true;
    }
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      
      for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.deepCompareObjects(obj1[key], obj2[key])) return false;
      }
      return true;
    }
    
    return obj1 === obj2;
  }

  // 生成数据指纹，用于快速比较
  generateDataFingerprint(data) {
    if (!data) return null;
    
    // 对于首页数据，特别关注bannerSwiper的变化
    if (data.bannerSwiper && Array.isArray(data.bannerSwiper)) {
      const swiperFingerprint = data.bannerSwiper.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        remark: item.remark,
        // 包含图片信息
        imageUrl: item.images?.url,
        imageHash: item.images?.hash,
        updatedAt: item.updatedAt
      }));
      
      return {
        id: data.id,
        updatedAt: data.updatedAt,
        bannerSwiper: swiperFingerprint
      };
    }
    
    // 对于其他数据，使用基本字段
    return {
      id: data.id,
      updatedAt: data.updatedAt,
      length: Array.isArray(data) ? data.length : undefined
    };
  }

  // 生成列表数据的指纹，检测每条记录的修改
  generateListFingerprint(listData) {
    if (!Array.isArray(listData)) return null;
    
    // 为每条记录生成指纹：id + updatedAt
    // 这样任何修改（文本、图片、排序等）都会被检测到
    return listData.map(item => ({
      id: item.id,
      updatedAt: item.updatedAt,
      // 可选：如果担心某些字段变化但 updatedAt 没变，可以加上这些关键字段
      // 但通常 Strapi 会在修改时更新 updatedAt
    })).sort((a, b) => {
      // 按 id 排序，确保顺序一致
      return (a.id || 0) - (b.id || 0);
    });
  }

  async checkForUpdates() {
    if (this.isUpdating) {
      this.log('正在更新中，跳过本次检查');
      return;
    }

    this.isUpdating = true;
    this.log('开始检查增量更新...');

    try {
      // 获取最新数据 - 监听正确的栏目，包括Training数据
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
        this.log('部分数据获取失败，跳过更新');
        return;
      }

      // 检查是否有变化
      const hasChanges = await this.detectChanges({
        home: home.data || {},
        about: about.data || {},
        events: events.data || [],
        certifications: certifications.data || [],
        standards: standards.data || [],
        joinus: joinus.data || {},
        trainingEn: trainingEn.data || [],
        trainingZh: trainingZh.data || [],
      });

      if (hasChanges) {
        this.log('检测到数据变化，开始重新构建项目');
        await this.rebuildProject();
        await this.updateCache({
          home: home.data || {},
          about: about.data || {},
          events: events.data || [],
          certifications: certifications.data || [],
          standards: standards.data || [],
          joinus: joinus.data || {},
          trainingEn: trainingEn.data || [],
          trainingZh: trainingZh.data || [],
          timestamp: Date.now(),
        });
      } else {
        this.log('无数据变化，跳过更新');
      }

    } catch (error) {
      this.log(`增量更新失败: ${error.message}`);
    } finally {
      this.isUpdating = false;
    }
  }

  async detectChanges(newData) {
    try {
      // 读取缓存数据
      let cachedData = null;
      if (fs.existsSync(this.cacheFile)) {
        const cacheContent = fs.readFileSync(this.cacheFile, 'utf8');
        cachedData = JSON.parse(cacheContent);
      }

      if (!cachedData) {
        this.log('无缓存数据，视为有变化');
        return true;
      }

      // 生成新数据的指纹
      const newFingerprints = {
        home: this.generateDataFingerprint(newData.home),
        about: this.generateDataFingerprint(newData.about),
        joinus: this.generateDataFingerprint(newData.joinus),
        // 使用列表指纹而不是只比较长度，这样可以检测到任何修改
        events: this.generateListFingerprint(newData.events),
        certifications: this.generateListFingerprint(newData.certifications),
        standards: this.generateListFingerprint(newData.standards),
        trainingEn: this.generateListFingerprint(newData.trainingEn),
        trainingZh: this.generateListFingerprint(newData.trainingZh),
      };

      // 生成缓存数据的指纹
      const cachedFingerprints = {
        home: this.generateDataFingerprint(cachedData.home),
        about: this.generateDataFingerprint(cachedData.about),
        joinus: this.generateDataFingerprint(cachedData.joinus),
        // 使用列表指纹而不是只比较长度
        events: this.generateListFingerprint(cachedData.events || []),
        certifications: this.generateListFingerprint(cachedData.certifications || []),
        standards: this.generateListFingerprint(cachedData.standards || []),
        trainingEn: this.generateListFingerprint(cachedData.trainingEn || []),
        trainingZh: this.generateListFingerprint(cachedData.trainingZh || []),
      };

      // 检查指纹变化（现在列表数据也会检测到任何修改）
      const hasChanges = 
        !this.deepCompareObjects(newFingerprints.home, cachedFingerprints.home) ||
        !this.deepCompareObjects(newFingerprints.about, cachedFingerprints.about) ||
        !this.deepCompareObjects(newFingerprints.joinus, cachedFingerprints.joinus) ||
        !this.deepCompareObjects(newFingerprints.events, cachedFingerprints.events) ||
        !this.deepCompareObjects(newFingerprints.certifications, cachedFingerprints.certifications) ||
        !this.deepCompareObjects(newFingerprints.standards, cachedFingerprints.standards) ||
        !this.deepCompareObjects(newFingerprints.trainingEn, cachedFingerprints.trainingEn) ||
        !this.deepCompareObjects(newFingerprints.trainingZh, cachedFingerprints.trainingZh);

      if (hasChanges) {
        this.log(`数据变化检测:`);
        this.log(`  Home: ${cachedFingerprints.home?.id || 'N/A'} -> ${newFingerprints.home?.id || 'N/A'}`);
        this.log(`  About: ${cachedFingerprints.about?.id || 'N/A'} -> ${newFingerprints.about?.id || 'N/A'}`);
        this.log(`  Join Us: ${cachedFingerprints.joinus?.id || 'N/A'} -> ${newFingerprints.joinus?.id || 'N/A'}`);
        
        // 检查列表数据变化（现在会显示详细的变化信息）
        const eventsChanged = !this.deepCompareObjects(newFingerprints.events, cachedFingerprints.events);
        const certificationsChanged = !this.deepCompareObjects(newFingerprints.certifications, cachedFingerprints.certifications);
        const standardsChanged = !this.deepCompareObjects(newFingerprints.standards, cachedFingerprints.standards);
        const trainingEnChanged = !this.deepCompareObjects(newFingerprints.trainingEn, cachedFingerprints.trainingEn);
        const trainingZhChanged = !this.deepCompareObjects(newFingerprints.trainingZh, cachedFingerprints.trainingZh);
        
        if (eventsChanged) {
          const oldCount = cachedFingerprints.events?.length || 0;
          const newCount = newFingerprints.events?.length || 0;
          this.log(`  📅 Events: ${oldCount} -> ${newCount} 条（检测到内容变化）`);
        }
        if (certificationsChanged) {
          const oldCount = cachedFingerprints.certifications?.length || 0;
          const newCount = newFingerprints.certifications?.length || 0;
          this.log(`  🏆 Certifications: ${oldCount} -> ${newCount} 条（检测到内容变化）`);
        }
        if (standardsChanged) {
          const oldCount = cachedFingerprints.standards?.length || 0;
          const newCount = newFingerprints.standards?.length || 0;
          this.log(`  📋 Standards: ${oldCount} -> ${newCount} 条（检测到内容变化）`);
        }
        if (trainingEnChanged) {
          const oldCount = cachedFingerprints.trainingEn?.length || 0;
          const newCount = newFingerprints.trainingEn?.length || 0;
          this.log(`  🎓 Training EN: ${oldCount} -> ${newCount} 条（检测到内容变化）`);
        }
        if (trainingZhChanged) {
          const oldCount = cachedFingerprints.trainingZh?.length || 0;
          const newCount = newFingerprints.trainingZh?.length || 0;
          this.log(`  🎓 Training ZH: ${oldCount} -> ${newCount} 条（检测到内容变化）`);
        }
        
        // 特别检查首页swiper变化
        if (newFingerprints.home?.bannerSwiper && cachedFingerprints.home?.bannerSwiper) {
          const swiperChanged = !this.deepCompareObjects(
            newFingerprints.home.bannerSwiper, 
            cachedFingerprints.home.bannerSwiper
          );
          if (swiperChanged) {
            this.log(`  🎯 首页轮播图内容发生变化！`);
            this.log(`    新轮播图数量: ${newFingerprints.home.bannerSwiper.length}`);
            this.log(`    旧轮播图数量: ${cachedFingerprints.home.bannerSwiper.length}`);
          }
        }
      }

      return hasChanges;
    } catch (error) {
      this.log(`变化检测失败: ${error.message}`);
      return true; // 出错时认为有变化
    }
  }

  async rebuildProject() {
    try {
      this.log('开始重新构建项目...');
      
      // 重新构建项目
      execSync('npm run build', { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      this.log('项目构建完成，重启静态服务器...');
      
      // 重启静态服务器
      execSync('pm2 restart gditc-nextjs', { 
        stdio: 'pipe'
      });
      
      this.log('静态服务器重启成功');
      
    } catch (error) {
      this.log(`项目重建失败: ${error.message}`);
      // 如果构建失败，尝试重启服务器
      try {
        execSync('pm2 restart gditc-nextjs', { stdio: 'pipe' });
        this.log('已重启静态服务器');
      } catch (restartError) {
        this.log(`服务器重启失败: ${restartError.message}`);
      }
    }
  }

  async updateCache(data) {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
      fs.writeFileSync(this.lastUpdateFile, JSON.stringify({
        timestamp: Date.now(),
        status: 'success',
      }, null, 2));
      
      this.log('缓存更新成功');
    } catch (error) {
      this.log(`缓存更新失败: ${error.message}`);
    }
  }

  async run() {
    this.log('增强增量更新器启动');
    
    // 立即执行一次检查
    await this.checkForUpdates();
    
    // 设置定期检查
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateInterval);

    this.log(`增强增量更新器已启动，检查间隔: ${this.updateInterval / 1000}秒`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const updater = new EnhancedIncrementalUpdater();
  updater.run().catch(error => {
    console.error('增强增量更新器启动失败:', error);
    process.exit(1);
  });
}

module.exports = EnhancedIncrementalUpdater;
