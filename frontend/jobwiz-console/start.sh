#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT=5173

echo "==> 检查端口 $PORT 是否有进程运行..."
PID=$(lsof -ti:$PORT 2>/dev/null || true)

if [ -n "$PID" ]; then
    echo "==> 发现进程 PID=$PID 占用端口 $PORT，正在关闭..."
    kill -15 $PID 2>/dev/null || true
    sleep 2
    # 强制杀掉可能残留的进程
    kill -9 $PID 2>/dev/null || true
    echo "==> 进程已关闭"
else
    echo "==> 端口 $PORT 空闲，无运行中的进程"
fi

echo "==> 检查并安装 npm 依赖..."
npm install

echo "==> 启动开发服务器 (端口 $PORT)..."
npm run dev
