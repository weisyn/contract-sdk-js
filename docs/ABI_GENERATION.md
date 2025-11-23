# ABI 元数据生成指南

**版本**: 0.1.0-alpha  
**最后更新**: 2025-01-23

---

## 概述

ABI（Application Binary Interface）元数据描述了合约的方法签名、参数类型和返回值，供 Workbench 和其他工具使用。

---

## ABI 格式

生成的 ABI JSON 格式如下：

```json
{
  "methods": [
    {
      "name": "SayHello",
      "type": "write",
      "parameters": [],
      "returnType": "number",
      "isReferenceOnly": false
    },
    {
      "name": "Transfer",
      "type": "write",
      "parameters": [
        {
          "name": "to",
          "type": "address",
          "required": true
        },
        {
          "name": "amount",
          "type": "number",
          "required": true
        }
      ],
      "returnType": "number"
    }
  ],
  "version": "1.0.0"
}
```

### 字段说明

- **methods**: 方法列表
  - **name**: 方法名称
  - **type**: 方法类型（`read` 或 `write`）
  - **parameters**: 参数列表
    - **name**: 参数名称
    - **type**: 参数类型（`address`, `number`, `string`, `bytes`, `boolean` 等）
    - **required**: 是否必需
  - **returnType**: 返回值类型
  - **isReferenceOnly**: 是否仅引用调用（只读方法）

---

## 生成 ABI

### 为单个模板生成 ABI

```bash
# 使用脚本
bash scripts/generate-abi.sh templates/learning/hello-world

# 或使用 npm 脚本
npm run generate:abi:template -- templates/learning/hello-world
```

### 为所有模板生成 ABI

```bash
# 使用脚本
bash scripts/generate-all-abi.sh

# 或使用 npm 脚本
npm run generate:abi
```

### 直接使用工具

```bash
# 使用 ts-node
ts-node tools/generate-abi.ts templates/learning/hello-world/contract.ts

# 指定输出文件
ts-node tools/generate-abi.ts templates/learning/hello-world/contract.ts output/abi.json
```

---

## 工作原理

ABI 生成工具通过以下方式提取方法信息：

1. **解析 onCall 方法**：查找 `onCall` 方法中的函数路由（`if (functionName === '...')`）
2. **提取函数定义**：根据函数名查找对应的函数定义
3. **解析参数和返回值**：从函数签名中提取参数类型和返回值类型
4. **判断方法类型**：根据方法名前缀和返回值类型判断是 `read` 还是 `write`

### 方法类型判断规则

以下方法名前缀会被识别为只读方法（`read`）：
- `get*`
- `query*`
- `is*`
- `has*`
- `balance*`
- `total*`
- `count*`

---

## 类型映射

AssemblyScript/TypeScript 类型会被映射到 ABI 类型：

| 源类型 | ABI 类型 |
|--------|---------|
| `u32`, `u64`, `i32`, `i64` | `number` |
| `bool` | `boolean` |
| `string` | `string` |
| `Uint8Array` | `bytes` |
| `Address` | `address` |
| `Hash` | `bytes32` |
| `TokenID` | `string` |
| `Amount` | `number` |
| `ErrorCode` | `number` |

---

## 示例

### Hello World 合约

```typescript
onCall(functionName: string, params: Uint8Array): ErrorCode {
  if (functionName === 'SayHello') {
    return this.sayHello();
  }
  return ErrorCode.ERROR_NOT_FOUND;
}

sayHello(): ErrorCode {
  // ...
}
```

生成的 ABI：

```json
{
  "methods": [
    {
      "name": "SayHello",
      "type": "write",
      "parameters": [],
      "returnType": "number"
    }
  ]
}
```

### Token Transfer

```typescript
onCall(functionName: string, params: Uint8Array): ErrorCode {
  if (functionName === 'Transfer') {
    return this.transfer(params);
  }
}

transfer(params: Uint8Array): ErrorCode {
  // 解析 params: to (Address), amount (Amount)
}
```

生成的 ABI：

```json
{
  "methods": [
    {
      "name": "Transfer",
      "type": "write",
      "parameters": [
        {"name": "to", "type": "address", "required": true},
        {"name": "amount", "type": "number", "required": true}
      ],
      "returnType": "number"
    }
  ]
}
```

---

## 限制

当前 ABI 生成工具的限制：

1. **参数解析**：只能解析简单的参数类型，复杂类型（如嵌套对象）需要手动补充
2. **方法发现**：只能发现通过 `onCall` 路由的方法，直接导出的方法需要手动添加
3. **类型推断**：某些复杂类型可能无法正确推断，需要手动修正

---

## 与 Workbench 集成

生成的 ABI JSON 文件可以被 Workbench 读取，用于：

1. **方法列表展示**：显示合约的所有可用方法
2. **参数表单生成**：根据参数类型生成输入表单
3. **调用代码生成**：生成调用合约的示例代码

---

## 故障排除

### 常见错误

1. **找不到方法**
   - 确保方法在 `onCall` 中有路由
   - 检查方法名拼写是否正确

2. **类型映射错误**
   - 检查类型是否在映射表中
   - 手动修正 ABI JSON 文件

3. **参数解析失败**
   - 确保参数格式正确（`name: type`）
   - 复杂参数需要手动补充

---

## 相关文档

- [API 参考](./API_REFERENCE.md)
- [构建指南](./BUILD_GUIDE.md)
- [开发者指南](./DEVELOPER_GUIDE.md)

