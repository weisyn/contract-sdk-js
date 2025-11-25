# 跨语言一致性测试

**版本**: 1.0  
**最后更新**: 2025-11-11  
**状态**: ✅ 框架已实现

---

## 📋 概述

跨语言一致性测试用于验证 Go SDK 和 JS SDK 在相同业务场景下的行为一致性，确保两个 SDK 的实现完全对齐。

---

## 🎯 测试方法

1. **定义共享的测试场景**（JSON/YAML 格式）
2. **分别调用 Go 和 TS/AS 合约**
3. **对比错误码、事件结构、返回值**

---

## 🏗️ 架构

### 核心组件

1. **WASM 编译器** (`wasm-compiler.ts`)
   - `GoCompiler`: 使用 TinyGo 编译 Go 合约为 WASM
   - `TypeScriptCompiler`: 使用 AssemblyScript 编译 TS/AS 合约为 WASM

2. **WASM 运行器** (`wasm-runner.ts`)
   - `AssemblyScriptRunner`: 加载和执行 AssemblyScript 编译的 WASM
   - `GoRunner`: 加载和执行 Go 编译的 WASM（占位实现，需要 WASI 支持）

3. **一致性测试框架** (`consistency.test.ts`)
   - `CrossLanguageConsistencyTest`: 核心测试类
   - `TestScenario`: 测试场景定义
   - `TestResult`: 测试结果结构

---

## 📝 使用说明

### 前置条件

1. **安装 TinyGo**（用于编译 Go 合约）
   ```bash
   # macOS
   brew install tinygo
   
   # Linux
   wget https://github.com/tinygo-org/tinygo/releases/download/v0.31.0/tinygo_0.31.0_amd64.deb
   sudo dpkg -i tinygo_0.31.0_amd64.deb
   ```

2. **安装 AssemblyScript**（用于编译 TS/AS 合约）
   ```bash
   npm install -g assemblyscript
   ```

### 运行测试

```bash
# 运行跨语言一致性测试
npm run test:cross-language

# 或使用 Jest 直接运行
npm test -- tests/cross-language/consistency.test.ts
```

---

## ⚠️ 当前实现状态

### ✅ 已完成

- ✅ 测试框架结构设计
- ✅ 测试场景定义格式
- ✅ 结果对比逻辑
- ✅ WASM 编译器集成（Go 和 TS/AS）
- ✅ WASM 加载器基础实现（AssemblyScript）
- ✅ HostABI Mock 环境

### ⚠️ 待完善

- ⚠️ **Go WASM 运行器**：当前为占位实现，需要 WASI 支持
  - 方案1: 使用 `wasmtime-node` 或 `wasmer-node`
  - 方案2: 使用 Node.js 的 WebAssembly API + WASI polyfill
  - 方案3: 通过子进程调用 `wasmtime` CLI

- ⚠️ **HostABI 函数完整映射**：需要根据实际合约 ABI 调整
  - 当前实现为基础函数映射
  - 需要完整实现所有 HostABI 函数的内存操作

- ⚠️ **参数序列化**：需要根据合约 ABI 序列化参数
  - 当前简化实现，假设方法签名简单
  - 需要实现完整的参数序列化/反序列化

---

## 📊 测试场景示例

```typescript
const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Simple Token Transfer',
    contract: 'simple-token',
    method: 'Transfer',
    params: {
      to: '0x1234...',
      amount: '1000',
    },
    expected: {
      errorCode: 0,
      events: [
        {
          name: 'Transfer',
          from: '0x...',
          to: '0x1234...',
          amount: '1000',
        },
      ],
    },
  },
];
```

---

## 🔧 扩展指南

### 添加新的测试场景

1. 在 `TEST_SCENARIOS` 数组中添加新的测试场景定义
2. 确保对应的 Go 和 TS/AS 合约存在
3. 运行测试验证一致性

### 完善 Go WASM 运行器

1. 选择 WASI 运行时（推荐 `wasmtime-node`）
2. 实现完整的 HostABI 函数映射
3. 实现参数序列化/反序列化
4. 实现事件收集逻辑

---

## 📚 相关文档

- [WASM 编译指南](../../docs/COMPILATION.md)
- [集成测试指南](../integration/README.md)
- [Mock HostABI 实现](../integration/mock-hostabi.ts)

---

**最后更新**: 2025-11-11
