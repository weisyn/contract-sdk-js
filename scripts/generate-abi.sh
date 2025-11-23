#!/bin/bash

# ABI 元数据生成脚本
# 为模板生成 ABI JSON 文件

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ 错误: 请指定模板路径${NC}"
    echo "用法: $0 <template-path>"
    echo "示例: $0 templates/learning/hello-world"
    exit 1
fi

TEMPLATE_PATH="$1"
CONTRACT_FILE="$TEMPLATE_PATH/contract.ts"
ABI_FILE="$TEMPLATE_PATH/abi.json"

# 检查合约文件是否存在
if [ ! -f "$CONTRACT_FILE" ]; then
    echo -e "${RED}❌ 错误: 找不到合约文件: $CONTRACT_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 生成 ABI 元数据: $TEMPLATE_PATH${NC}"

# 检查是否安装了 ts-node
if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}⚠️  ts-node 未安装，尝试使用 npx...${NC}"
    NPX_CMD="npx ts-node --esm"
else
    NPX_CMD="ts-node --esm"
fi

# 优先使用 AST 解析，失败则回退到正则解析
if $NPX_CMD tools/generate-abi-ast.ts "$CONTRACT_FILE" "$ABI_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ ABI 已生成（AST 解析）: $ABI_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  AST 解析失败，使用正则解析...${NC}"
    if $NPX_CMD tools/generate-abi.ts "$CONTRACT_FILE" "$ABI_FILE"; then
        echo -e "${GREEN}✅ ABI 已生成（正则解析）: $ABI_FILE${NC}"
    else
        echo -e "${RED}❌ ABI 生成失败${NC}"
        exit 1
    fi
fi

