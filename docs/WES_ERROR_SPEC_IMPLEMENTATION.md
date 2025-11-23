# WES Error Specification 实施文档

## 概述

本文档记录了 `contract-sdk-js.git`（TypeScript/AssemblyScript 合约 SDK）中 WES Error Specification 的实施情况。

## 实施范围

### 1. 错误码定义

**文件**: `src/framework/types.ts`

- 定义了标准的合约错误码枚举（`ErrorCode`），与 Go SDK 错误码对齐
- 错误码包括：
  - `SUCCESS` (0): 成功
  - `ERROR_INVALID_PARAMS` (1): 参数无效
  - `ERROR_INSUFFICIENT_BALANCE` (2): 余额不足
  - `ERROR_UNAUTHORIZED` (3): 未授权
  - `ERROR_NOT_FOUND` (4): 资源不存在
  - `ERROR_ALREADY_EXISTS` (5): 资源已存在
  - `ERROR_EXECUTION_FAILED` (6): 执行失败
  - `ERROR_INVALID_STATE` (7): 状态无效
  - `ERROR_TIMEOUT` (8): 超时
  - `ERROR_NOT_IMPLEMENTED` (9): 未实现
  - `ERROR_PERMISSION_DENIED` (10): 权限不足
  - `ERROR_UNKNOWN` (999): 未知错误

### 2. 错误码映射

**文件**: `src/framework/error-mapping.ts`

- 提供了合约错误码到 WES 错误码的映射函数
- `contractErrorCodeToWESCode()`: 映射到 WES 错误码字符串
- `contractErrorCodeToUserMessage()`: 映射到用户友好的消息
- `contractErrorCodeToHTTPStatus()`: 映射到 HTTP 状态码

### 3. 错误处理工具

**文件**: `src/framework/error.ts`

- `ErrorCodeMapper`: 提供错误码映射和转换功能
- `fromHostABI()`: 将 HostABI 返回码映射为 ErrorCode
- `toHostABI()`: 将 ErrorCode 转换为 HostABI 返回码
- `getDescription()`: 获取错误码描述（用于调试）

### 4. Result 类型

**文件**: `src/framework/result.ts`

- `Result<T>`: 用于表示操作的成功或失败
- `success()`: 创建成功结果
- `error()`: 创建错误结果
- `isOk()` / `isErr()`: 检查结果状态

## 错误码映射表

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

## 使用示例

### 在合约中返回错误

```typescript
import { Context, ErrorCode, Result } from '@weisyn/contract-sdk-js';

export function transfer(ctx: Context, to: Address, amount: Amount): ErrorCode {
  // 检查余额
  const balance = ctx.getBalance(ctx.getCaller());
  if (balance < amount) {
    return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
  }
  
  // 检查参数
  if (to.isZero()) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  
  // 执行转账
  // ...
  
  return ErrorCode.SUCCESS;
}
```

### 使用 Result 类型

```typescript
import { Result, ErrorCode } from '@weisyn/contract-sdk-js';

export function transfer(ctx: Context, to: Address, amount: Amount): Result<Amount> {
  // 检查余额
  const balance = ctx.getBalance(ctx.getCaller());
  if (balance < amount) {
    return Result.error<Amount>(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
  }
  
  // 执行转账
  const newBalance = balance - amount;
  
  return Result.success(newBalance);
}
```

### 错误码映射示例

```typescript
import { contractErrorCodeToWESCode, contractErrorCodeToUserMessage } from '@weisyn/contract-sdk-js/framework/error-mapping';
import { ErrorCode } from '@weisyn/contract-sdk-js/framework/types';

// 将合约错误码映射到 WES 错误码
const wesCode = contractErrorCodeToWESCode(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
// wesCode = "BC_INSUFFICIENT_BALANCE"

// 获取用户友好的消息
const userMsg = contractErrorCodeToUserMessage(ErrorCode.ERROR_INSUFFICIENT_BALANCE);
// userMsg = "余额不足，无法完成交易。"
```

## 与区块链服务层的集成

合约执行错误会被区块链服务层（`weisyn.git`）捕获并转换为 Problem Details：

1. **合约返回错误码**：例如 `ErrorCode.ERROR_INSUFFICIENT_BALANCE` (2)
2. **服务层转换**：映射到 `BC_INSUFFICIENT_BALANCE`，创建 Problem Details
3. **客户端接收**：客户端 SDK 解析 Problem Details，显示用户友好的错误消息

## 注意事项

1. **合约环境限制**：合约代码在 WASM 环境中运行，不能直接使用 Problem Details
2. **错误码对齐**：合约错误码必须与 Go SDK 和 HostABI 错误码对齐
3. **映射一致性**：错误码映射必须与区块链服务层的映射一致
4. **AssemblyScript 兼容性**：错误码映射函数需要在 AssemblyScript 环境中可用

## 参考

- [WES Error Specification](../../weisyn.git/docs/error-spec/README.md)
- [Go SDK 错误码定义](../contract-sdk-go.git/framework/errors.go)
- [HostABI 错误码定义](../../weisyn.git/internal/core/ispc/hostabi/errors.go)

