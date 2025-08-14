# 🚀 GitHub 部署指南

## 📋 部署到 GitHub 的完整步骤

### 🔧 第一步：准备 Git 仓库

1. **初始化 Git 仓库**（如果还没有）
   ```bash
   git init
   ```

2. **添加 .gitignore 文件**
   确保项目根目录有 `.gitignore` 文件，包含以下内容：
   ```
   node_modules/
   .DS_Store
   dist/
   .env
   .env.local
   .env.*.local
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   pnpm-debug.log*
   .vscode/
   .idea/
   *.suo
   *.ntvs*
   *.njsproj
   *.sln
   *.sw?
   ```

3. **提交当前代码**
   ```bash
   git add .
   git commit -m "Initial commit: 渔友圈 H5 应用"
   ```

### 🌐 第二步：创建 GitHub 仓库

1. **访问 GitHub**
   - 打开 [https://github.com](https://github.com)
   - 登录您的 GitHub 账号

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 填写仓库信息：
     - Repository name: `fishing-social-h5`
     - Description: `渔友圈 H5 移动端应用`
     - 选择 Public 或 Private
     - 不要勾选 "Initialize this repository with a README"

3. **获取仓库地址**
   - 创建后会显示仓库的 HTTPS 或 SSH 地址
   - 例如：`https://github.com/yourusername/fishing-social-h5.git`

### 📤 第三步：推送代码到 GitHub

1. **添加远程仓库**
   ```bash
   git remote add origin https://github.com/yourusername/fishing-social-h5.git
   ```

2. **推送代码**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### 🌍 第四步：配置 GitHub Pages（免费静态托管）

#### 方法一：使用 GitHub Actions 自动部署

1. **创建 GitHub Actions 工作流**
   在项目根目录创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v3
   
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'
   
       - name: Setup pnpm
         uses: pnpm/action-setup@v2
         with:
           version: 8
   
       - name: Install dependencies
         run: pnpm install
   
       - name: Build
         run: pnpm build
   
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

2. **启用 GitHub Pages**
   - 在 GitHub 仓库页面，点击 "Settings"
   - 滚动到 "Pages" 部分
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages"
   - 点击 "Save"

3. **推送工作流文件**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push
   ```

#### 方法二：手动部署

1. **构建项目**
   ```bash
   pnpm build
   ```

2. **安装 gh-pages**
   ```bash
   pnpm add -D gh-pages
   ```

3. **添加部署脚本到 package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **执行部署**
   ```bash
   pnpm run deploy
   ```

### 🔧 第五步：配置路由（重要）

由于是 SPA 应用，需要配置路由重定向。在 `dist` 目录创建 `404.html`：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>渔友圈</title>
    <script type="text/javascript">
      var pathSegmentsToKeep = 0;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### 📱 第六步：访问应用

1. **获取 GitHub Pages 地址**
   - 部署成功后，访问地址为：
   - `https://yourusername.github.io/fishing-social-h5/`

2. **检查部署状态**
   - 在仓库的 "Actions" 标签查看部署状态
   - 在 "Settings" > "Pages" 查看部署地址

### 🔄 更新部署

**自动更新**（使用 GitHub Actions）：
- 每次推送到 main 分支时自动部署

**手动更新**：
```bash
# 修改代码后
git add .
git commit -m "更新功能"
git push

# 如果使用手动部署
pnpm build
pnpm run deploy
```

### 🎯 高级配置

#### 自定义域名

1. **添加 CNAME 文件**
   在 `public` 目录创建 `CNAME` 文件：
   ```
   yourdomain.com
   ```

2. **配置 DNS**
   - 在域名提供商处添加 CNAME 记录
   - 指向 `yourusername.github.io`

#### 环境变量

1. **在 GitHub 仓库设置环境变量**
   - Settings > Secrets and variables > Actions
   - 添加需要的环境变量

2. **在工作流中使用**
   ```yaml
   - name: Build
     run: pnpm build
     env:
       VITE_API_URL: ${{ secrets.API_URL }}
   ```

### ⚠️ 注意事项

1. **GitHub Pages 限制**
   - 仓库大小限制：1GB
   - 每月带宽限制：100GB
   - 每小时构建限制：10次

2. **路由配置**
   - 确保 Vue Router 使用 hash 模式或正确配置 history 模式
   - 添加 404.html 处理 SPA 路由

3. **静态资源**
   - 确保所有资源路径正确
   - 检查 base URL 配置

4. **HTTPS**
   - GitHub Pages 自动提供 HTTPS
   - 强制 HTTPS 可在设置中启用

### 🎉 完成！

现在您的渔友圈应用已经部署到 GitHub，可以通过 GitHub Pages 全球访问！

**优势：**
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 版本控制
- ✅ 自动部署
- ✅ 自定义域名支持