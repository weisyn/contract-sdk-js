# Simple Token 合约模板

展示如何使用 Token Helper 实现代币合约。

## 功能

- ✅ **Transfer** - 转账代币
- ✅ **Mint** - 铸造代币
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
  "token_id": "MY_TOKEN",
  "amount": "100"
}
```

### Mint()

铸造新代币到指定地址。

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
  "token_id": "MY_TOKEN",
  "amount": "1000"
}
```

### BalanceOf()

查询指定地址的代币余额。

**调用示例**:
```bash
wes contract call <contract_address> --function BalanceOf --params '{"address":"<address>"}'
```

**返回**: 成功返回 0，返回值包含余额

## 代码说明

本模板展示了：

1. **Token Helper 使用**：使用 `Token.transfer()`, `Token.mint()`, `Token.balanceOf()` 等 API
2. **业务语义封装**：通过 Helper 层简化代币操作
3. **事件发出**：Token Helper 自动发出 Transfer/Mint 事件

## 与 Go SDK 的对应关系

| TS/AS 函数 | Go SDK 函数 | 说明 |
|-----------|------------|------|
| `Transfer()` | `//export Transfer` | 转账代币 |
| `Mint()` | `//export Mint` | 铸造代币 |
| `BalanceOf()` | `//export BalanceOf` | 查询余额 |

## 下一步

完成本模板后，可以尝试：

1. **ERC20 Token 标准模板**：完整的 ERC20 代币实现
2. **Market Demo 模板**：学习托管和分阶段释放功能

## 参考

- [Token Helper 文档](../../src/helpers/token.ts)
- [开发者指南](../../docs/DEVELOPER_GUIDE.md)
- [API 参考](../../docs/API_REFERENCE.md)

