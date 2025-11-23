# Go/JS Contract SDK 能力对比

## 📌 版本信息

- **版本**：1.0.0
- **状态**：stable
- **最后更新**：2025-11-11
- **最后审核**：2025-11-11
- **所有者**：SDK 团队
- **适用范围**：Go/JS Contract SDK

---

## 📋 概述

本文档对比 WES Contract SDK Go 版本和 JavaScript/TypeScript 版本的能力差异，帮助开发者选择合适的 SDK 和了解两个 SDK 的特性。

**对齐原则**：
- ✅ **统一基准**：除语言特性天然差异外，业务能力必须 Go / JS 双端都有，对齐语义
- ✅ **向上对齐**：缺哪边补哪边，不砍功能、不弱化抽象；一端更"高级/丰富"时，以更高级的一端为基准

---

## ✅ Framework 层能力对比

| 能力 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| **Context（执行上下文）** | | | |
| `GetCaller()` | ✅ | ✅ | 获取调用者地址 |
| `GetContractAddress()` | ✅ | ✅ | 获取当前合约地址 |
| `GetTransactionID()` | ✅ | ✅ | 获取当前交易哈希/ID |
| `GetBlockHeight()` | ✅ | ✅ | 获取当前区块高度 |
| `GetBlockTimestamp()` | ✅ | ✅ | 获取当前区块时间戳 |
| **HostABI 封装** | | | |
| `QueryUTXOBalance()` | ✅ | ✅ | 查询 UTXO 余额 |
| `QueryUTXOLookup()` | ✅ | ✅ | 查询 UTXO 详情 |
| `QueryResourceLookup()` | ✅ | ✅ | 查询资源详情 |
| `QueryResourceExists()` | ✅ | ✅ | 查询资源是否存在 |
| `EmitEvent()` | ✅ | ✅ | 发出链上事件 |
| `LogDebug()` | ✅ | ✅ | 记录调试日志 |
| `AddressBytesToBase58()` | ✅ | ✅ | 地址 Base58 编码 |
| `AddressBase58ToBytes()` | ✅ | ✅ | 地址 Base58 解码 |
| **TransactionBuilder** | | | |
| `Transfer()` | ✅ | ✅ | 添加转账输出 |
| `Mint()` | ✅ | ✅ | 添加铸造输出 |
| `AddStateOutput()` | ✅ | ✅ | 添加状态输出 |
| `AddResourceOutput()` | ✅ | ✅ | 添加资源输出 |
| `Finalize()` | ✅ | ✅ | 完成交易构建 |
| **错误处理** | | | |
| 错误码定义 | ✅ | ✅ | 统一的错误码集合 |
| WES ProblemDetails 映射 | ✅ | ✅ | 错误码到 WES 错误码映射 |
| HTTP 状态码映射 | ✅ | ✅ | 错误码到 HTTP 状态码映射 |

**结论**：✅ **完全对齐**

---

## ✅ Helpers 层能力对比

### 1. Token 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `Transfer()` | ✅ | ✅ | 转账代币 |
| `Mint()` | ✅ | ✅ | 铸造代币 |
| `Burn()` | ✅ | ✅ | 销毁代币（转移到零地址） |
| `Approve()` | ✅ | ✅ | 授权代币 |
| `Freeze()` | ✅ | ✅ | 冻结代币 |
| `Airdrop()` | ✅ | ✅ | 空投代币 |
| `BatchMint()` | ✅ | ✅ | 批量铸造 |

**事件语义**：
- ✅ Transfer 事件：字段名、类型、地址编码（Base58）完全对齐
- ✅ Mint 事件：字段名、类型、地址编码（Base58）完全对齐
- ✅ Burn 事件：字段名、类型、地址编码（Base58）完全对齐

**结论**：✅ **完全对齐**

---

### 2. NFT 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `Mint()` | ✅ | ✅ | 铸造 NFT |
| `Transfer()` | ✅ | ✅ | 转移 NFT |
| `Burn()` | ✅ | ✅ | 销毁 NFT |
| `OwnerOf()` | ✅ | ✅ | 查询所有者（简化实现） |
| `BalanceOf()` | ✅ | ✅ | 查询余额（简化实现） |
| `GetMetadata()` | ✅ | ✅ | 获取元数据（简化实现） |

