# Strapi Webhook 实时更新前端 - 方案一详细说明

本文档面向不熟悉后端的开发者，详细讲解方案一的实现原理、相关概念和配置步骤。

---

## 一、核心概念解释

### 1. Webhook 是什么？

**通俗理解**：Webhook 可以理解为「反向电话」—— 不是你去问别人「有更新吗？」，而是别人有更新时主动打电话通知你。

| 对比 | 轮询（Polling） | Webhook |
|------|-----------------|---------|
| **方式** | 前端每隔一段时间主动去问 Strapi「有更新吗？」 | Strapi 有更新时主动通知前端 |
| **比喻** | 你每隔 10 分钟去问一次「饭好了吗？」 | 饭好了厨师叫你一声 |
| **实时性** | 最坏情况要等一个轮询周期（如 10 分钟） | 内容一发布就触发，几乎实时 |
| **资源消耗** | 频繁请求，浪费资源 | 按需触发，更省资源 |

**技术定义**：Webhook 是一种 HTTP 回调机制。当 Strapi 中发生某些事件（如发布文章、修改活动）时，Strapi 会向你配置的 URL 发送一个 HTTP POST 请求，通知你「有内容变了」。

---

### 2. Rebuild（重建）是什么？

**通俗理解**：你的网站是「提前做好的静态页面」，就像印刷好的报纸。内容更新后，需要重新「印刷」一遍，才能让读者看到新内容。

| 阶段 | 说明 |
|------|------|
| **Build（构建）** | 运行 `npm run build`，Next.js 从 Strapi 拉取最新数据，生成 HTML 文件到 `out/` 目录 |
| **Rebuild（重建）** | 再次执行构建，用最新数据重新生成所有页面 |
| **结果** | `out/` 目录里的 HTML 被更新，用户访问时看到新内容 |

**为什么需要 Rebuild？**  
因为项目使用了 `output: 'export'`（静态导出），页面在构建时就已经生成好了。Strapi 里改了内容，`out/` 里的旧 HTML 不会自动变，必须重新构建才能更新。

---

### 3. 其他相关名词

| 名词 | 含义 |
|------|------|
| **API** | 应用程序接口，可以理解为「服务端提供的功能入口」。例如 `/api/rebuild-trigger` 就是一个 API，调用它会触发重建 |
| **POST 请求** | HTTP 的一种请求方式。GET 通常用于「获取数据」，POST 用于「提交数据」或「触发操作」 |
| **Token（令牌）** | 一串密钥，用于验证请求是否合法，防止陌生人随意触发你的重建接口 |
| **202 状态码** | 表示「请求已接受，正在处理」。我们立即返回 202，让 Strapi 不用等待，重建在后台慢慢执行 |

---

## 二、方案一实现原理

### 整体流程图

```
┌─────────────────┐     ① 编辑并发布内容      ┌─────────────────┐
│  内容编辑人员    │ ──────────────────────→ │  Strapi 后台     │
└─────────────────┘                          └────────┬────────┘
                                                      │
                                                      │ ② 触发 Webhook
                                                      │   （发送 POST 请求）
                                                      ↓
┌─────────────────┐     ③ 收到请求，验证 Token  ┌─────────────────┐
│  前端服务器     │ ←───────────────────────── │  Webhook URL    │
│  (Express)     │                              │  /api/rebuild-  │
└────────┬────────┘                              │  trigger        │
         │                                       └─────────────────┘
         │ ④ 立即返回 202（不阻塞）
         │
         │ ⑤ 后台异步执行：
         │    - npm run build（重新构建）
         │    - pm2 restart（重启服务）
         ↓
┌─────────────────┐
│  out/ 目录更新   │  → 用户访问网站看到新内容
└─────────────────┘
```

### 关键设计

1. **立即返回 202**：Strapi 的 Webhook 有超时限制，如果等构建完成（可能 1–3 分钟）再返回，Strapi 会认为请求失败。所以我们先返回「已收到」，再在后台慢慢构建。
2. **Token 验证**：只有携带正确 Token 的请求才会触发重建，避免恶意调用。
3. **异步执行**：使用 Node.js 的 `exec` 在后台执行构建，不阻塞主进程。

---

## 三、配置步骤

### 步骤 1：生成并配置 Token

1. 生成一个随机字符串作为 Token，例如：
   ```
   my-secret-rebuild-token-2025
   ```
   或使用命令生成：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. 在 `gditc-website` 的 `.env` 或 `.env.local` 中添加：
   ```env
   REBUILD_TRIGGER_TOKEN=my-secret-rebuild-token-2025
   ```
   也可使用已有的 `INCREMENTAL_UPDATE_TOKEN`，代码会优先检查这两个变量。

3. 重启前端服务器使配置生效：
   ```bash
   pm2 restart gditc-nextjs
   ```

---

### 步骤 2：在 Strapi 中配置 Webhook

