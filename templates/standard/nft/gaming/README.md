# Ugaming NFT合约示例

**分类**: NFT 示例  
**难度**: ⭐⭐ 进阶  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建Ugaming NFT合约。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **铸造NFT** | `MintNFT` | 铸造唯一的Ugaming NFT |
| ✅ **转移NFT** | `TransferNFT` | 转移NFT所有权 |
| ✅ **查询NFT** | `QueryNFT` | 查询NFT的所有者信息 |

---

## 🚀 快速开始

```bash
asc contract.ts --target release --outFile contract.wasm
wes contract deploy --wasm contract.wasm --function Initialize
```

---

**最后更新**: 2025-11-23
