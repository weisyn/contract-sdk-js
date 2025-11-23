#!/bin/bash

# 编译所有模板脚本
# 批量编译 templates/ 目录下的所有模板

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TARGET="${1:-release}"
BUILD_SCRIPT="$(dirname "$0")/build-template.sh"

echo -e "${YELLOW}🔨 编译所有模板 (目标: $TARGET)${NC}"
echo ""

# 查找所有模板目录
TEMPLATES=(
    "templates/learning/hello-world"
    "templates/learning/simple-token"
    "templates/learning/market-demo"
    "templates/standard/token/erc20-token"
    "templates/standard/governance/dao"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for template in "${TEMPLATES[@]}"; do
    if [ -f "$template/contract.ts" ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        if bash "$BUILD_SCRIPT" "$template" "$TARGET"; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
            echo -e "${YELLOW}⚠️  模板编译失败: $template${NC}"
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  跳过 (未找到合约文件): $template${NC}"
    fi
done

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ 所有模板编译完成!${NC}"
    echo "   成功: $SUCCESS_COUNT"
    echo "   失败: $FAIL_COUNT"
else
    echo -e "${YELLOW}⚠️  部分模板编译失败${NC}"
    echo "   成功: $SUCCESS_COUNT"
    echo "   失败: $FAIL_COUNT"
    exit 1
fi

