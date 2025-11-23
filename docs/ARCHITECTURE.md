# Contract SDK JS - 架构设计（AssemblyScript 合约 SDK）

**版本**: v0.1.0-alpha  
**最后更新**: 2025-11-19

---

## 📋 概述

本文件描述 **TypeScript/AssemblyScript 合约 SDK** 的目标架构，用于在 WES 上编写和部署 WASM 合约。

---

## 🏗️ 模块总览

目标代码结构（规划态）：

```
src/
├── runtime/              # WASM 运行时 & Host ABI 绑定（AssemblyScript）
│   ├── abi.ts            # WES Host ABI 封装（env 调用）
│   ├── env.ts            # 导出的环境函数声明
│   └── memory.ts         # 字符串/字节缓冲区编解码辅助
│
├── framework/            # 合约框架（语言无关但以 AS 实现）
│   ├── contract.ts       # Contract 基类 & 生命周期钩子
│   ├── context.ts        # Context（调用者、区块信息等）
│   ├── storage.ts        # 键值存储/状态访问抽象
│   └── result.ts         # Result / ErrorCode 封装
│
├── helpers/              # 业务语义 Helpers（token / nft / governance 等）
│   ├── token.ts
│   ├── nft.ts
│   ├── governance.ts
│   └── ...
│
├── as/                   # AssemblyScript 入口与装饰器
│   ├── decorators.ts     # @contract, @view, @call 等装饰器
│   └── index.ts          # TS/AS 开发者的主要入口
│
└── index.ts              # JS 侧入口（导出供合约项目引用）
```

---

## 🧩 模块职责

### 1. `runtime/` - Host ABI 绑定

**目标**：在 AssemblyScript 中封装 WES 节点提供的 Host ABI，提供类型安全、易用的底层接口。

- `abi.ts`
  - 封装例如：
    - `host_read_input()`
    - `host_write_output(ptr: u32, len: u32)`
    - `host_get_caller()`
    - `host_log(ptr: u32, len: u32)`
  - 将指针/长度形式的原始接口，转换为字符串/字节数组等高层类型。

- `env.ts`
  - 声明 `@external("env", "...")` 等 AssemblyScript 外部函数签名。

- `memory.ts`
  - 封装 WASM 线性内存上的字符串、字节缓冲区编解码。

### 2. `framework/` - 合约框架

为合约开发者提供统一的编程模型：

- `contract.ts`
  - `abstract class Contract`  
    - 生命周期：
      - `onInit(ctx: Context): void`
      - `onCall(ctx: Context, method: string): void`
    - 错误处理 & 返回码封装。

- `context.ts`
  - 封装当前调用上下文：
    - `ctx.caller: Address`
    - `ctx.blockHeight: u64`
    - `ctx.timestamp: u64`
    - 请求参数读取、解析等。

- `storage.ts`
  - 基于 WES 提供的状态接口，实现：
    - `Storage.get<T>(key: string): T | null`
    - `Storage.set<T>(key: string, value: T): void`
    - 简单序列化策略（JSON / 自定义结构）。

- `result.ts`
  - 定义标准错误码 / 返回值：
    - `enum ErrorCode { SUCCESS, INVALID_PARAMS, EXECUTION_FAILED, ... }`
    - `class Result<T> { code: ErrorCode; value: T | null; message?: string }`

### 3. `helpers/` - 业务语义 API

对标 `contract-sdk-go` 中的 helpers，用 AssemblyScript 实现同等抽象：

- `token.ts`
  - `transfer(from: Address, to: Address, amount: u64): ErrorCode`
  - `mint(to: Address, amount: u64): ErrorCode`
  - `burn(from: Address, amount: u64): ErrorCode`

- `nft.ts`
  - `mintNFT(to: Address, tokenId: string, metadata: string): ErrorCode`
  - `transferNFT(from: Address, to: Address, tokenId: string): ErrorCode`

- `governance.ts`
  - `createProposal(…): ErrorCode`
  - `vote(…): ErrorCode`

这些 Helpers 内部基于 `framework` + `runtime`，不直接暴露底层 ABI。

### 4. `as/` - 装饰器与入口

提供符合 TypeScript/AssemblyScript 习惯的开发体验：

- `decorators.ts`
  - `@contract`：标记一个类为合约入口。
  - `@view`：只读查询方法。
  - `@call`：状态修改方法。

示例（目标形态）：

```ts
@contract
export class TokenContract extends Contract {
  @call
  transfer(to: string, amount: u64): ErrorCode {
    return token.transfer(this.ctx.caller, Address.fromString(to), amount);
  }

  @view
  balanceOf(owner: string): u64 {
    return token.balanceOf(Address.fromString(owner));
  }
}
```

装饰器在编译阶段展开为导出函数（符合 WES ABI 要求）。

---

## 🔗 依赖与边界

- **不依赖 Go SDK**：只依赖 WES 节点公开的 WASM Host ABI。
- **依赖 AssemblyScript 工具链**：
  - 编译目标：`wasm32-unknown-unknown` 或等效配置。
  - 由合约项目侧安装 `assemblyscript` / `asbuild`。
- **与其他 SDK 的关系**：
  - `contract-sdk-go`：Go 合约 SDK，语义与接口对齐，但实现独立。
  - `client-sdk-js`：链外调用 SDK，与本仓库解耦。

---

## 📖 相关文档

- `docs/ARCHITECTURE_PLAN.md` – 分阶段实施计划  
- `_dev/JS_TS_CONTRACT_SUPPORT.md` – JS/TS 合约支持决策与 AssemblyScript 路线说明  
- `_dev/MIGRATION_PLAN.md` – 从模板工具 SDK 向 TS/AS 合约 SDK 迁移的步骤

---

**最后更新**: 2025-11-19