**实现说明**：
- ✅ 双端都使用 `token.Mint/Transfer/Burn` 实现 NFT 操作（数量为1）
- ⚠️ `OwnerOf/BalanceOf/GetMetadata` 在 EUTXO 模型中需要索引服务支持，当前为简化实现

**结论**：✅ **完全对齐**（简化实现部分一致）

---

### 3. Staking 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `Stake()` | ✅ | ✅ | 质押代币 |
| `Unstake()` | ✅ | ✅ | 解质押代币 |
| `Delegate()` | ✅ | ✅ | 委托代币 |
| `Undelegate()` | ✅ | ✅ | 取消委托 |

**事件语义**：
- ✅ Stake/Unstake/Delegate/Undelegate 事件：字段名、类型、地址编码（Base58）完全对齐

**结论**：✅ **完全对齐**

---

### 4. Governance 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `Propose()` | ✅ | ✅ | 创建提案 |
| `Vote()` | ✅ | ✅ | 投票 |
| `VoteAndCount()` | ✅ | ✅ | 投票并统计 |

**实现说明**：
- ✅ `Propose/Vote` 双端完全对齐
- ✅ `VoteAndCount`：JS 端已实现历史状态查询，支持 `voteAndCount`（基础版）和 `voteAndCountWithVoters`（完整版）
- ✅ Go 端文档保留完整目标语义，JS 端实现已对齐

**结论**：✅ **完全对齐**

---

### 5. Market 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `Escrow()` | ✅ | ✅ | 托管交易 |
| `Release()` | ✅ | ✅ | 分阶段释放 |

**事件语义**：
- ✅ Escrow 事件：字段名（buyer/seller/token_id/amount/escrow_id/caller）、类型、地址编码（Base58）完全对齐
- ✅ Release 事件：字段名（from/beneficiary/token_id/total_amount/vesting_id/caller）、类型、地址编码（Base58）完全对齐

**结论**：✅ **完全对齐**

---

### 6. RWA 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `ValidateAndTokenize()` | ✅ | ✅ | 验证并代币化资产 |
| `ValidateAsset()` | ✅ | ✅ | 验证资产 |
| `ValueAsset()` | ✅ | ✅ | 估值资产 |

**返回值结构**：
- ✅ `ValidateAndTokenizeResult`：字段（TokenID/Validated/ValidationProof/Valuation/ValuationProof/TxHash）完全对齐

**结论**：✅ **完全对齐**

---

### 7. External 模块

| 方法 | Go SDK | JS SDK | 说明 |
|------|--------|--------|------|
| `CallAPI()` | ✅ | ✅ | 调用外部 API（ISPC） |
| `QueryDatabase()` | ✅ | ✅ | 查询外部数据库（ISPC） |
| `DeclareExternalState()` | ✅ | ✅ | 声明外部状态预期 |
| `ProvideEvidence()` | ✅ | ✅ | 提供验证佐证 |
| `QueryControlledState()` | ✅ | ✅ | 查询已验证的外部状态 |

**结论**：✅ **完全对齐**

---

## ✅ 模板能力对比

| 业务分类 | Go 模板 | JS 模板 | 对齐状态 |
|----------|---------|---------|----------|
| **学习模板** | | | |
| Hello World | ✅ | ✅ | ✅ 已对齐 |
| Simple Token | ✅ | ✅ | ✅ 已对齐 |
| Basic NFT | ✅ | ✅ | ✅ 已对齐 |
| Starter Contract | ✅ | ✅ | ✅ 已对齐 |
| Market Demo | ⚠️ | ✅ | ⚠️ JS > Go |
| **标准模板** | | | |
| Token (4个) | ✅ | ✅ | ✅ 已对齐 |
| NFT (8个) | ✅ | ✅ | ✅ 已对齐 |
| Staking (2个) | ✅ | ✅ | ✅ 已对齐 |
| Governance (2个) | ✅ | ✅ | ✅ 已对齐 |
| Market (2个) | ✅ | ✅ | ✅ 已对齐 |
| RWA (7个) | ✅ | ✅ | ✅ 已对齐 |
| DeFi (3个) | ✅ | ✅ | ✅ 已对齐 |

