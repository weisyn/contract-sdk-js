# commodity 代币化合约示例

**分类**: RWA 示例  
**难度**: ⭐⭐⭐ 高级  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建commodity代币化合约。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **资产代币化** | `Tokenizecommodity` | 将资产代币化 |
| ✅ **资产转移** | `Transfercommodity` | 转移资产份额 |
| ✅ **资产托管** | `Escrowcommodity` | 创建资产托管 |
| ✅ **分红释放** | `ReleaseDividend` | 创建分阶段分红释放 |

---

## 🚀 快速开始

```bash
asc contract.ts --target release --outFile contract.wasm
wes contract deploy --wasm contract.wasm --function Initialize
```

---

**最后更新**: 2025-11-23
