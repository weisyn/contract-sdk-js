# DAO 治理合约模板

完整的 DAO（去中心化自治组织）治理合约实现，可用于生产环境。

## 功能

- ✅ **CreateProposal** - 创建治理提案
- ✅ **Vote** - 对提案进行投票
- ✅ **VoteAndCount** - 投票并统计结果

## 快速开始

### 构建

```bash
# 确保已安装 AssemblyScript
npm install -g assemblyscript

# 编译合约
asc contract.ts --target release --outFile contract.wasm
```

## 合约接口

### CreateProposal()

创建新的治理提案。

**参数格式（JSON）**:
```json
{
  "proposal_id": "proposal_001",
  "title": "Proposal Title",
  "description": "Proposal description (optional)"
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function CreateProposal --params '{"proposal_id":"proposal_001","title":"Proposal Title"}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Propose",
  "proposer": "<caller_address>",
  "proposal_id": "proposal_001",
  "proposal_data": "Proposal Title"
}
```

### Vote()

对提案进行投票。

**参数格式（JSON）**:
```json
{
  "proposal_id": "proposal_001",
  "support": true
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function Vote --params '{"proposal_id":"proposal_001","support":true}'
```

**返回**: 成功返回 0

**事件**:
```json
{
  "name": "Vote",
  "voter": "<caller_address>",
  "proposal_id": "proposal_001",
  "support": true
}
```

### VoteAndCount()

投票并统计结果。

**参数格式（JSON）**:
```json
{
  "proposal_id": "proposal_001",
  "support": true,
  "threshold": 50
}
```

**调用示例**:
```bash
wes contract call <contract_address> --function VoteAndCount --params '{"proposal_id":"proposal_001","support":true,"threshold":50}'
```

**返回**: 成功返回 0，返回值包含投票统计结果

**返回值格式**:
```json
{
  "totalVotes": "10",
  "supportVotes": "7",
  "opposeVotes": "3",
  "passed": true,
  "threshold": "50"
}
```

## 代码说明

本模板展示了：

1. **DAO 治理功能**：提案创建、投票、统计
2. **Governance Helper 使用**：使用 `Governance.propose()`, `Governance.vote()`, `Governance.voteAndCount()` 等 API
3. **投票统计**：自动统计投票结果并判断是否通过阈值

## 与 Go SDK 的对应关系

| TS/AS 函数 | Go SDK 函数 | 说明 |
|-----------|------------|------|
| `CreateProposal()` | `//export CreateProposal` | 创建提案 |
| `Vote()` | `//export Vote` | 投票 |
| `VoteAndCount()` | `//export VoteAndCount` | 投票并统计 |

## 安全注意事项

⚠️ **重要提示**：

1. **提案唯一性**：应检查提案ID的唯一性，避免重复创建
2. **投票权限**：应检查投票者是否有投票权限（例如持有治理代币）
3. **投票期限**：应实现投票期限检查，过期提案不能投票
4. **提案执行**：应实现提案执行功能，只有通过的提案才能执行

## 参考

- [Governance Helper 文档](../../../src/helpers/governance.ts)
- [开发者指南](../../../docs/DEVELOPER_GUIDE.md)
- [API 参考](../../../docs/API_REFERENCE.md)

