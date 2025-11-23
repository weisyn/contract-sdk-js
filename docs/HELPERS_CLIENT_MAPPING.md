# Helpers-Client 映射文档

## 📌 版本信息

- **版本**：1.0.0
- **最后更新**：2025-11-11
- **适用范围**：Contract SDK Helpers ↔ Client SDK Services

---

## 📋 概述

本文档说明 Contract SDK 的 Helpers 层与 Client SDK 的 Services 层之间的对应关系，帮助开发者理解：
- **合约层（on-chain）**：使用 Contract SDK Helpers 实现业务逻辑
- **客户端层（off-chain）**：使用 Client SDK Services 调用合约功能

**核心概念**：
- **Contract SDK Helpers**：合约内的业务语义接口（如 `Token.transfer()`）
- **Client SDK Services**：链外调用合约的客户端接口（如 `TokenService.transfer()`）

---

## 🔗 Helpers ↔ Services 映射表

### 1. Token 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `Token.transfer()` | `TokenService.transfer()` | 转账代币 |
| `Token.mint()` | `TokenService.mint()` | 铸造代币 |
| `Token.burn()` | `TokenService.burn()` | 销毁代币 |
| `Token.approve()` | `TokenService.approve()` | 授权代币 |
| `Token.freeze()` | `TokenService.freeze()` | 冻结代币 |
| `Token.airdrop()` | `TokenService.airdrop()` | 空投代币 |
| `Token.batchMint()` | `TokenService.batchMint()` | 批量铸造 |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { Token } from '@weisyn/contract-sdk-js/helpers';

export function transfer(): ErrorCode {
  const caller = Context.getCaller();
  return Token.transfer(caller, recipientAddress, amount, tokenID);
}
```

**客户端层（Client SDK）**：
```typescript
import { TokenService } from '@weisyn/client-sdk-js';

const tokenService = new TokenService(client);
await tokenService.transfer({
  from: 'address1',
  to: 'address2',
  amount: '1000',
  tokenID: 'my_token'
});
```

---

### 2. NFT 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `NFT.mint()` | `NFTService.mint()` | 铸造 NFT |
| `NFT.transfer()` | `NFTService.transfer()` | 转移 NFT |
| `NFT.burn()` | `NFTService.burn()` | 销毁 NFT |
| `NFT.ownerOf()` | `NFTService.ownerOf()` | 查询所有者 |
| `NFT.balanceOf()` | `NFTService.balanceOf()` | 查询余额 |
| `NFT.getMetadata()` | `NFTService.getMetadata()` | 获取元数据 |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { NFT } from '@weisyn/contract-sdk-js/helpers';

export function mintNFT(): ErrorCode {
  const caller = Context.getCaller();
  return NFT.mint(caller, tokenID, metadata);
}
```

**客户端层（Client SDK）**：
```typescript
import { NFTService } from '@weisyn/client-sdk-js';

const nftService = new NFTService(client);
await nftService.mint({
  to: 'address1',
  tokenID: 'nft_001',
  metadata: { name: 'My NFT', description: '...' }
});
```

---

### 3. Staking 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `Staking.stake()` | `StakingService.stake()` | 质押代币 |
| `Staking.unstake()` | `StakingService.unstake()` | 解质押代币 |
| `Staking.delegate()` | `StakingService.delegate()` | 委托代币 |
| `Staking.undelegate()` | `StakingService.undelegate()` | 取消委托 |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { Staking } from '@weisyn/contract-sdk-js/helpers';

export function stake(): ErrorCode {
  const caller = Context.getCaller();
  return Staking.stake(caller, validatorAddress, amount, tokenID);
}
```

**客户端层（Client SDK）**：
```typescript
import { StakingService } from '@weisyn/client-sdk-js';

const stakingService = new StakingService(client);
await stakingService.stake({
  staker: 'address1',
  validator: 'validator_address',
  amount: '1000',
  tokenID: 'my_token'
});
```

---

### 4. Governance 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `Governance.propose()` | `GovernanceService.propose()` | 创建提案 |
| `Governance.vote()` | `GovernanceService.vote()` | 投票 |
| `Governance.voteAndCount()` | `GovernanceService.voteAndCount()` | 投票并统计 |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { Governance } from '@weisyn/contract-sdk-js/helpers';

export function propose(): ErrorCode {
  const caller = Context.getCaller();
  return Governance.propose(caller, proposalID, proposalData);
}
```

**客户端层（Client SDK）**：
```typescript
import { GovernanceService } from '@weisyn/client-sdk-js';

const governanceService = new GovernanceService(client);
await governanceService.propose({
  proposer: 'address1',
  proposalID: 'proposal_001',
  proposalData: { title: '...', description: '...' }
});
```

