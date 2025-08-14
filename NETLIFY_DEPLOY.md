# 渔友圈 - Netlify 部署指南

## 🚀 快速部署

### 方法一：Git 仓库部署（推荐）

1. **上传代码到 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **连接 Netlify**
   - 访问 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的 Git 提供商（GitHub/GitLab/Bitbucket）
   - 选择项目仓库

3. **配置构建设置**
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 方法二：手动部署

1. **构建项目**
   ```bash
   pnpm build
   ```

2. **上传 dist 文件夹**
   - 访问 [Netlify](https://netlify.com)
   - 将 `dist` 文件夹拖拽到部署区域

## ⚙️ 配置文件说明

项目已包含 `netlify.toml` 配置文件，包含以下设置：

### 构建配置
- 构建命令：`pnpm build`
- 输出目录：`dist`
- Node.js 版本：18

### 路由配置
- SPA 重定向：所有路由重定向到 `index.html`
- 状态码：200（支持前端路由）

### 缓存优化
- 静态资源缓存：1年
- JS/CSS 文件缓存：1年
- 不可变资源标记

### 安全头
- X-Frame-Options: DENY
- X-XSS-Protection: 启用
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 🔧 环境变量配置

如果项目使用环境变量，在 Netlify 控制台设置：

1. 进入站点设置
2. 点击 "Environment variables"
3. 添加所需的环境变量

常见环境变量：
```
VITE_API_BASE_URL=https://your-api.com
VITE_APP_TITLE=渔友圈
```

## 📱 自定义域名

1. **添加自定义域名**
   - 在 Netlify 控制台点击 "Domain settings"
   - 点击 "Add custom domain"
   - 输入你的域名

2. **配置 DNS**
   - 添加 CNAME 记录指向 Netlify 域名
   - 或使用 Netlify DNS 服务

3. **启用 HTTPS**
   - Netlify 自动提供 Let's Encrypt SSL 证书
   - 强制 HTTPS 重定向

## 🔄 自动部署

连接 Git 仓库后，每次推送代码都会自动触发部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

## 📊 部署状态

部署完成后，你将获得：
- **临时域名**：`https://amazing-name-123456.netlify.app`
- **构建日志**：查看部署过程
- **部署预览**：每个 PR 的预览版本

## 🐛 常见问题

### Q: 404 错误
A: 确保 `netlify.toml` 中的重定向规则正确配置

### Q: 构建失败
A: 检查 Node.js 版本和依赖安装

### Q: 静态资源加载失败
A: 确认 `vite.config.ts` 中的 `base` 配置

### Q: 路由不工作
A: 确保 SPA 重定向规则已配置

## 💡 优化建议

1. **启用分支部署**：为不同分支创建预览
2. **配置构建钩子**：部署前后执行自定义脚本
3. **使用 Netlify Functions**：添加服务端功能
4. **启用表单处理**：处理联系表单
5. **配置分析**：监控网站性能

## 🎯 部署检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] `netlify.toml` 配置文件已添加
- [ ] 构建命令和输出目录正确
- [ ] 环境变量已配置
- [ ] 自定义域名已设置（可选）
- [ ] HTTPS 已启用
- [ ] 部署成功并可访问

部署完成后，你的渔友圈应用就可以通过 Netlify 提供的域名全球访问了！