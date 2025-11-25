# Hello World 合约模板

最简单的 WES 智能合约示例，展示 SDK 的基本用法。

## 功能

- ✅ **Initialize** - 初始化合约
- ✅ **SayHello** - 问候调用者，返回个性化消息

## 快速开始

### 构建

```bash
# 确保已安装 AssemblyScript
npm install -g assemblyscript

# 编译合约
asc contract.ts --target release --outFile contract.wasm
```

编译成功后会生成 `contract.wasm` 文件。

## 合约接口

### Initialize()

初始化合约。

**调用示例**:
```bash
wes contract deploy contract.wasm --function Initialize
```

**返回**: 成功返回 0

### SayHello()

问候调用者并返回个性化消息。

**调用示例**:
```bash
wes contract call <contract_address> --function SayHello
```

**返回**: 成功返回 0，返回值包含问候消息

**事件**:
```json
{
  "name": "Greeting",
  "data": "Hello, <caller_address>!"
}
```

## 代码说明

本模板展示了：

1. **合约基类继承**：继承 `Contract` 类
2. **上下文访问**：使用 `Context.getCaller()` 获取调用者地址
3. **事件发出**：使用 `emitEvent()` 发出事件
4. **返回值设置**：使用 `setReturnData()` 设置返回值
5. **WASM 导出**：使用 `export function` 导出函数供 WASM 调用

## 与 Go SDK 的对应关系

| TS/AS 函数 | Go SDK 函数 | 说明 |
|-----------|------------|------|
| `Initialize()` | `//export Initialize` | 合约初始化 |
| `SayHello()` | `//export SayHello` | 问候函数 |

## 下一步

完成本模板后，可以尝试：

1. **Simple Token 模板**：学习如何使用 Token Helper 实现代币功能
2. **Market Demo 模板**：学习如何使用 Market Helper 实现托管功能

## 参考

- [AssemblyScript 兼容性指南](../../docs/ASSEMBLYSCRIPT_COMPATIBILITY.md)
- [开发者指南](../../docs/DEVELOPER_GUIDE.md)
- [API 参考](../../docs/API_REFERENCE.md)

