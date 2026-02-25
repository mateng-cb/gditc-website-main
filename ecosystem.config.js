module.exports = {
  apps: [
    {
      name: 'gditc-nextjs',
      script: 'start-static-server.js',
      cwd: process.cwd(),
      env: {
        PORT: 6001,
        NODE_ENV: 'production'
      },
      // 会员申请表单需从 .env 加载: NEXT_PUBLIC_STRAPI_API_URL, STRAPI_API_TOKEN
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/nextjs-error.log',
      out_file: './logs/nextjs-out.log',
      log_file: './logs/nextjs-combined.log',
      time: true
    },
    {
      name: 'gditc-updater',
      script: 'scripts/enhanced-incremental-updater.js',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/updater-error.log',
      out_file: './logs/updater-out.log',
      log_file: './logs/updater-combined.log',
      time: true
    },
    {
      name: 'gditc-daily-rebuilder',
      script: 'scripts/daily-rebuilder.js',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: false,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/daily-rebuilder-error.log',
      out_file: './logs/daily-rebuilder-out.log',
      log_file: './logs/daily-rebuilder-combined.log',
      time: true,
      cron_restart: '0 2 * * *', // 每天凌晨2点执行
      exec_mode: 'fork'
    }
  ]
};
