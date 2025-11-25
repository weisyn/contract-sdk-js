# 集成测试指南

## 概述

集成测试用于验证合约 SDK 与 WES 节点的完整集成，包括：
- HostABI 环境模拟
- 合约编译验证
- 合约执行流程测试

## 测试结构

```
tests/integration/
├── README.md              # 本文档
├── mock-hostabi.ts        # HostABI Mock 实现
├── contract.test.ts       # 合约执行测试
└── compile-test.ts        # 编译验证测试
```

## Mock HostABI

`MockHostABI` 类提供了完整的 HostABI 环境模拟，包括：

- **环境查询**：调用者地址、合约地址、区块高度、时间戳等
- **UTXO 查询**：模拟 UTXO 存储和查询
- **Resource 查询**：模拟 Resource 存储和查询

### 使用示例

```typescript
import { MockHostABI } from './mock-hostabi';
import { OutPoint, UTXO } from '../../src/framework/types';

const mockHostABI = new MockHostABI();

// 设置调用者
mockHostABI.setCaller(new Uint8Array(20));

// 添加 UTXO
const outPoint = new OutPoint(new Uint8Array(32), 0);
const utxo: UTXO = {
  outPoint: outPoint,
  outputType: OutputType.ASSET,
  recipient: new Uint8Array(20),
  amount: 1000,
  tokenID: null,
  lockingConditions: null,
};
mockHostABI.addUTXO(outPoint, utxo);

// 查询 UTXO
const result = mockHostABI.utxoLookup(outPoint);
```

## 编译测试

编译测试验证模板可以成功编译为 WASM：

```bash
# 运行编译测试
npm run test:integration
```

## 合约执行测试

合约执行测试需要：
1. 编译 WASM 合约
2. 加载 WASM 模块
3. 调用合约入口函数
4. 验证执行结果

### 当前状态

- ✅ Mock HostABI 实现完成
- ✅ 基础环境测试完成
- ⚠️ 实际合约执行测试待实现（需要 WASM 加载器）

## 未来改进

1. **WASM 加载器集成**
   - 使用 `@assemblyscript/loader` 加载编译后的 WASM
   - 实现合约入口函数调用

2. **完整执行流程测试**
   - HelloWorld 合约执行
   - Token 合约转账测试
   - Market 合约托管测试

3. **与测试节点集成**
   - 连接本地测试节点
   - 执行真实交易
   - 验证链上状态

## 运行测试

```bash
# 运行所有集成测试
npm run test:integration

# 运行特定测试文件
npm test -- tests/integration/contract.test.ts
```

