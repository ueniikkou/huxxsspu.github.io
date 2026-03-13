# 毕业留言板后端（Cloudflare Worker + D1）

这个后端给你的前端页面提供一个“所有人都能看到”的在线留言 API。

## 你需要准备什么（硬件/成本）

- 不需要买服务器，不需要额外硬件
- 一台能上网的电脑即可
- Cloudflare 提供 Worker + D1（有免费额度）

## 你将学到的知识点（最基础）

- HTTP：GET/POST 请求、JSON
- 跨域（CORS）：为什么浏览器要拦请求，如何在后端加响应头放行
- 数据库：表、字段、排序、分页（这里用 SQLite）
- 部署：把代码发布成公网可访问的 API

## 第 0 步：注册 Cloudflare

1. 注册 Cloudflare 账号（邮箱即可）
2. 不需要买域名也能用 Workers 默认域名

## 第 1 步：安装工具（一次性）

安装 Node.js（建议用 LTS 版本），然后在命令行运行：

```bash
npm i -g wrangler
```

登录：

```bash
wrangler login
```

## 第 2 步：创建 D1 数据库

在本目录（`backend/`）运行：

```bash
wrangler d1 create grad_messages
```

它会输出一个 `database_id`，把它填到 `wrangler.toml` 的：

```toml
database_id = "PLEASE_FILL_DATABASE_ID"
```

## 第 3 步：建表（把 schema.sql 应用到 D1）

本地/远程都可以，建议直接建到远程：

```bash
wrangler d1 execute grad_messages --remote --file=./schema.sql
```

## 第 4 步：本地运行（联调）

```bash
wrangler dev
```

看到类似 `http://localhost:8787` 就成功了。

## 第 5 步：部署到线上

```bash
wrangler deploy
```

部署后会给你一个 URL，形如：

`https://grad-message-api.<你的subdomain>.workers.dev`

## 第 6 步：让前端调用你的后端

打开前端的 `app.js`，找到：

```js
const API_BASE = "";
```

把它改成你的 Worker 地址，例如：

```js
const API_BASE = "https://grad-message-api.<你的subdomain>.workers.dev";
```

然后把前端文件上传到 GitHub Pages。

## API 说明

- 取留言：
  - `GET /api/messages?limit=100`
- 发留言：
  - `POST /api/messages`
  - JSON：
    - `major`（必填）
    - `studentId`（必填）
    - `content`（必填）
    - `avatarDataUrl`（可选，data:image/...;base64,...）

