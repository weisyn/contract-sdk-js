# 分阶段释放合约示例

**分类**: Market 市场示例  
**难度**: ⭐⭐ 进阶  
**最后更新**: 2025-11-23

---

## 📋 概述

本示例展示如何使用 WES Contract SDK JS 构建分阶段释放（Vesting）合约。适用于代币分配、员工激励、投资解锁等场景。

---

## 🎯 核心功能

| 功能 | 函数 | 说明 |
|------|------|------|
| ✅ **创建释放计划** | `CreateVesting` | 创建分阶段释放计划 |
| ✅ **领取释放代币** | `ClaimVesting` | 领取已解锁的代币 |
| ✅ **查询释放计划** | `QueryVesting` | 查询释放计划的详细信息 |

---

## 🚀 快速开始

```bash
# 编译
asc contract.ts --target release --outFile contract.wasm

# 部署
wes contract deploy --wasm contract.wasm --function Initialize

# 创建释放计划
wes contract call --address {contract_addr} --function CreateVesting --params '{"beneficiary":"...","total_amount":1000000,"vesting_id":"vesting_001"}'
```

---

**最后更新**: 2025-11-23

