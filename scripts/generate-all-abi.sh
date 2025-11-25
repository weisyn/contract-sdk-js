#!/bin/bash

# 为所有模板生成 ABI 元数据

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ABI_SCRIPT="$(dirname "$0")/generate-abi.sh"

echo -e "${YELLOW}🔍 为所有模板生成 ABI 元数据${NC}"
echo ""

# 查找所有模板目录
TEMPLATES=(
    "templates/learning/basic-nft"
    "templates/learning/hello-world"
    "templates/learning/market-demo"
    "templates/learning/simple-token"
    "templates/learning/starter-contract"
    "templates/standard/defi/amm"
    "templates/standard/defi/lending"
    "templates/standard/defi/liquidity-pool"
    "templates/standard/governance/dao"
    "templates/standard/governance/proposal-voting"
    "templates/standard/market/escrow"
    "templates/standard/market/vesting"
    "templates/standard/nft/certificates"
    "templates/standard/nft/collectibles"
    "templates/standard/nft/digital-art"
    "templates/standard/nft/domains"
    "templates/standard/nft/gaming"
    "templates/standard/nft/identity"
    "templates/standard/nft/music"
    "templates/standard/nft/tickets"
    "templates/standard/rwa/artwork"
    "templates/standard/rwa/bond"
    "templates/standard/rwa/commodity"
    "templates/standard/rwa/equity"
    "templates/standard/rwa/intellectual-property"
    "templates/standard/rwa/real-estate/commercial"
    "templates/standard/rwa/real-estate/residential"
    "templates/standard/staking/basic-staking"
    "templates/standard/staking/delegation"
    "templates/standard/token/erc20-token"
    "templates/standard/token/game-currency"
    "templates/standard/token/governance-token"
    "templates/standard/token/payment-token"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for template in "${TEMPLATES[@]}"; do
    if [ -f "$template/contract.ts" ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        if bash "$ABI_SCRIPT" "$template"; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
            echo -e "${YELLOW}⚠️  模板 ABI 生成失败: $template${NC}"
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  跳过 (未找到合约文件): $template${NC}"
    fi
done

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ 所有模板 ABI 生成完成!${NC}"
    echo "   成功: $SUCCESS_COUNT"
    echo "   失败: $FAIL_COUNT"
else
    echo -e "${YELLOW}⚠️  部分模板 ABI 生成失败${NC}"
    echo "   成功: $SUCCESS_COUNT"
    echo "   失败: $FAIL_COUNT"
    exit 1
fi

