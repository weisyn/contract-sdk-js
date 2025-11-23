# ERC-20 Token 标准合约模板

完整的 ERC-20 兼容代币合约实现，可用于生产环境。

## 功能

- ✅ **Transfer** - 转账代币
- ✅ **Mint** - 铸造代币
- ✅ **Burn** - 销毁代币
- ✅ **Approve** - 授权代币
- ✅ **Freeze** - 冻结代币
- ✅ **BalanceOf** - 查询余额

## 快速开始

### 构建

```bash
# 确保已安装 AssemblyScript
npm install -g assemblyscript

# 编译合约
asc contract.ts --target release --outFile contract.wasm
```

## 合约接口

### Transfer()

转账代币到指定地址。

**参数格式（JSON）**:
```json
{
  "to": "receiver_address",
  "amount": 100
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Transfer --params '{"to":"<address>","amount":100}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Transfer",
  "from": "<sender_address>",
  "to": "<recipient_address>",
  "token_id": "ERC20_TOKEN",
  "amount": "100"
}
```

### Mint()

铸造新代币到指定地址。

**参数格式（JSON）**:
```json
{
  "to": "receiver_address",
  "amount": 1000
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Mint --params '{"to":"<address>","amount":1000}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Mint",
  "to": "<recipient_address>",
  "token_id": "ERC20_TOKEN",
  "amount": "1000"
}
```

### Burn()

销毁调用者的代币。

**参数格式（JSON）**:
```json
{
  "amount": 500
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Burn --params '{"amount":500}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Burn",
  "from": "<caller_address>",
  "token_id": "ERC20_TOKEN",
  "amount": "500"
}
```

### Approve()

授权指定地址使用代币。

**参数格式（JSON）**:
```json
{
  "spender": "spender_address",
  "amount": 1000
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Approve --params '{"spender":"<address>","amount":1000}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Approve",
  "owner": "<caller_address>",
  "spender": "<spender_address>",
  "token_id": "ERC20_TOKEN",
  "amount": "1000"
}
```

### Freeze()

冻结指定地址的代币。

**参数格式（JSON）**:
```json
{
  "target": "target_address",
  "amount": 1000
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Freeze --params '{"target":"<address>","amount":1000}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Freeze",
  "target": "<target_address>",
  "token_id": "ERC20_TOKEN",
  "amount": "1000",
  "freezer": "<caller_address>"
}
```

### BalanceOf()

查询指定地址的代币余额。

**参数格式（JSON）**:
```json
{
  "address": "address_to_query"
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function BalanceOf --params '{"address":"<address>"}'
```

**返回**: 成功返回 0，返回值包含余额

## 代码说明

本模板展示了：

1. **完整的代币功能**：转账、铸造、销毁、授权、冻结
2. **参数解析**：使用 JSON 解析工具解析合约参数
3. **错误处理**：完整的参数验证和错误码返回
4. **事件发出**：所有操作都会发出相应的事件

## 与 Go SDK 的对应关系

| TS/AS 函数 | Go SDK 函数 | 说明 |
|-----------|------------|------|
| `Transfer()` | `//export Transfer` | 转账代币 |
| `Mint()` | `//export Mint` | 铸造代币 |
| `Burn()` | `//export Burn` | 销毁代币 |
| `Approve()` | `//export Approve` | 授权代币 |
| `Freeze()` | `//export Freeze` | 冻结代币 |
| `BalanceOf()` | `//export BalanceOf` | 查询余额 |

## 安全注意事项

⚠️ **重要提示**：

1. **权限控制**：Mint 和 Freeze 函数应添加权限检查，只有授权地址可以调用
2. **参数验证**：所有参数都应进行严格验证
3. **余额检查**：Transfer 和 Burn 函数会自动检查余额，但应确保逻辑正确

## 参考

- [Token Helper 文档](../../../src/helpers/token.ts)
- [开发者指南](../../../docs/DEVELOPER_GUIDE.md)
- [API 参考](../../../docs/API_REFERENCE.md)

