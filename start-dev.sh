#!/bin/bash

echo "正在关闭运行在3000端口的进程..."
npx kill-port 3000

echo "清理Next.js缓存..."
rm -rf .next

echo "安装依赖..."
npm install --legacy-peer-deps

echo "启动开发服务器..."
npm run dev 