1. 登录 Strapi 管理后台（如 `http://localhost:1337/admin` 或你的生产地址）

2. 进入 **Settings（设置）** → **Webhooks**

3. 点击 **Create new webhook**

4. 填写配置：

   | 字段 | 填写内容 |
   |------|----------|
   | **Name** | `前端重建触发`（可自定义） |
   | **URL** | `https://你的前端域名/api/rebuild-trigger`<br>例如：`https://gditc.org/api/rebuild-trigger`<br>本地测试：`http://localhost:6001/api/rebuild-trigger` |
   | **Headers** | 点击 Add header，添加：<br>Key: `Authorization`<br>Value: `Bearer my-secret-rebuild-token-2025`<br>（与 .env 中的 Token 一致） |
   | **Events** | 勾选需要触发重建的事件：<br>☑ `entry.create` - 新建内容时<br>☑ `entry.update` - 修改内容时<br>☑ `entry.delete` - 删除内容时<br>☑ `entry.publish` - 发布内容时（如有草稿功能）<br>☑ `entry.unpublish` - 取消发布时 |

5. 点击 **Save** 保存

---

### 步骤 2 备选：URL 校验失败时的解决方案

如果 Strapi 提示「Url is not supported because it isn't reachable over the public internet」，说明你填的 URL（如 localhost、内网 IP）无法从公网访问。可选方案：

#### 方案 A：使用开发模式（本地 Strapi）

Strapi 在 **开发模式** 下会跳过 URL 校验。用以下命令启动 Strapi：

```bash
cd gditc-cms
npm run develop
```

此时可以在 Webhook 中填写 `http://localhost:6001/api/rebuild-trigger`。

#### 方案 B：使用公网 URL（生产环境）

- 部署到公网后，使用正式域名，例如：`https://gditc.org/api/rebuild-trigger`
- 本地开发时可用 ngrok 暴露：`ngrok http 6001`，用生成的公网 URL

#### 方案 C：Strapi 无配置开关

Strapi 官方**没有**提供在 `config/server.js` 中关闭 Webhook URL 校验的配置项。该校验是为防止 SSRF 安全漏洞而加入的，无法通过配置关闭。

---

### 步骤 3：验证配置

**方法一：手动测试**

在终端执行（将 URL 和 Token 替换为你的实际值）：

```bash
curl -X POST https://你的域名/api/rebuild-trigger \
  -H "Authorization: Bearer my-secret-rebuild-token-2025" \
  -H "Content-Type: application/json"
```

应返回：`{"success":true,"message":"Rebuild triggered"}`

**方法二：在 Strapi 中触发**

1. 在 Strapi 中随便修改一篇文章或活动并保存
2. 查看前端服务器日志：`pm2 logs gditc-nextjs`
3. 应看到类似：`[rebuild-trigger] 收到 Webhook，开始后台重建...`

---

## 四、注意事项

### 1. 网络可达性

- **Strapi 和前端是否同机部署**：若 Strapi 在 A 服务器，前端在 B 服务器，Strapi 必须能访问 B 的 `https://B的域名/api/rebuild-trigger`
- **本地开发**：Strapi 在本地时，用 `npm run develop` 启动可跳过 URL 校验，使用 localhost

### 2. 构建时间

- 一次完整构建通常需要 1–3 分钟
- 构建期间网站仍可正常访问（使用旧版本）
- 构建完成后 PM2 会重启服务，新请求将获得新内容

### 3. 频繁更新

- 若短时间内多次发布，会触发多次重建，可能排队执行
- 如需「防抖」，可在此基础上增加「距上次构建不足 N 分钟则跳过」的逻辑

### 4. 安全

- Token 务必保密，不要提交到 Git
- 生产环境建议使用 HTTPS

---

## 五、相关文件

| 文件 | 作用 |
|------|------|
| `start-static-server.js` | 新增了 `/api/rebuild-trigger` 接口的实现 |
| `.env` / `.env.local` | 配置 `REBUILD_TRIGGER_TOKEN` 或 `INCREMENTAL_UPDATE_TOKEN` |
| Strapi 后台 Webhooks | 配置触发 URL、Headers 和事件 |

---

## 六、故障排查

| 现象 | 可能原因 | 处理方式 |
|------|----------|----------|
| Strapi 显示 Webhook 失败 | URL 不可达或 Token 错误 | 检查 URL、防火墙、Token 是否一致 |
| 收到请求但无重建 | PM2 未安装或进程名不对 | 确认 `pm2 restart gditc-nextjs` 可执行 |
| 构建失败 | 依赖缺失或环境问题 | 在项目目录下手动执行 `npm run build` 排查错误 |
| URL 校验不通过 | 使用了 localhost/内网 IP | 用 `npm run develop` 启动 Strapi，或使用公网 URL |

---

**文档版本**：1.0  
**更新日期**：2025-02
