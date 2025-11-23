#!/bin/bash

# 修复模板中的占位符脚本
# 将所有模板中的 base58_address_placeholder 和简化的 parseAddress/addressToBase58 替换为正确的实现

set -e

TEMPLATES_DIR="templates/standard"

# 需要修复的文件列表（包含占位符的文件）
FILES=(
  "defi/amm/contract.ts"
  "nft/collectibles/contract.ts"
  "nft/digital-art/contract.ts"
  "market/vesting/contract.ts"
  "token/game-currency/contract.ts"
  "token/payment-token/contract.ts"
  "rwa/real-estate/residential/contract.ts"
  "rwa/real-estate/commercial/contract.ts"
  "rwa/intellectual-property/contract.ts"
  "rwa/artwork/contract.ts"
  "rwa/commodity/contract.ts"
  "rwa/bond/contract.ts"
  "rwa/equity/contract.ts"
  "defi/liquidity-pool/contract.ts"
  "defi/lending/contract.ts"
  "governance/proposal-voting/contract.ts"
  "staking/basic-staking/contract.ts"
)

echo "开始修复模板占位符..."

for file in "${FILES[@]}"; do
  filepath="${TEMPLATES_DIR}/${file}"
  if [ -f "$filepath" ]; then
    echo "处理: $filepath"
    
    # 检查是否需要添加导入
    if ! grep -q "ParsingUtils" "$filepath"; then
      # 在最后一个 import 语句后添加 ParsingUtils 和 FormatUtils 导入
      sed -i '' '/^import.*from.*framework.*utils\/json/a\
import { ParsingUtils } from '\''../../../src/framework/utils/parsing'\'';\
import { FormatUtils } from '\''../../../src/framework/utils/format'\'';
' "$filepath"
    fi
    
    # 替换 parseAddress 方法
    sed -i '' 's/private parseAddress(addressStr: string): Address | null {[^}]*return Context\.getCaller();[^}]*}/private parseAddress(addressStr: string): Address | null {\
    return ParsingUtils.parseAddress(addressStr);\
  }/g' "$filepath"
    
    # 替换 addressToBase58 方法
    sed -i '' "s/return 'base58_address_placeholder';/return FormatUtils.addressToBase58(address);/g" "$filepath"
    sed -i '' 's/private addressToBase58(address: Address): string {[^}]*return '\''base58_address_placeholder'\'';[^}]*}/private addressToBase58(address: Address): string {\
    return FormatUtils.addressToBase58(address);\
  }/g' "$filepath"
    
    echo "  ✅ 完成"
  else
    echo "  ⚠️  文件不存在: $filepath"
  fi
done

echo "所有模板占位符修复完成！"

