#!/usr/bin/env python3
"""
批量修复模板中的占位符脚本
将所有模板中的 base58_address_placeholder 和简化的 parseAddress/addressToBase58 替换为正确的实现
"""

import os
import re
from pathlib import Path

TEMPLATES_DIR = Path("templates/standard")

# 需要修复的文件列表（包含占位符的文件）
FILES_TO_FIX = [
    "defi/amm/contract.ts",
    "nft/collectibles/contract.ts",
    "nft/digital-art/contract.ts",
    "market/vesting/contract.ts",
    "token/game-currency/contract.ts",
    "rwa/real-estate/residential/contract.ts",
    "rwa/real-estate/commercial/contract.ts",
    "rwa/intellectual-property/contract.ts",
    "rwa/artwork/contract.ts",
    "rwa/commodity/contract.ts",
    "rwa/bond/contract.ts",
    "rwa/equity/contract.ts",
    "defi/liquidity-pool/contract.ts",
    "defi/lending/contract.ts",
    "governance/proposal-voting/contract.ts",
    "staking/basic-staking/contract.ts",
]

def fix_file(filepath: Path):
    """修复单个文件"""
    if not filepath.exists():
        print(f"  ⚠️  文件不存在: {filepath}")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    original_content = content
    
    # 1. 检查并添加导入
    if "ParsingUtils" not in content:
        # 找到最后一个 import 语句的位置
        import_pattern = r'(import\s+.*?from\s+[\'"]\.\.\/\.\.\/\.\.\/src\/framework\/utils\/json[\'"];)'
        match = re.search(import_pattern, content)
        if match:
            insert_pos = match.end()
            new_imports = '\nimport { ParsingUtils } from \'../../../src/framework/utils/parsing\';\nimport { FormatUtils } from \'../../../src/framework/utils/format\';'
            content = content[:insert_pos] + new_imports + content[insert_pos:]
    
    # 2. 替换 parseAddress 方法
    # 匹配模式：private parseAddress(...) { ... return Context.getCaller(); ... }
    parse_address_pattern = r'private\s+parseAddress\s*\([^)]+\)\s*:\s*Address\s*\|\s*null\s*\{[^}]*return\s+Context\.getCaller\(\);[^}]*\}'
    if re.search(parse_address_pattern, content):
        content = re.sub(
            parse_address_pattern,
            'private parseAddress(addressStr: string): Address | null {\n    return ParsingUtils.parseAddress(addressStr);\n  }',
            content
        )
    
    # 3. 替换 addressToBase58 方法
    # 匹配模式1：return 'base58_address_placeholder';
    content = content.replace("return 'base58_address_placeholder';", "return FormatUtils.addressToBase58(address);")
    
    # 匹配模式2：private addressToBase58(...) { ... return 'base58_address_placeholder'; ... }
    address_to_base58_pattern = r'private\s+addressToBase58\s*\([^)]+\)\s*:\s*string\s*\{[^}]*return\s+[\'"]base58_address_placeholder[\'"];[^}]*\}'
    if re.search(address_to_base58_pattern, content):
        content = re.sub(
            address_to_base58_pattern,
            'private addressToBase58(address: Address): string {\n    return FormatUtils.addressToBase58(address);\n  }',
            content
        )
    
    # 如果内容有变化，写入文件
    if content != original_content:
        filepath.write_text(content, encoding='utf-8')
        return True
    
    return False

def main():
    print("开始修复模板占位符...")
    print()
    
    fixed_count = 0
    for file_rel_path in FILES_TO_FIX:
        filepath = TEMPLATES_DIR / file_rel_path
        print(f"处理: {filepath}")
        
        if fix_file(filepath):
            print(f"  ✅ 已修复")
            fixed_count += 1
        else:
            print(f"  ℹ️  无需修复或文件不存在")
    
    print()
    print(f"修复完成！共修复 {fixed_count} 个文件")

if __name__ == "__main__":
    main()

