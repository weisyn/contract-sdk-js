# API 参考文档

**版本**: 0.1.0-alpha  
**最后更新**: 2025-01-23

---

## 概述

本文档提供 `contract-sdk-js` 的完整 API 参考。SDK 采用分层架构：

- **Runtime 层**：HostABI 封装和内存管理
- **Framework 层**：合约框架和交易构建
- **Helpers 层**：业务语义 API

---

## Runtime 层

### HostABI

HostABI 提供了与 WES 节点交互的底层接口。

#### 环境查询

```typescript
// 获取调用者地址
HostABI.getCaller(): Uint8Array

// 获取合约地址
HostABI.getContractAddress(): Uint8Array

// 获取区块高度
HostABI.getBlockHeight(): u64

// 获取区块时间戳
HostABI.getBlockTimestamp(): u64

// 获取交易哈希
HostABI.getTxHash(): Uint8Array

// 获取链 ID
HostABI.getChainID(): Uint8Array
```

#### UTXO 查询

```typescript
// 查询 UTXO
HostABI.utxoLookup(outPoint: OutPoint): UTXO | null
```

#### Resource 查询

```typescript
// 查询 Resource
HostABI.resourceLookup(contentHash: Hash): Resource | null
```

#### 状态输出

```typescript
// 添加状态输出
HostABI.appendStateOutput(
  stateID: Uint8Array,
  stateVersion: u64,
  execHash: Hash,
  publicInputs: Uint8Array | null,
  parentHash: Hash | null
): u32
```

#### 批量输出

```typescript
// 批量创建输出
HostABI.batchCreateOutputsSimple(items: BatchOutputItem[]): u32
```

#### 哈希计算

```typescript
// 计算哈希
HostABI.computeHash(data: Uint8Array): Hash
```

---

## Framework 层

### Contract

合约基类，所有合约都应继承此类。

```typescript
export abstract class Contract {
  protected context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  // 合约入口函数（由子类实现）
  abstract execute(): ErrorCode;
}
```

### Context

合约执行上下文，提供环境信息和交易构建能力。

```typescript
export class Context {
  // 获取调用者地址
  getCaller(): Address

  // 获取合约地址
  getContractAddress(): Address

  // 获取区块高度
  getBlockHeight(): u64

  // 获取区块时间戳
  getBlockTimestamp(): u64

  // 创建交易构建器
  newTransaction(): TransactionBuilder
}
```

### TransactionBuilder

链式 API 用于构建交易。

```typescript
export class TransactionBuilder {
  // 添加资产输出
  addAssetOutput(
    recipient: Address,
    amount: Amount,
    tokenID: TokenID | null,
    lockingConditions: LockingConditions | null
  ): TransactionBuilder

  // 添加状态输出
  addStateOutput(
    stateID: Uint8Array,
    version: u64,
    execHash: Hash,
    publicInputs: Uint8Array | null,
    parentHash: Hash | null
  ): TransactionBuilder

  // 构建并提交交易
  build(): TransactionResult
}
```

---

## Helpers 层

### Token

代币相关业务语义 API。

#### 余额查询

```typescript
Token.balanceOf(address: Address, tokenID: TokenID | null): Amount
```

#### 转账

```typescript
Token.transfer(
  from: Address,
  to: Address,
  amount: Amount,
  tokenID: TokenID | null
): ErrorCode
```

#### 铸造

```typescript
Token.mint(
  to: Address,
  amount: Amount,
  tokenID: TokenID
): ErrorCode
```

#### 销毁

```typescript
Token.burn(
  from: Address,
  amount: Amount,
  tokenID: TokenID
): ErrorCode
```

#### 授权

```typescript
Token.approve(
  owner: Address,
  spender: Address,
  tokenID: TokenID,
  amount: Amount
): ErrorCode
```

#### 冻结

```typescript
Token.freeze(
  target: Address,
  tokenID: TokenID,
  amount: Amount
): ErrorCode
```

#### 空投

```typescript
Token.airdrop(
  from: Address,
  recipients: AirdropRecipient[],
  tokenID: TokenID | null
): ErrorCode
```

#### 批量铸造

```typescript
Token.batchMint(
  recipients: MintRecipient[],
  tokenID: TokenID
): ErrorCode
```

---

### Market

市场相关业务语义 API。

#### 托管

```typescript
Market.escrow(
  buyer: Address,
  seller: Address,
  amount: Amount,
  escrowID: Uint8Array
): ErrorCode
```

#### 释放

```typescript
Market.release(
  from: Address,
  beneficiary: Address,
  amount: Amount,
  vestingID: Uint8Array
): ErrorCode
```

#### 事件语义文档

Market 模块发出的所有事件都遵循统一的语义规范。下表列出了所有事件的结构和字段含义：

