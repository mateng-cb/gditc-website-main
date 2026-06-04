# Strapi 内容更新 → 官网自动重建（当前生产方案）

> 归档日期：2026-06-04  
> 适用环境：Strapi（`top.gditc.org`）+ GitHub（`mateng-cb/gditc-website-main`）+ Cloudflare Worker **`gditc`**（`gditc.org`）

---

## 1. 方案概述

官网为 Next.js **静态导出**（`npm run build` → `out/`），页面内容在**构建时**从 Strapi 写入 HTML，运行时不会自动拉 CMS。

**当前生产链路：**

```text
编辑在 Strapi 发布/更新内容
    ↓ POST（Webhook）
桥接 Worker：gditc-strapi-github-trigger
    ↓ GitHub API 更新 .strapi-sync/last-publish.txt 并提交
GitHub 仓库 main 分支有新 commit
    ↓（已连接的 Git 集成）
Cloudflare Worker「gditc」自动 npm run build 并部署
    ↓ 约 3～10 分钟
用户访问 gditc.org 看到新内容
```

**与「仅 push 代码」的关系：**

| 触发方式 | 行为 |
|----------|------|
| 开发者 `git push` | Cloudflare 自动构建（原有能力，不变） |
| Strapi 发内容 | 经桥接 Worker 产生一次 **仅改标记文件** 的 commit，同样触发 Cloudflare 构建 |

**不需要：**

- GitHub Actions 里的 Cloudflare API Token  
- Cloudflare Pages Deploy Hook  
- 自建服务器 `pm2` + `/api/rebuild-trigger`（见 [WEBHOOK_REBUILD_GUIDE.md](./WEBHOOK_REBUILD_GUIDE.md)，已过时）

---

## 2. 架构与组件

| 组件 | 名称/位置 | 作用 |
|------|-----------|------|
| CMS | Strapi @ `https://top.gditc.org` | 内容源；Webhook 发 POST |
| 桥接 Worker | `workers/strapi-github-trigger/` → 部署名 `gditc-strapi-github-trigger` | 校验密钥，调 GitHub API 提交 |
| 标记文件 | `.strapi-sync/last-publish.txt` | 仅时间戳，用于触发 Git 变更 |
| 前端仓库 | `github.com/mateng-cb/gditc-website-main` | 源码与构建配置 |
| 官网 Worker | Cloudflare **`gditc`** | 托管 `out/`，绑定 `gditc.org` |
| 官网构建配置 | Cloudflare 项目 **gditc** 的 Git 集成 | `npm run build`，输出 `out/`；构建环境变量在 **CF 控制台** 配置 |

根目录 `wrangler.jsonc` 的 `name` 为 **`gditc`**（与 Cloudflare 面板一致），仅用于官网静态资源部署，与桥接 Worker 无关。

---

## 3. 代码位置

```
gditc-website/
├── workers/strapi-github-trigger/
│   ├── index.js          # 接收 POST → GitHub Contents API 提交
│   └── wrangler.jsonc    # GITHUB_OWNER / GITHUB_REPO
├── .strapi-sync/
│   └── last-publish.txt  # 由 Worker 每次更新为 ISO 时间戳
└── wrangler.jsonc          # 官网 Worker「gditc」
```

---

## 4. 部署与配置（一次性）

### 4.1 Cloudflare：官网 `gditc`

- 已连接 GitHub `mateng-cb/gditc-website-main`  
- Build：`npm run build`，输出目录 `out`  
- 环境变量（示例）：`NEXT_PUBLIC_STRAPI_API_URL`、`STRAPI_API_TOKEN`、`NEXT_PUBLIC_SITE_URL` 等  

### 4.2 Cloudflare：桥接 Worker

```powershell
cd workers/strapi-github-trigger
wrangler login
wrangler deploy
wrangler secret put STRAPI_WEBHOOK_SECRET   # 自拟，Strapi Header 用同一串
wrangler secret put GITHUB_PAT              # GitHub Classic PAT，勾选 repo
```

`wrangler.jsonc` 中默认：

- `GITHUB_OWNER`: `mateng-cb`  
- `GITHUB_REPO`: `gditc-website-main`  

### 4.3 GitHub PAT

- 类型：**Classic**  
- 权限：**repo**（私有仓库）  
- 过期：按需（过期后需重新 `wrangler secret put GITHUB_PAT`）  
- **不要**写入 Strapi；仅存在于 Worker secret  

### 4.4 Strapi Webhook

| 字段 | 值 |
|------|-----|
| URL | `https://gditc-strapi-github-trigger.<子域>.workers.dev` |
| Header | `Authorization`: `Bearer <STRAPI_WEBHOOK_SECRET>` |
| Events（Entry） | 建议 **`entry.publish`**、**`entry.unpublish`**；若同时勾选 `entry.update`，一次发布可能触发 **两次** commit（已知现象，可接受则不优化） |

