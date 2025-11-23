# AssemblyScript 编译指南

---

## 📌 版本信息

- **版本**：1.0
- **状态**：stable
- **最后更新**：2025-11-19
- **最后审核**：2025-11-19
- **所有者**：WES SDK 团队
- **适用范围**：WES Contract SDK for TypeScript/AssemblyScript

---

## 🎯 文档定位

本文档说明如何使用 AssemblyScript 编译器将 TypeScript/AssemblyScript 合约代码编译为 WASM。

---

## 📋 前置条件

### 安装 AssemblyScript

```bash
npm install --save-dev assemblyscript
npm install --save-dev @assemblyscript/loader
```

### 验证安装

```bash
npx asc --version
```

---

## 🔧 编译配置

SDK 提供了 `asconfig.json` 配置文件，包含两个编译目标：

- **release**: 优化后的生产版本
- **debug**: 包含调试信息的开发版本

### 配置文件

```json
{
  "targets": {
    "release": {
      "binaryFile": "build/release.wasm",
      "textFile": "build/release.wat",
      "sourceMap": true,
      "optimizeLevel": 3,
      "shrinkLevel": 2
    },
    "debug": {
      "binaryFile": "build/debug.wasm",
      "textFile": "build/debug.wat",
      "sourceMap": true,
      "optimizeLevel": 0,
      "shrinkLevel": 0
    }
  }
}
```

---

## 🚀 编译命令

### 使用 npm 脚本

```bash
# 编译 release 版本
npm run build:contract

# 编译 debug 版本
npm run build:contract:debug
```

### 直接使用 asc

```bash
# Release 版本
asc templates/learning/hello-world/contract.ts --target release --outFile build/hello-world.wasm

# Debug 版本
asc templates/learning/hello-world/contract.ts --target debug --outFile build/hello-world.wasm
```

---

## 📝 编译示例

### Hello World 合约

```bash
cd examples
asc hello-world.ts --target release --outFile ../build/hello-world.wasm
```

### Token 合约

```bash
cd examples
asc token.ts --target release --outFile ../build/token.wasm
```

---

## ⚠️ 注意事项

### AssemblyScript 限制

1. **装饰器支持**：AssemblyScript 不支持装饰器，装饰器主要用于 TypeScript 开发时的标记
2. **JSON 支持**：AssemblyScript 的 JSON 支持有限，SDK 提供了简化的 JSON 解析工具
3. **类型限制**：需要使用 AssemblyScript 支持的类型（u32, u64, i32, i64, f32, f64 等）

### 常见错误

1. **类型错误**：确保使用 AssemblyScript 支持的类型
2. **导入错误**：确保正确导入 SDK 模块
3. **内存错误**：注意内存管理，使用 SDK 提供的内存工具函数

---

## 🔍 验证编译

### 检查 WASM 文件

```bash
# 检查文件是否存在
ls -lh build/*.wasm

# 查看文件信息
file build/hello-world.wasm
```

### 使用 wasm-objdump（如果已安装）

```bash
wasm-objdump -x build/hello-world.wasm
```

---

## 📚 相关文档

- [开发者指南](./DEVELOPER_GUIDE.md) - 使用指南和示例
- [API 参考](./API_REFERENCE.md) - 完整 API 文档
- [架构文档](./ARCHITECTURE.md) - SDK 架构说明

---

## 🔗 参考资源

- [AssemblyScript 官方文档](https://www.assemblyscript.org/)
- [AssemblyScript 编译器选项](https://www.assemblyscript.org/compiler.html#compiler-options)
- [WebAssembly 规范](https://webassembly.org/)

---

**最后更新**：2025-11-19

