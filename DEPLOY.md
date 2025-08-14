# 渔友圈 - 部署说明

## 开发环境部署

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

开发服务器将在以下地址启动：
- 本地访问：http://localhost:3000
- 局域网访问：http://[你的IP地址]:3000

### 3. 获取本机IP地址
在终端运行以下命令获取本机IP：
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

## 生产环境部署

### 1. 构建项目
```bash
pnpm build
```

### 2. 预览生产版本
```bash
pnpm preview
```

### 3. 局域网部署
```bash
pnpm serve
```

生产版本将在以下地址启动：
- 本地访问：http://localhost:4173
- 局域网访问：http://[你的IP地址]:4173

## 一键部署
```bash
pnpm start
```
这个命令会先构建项目，然后启动生产服务器。

## 网络访问说明

1. **开发环境**：端口 3000
2. **生产环境**：端口 4173
3. **防火墙设置**：确保防火墙允许对应端口访问
4. **路由器设置**：如果需要在互联网访问，需要配置端口转发

## 常见问题

### Q: 其他设备无法访问？
A: 检查以下几点：
1. 确保防火墙允许端口访问
2. 确认IP地址正确
3. 检查网络连接

### Q: 如何获取本机IP？
A: 
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig | findstr "IPv4"`
- Linux: `ip addr show | grep "inet " | grep -v 127.0.0.1`

### Q: 端口被占用？
A: 可以修改 `vite.config.ts` 中的端口配置：
```typescript
server: {
    port: 3001, // 修改为其他端口
}
```

## 部署到服务器

### 使用 nginx 部署
1. 构建项目：`pnpm build`
2. 将 `dist` 目录上传到服务器
3. 配置 nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 使用 Docker 部署
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
``` 