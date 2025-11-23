# 错误处理集成文档

## 📌 版本信息

- **版本**：1.0.0
- **最后更新**：2025-11-11
- **适用范围**：Contract SDK ↔ Client SDK 错误处理链路

---

## 📋 概述

本文档说明 Contract SDK 和 Client SDK 之间的错误处理集成链路，帮助开发者理解从合约错误码到客户端错误的完整流程。

**错误处理链路**：
```
合约执行错误码 (Contract SDK)
    ↓
WES Problem Details (节点层)
    ↓
客户端错误 (Client SDK)
```

---

## 🔄 错误处理链路

### 1. 合约层（Contract SDK）

**Contract SDK 错误码**：
- `SUCCESS` (0)
- `ERROR_INVALID_PARAMS` (1)
- `ERROR_INSUFFICIENT_BALANCE` (2)
- `ERROR_UNAUTHORIZED` (3)
- `ERROR_NOT_FOUND` (4)
- `ERROR_ALREADY_EXISTS` (5)
- `ERROR_EXECUTION_FAILED` (6)
- `ERROR_INVALID_STATE` (7)
- `ERROR_TIMEOUT` (8)
- `ERROR_NOT_IMPLEMENTED` (9)
- `ERROR_PERMISSION_DENIED` (10)
- `ERROR_UNKNOWN` (999)

**Contract SDK 错误映射**：
- 每个错误码都有对应的 WES 错误码映射
- 每个错误码都有对应的 HTTP 状态码映射
- 每个错误码都有对应的用户消息

**参考文档**：
- [Contract SDK API 参考 - 错误码](./API_REFERENCE.md#错误码)
- [Contract SDK Go 错误映射](../../contract-sdk-go.git/framework/error_mapping.go)
- [Contract SDK JS 错误映射](../src/framework/error-mapping.ts)

---

### 2. 节点层（WES Node）

**WES Problem Details 格式**（基于 RFC7807 + WES 扩展）：

```json
{
  "type": "https://weisyn.io/problems/bc-contract-invocation-failed",
  "title": "Contract Invocation Failed",
  "status": 422,
  "detail": "合约执行失败，请检查合约逻辑。",
  "instance": "/api/v1/contracts/my-contract/invoke",
  
  "code": "BC_CONTRACT_INVOCATION_FAILED",
  "layer": "blockchain",
  "userMessage": "合约执行失败，请检查合约逻辑。",
  "details": {
    "contractErrorCode": 6,
    "contractErrorName": "ERROR_EXECUTION_FAILED"
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-11T10:00:00Z"
}
```

**错误码映射表**：

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

---

### 3. 客户端层（Client SDK）

**Client SDK 错误类型**：

#### Go Client SDK

```go
// ProblemDetails 结构
type ProblemDetails struct {
    // RFC7807 标准字段
    Type     string
    Title    string
    Status   int
    Detail   string
    Instance string
    
    // WES 扩展字段
    Code        string
    Layer       string
    UserMessage string
    Details     map[string]interface{}
    TraceID     string
    Timestamp   string
}

// 检查错误是否为 WES Problem Details
func IsWesError(err error) (*ProblemDetails, bool)
```

#### JS Client SDK

```typescript
// WesProblemDetails 接口
interface WesProblemDetails {
  // RFC7807 标准字段
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  
  // WES 扩展字段
  code: string;
  layer: string;
  userMessage: string;
  details?: Record<string, any>;
  traceId: string;
  timestamp: string;
}

// WesError 类
class WesError extends Error {
  public readonly code: string;
  public readonly layer: string;
  public readonly userMessage: string;
  public readonly detail?: string;
  public readonly status?: number;
  public readonly details?: Record<string, any>;
  public readonly traceId: string;
  public readonly timestamp: string;
  
  static fromProblemDetails(problem: WesProblemDetails): WesError;
}
```

**Client SDK 错误处理流程**：

1. **HTTP 响应解析**：
   - 检查 `Content-Type` 是否为 `application/problem+json`
   - 解析 Problem Details JSON
   - 创建 `WesError` / `ProblemDetails` 实例

2. **JSON-RPC 错误解析**：
   - 检查 JSON-RPC 响应中的 `error` 字段
   - 从 `error.data` 解析 Problem Details
   - 创建 `WesError` / `ProblemDetails` 实例

3. **错误传播**：
   - 所有错误都转换为 `WesError` / `ProblemDetails`
   - 提供 fallback 机制，确保所有错误都有结构化格式

**参考文档**：
- [Client SDK Go 错误处理](../../client-sdk-go.git/docs/WES_ERROR_SPEC_IMPLEMENTATION.md)
- [Client SDK JS 错误处理](../../client-sdk-js.git/docs/WES_ERROR_SPEC_IMPLEMENTATION.md)

---

## 🔗 完整错误处理示例

### 场景：合约执行失败

**1. 合约层（Contract SDK）**：

```typescript
// 合约代码
import { ErrorCode } from '@weisyn/contract-sdk-js/as';

export function transfer(): ErrorCode {
  // 业务逻辑检查失败
  return ErrorCode.ERROR_INSUFFICIENT_BALANCE; // 错误码 2
}
```

**2. 节点层（WES Node）**：

```json
{
  "code": "BC_INSUFFICIENT_BALANCE",
  "layer": "blockchain",
  "status": 422,
  "userMessage": "余额不足，无法完成交易。",
  "details": {
    "contractErrorCode": 2,
    "contractErrorName": "ERROR_INSUFFICIENT_BALANCE"
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-11T10:00:00Z"
}
```

**3. 客户端层（Client SDK）**：

```typescript
// JS Client SDK
import { TokenService } from '@weisyn/client-sdk-js';

try {
  await tokenService.transfer({
    from: 'address1',
    to: 'address2',
    amount: '1000',
    tokenID: 'my_token'
  });
} catch (error) {
  if (WesError.isWesError(error)) {
    console.error('错误码:', error.code); // BC_INSUFFICIENT_BALANCE
    console.error('用户消息:', error.userMessage); // 余额不足，无法完成交易。
    console.error('合约错误码:', error.details?.contractErrorCode); // 2
  }
}
```

```go
// Go Client SDK
import "github.com/weisyn/client-sdk-go/client"

result, err := tokenService.Transfer(ctx, &token.TransferRequest{
    From:   "address1",
    To:     "address2",
    Amount: "1000",
    TokenID: "my_token",
})
if err != nil {
    if pd, ok := client.IsWesError(err); ok {
        log.Printf("错误码: %s", pd.Code) // BC_INSUFFICIENT_BALANCE
        log.Printf("用户消息: %s", pd.UserMessage) // 余额不足，无法完成交易。
        if details, ok := pd.Details["contractErrorCode"].(float64); ok {
            log.Printf("合约错误码: %.0f", details) // 2
        }
    }
}
```

---

## 📚 相关文档

- [Contract SDK API 参考 - 错误码](./API_REFERENCE.md#错误码)
- [Contract SDK Go 错误映射](../../contract-sdk-go.git/framework/error_mapping.go)
- [Contract SDK JS 错误映射](../src/framework/error-mapping.ts)
- [Client SDK Go 错误处理](../../client-sdk-go.git/docs/WES_ERROR_SPEC_IMPLEMENTATION.md)
- [Client SDK JS 错误处理](../../client-sdk-js.git/docs/WES_ERROR_SPEC_IMPLEMENTATION.md)
- [WES Error Specification](../../weisyn.git/docs/error-spec/README.md)

---

**最后更新**：2025-11-11