**详细状态**：见 [`_dev/TEMPLATE_ALIGNMENT_STATUS.md`](../_dev/TEMPLATE_ALIGNMENT_STATUS.md)

**结论**：✅ **28/32 模板已对齐 (87.5%)**，仅 1 个 JS > Go 模板（market-demo）待补齐

> 📋 **重要提示**：模板对齐状态以 [`_dev/TEMPLATE_ALIGNMENT_STATUS.md`](../_dev/TEMPLATE_ALIGNMENT_STATUS.md) 为准，这是唯一权威的状态文档。

---

## ✅ 文档能力对比

| 文档类型 | Go SDK | JS SDK | 对齐状态 |
|----------|--------|--------|----------|
| README.md | ✅ | ✅ | ✅ 结构已对齐 |
| DEVELOPER_GUIDE.md | ✅ | ✅ | ✅ 内容已对齐 |
| API_REFERENCE.md | ✅ | ✅ | ✅ 错误码表已对齐 |
| 错误码映射表 | ✅ | ✅ | ✅ 完全对齐 |
| 事件语义文档 | ✅ | ✅ | ✅ 完全对齐 |
| 架构设计文档 | ✅ | ✅ | ✅ 已对齐 |

**结论**：✅ **完全对齐**

---

## ✅ 测试能力对比

| 测试类型 | Go SDK | JS SDK | 对齐状态 |
|----------|--------|--------|----------|
| 单元测试 | ✅ | ✅ | ✅ 已对齐 |
| 集成测试 | ✅ | ✅ | ✅ 已对齐 |
| 跨语言一致性测试 | ⚠️ | ⚠️ | ⚠️ 框架已搭建，WASM 编译/加载待实现 |

**结论**：⚠️ **测试框架已对齐**，跨语言一致性测试实现待完成

---

## 📊 总体对齐状态

| 模块/能力 | 对齐状态 | 说明 |
|----------|----------|------|
| Framework 层 | ✅ 完全对齐 | 所有核心能力已对齐 |
| Token 模块 | ✅ 完全对齐 | 包括事件语义 |
| NFT 模块 | ✅ 完全对齐 | 简化实现部分一致 |
| Staking 模块 | ✅ 完全对齐 | 包括事件语义 |
| Governance 模块 | ✅ 核心对齐 | VoteAndCount 实现路径已标注 |
| Market 模块 | ✅ 完全对齐 | 包括事件语义 |
| RWA 模块 | ✅ 完全对齐 | 返回值结构对齐 |
| External 模块 | ✅ 完全对齐 | ISPC 能力对齐 |
| 模板 | ✅ 高度对齐 | 28/32 模板已对齐 (87.5%)，仅 1 个 JS > Go 待补齐 |
| 文档 | ✅ 完全对齐 | 所有文档已对齐 |
| 测试 | ⚠️ 框架对齐 | 跨语言一致性测试实现待完成 |

**总体结论**：✅ **核心能力已完全对齐**，部分高级模板和跨语言测试实现待补齐

---

## 🔄 持续对齐计划

### 短期（1-2 周）

1. ✅ 统一地址编码（Base58）
2. ✅ 统一事件语义文档
3. ✅ 统一错误码映射
4. ✅ 补齐 JS 端高级模板（已完成 28/32 对齐）
5. ⚠️ 补齐 Go 端 market-demo 模板（JS > Go，1个）

### 中期（1-2 月）

1. ⚠️ 实现跨语言一致性测试（WASM 编译/加载）
2. ⚠️ 完善 NFT OwnerOf/BalanceOf/GetMetadata 实现（基于索引服务）
3. ✅ 实现 Governance.VoteAndCount 的链上历史状态查询（已完成 `voteAndCountWithVoters`）

### 长期（3-6 月）

1. ⚠️ 建立 Contract SDK 与 Client SDK 的能力映射文档
2. ⚠️ 完善错误处理链路文档（合约错误码 → WES ProblemDetails → Client SDK WesError）

---

## 📚 相关文档

- [模板对齐状态](../_dev/TEMPLATE_ALIGNMENT_STATUS.md)
- [API 参考](./API_REFERENCE.md)
- [开发者指南](./DEVELOPER_GUIDE.md)
- [架构设计](./ARCHITECTURE.md)

---

**最后更新**：2025-11-11

