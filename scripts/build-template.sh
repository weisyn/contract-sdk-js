#!/bin/bash

# WES 智能合约模板编译脚本
# 用于编译 AssemblyScript 模板为 WASM

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ 错误: 请指定模板路径${NC}"
    echo "用法: $0 <template-path> [target]"
    echo "示例: $0 templates/learning/hello-world"
    echo "示例: $0 templates/standard/token/erc20-token release"
    exit 1
fi

TEMPLATE_PATH="$1"
TARGET="${2:-release}"
BUILD_DIR="build/templates"
TEMPLATE_NAME=$(basename "$TEMPLATE_PATH")

# 检查 AssemblyScript 编译器
if ! command -v asc &> /dev/null; then
    echo -e "${RED}❌ 错误: AssemblyScript 编译器未安装${NC}"
    echo "请运行: npm install -g assemblyscript"
    exit 1
fi

# 检查模板文件是否存在
CONTRACT_FILE="$TEMPLATE_PATH/contract.ts"
if [ ! -f "$CONTRACT_FILE" ]; then
    echo -e "${RED}❌ 错误: 找不到合约文件: $CONTRACT_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}🔨 编译模板: $TEMPLATE_PATH${NC}"
echo "   目标: $TARGET"
echo "   合约文件: $CONTRACT_FILE"

# 创建构建目录
mkdir -p "$BUILD_DIR"

# 输出文件路径
OUTPUT_WASM="$BUILD_DIR/${TEMPLATE_NAME}.wasm"
OUTPUT_WAT="$BUILD_DIR/${TEMPLATE_NAME}.wat"

# 编译参数
COMPILE_OPTS=""
if [ "$TARGET" = "release" ]; then
    COMPILE_OPTS="--optimize --optimizeLevel 3 --shrinkLevel 2"
elif [ "$TARGET" = "debug" ]; then
    COMPILE_OPTS="--debug --sourceMap"
fi

# 执行编译
echo ""
echo -e "${YELLOW}📦 正在编译...${NC}"
asc "$CONTRACT_FILE" \
    --target "$TARGET" \
    --outFile "$OUTPUT_WASM" \
    --textFile "$OUTPUT_WAT" \
    $COMPILE_OPTS \
    --runtime stub \
    --exportRuntime

# 检查编译结果
if [ -f "$OUTPUT_WASM" ]; then
    SIZE=$(wc -c < "$OUTPUT_WASM" | tr -d ' ')
    echo ""
    echo -e "${GREEN}✅ 编译成功!${NC}"
    echo "📦 WASM 文件大小: $SIZE 字节"
    echo "📄 输出文件: $OUTPUT_WASM"
    
    # 显示 WASM 导出函数（如果 wasm-objdump 可用）
    if command -v wasm-objdump &> /dev/null; then
        echo ""
        echo "📋 导出的函数:"
        wasm-objdump -x "$OUTPUT_WASM" | grep "export" | grep "func" || echo "  (无导出函数)"
    fi
else
    echo -e "${RED}❌ 编译失败${NC}"
    exit 1
fi