| 事件名 | 字段名 | 类型 | 说明 |
|--------|--------|------|------|
| **Escrow** | `buyer` | Address (Base58) | 买方地址 |
| | `seller` | Address (Base58) | 卖方地址 |
| | `token_id` | string | 代币ID（空字符串表示原生币） |
| | `amount` | string | 托管金额（字符串表示） |
| | `escrow_id` | string | 托管ID（由合约生成） |
| | `caller` | Address (Base58) | 调用者地址（创建托管的地址） |
| **Release** | `from` | Address (Base58) | 释放者地址 |
| | `beneficiary` | Address (Base58) | 受益人地址 |
| | `token_id` | string | 代币ID（空字符串表示原生币） |
| | `total_amount` | string | 总释放金额（字符串表示） |
| | `vesting_id` | string | 释放计划ID（由合约生成） |
| | `caller` | Address (Base58) | 调用者地址（创建释放计划的地址） |

**事件格式说明**：
- 所有地址字段使用 Base58 编码（与 Go SDK 保持一致）
- 金额字段使用字符串表示（避免大数精度问题）
- 事件结构作为公共契约，未来只能增加字段、不能删减

---

### Governance

治理相关业务语义 API。

#### 提案

```typescript
Governance.propose(
  proposer: Address,
  proposalID: Uint8Array,
  proposalData: Uint8Array
): ErrorCode
```

#### 投票

```typescript
Governance.vote(
  voter: Address,
  proposalID: Uint8Array,
  support: bool
): ErrorCode
```

#### 投票并计数

```typescript
// 基础版本：仅查询当前投票者的历史状态
Governance.voteAndCount(
  voter: Address,
  proposalID: Uint8Array,
  support: bool,
  threshold: u64
): VoteAndCountResult

// 完整版本：支持投票者列表，遍历所有投票者并聚合统计
Governance.voteAndCountWithVoters(
  voter: Address,
  proposalID: Uint8Array,
  support: bool,
  threshold: u64,
  allVoters: Address[]
): VoteAndCountResult
```

**✅ 实现说明**：

当前版本已实现历史状态查询功能：

- **`voteAndCount`（基础版本）**：
  - ✅ 查询当前投票者的历史状态
  - ✅ 累加历史投票和当前投票
  - ⚠️ 无法统计所有投票者的投票（需要投票者列表）

- **`voteAndCountWithVoters`（完整版本）**：
  - ✅ 支持传入投票者列表
  - ✅ 遍历所有投票者，查询每个投票者的历史状态
  - ✅ 累加所有投票者的投票结果
  - ✅ 自动判断是否通过阈值
  - ✅ 已实现完整功能

**使用建议**：
- 如果提案创建时记录了投票者列表，使用 `voteAndCountWithVoters` 并传入投票者列表
- 如果无法获取投票者列表，使用 `voteAndCount` 基础版本

**技术实现**：
- 使用 `HostABI.queryStateFromChain` 查询链上历史 StateOutput
- 解析 StateOutput 中的投票数据（voteValue: 1=支持, 0=反对）
- 累加所有投票者的投票结果
- 支持查询多个 StateOutput 并累加投票
- 完整的 ISPC 增强语义

**返回值结构**：

```typescript
class VoteAndCountResult {
  totalVotes: u64;      // 总票数
  supportVotes: u64;   // 支持票数
  opposeVotes: u64;    // 反对票数
  passed: bool;         // 是否通过（基于阈值判断）
  threshold: u64;       // 通过阈值
  errorCode: ErrorCode; // 错误码（SUCCESS 表示成功）
}
```

---

## 类型定义

### 基础类型

```typescript
// 地址（20 字节）
type Address = Uint8Array

// 哈希（32 字节）
type Hash = Uint8Array

// 代币 ID
type TokenID = string

// 金额
type Amount = u64

// 错误码
enum ErrorCode {
  SUCCESS = 0x00000000,
  INVALID_PARAMETER = 0x00000001,
  INSUFFICIENT_BALANCE = 0x00000002,
  // ... 更多错误码
}
```

### UTXO

```typescript
interface UTXO {
  outPoint: OutPoint
  outputType: OutputType
  recipient: Address
  amount: Amount
  tokenID: TokenID | null
  lockingConditions: LockingConditions | null
}
```

### Resource

```typescript
interface Resource {
  contentHash: Hash
  category: ResourceCategory
  mimeType: string
  size: u64
  name: string | null
  version: string | null
  metadata: string | null
}
```

---

## 错误码

### 标准错误码定义

合约 SDK 使用统一的错误码集合，与 Go SDK 完全对齐。所有错误码均为 `uint32` 类型。

