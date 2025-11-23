# 构建指南

**版本**: 0.1.0-alpha  
**最后更新**: 2025-01-23

---

## 概述

本文档说明如何编译 AssemblyScript 模板为 WASM 文件。

---

## 前置条件

### 安装 AssemblyScript

```bash
npm install -g assemblyscript
# 或
npm install --save-dev assemblyscript
```

### 验证安装

```bash
asc --version
```

---

## 编译单个模板

### 使用编译脚本

```bash
# 编译 release 版本
bash scripts/build-template.sh templates/learning/hello-world

# 编译 debug 版本
bash scripts/build-template.sh templates/learning/hello-world debug

# 或使用 npm 脚本
npm run build:template -- templates/learning/hello-world
```

### 输出文件

编译后的文件位于 `build/templates/` 目录：

- `{template-name}.wasm` - WASM 二进制文件
- `{template-name}.wat` - WASM 文本格式（可选）

---

## 编译所有模板

### 使用编译脚本

```bash
# 编译所有模板（release 版本）
bash scripts/build-all-templates.sh

# 编译所有模板（debug 版本）
bash scripts/build-all-templates.sh debug

# 或使用 npm 脚本
npm run build:templates
npm run build:templates:debug
```

### 支持的模板

- `templates/learning/hello-world`
- `templates/learning/simple-token`
- `templates/learning/market-demo`
- `templates/standard/token/erc20-token`
- `templates/standard/governance/dao`

---

## 直接使用 asc 命令

### Release 版本

```bash
asc templates/learning/hello-world/contract.ts \
    --target release \
    --outFile build/templates/hello-world.wasm \
    --optimize --optimizeLevel 3 --shrinkLevel 2 \
    --runtime stub \
    --exportRuntime
```

### Debug 版本

```bash
asc templates/learning/hello-world/contract.ts \
    --target debug \
    --outFile build/templates/hello-world.wasm \
    --debug --sourceMap \
    --runtime stub \
    --exportRuntime
```

---

## 编译配置

编译配置位于 `asconfig.json`：

```json
{
  "targets": {
    "release": {
      "binaryFile": "build/release.wasm",
      "optimizeLevel": 3,
      "shrinkLevel": 2
    },
    "debug": {
      "binaryFile": "build/debug.wasm",
      "optimizeLevel": 0,
      "shrinkLevel": 0
    }
  }
}
```

---

## 验证编译结果

### 检查 WASM 文件

```bash
# 检查文件大小
ls -lh build/templates/*.wasm

# 查看导出函数（需要 wasm-objdump）
wasm-objdump -x build/templates/hello-world.wasm | grep export
```

### 运行集成测试

```bash
# 运行 WASM 加载器测试
npm test -- tests/integration/wasm-loader.test.ts
```

---

## 故障排除

### 常见错误

1. **找不到 asc 命令**
   ```bash
   npm install -g assemblyscript
   ```

2. **编译错误：找不到模块**
   - 确保模板文件路径正确
   - 检查 `contract.ts` 文件是否存在

3. **HostABI 函数未定义**
   - 确保合约正确导入 `@weisyn/contract-sdk-js`
   - 检查 `env.ts` 中的函数声明

---

## 下一步

编译完成后，可以：

1. **运行集成测试**：验证 WASM 模块可以正确加载和执行
2. **部署到测试节点**：使用编译后的 WASM 文件部署合约
3. **性能分析**：使用 WASM 分析工具优化合约性能

---

## 相关文档

- [编译文档](./COMPILATION.md)
- [开发者指南](./DEVELOPER_GUIDE.md)
- [API 参考](./API_REFERENCE.md)