**Strapi 5.11 后台 Bug：** 保存/编辑 Webhook 页面可能报错 `ProtectedEditPage ... undefined`。列表中已存在且 Enabled 即表示创建成功。可改用 Admin API：

```powershell
# 创建示例（替换 ADMIN_JWT、URL、SECRET）
curl -X POST "https://top.gditc.org/admin/webhooks" `
  -H "Authorization: Bearer ADMIN_JWT" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"触发官网重建\",\"url\":\"https://gditc-strapi-github-trigger.xxx.workers.dev\",\"headers\":{\"Authorization\":\"Bearer YOUR_SECRET\"},\"events\":[\"entry.publish\",\"entry.unpublish\"],\"isEnabled\":true}"
```

Webhook 界面只有 **Entry / Media** 行，无按栏目（Event、Training 等）分列；勾 **Entry** 即覆盖所有 Collection Type。

**根治后台报错：** 将 `@strapi/strapi` 升级至 **≥ 5.13.0** 后重新部署 CMS。

---

## 5. 日常运维

| 操作 | 做法 |
|------|------|
| 发布 CMS 内容 | Strapi 正常 Publish，等待约 3～10 分钟 |
| 改前端代码 | `git push` → Cloudflare 自动构建 |
| 手动触发重建 | 对本机 Worker URL 发 POST（见下）或 Strapi 再发布一条 |
| 轮换 GitHub PAT | `wrangler secret put GITHUB_PAT` |
| 轮换桥接密钥 | `wrangler secret put STRAPI_WEBHOOK_SECRET` 并同步改 Strapi Header |

**自测 Worker：**

```powershell
curl -X POST "https://gditc-strapi-github-trigger.xxx.workers.dev" `
  -H "Authorization: Bearer YOUR_SECRET" `
  -H "Content-Type: application/json" `
  -d "{}"
```

期望：`{"ok":true,...}`，且 GitHub 出现 commit `chore: rebuild after Strapi publish [strapi-sync]`。

---

## 6. 验收清单

- [ ] Strapi Webhook 列表中启用，URL 指向桥接 Worker  
- [ ] `wrangler secret` 已设置 `STRAPI_WEBHOOK_SECRET`、`GITHUB_PAT`  
- [ ] 发布后 GitHub 有新 commit（修改 `.strapi-sync/last-publish.txt`）  
- [ ] Cloudflare **gditc** 有新部署且 Success  
- [ ] 无痕访问 `gditc.org` 内容已更新  

---

## 7. 故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| Strapi Webhook 401 | Bearer 与 `STRAPI_WEBHOOK_SECRET` 不一致 | 对齐后重试 |
| Worker 500 | 未配置 `GITHUB_PAT` 或 owner/repo 错误 | `wrangler secret put` / 检查 jsonc |
| GitHub 403 | PAT 无 repo 权限 | 重新生成 Classic PAT |
| 有 commit 但 CF 不构建 | gditc 未连该仓库/分支 | 检查 CF 项目 Git 设置 |
| 站点仍旧内容 | 构建失败或未完成 | 查看 CF 构建日志、Strapi Token |
| 一次操作两条 commit | `update` + `publish` 各触发一次 | 仅保留 `entry.publish` 或接受现状 |
| 后台无法编辑 Webhook | Strapi 5.11 前端 Bug | 用 API 修改；或升级 Strapi |

---

## 8. 延迟说明

| 阶段 | 大致时间 |
|------|----------|
| Strapi Publish → API 可读 | 几乎即时 |
| Webhook → Git commit | 数秒 |
| Cloudflare 构建 + 部署 | 通常 **3～10 分钟** |

非秒级实时；若需秒级需改为运行时请求 Strapi（架构变更）。

---

## 9. 历史方案（勿与当前混淆）

| 文档 | 说明 |
|------|------|
| [WEBHOOK_REBUILD_GUIDE.md](./WEBHOOK_REBUILD_GUIDE.md) | 测试机 Express `/api/rebuild-trigger` + PM2 |
| [SERVER_DEPLOYMENT_GUIDE.md](./SERVER_DEPLOYMENT_GUIDE.md) | 内网服务器 PM2 部署 |
| [DAILY_REBUILD_GUIDE.md](./DAILY_REBUILD_GUIDE.md) | 定时/增量脚本 + PM2 |

---

## 10. 相关链接

- 文档索引：[README.md](./README.md)  
- 项目总览：[../README.md](../README.md)  
- Strapi Webhook 官方 issue（5.11 ProtectedEditPage）：[strapi#23598](https://github.com/strapi/strapi/issues/23598)