| 错误码 | 常量名 | 说明 |
|--------|--------|------|
| 0 | `SUCCESS` | 成功 |
| 1 | `ERROR_INVALID_PARAMS` | 参数无效 |
| 2 | `ERROR_INSUFFICIENT_BALANCE` | 余额不足 |
| 3 | `ERROR_UNAUTHORIZED` | 未授权 |
| 4 | `ERROR_NOT_FOUND` | 资源不存在 |
| 5 | `ERROR_ALREADY_EXISTS` | 资源已存在 |
| 6 | `ERROR_EXECUTION_FAILED` | 执行失败 |
| 7 | `ERROR_INVALID_STATE` | 状态无效 |
| 8 | `ERROR_TIMEOUT` | 超时 |
| 9 | `ERROR_NOT_IMPLEMENTED` | 未实现 |
| 10 | `ERROR_PERMISSION_DENIED` | 权限不足 |
| 999 | `ERROR_UNKNOWN` | 未知错误 |

### 错误码映射表

合约执行时，错误码会被区块链服务层（weisyn.git）捕获并转换为 WES Problem Details 格式。下表展示了完整的映射关系：

| 合约错误码 | WES 错误码 | HTTP 状态码 | 用户消息 |
|-----------|-----------|-----------|---------|
| `SUCCESS` (0) | - | 200 | - |
| `ERROR_INVALID_PARAMS` (1) | `COMMON_VALIDATION_ERROR` | 400 | 参数验证失败，请检查输入参数。 |
| `ERROR_INSUFFICIENT_BALANCE` (2) | `BC_INSUFFICIENT_BALANCE` | 422 | 余额不足，无法完成交易。 |
| `ERROR_UNAUTHORIZED` (3) | `COMMON_VALIDATION_ERROR` | 401 | 未授权操作，请检查权限。 |
| `ERROR_NOT_FOUND` (4) | `BC_CONTRACT_NOT_FOUND` | 404 | 资源不存在。 |
| `ERROR_ALREADY_EXISTS` (5) | `COMMON_VALIDATION_ERROR` | 409 | 资源已存在。 |
| `ERROR_EXECUTION_FAILED` (6) | `BC_CONTRACT_INVOCATION_FAILED` | 422 | 合约执行失败，请检查合约逻辑。 |
| `ERROR_INVALID_STATE` (7) | `BC_CONTRACT_INVOCATION_FAILED` | 422 | 合约状态无效，请检查合约状态。 |
| `ERROR_TIMEOUT` (8) | `COMMON_TIMEOUT` | 408 | 执行超时，请稍后重试。 |
| `ERROR_NOT_IMPLEMENTED` (9) | `BC_CONTRACT_INVOCATION_FAILED` | 501 | 功能未实现。 |
| `ERROR_PERMISSION_DENIED` (10) | `COMMON_VALIDATION_ERROR` | 403 | 权限不足，无法执行此操作。 |
| `ERROR_UNKNOWN` (999) | `COMMON_INTERNAL_ERROR` | 500 | 未知错误，请稍后重试或联系管理员。 |

### 错误处理工具

SDK 提供了错误码映射工具函数（位于 `src/framework/error-mapping.ts`）：

```typescript
import { ErrorCode } from '@weisyn/contract-sdk-js/framework';
import { 
  contractErrorCodeToWESCode,
  contractErrorCodeToUserMessage,
  contractErrorCodeToHTTPStatus
} from '@weisyn/contract-sdk-js/framework/error-mapping';

// 将合约错误码映射到 WES 错误码
const wesCode = contractErrorCodeToWESCode(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
// wesCode = "BC_INSUFFICIENT_BALANCE"

// 获取用户友好的消息
const userMsg = contractErrorCodeToUserMessage(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
// userMsg = "余额不足，无法完成交易。"

// 获取 HTTP 状态码
const httpStatus = contractErrorCodeToHTTPStatus(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
// httpStatus = 422
```

### 错误处理流程

1. **合约执行时**：合约返回错误码（`ErrorCode`）
2. **区块链服务层**：捕获错误码并转换为 Problem Details
3. **客户端**：接收 Problem Details 格式的错误响应

更多详细信息，请参考 [WES Error Specification 实施文档](./WES_ERROR_SPEC_IMPLEMENTATION.md)。

---

## 使用示例

### 简单转账

```typescript
import { Contract, Context, ErrorCode } from '@weisyn/contract-sdk-js';
import { Token } from '@weisyn/contract-sdk-js/helpers';

export class MyContract extends Contract {
  execute(): ErrorCode {
    const caller = this.context.getCaller();
    const recipient = new Uint8Array(20); // 目标地址
    const amount: u64 = 1000;

    return Token.transfer(caller, recipient, amount, null);
  }
}
```

### 代币授权

```typescript
import { Token } from '@weisyn/contract-sdk-js/helpers';

const owner = new Uint8Array(20);
const spender = new Uint8Array(20);
const tokenID = 'MY_TOKEN';
const amount: u64 = 5000;

const result = Token.approve(owner, spender, tokenID, amount);
if (result !== ErrorCode.SUCCESS) {
  // 处理错误
}
```

---

## 更多资源

- [开发者指南](./DEVELOPER_GUIDE.md)
- [架构概览](../_dev/ARCHITECTURE_OVERVIEW.md)
- [模板示例](../templates/)
