# 游戏货币合约示例

**分类**: Token 代币示例  
**难度**: ⭐⭐ 进阶  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建游戏货币合约。游戏货币是一种专门用于游戏内交易的代币，支持游戏内购买、奖励发放等场景。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **转账** | `Transfer` | 游戏内转账 |
| ✅ **铸造** | `Mint` | 铸造新代币（奖励发放） |
| ✅ **销毁** | `Burn` | 销毁代币（道具购买） |
| ✅ **授权** | `Approve` | 授权其他地址使用代币 |
| ✅ **冻结** | `Freeze` | 冻结指定地址的代币 |
| ✅ **空投** | `Airdrop` | 批量空投代币（活动奖励） |

---

## 🚀 快速开始

```bash
# 编译
asc contract.ts --target release --outFile contract.wasm

# 部署
wes contract deploy --wasm contract.wasm --function Initialize

# 调用
wes contract call --address {contract_addr} --function Transfer --params '{"to":"...","amount":100}'
```

---

**最后更新**: 2025-11-23