---

### 5. Market 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `Market.escrow()` | `MarketService.createEscrow()` | 创建托管 |
| `Market.release()` | `MarketService.releaseEscrow()` | 释放托管 |
| - | `MarketService.refundEscrow()` | 退款托管（客户端层） |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { Market } from '@weisyn/contract-sdk-js/helpers';

export function escrow(): ErrorCode {
  const caller = Context.getCaller();
  return Market.escrow(buyer, seller, amount, escrowID, tokenID);
}
```

**客户端层（Client SDK）**：
```typescript
import { MarketService } from '@weisyn/client-sdk-js';

const marketService = new MarketService(client);
await marketService.createEscrow({
  buyer: 'address1',
  seller: 'address2',
  amount: '1000',
  escrowID: 'escrow_001',
  tokenID: 'my_token'
});
```

---

### 6. RWA 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `RWA.validateAndTokenize()` | `RWAService.validateAndTokenize()` | 验证并代币化资产 |
| `RWA.validateAsset()` | `RWAService.validateAsset()` | 验证资产 |
| `RWA.valueAsset()` | `RWAService.valueAsset()` | 估值资产 |

**示例**：

**合约层（Contract SDK）**：
```typescript
import { RWA } from '@weisyn/contract-sdk-js/helpers';

export function tokenize(): ErrorCode {
  const result = RWA.validateAndTokenize(
    assetID,
    documents,
    validatorAPI,
    validatorEvidence,
    valuationAPI,
    valuationEvidence
  );
  if (result === null) {
    return ErrorCode.ERROR_EXECUTION_FAILED;
  }
  return ErrorCode.SUCCESS;
}
```

**客户端层（Client SDK）**：
```typescript
import { RWAService } from '@weisyn/client-sdk-js';

const rwaService = new RWAService(client);
const result = await rwaService.validateAndTokenize({
  assetID: 'real_estate_001',
  documents: { ... },
  validatorAPI: 'https://validator.example.com/api/validate',
  validatorEvidence: { apiSignature: ..., responseHash: ... },
  valuationAPI: 'https://valuation.example.com/api/value',
  valuationEvidence: { apiSignature: ..., responseHash: ... }
});
```

---

### 7. External 模块

| Contract SDK Helper | Client SDK Service | 说明 |
|---------------------|-------------------|------|
| `External.callAPI()` | - | 合约内调用外部 API（ISPC） |
| `External.queryDatabase()` | - | 合约内查询外部数据库（ISPC） |
| `External.validateAndQuery()` | - | 合约内验证并查询外部状态（ISPC） |

**说明**：
- External 模块主要用于合约内的 ISPC 受控外部交互
- 客户端层通常不需要直接调用 External 功能
- 客户端层通过调用使用 External 的合约方法来间接使用 External 功能

---

## 🎯 使用场景

### 场景 1：开发一个代币合约

**1. 合约层（Contract SDK）**：
```typescript
import { Contract, Context, ErrorCode, call, contract } from '@weisyn/contract-sdk-js/as';
import { Token } from '@weisyn/contract-sdk-js/helpers';

@contract('MyToken')
export class MyTokenContract extends Contract {
  @call('Transfer')
  transfer(to: Uint8Array, amount: u64): ErrorCode {
    const caller = Context.getCaller();
    return Token.transfer(caller, to, amount, null);
  }
}
```

**2. 客户端层（Client SDK）**：
```typescript
import { ContractClient } from '@weisyn/client-sdk-js';

const client = new ContractClient({ nodeURL: 'http://localhost:8080' });
await client.invoke('MyToken', 'Transfer', {
  to: 'address2',
  amount: '1000'
});
```

---

### 场景 2：开发一个 DAO 治理合约

**1. 合约层（Contract SDK）**：
```typescript
import { Governance } from '@weisyn/contract-sdk-js/helpers';

export function propose(): ErrorCode {
  const caller = Context.getCaller();
  return Governance.propose(caller, proposalID, proposalData);
}
```

**2. 客户端层（Client SDK）**：
```typescript
import { GovernanceService } from '@weisyn/client-sdk-js';

const governanceService = new GovernanceService(client);
await governanceService.propose({
  proposer: 'address1',
  proposalID: 'proposal_001',
  proposalData: { title: '...', description: '...' }
});
```

---

## 📚 相关文档

- [Contract SDK Helpers 文档](../src/helpers/README.md)
- [Client SDK Services 文档](../../client-sdk-js.git/docs/api/services.md)
- [错误处理集成文档](./ERROR_HANDLING_INTEGRATION.md)
- [能力对比矩阵](./capability-comparison.md)

---

**最后更新**：2025-11-11

