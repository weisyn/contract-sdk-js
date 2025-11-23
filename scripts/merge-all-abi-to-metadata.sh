#!/bin/bash

# 将所有模板的 ABI JSON 合并到 metadata.json 的 methods 字段

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/../templates"

# 检查是否安装了 ts-node
if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}⚠️  ts-node 未安装，尝试使用 npx...${NC}"
    NPX_CMD="npx ts-node --esm"
else
    NPX_CMD="ts-node --esm"
fi

echo -e "${GREEN}🔍 开始合并所有模板的 ABI 到 metadata.json${NC}"

# 查找所有包含 contract.ts 的模板目录
find "$TEMPLATES_DIR" -name "contract.ts" -o -name "index.ts" | while read -r contract_file; do
    template_dir=$(dirname "$contract_file")
    template_name=$(basename "$template_dir")
    
    echo -e "\n${YELLOW}📦 处理模板: $template_name${NC}"
    
    # 检查是否存在 abi.json
    if [ ! -f "$template_dir/abi.json" ]; then
        echo -e "${YELLOW}  ⚠️  跳过: 未找到 abi.json，请先运行 generate:abi${NC}"
        continue
    fi
    
    # 合并 ABI 到 metadata.json
    if $NPX_CMD "$SCRIPT_DIR/../tools/merge-abi-to-metadata.ts" "$template_dir" 2>/dev/null; then
        echo -e "${GREEN}  ✅ 已合并 ABI 到 metadata.json${NC}"
    else
        echo -e "${RED}  ❌ 合并失败${NC}"
    fi
done

echo -e "\n${GREEN}✅ 所有模板的 ABI 已合并完成${NC}"

