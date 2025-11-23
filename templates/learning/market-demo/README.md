# Market Demo 合约模板

展示如何使用 Market Helper 实现托管和分阶段释放功能。

## 功能

- ✅ **CreateEscrow** - 创建托管
- ✅ **CreateVesting** - 创建分阶段释放计划

## 快速开始

### 构建

```bash
# 确保已安装 AssemblyScript
npm install -g assemblyscript

# 编译合约
asc contract.ts --target release --outFile contract.wasm
```

## 合约接口

### CreateEscrow()

创建代币托管。

**调用示例**:
```bash
wes contract call <contract_address> --function CreateEscrow --params '{"seller":"<address>","amount":10000,"escrowID":"escrow_123"}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Escrow",
  "buyer": "<buyer_address>",
  "seller": "<seller_address>",
  "token_id": "",
  "amount": "10000",
  "escrow_id": "escrow_123"
}
```

### CreateVesting()

创建分阶段释放计划。

**调用示例**:
```bash
wes contract call <contract_address> --function CreateVesting --params '{"beneficiary":"<address>","totalAmount":100000,"vestingID":"vesting_123"}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Release",
  "from": "<from_address>",
  "beneficiary": "<beneficiary_address>",
  "token_id": "",
  "total_amount": "100000",
  "vesting_id": "vesting_123"
}
```

## 代码说明

本模板展示了：

1. **Market Helper 使用**：使用 `Market.escrow()` 和 `Market.release()` API
2. **托管功能**：将代币托管给第三方，使用 StateOutput 记录托管状态
3. **分阶段释放**：创建代币归属计划，使用 StateOutput 记录释放计划状态

## 与 Go SDK 的对应关系

| TS/AS 函数 | Go SDK 函数 | 说明 |
|-----------|------------|------|
| `CreateEscrow()` | `//export CreateEscrow` | 创建托管 |
| `CreateVesting()` | `//export CreateVesting` | 创建分阶段释放计划 |

## 下一步

完成本模板后，可以尝试：

1. **Escrow 标准模板**：完整的托管合约实现
2. **Vesting 标准模板**：完整的分阶段释放合约实现

## 参考

- [Market Helper 文档](../../src/helpers/market.ts)
- [开发者指南](../../docs/DEVELOPER_GUIDE.md)
- [API 参考](../../docs/API_REFERENCE.md)

