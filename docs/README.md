# 项目文档索引

运维与功能说明均在本目录；根目录仅保留 [README.md](../README.md)。

| 文档 | 说明 |
|------|------|
| [STRAPI_WEBHOOK_CLOUDFLARE_REBUILD.md](./STRAPI_WEBHOOK_CLOUDFLARE_REBUILD.md) | **当前生产**：Strapi Webhook → 桥接 Worker → Git 提交 → Cloudflare 自动重建 |
| [START_GUIDE.md](./START_GUIDE.md) | 本地开发启动（dev / build / start） |
| [SERVER_DEPLOYMENT_GUIDE.md](./SERVER_DEPLOYMENT_GUIDE.md) | 自建服务器 + PM2 部署（历史/测试环境） |
| [WEBHOOK_REBUILD_GUIDE.md](./WEBHOOK_REBUILD_GUIDE.md) | 自建机 `/api/rebuild-trigger` Webhook（已过时，仅供参考） |
| [DAILY_REBUILD_GUIDE.md](./DAILY_REBUILD_GUIDE.md) | PM2 定时增量/每日重建脚本 |
| [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) | 项目清理记录 |

根目录 [README.md](../README.md) 保留项目总览与快速上手。
