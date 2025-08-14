#!/bin/bash

# GitHub 快速初始化脚本
# 使用方法: ./scripts/github-init.sh <your-github-username> [repository-name]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${RED}错误: 请提供 GitHub 用户名${NC}"
    echo -e "${YELLOW}使用方法: $0 <github-username> [repository-name]${NC}"
    echo -e "${YELLOW}示例: $0 myusername fishing-social-h5${NC}"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=${2:-"fishing-social-h5"}
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo -e "${BLUE}🚀 开始 GitHub 部署初始化...${NC}"
echo -e "${BLUE}📁 仓库名称: ${REPO_NAME}${NC}"
echo -e "${BLUE}👤 GitHub 用户: ${GITHUB_USERNAME}${NC}"
echo -e "${BLUE}🔗 仓库地址: ${REPO_URL}${NC}"
echo ""

# 检查是否已经是 Git 仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
else
    echo -e "${GREEN}✅ 检测到现有 Git 仓库${NC}"
fi

# 检查是否有远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    CURRENT_ORIGIN=$(git remote get-url origin)
    echo -e "${YELLOW}⚠️  检测到现有远程仓库: ${CURRENT_ORIGIN}${NC}"
    read -p "是否要替换为新的远程仓库? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        git remote add origin "$REPO_URL"
        echo -e "${GREEN}✅ 远程仓库已更新${NC}"
    else
        echo -e "${YELLOW}⏭️  保持现有远程仓库${NC}"
    fi
else
    echo -e "${YELLOW}🔗 添加远程仓库...${NC}"
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ 远程仓库添加完成${NC}"
fi

# 检查工作区状态
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 检测到未提交的更改，正在添加文件...${NC}"
    git add .
    
    # 检查是否有提交
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        git commit -m "Update: 准备部署到 GitHub Pages"
    else
        git commit -m "Initial commit: 渔友圈 H5 应用"
    fi
    echo -e "${GREEN}✅ 文件提交完成${NC}"
else
    echo -e "${GREEN}✅ 工作区干净，无需提交${NC}"
fi

# 设置主分支
echo -e "${YELLOW}🌿 设置主分支为 main...${NC}"
git branch -M main
echo -e "${GREEN}✅ 主分支设置完成${NC}"

# 推送到 GitHub
echo -e "${YELLOW}📤 推送代码到 GitHub...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}🎉 代码推送成功！${NC}"
else
    echo -e "${RED}❌ 推送失败，请检查：${NC}"
    echo -e "${RED}   1. GitHub 仓库是否已创建${NC}"
    echo -e "${RED}   2. 是否有推送权限${NC}"
    echo -e "${RED}   3. 网络连接是否正常${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎊 GitHub 初始化完成！${NC}"
echo ""
echo -e "${BLUE}📋 接下来的步骤：${NC}"
echo -e "${BLUE}1. 访问 GitHub 仓库: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
echo -e "${BLUE}2. 在仓库设置中启用 GitHub Pages${NC}"
echo -e "${BLUE}3. 等待 GitHub Actions 自动部署${NC}"
echo -e "${BLUE}4. 访问应用: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/${NC}"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo -e "${YELLOW}   - 每次推送到 main 分支都会自动部署${NC}"
echo -e "${YELLOW}   - 也可以使用 'pnpm run deploy' 手动部署${NC}"
echo -e "${YELLOW}   - 查看部署状态: GitHub 仓库 > Actions 标签${NC}"