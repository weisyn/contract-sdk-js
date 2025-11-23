# Contract SDK JS - 架构规划（AssemblyScript 合约 SDK）

**版本**: v0.1.0-alpha  
**最后更新**: 2025-11-19

---

## 📋 概述

本文件规划 **TypeScript/AssemblyScript 合约 SDK** 的实现路径：  
记录从早期"模板工具"阶段到当前完整合约 SDK 的演进过程。

---

## 🎯 总体目标

- 提供一套完整的 TS/AS 合约开发体验：
  - 合约框架（Contract / Context / Storage 等）。
  - 业务 Helpers（token / nft / governance 等）。
  - AssemblyScript 编译配置与 ABI 绑定。
- 产出 WASM 合约，可直接由 WES 节点加载执行。
- 在不破坏现有仓库结构的前提下，渐进式重构。

---

## Phase 0：对齐目标 & 清理文档（已完成）

- [x] 更新顶层 `README.md`，将目标改为“TS/AssemblyScript 合约 SDK”。
- [x] 更新 `docs/ARCHITECTURE.md`，描述 TS/AS 合约 SDK 的模块设计。
- [x] 更新 `docs/ARCHITECTURE_PLAN.md`（本文件），写清实施阶段。
- [x] 更新 `_dev/MIGRATION_PLAN.md`，从模板工具迁移到合约 SDK。
- [x] 更新 `_dev/JS_TS_CONTRACT_SUPPORT.md`，明确采用 AssemblyScript 路线。

> ✅ **已完成**：框架层、Helpers 层、运行时层均已实现，文档已对齐 Go SDK。

---

## Phase 1：最小 TS/AS 合约运行时（MVP Runtime）

**目标**：实现最小可用的 AssemblyScript 运行时和 ABI 绑定，支持一个“Hello World” 合约。

### 任务

- [ ] 定义 WES 合约 WASM ABI（在文档中固化）：
  - 必须导出的函数签名（如 `Init`, `Handle`, `Query` 或等价形式）。
  - 内存模型：字符串/字节传递方式。
  - 错误码与返回值规范。

- [ ] 创建 `src/runtime/` 模块：
  - [ ] `env.ts`：声明 Host 提供的外部函数（`@external("env", "...")`）。
  - [ ] `abi.ts`：封装 Host 调用，提供 TS 友好接口。
  - [ ] `memory.ts`：实现字符串/字节与 WASM 内存之间的转换。

- [ ] 创建 `src/framework/` 最小骨架：
  - [ ] `contract.ts`：定义 `Contract` 抽象类和基础流程。
  - [ ] `context.ts`：封装调用上下文（caller / block / timestamp）。
  - [ ] `result.ts`：基础错误码与返回类型。

- [x] ✅ 提供一个最小示例：
  - [x] ✅ `templates/learning/hello-world/`：一个简单的"返回字符串/日志"的合约。
  - [x] ✅ 文档：如何使用 AssemblyScript 编译该模板为 WASM。

### 验收标准

- [ ] 可以编写一个简单的 AssemblyScript 合约，并成功编译为 WASM。
- [ ] WASM 能被 WES 节点加载并执行（至少完成一次端到端试验）。

---

## Phase 2：合约框架完善 & 基础 Helpers

**目标**：在最小运行时上，提供更完整的合约框架和若干基础 Helpers。

### 任务

- [ ] 完善 `framework/`：
  - [ ] `storage.ts`：提供键值存储抽象。
  - [ ] 增强 `Context`，加入更多链上信息（高度、链 ID 等）。
  - [ ] 提供事件/日志封装（如 `emitEvent(name, fields)`）。

- [ ] 实现基础 `token` Helper：
  - [ ] 对齐 `contract-sdk-go/helpers/token` 的核心方法。
  - [ ] 在 TS/AS 中提供类型安全的 API：
    - `transfer`, `mint`, `burn`, `balanceOf` 等。

- [ ] 实现简单的 `nft` Helper（最小版本）：
  - [ ] 支持 `mintNFT`, `transferNFT`, `ownerOf`。

- [ ] 为 Helpers 添加单元测试（尽可能在 Node/wasm 环境下）。

### 验收标准

- [ ] 可以用 TS/AS 写出一个最小的 Token 合约（基于 Helpers）。
- [ ] 编译后的 WASM 可以在 WES 节点上完成一次简单转账流程。

---

## Phase 3：模板与示例库（TS/AS 合约）

**目标**：为 TS/AS 合约提供标准模板和学习示例，类似 Go SDK 的 templates。

### 任务

- [ ] 定义 TS/AS 模板目录结构（规划类似 Go 的 `learning` / `standard`）。
- [ ] 为以下场景各提供至少 1 个模板：
  - [ ] Learning：Hello World / Simple Token / Basic NFT。
  - [ ] Standard：ERC-20 风格 Token / 简单 NFT / 基础治理。

- [x] ✅ 在 `templates/` 中提供：
  - [x] ✅ 合约代码 + `asconfig.json` / `package.json`。
  - [x] ✅ 编译脚本（如 `npm run asbuild`）。
  - [x] ✅ 部署与调用示例（结合 `client-sdk-js` / CLI）。

- [ ] 更新文档：
  - [ ] `docs/DEVELOPER_GUIDE.md`：基于 TS/AS 的完整开发流程。
  - [ ] `docs/API_REFERENCE.md`：补充 Helpers / 装饰器等 API。

### 验收标准

- [ ] 至少有 3–5 个可运行的 TS/AS 模板合约。
- [ ] 文档中可以给出清晰的“从 0 到部署”教程。

---

## Phase 4：Workbench / 工具链集成

**目标**：把 TS/AS 合约 SDK 接入到 `contract-workbench` 等上层工具中。

### 任务

- [ ] 提供 Workbench 集成指南：
  - [ ] 如何在前端 UI 中选择 “TS/AS 合约” 模式。
  - [ ] 如何调用本 SDK 的模板/脚手架功能。

- [ ] 提供 CLI 或脚手架：
  - [ ] `npx create-wes-contract-as`（示意）创建 TS/AS 合约项目骨架。

- [ ] 评估与 Go 模板/SDK 的共存策略：
  - [ ] 同一 Workbench 中，用户可以选择 Go 合约或 TS/AS 合约。
  - [ ] 文档中给出差异对比和推荐场景。

### 验收标准

- [ ] Workbench 中可以通过图形界面使用 TS/AS 合约模板。
- [ ] 至少有一个端到端的“TS/AS 合约开发体验”被完整走通并记录。

---

## Phase 5：优化与稳定

**目标**：在基础功能完成后，进行性能优化、开发体验改进和文档补全。

### 任务

- [ ] 性能与体积优化：
  - [ ] 评估 AssemblyScript 输出 WASM 体积与执行性能。
  - [ ] 优化常用 Helpers 的实现。

- [ ] 开发体验：
  - [ ] 提供类型更完备的声明文件。
  - [ ] VSCode 代码片段与模板。

- [ ] 文档与示例：
  - [ ] 增强错误排查、调试指南。
  - [ ] 增补高级用法示例。

---

## 📌 备注

- 现有的“模板工具”代码（元数据 + Go 代码生成）将作为历史阶段保留，但不会再扩展；  
  后续可以选择：
  - 保留在仓库中，用 `_dev/history` 记录；或
  - 迁出到独立工具仓库（视团队决策）。

---

**最后更新**: 2025-11-19

