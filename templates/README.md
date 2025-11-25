# 合约模板目录

本目录包含 WES 智能合约的 TypeScript/AssemblyScript 模板。

## 📁 目录结构

```
templates/
├── learning/              # 学习模板（适合初学者）✅ 5/5 已完成
│   ├── hello-world/      # Hello World 示例 ✅
│   ├── simple-token/     # 简单代币示例 ✅
│   ├── basic-nft/        # 基础 NFT 示例 ✅
│   ├── starter-contract/ # 入门合约骨架 ✅
│   └── market-demo/      # 市场功能示例 ✅ (JS > Go)
│
└── standard/              # 标准模板（可用于生产环境）✅ 27/27 已完成
    ├── token/
    │   ├── erc20-token/  # ERC-20 代币标准实现 ✅
    │   ├── governance-token/  # 治理代币 ✅
    │   ├── payment-token/     # 支付代币 ✅
    │   └── game-currency/     # 游戏货币 ✅
    ├── nft/               # NFT 模板 ✅ (8个模板)
    ├── staking/           # 质押模板 ✅ (2个模板)
    ├── governance/
    │   ├── dao/           # DAO 治理合约实现 ✅
    │   └── proposal-voting/  # 提案投票 ✅
    ├── defi/              # DeFi 模板 ✅ (3个模板)
    ├── market/            # 市场模板 ✅ (2个模板)
    └── rwa/               # RWA 模板 ✅ (7个模板)
```

## 🎯 使用模板

### 学习模板

适合初学者，从简单到复杂：

1. **hello-world** - 最简单的合约示例 ✅
2. **simple-token** - 代币功能示例 ✅
3. **basic-nft** - 基础 NFT 功能示例 ✅
4. **starter-contract** - 入门合约骨架 ✅
5. **market-demo** - 市场功能示例 ✅

**学习模板完成度**: 5/5 (100%) ✅

### 标准模板

可用于生产环境，包含完整功能：

**Token 模块** (4个模板) ✅：
- **erc20-token** - ERC-20 代币标准实现 ✅
- **governance-token** - 治理代币 ✅
- **payment-token** - 支付代币 ✅
- **game-currency** - 游戏货币 ✅

**NFT 模块** (8个模板) ✅：
- digital-art, collectibles, gaming, certificates, identity, tickets, domains, music

**Staking 模块** (2个模板) ✅：
- basic-staking, delegation

**Governance 模块** (2个模板) ✅：
- dao, proposal-voting

**Market 模块** (2个模板) ✅：
- escrow, vesting

**DeFi 模块** (3个模板) ✅：
- lending, amm, liquidity-pool

**RWA 模块** (7个模板) ✅：
- real-estate (residential/commercial), equity, bond, commodity, artwork, intellectual-property

**标准模板完成度**: 27/27 (100%) ✅

**总体对齐状态**: 28/32 已对齐 (87.5%)，1 个 JS > Go (market-demo)

> 📋 **重要提示**：模板对齐状态以 [_dev/TEMPLATE_ALIGNMENT_STATUS.md](../_dev/TEMPLATE_ALIGNMENT_STATUS.md) 为准，这是唯一权威的状态文档。

## 📝 模板结构

每个模板包含：

- `contract.ts` - 合约源码
- `README.md` - 模板说明文档
- `metadata.json` - 模板元数据（用于 Workbench 集成）

## 🚀 快速开始

### 使用模板创建新合约

```bash
# 复制模板到你的项目
cp -r templates/learning/hello-world my-contract

# 进入项目目录
cd my-contract

# 编译合约
asc contract.ts --target release --outFile contract.wasm
```

## 📚 相关文档

- [开发者指南](../docs/DEVELOPER_GUIDE.md)
- [API 参考](../docs/API_REFERENCE.md)
- [AssemblyScript 兼容性指南](../docs/ASSEMBLYSCRIPT_COMPATIBILITY.md)

## ⚠️ 注意事项

- `examples/` 目录已标记为 legacy，建议使用 `templates/` 中的模板
- **模板导入路径**：所有模板统一使用 npm 包路径 `@weisyn/contract-sdk-js/as`，与 Go 模板的模块路径风格一致
  - 模板代码本身只依赖对外公开的 SDK 标识，不依赖仓库相对路径
  - 工作台/编译服务会自动处理包路径到 AssemblyScript `~lib/` 的映射
- 建议先完成学习模板，再使用标准模板
- **模板对齐状态**：详细的对齐状态和 Go/JS 对比请参考 [_dev/TEMPLATE_ALIGNMENT_STATUS.md](../_dev/TEMPLATE_ALIGNMENT_STATUS.md)

