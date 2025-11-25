# 数字艺术NFT合约示例

**分类**: NFT 示例  
**难度**: ⭐⭐⭐ 高级  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建数字艺术NFT合约。通过本示例，您可以学习如何使用 `helpers/nft` 模块创建和管理NFT，实现数字艺术品的代币化。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **铸造NFT** | `MintNFT` | 铸造唯一的数字艺术NFT，包含元数据 |
| ✅ **转移NFT** | `TransferNFT` | 转移NFT所有权 |
| ✅ **查询NFT** | `QueryNFT` | 查询NFT的所有者信息 |

---

## 🚀 快速开始

```bash
# 编译
asc contract.ts --target release --outFile contract.wasm

# 部署
wes contract deploy --wasm contract.wasm --function Initialize

# 铸造NFT
wes contract call --address {contract_addr} --function MintNFT --params '{"to":"...","token_id":"art_001","name":"Sunset","artist":"Alice"}'
```

---

**最后更新**: 2025-11-23

