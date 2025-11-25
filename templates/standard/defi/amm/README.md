# AMM（自动化做市商）合约示例

**分类**: Advanced DeFi 示例  
**难度**: ⭐⭐⭐⭐ 高级  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建 AMM（Automated Market Maker）合约。通过本示例，您可以学习如何使用 `helpers/token` 和 `helpers/market` 模块实现完整的AMM功能。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **添加流动性** | `AddLiquidity` | 向流动性池添加代币对，获得LP Token |
| ✅ **移除流动性** | `RemoveLiquidity` | 从流动性池移除代币对，销毁LP Token |
| ✅ **代币交换** | `SwapTokens` | 使用恒定乘积公式进行代币交换 |

---

## 🚀 快速开始

```bash
# 编译
asc contract.ts --target release --outFile contract.wasm

# 部署
wes contract deploy --wasm contract.wasm --function Initialize

# 添加流动性
wes contract call --address {contract_addr} --function AddLiquidity --params '{"token_a_id":"TOKEN_A","token_b_id":"TOKEN_B","amount_a":1000,"amount_b":2000}'
```

---

**最后更新**: 2025-11-23

