# 导入路径指南

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

本文档说明如何在合约代码中正确导入 SDK 模块。

---

## ⚠️ 重要说明

**AssemblyScript 不支持 npm 包名导入**，必须使用相对路径导入。

---

## 📋 导入方式

### 在合约模板中（templates/）

```typescript
// ✅ 正确：使用相对路径
import { Contract, Context, ErrorCode, contract, call } from '../src/as';
import { Token } from '../src/as';

// ❌ 错误：使用 npm 包名（AssemblyScript 不支持）
import { Contract } from '@weisyn/contract-sdk-js/as';
```

### 在独立合约项目中

如果你的合约代码在独立的项目中，需要：

1. **将 SDK 源码复制到项目中**，或
2. **使用相对路径指向 SDK 源码目录**

```typescript
// 假设 SDK 源码在 ../contract-sdk-js/src/
import { Contract, Context, ErrorCode } from '../contract-sdk-js/src/as';
```

---

## 📚 可用的导入路径

### 统一入口（推荐）

```typescript
// 从 as 层导入（推荐）
import { Contract, Context, ErrorCode, Token, Governance } from '../src/as';
```

### 分层导入

```typescript
// Runtime 层
import { HostABI } from '../src/runtime';

// Framework 层
import { Contract, Context, Storage } from '../src/framework';

// Helpers 层
import { Token, NFT, Governance, Staking, Market } from '../src/helpers';
```

---

## 🔍 常见问题

### 问题 1：找不到模块

**错误信息**：
```
ERROR TS6054: File '~lib/@weisyn/contract-sdk-js/as.ts' not found.
```

**原因**：使用了 npm 包名导入

**解决方案**：改为相对路径导入

### 问题 2：路径错误

**错误信息**：
```
ERROR TS6054: File '~lib/../src/as.ts' not found.
```

**原因**：相对路径不正确

**解决方案**：
- 检查当前文件位置
- 确认 SDK 源码目录位置
- 调整相对路径

---

## 📝 示例

### Hello World 合约

```typescript
import { Contract, Context, ErrorCode, contract, call } from '../src/as';

@contract('HelloWorld')
export class HelloWorldContract extends Contract {
  // ...
}
```

### Token 合约

```typescript
import { Contract, Context, ErrorCode, contract, call } from '../src/as';
import { Token } from '../src/as';

@contract('ERC20Token')
export class ERC20TokenContract extends Contract {
  // ...
}
```

---

## 🔗 相关文档

- [编译指南](./COMPILATION.md) - 详细的编译说明
- [API 参考](./API_REFERENCE.md) - 完整 API 文档
- [开发者指南](./DEVELOPER_GUIDE.md) - 使用指南

---

**最后更新**：2025-11-19

