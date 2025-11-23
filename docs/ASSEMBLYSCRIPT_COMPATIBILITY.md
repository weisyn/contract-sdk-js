# AssemblyScript 兼容性指南

---

## 📌 版本信息

- **版本**：1.0
- **状态**：stable
- **最后更新**：2025-11-19
- **最后审核**：2025-11-19
- **所有者**：WES SDK 团队
- **适用范围**：使用 AssemblyScript 编写 WES 智能合约的开发者

---

## 🎯 文档定位

本文档记录 AssemblyScript 的限制和常见兼容性问题，帮助开发者避免常见错误。

---

## ⚠️ AssemblyScript 限制

AssemblyScript 是 TypeScript 的子集，**不支持**以下 TypeScript 特性：

### 1. 联合类型（Union Types）

**不支持**：`string | number`、`A | B | null` 等联合类型

**错误示例**：
```typescript
// ❌ 错误：不支持联合类型
function example(param: string | number): void { }
function getValue(): string | null { }
```

**正确做法**：
```typescript
// ✅ 正确：使用单一类型或分离方法
function exampleString(param: string): void { }
function exampleNumber(param: number): void { }

// 或使用类封装
class Result {
  value: string;
  isNull: bool;
}
```

**实际案例**：
- `string | symbol` → 改为 `string`
- `string | Uint8Array` → 分离为 `emitEventString()` 和 `emitEventBytes()`
- `{ value: Uint8Array; version: u64 } | null` → 使用 `StateResult` 类

---

### 2. 可选属性（Optional Properties）

**不支持**：`interface` 中的可选属性 `property?: Type`

**错误示例**：
```typescript
// ❌ 错误：不支持可选属性
interface OutputDescriptor {
  to?: Address;
  amount?: Amount;
}
```

**正确做法**：
```typescript
// ✅ 正确：使用类，所有属性必填，用 null 或默认值
class OutputDescriptor {
  to: Address | null;
  amount: Amount;
  
  constructor(to: Address | null = null, amount: Amount = 0) {
    this.to = to;
    this.amount = amount;
  }
}
```

**实际案例**：
- `OutputDescriptor` interface → 改为 class，所有属性必填

---

### 3. 字符串枚举（String Enums）

**不支持**：枚举值使用字符串

**错误示例**：
```typescript
// ❌ 错误：不支持字符串枚举
enum OutputType {
  ASSET = 'asset',
  STATE = 'state',
}
```

**正确做法**：
```typescript
// ✅ 正确：使用数值枚举
enum OutputType {
  ASSET = 0,
  STATE = 1,
  RESOURCE = 2,
}
```

**实际案例**：
- `OutputType` 枚举 → 改为数值枚举（0, 1, 2）

---

### 4. 对象字面量返回类型

**不支持**：函数返回对象字面量类型

**错误示例**：
```typescript
// ❌ 错误：不支持对象字面量返回类型
function finalize(): { success: bool; errorCode: ErrorCode } {
  return { success: true, errorCode: ErrorCode.SUCCESS };
}
```

**正确做法**：
```typescript
// ✅ 正确：使用类封装返回类型
class TransactionResult {
  success: bool;
  errorCode: ErrorCode;
  
  constructor(success: bool, errorCode: ErrorCode) {
    this.success = success;
    this.errorCode = errorCode;
  }
}

function finalize(): TransactionResult {
  return new TransactionResult(true, ErrorCode.SUCCESS);
}
```

**实际案例**：
- `TransactionResult` → 创建类
- `StateResult` → 创建类
- `VoteAndCountResult` → 创建类

---

### 5. 正则表达式

**不支持**：JavaScript 正则表达式 `/pattern/flags`

**错误示例**：
```typescript
// ❌ 错误：不支持正则表达式
encoded = encoded.replace(/=/g, '');
```

**正确做法**：
```typescript
// ✅ 正确：手动字符串操作
let cleaned = '';
for (let i = 0; i < encoded.length; i++) {
  if (encoded.charCodeAt(i) !== 61) { // 61 = '='
    cleaned += encoded.charAt(i);
  }
}
encoded = cleaned;
```

**实际案例**：
- Base64 解码中的 `replace(/=/g, '')` → 改为手动循环

---

### 6. 装饰器（Decorators）

**不支持**：装饰器在运行时会被忽略

**说明**：
- AssemblyScript 不支持装饰器
- 装饰器语法可以使用，但运行时为空操作
- 装饰器主要用于 TypeScript 开发时的类型标记

**示例**：
```typescript
// ✅ 可以使用装饰器语法（但运行时为空操作）
@contract('HelloWorld')
export class HelloWorldContract extends Contract {
  @call('SayHello')
  sayHello(): ErrorCode {
    // ...
  }
}
```

**注意**：
- 装饰器函数实现应为空，仅作为类型标记
- 不要使用 `Reflect.defineMetadata`（AssemblyScript 不支持）

---

### 7. 导出类（Export Class）

**不支持**：直接导出类

**错误示例**：
```typescript
// ❌ 错误：导出类会产生警告
export class HelloWorldContract extends Contract {
  // ...
}
```

**警告信息**：
```
WARNING AS235: Only variables, functions and enums become WebAssembly module exports.
```

**正确做法**：
```typescript
// ✅ 正确：使用普通类，导出函数
class HelloWorldContract extends Contract {
  // ...
}

const contract = new HelloWorldContract();

// 导出函数供 WASM 运行时调用
export function Initialize(): u32 {
  return contract.onInit(params);
}

export function SayHello(): u32 {
  return contract.sayHello();
}
```

**实际案例**：
- `HelloWorldContract` → 改为普通类，导出 `Initialize()` 和 `SayHello()` 函数

---

### 8. npm 包名导入

**不支持**：使用 npm 包名导入模块

**错误示例**：
```typescript
// ❌ 错误：不支持 npm 包名导入
import { Contract } from '@weisyn/contract-sdk-js/as';
```

**正确做法**：
```typescript
// ✅ 正确：使用相对路径导入
import { Contract } from '../src/as';
```

**实际案例**：
- 所有示例代码中的导入路径 → 改为相对路径

---

### 9. String.UTF8.encode() 返回类型

**注意**：`String.UTF8.encode()` 返回 `ArrayBuffer`，不是 `Uint8Array`

**错误示例**：
```typescript
// ❌ 错误：类型不匹配
this.setReturnData(String.UTF8.encode(message));
```

**正确做法**：
```typescript
// ✅ 正确：转换为 Uint8Array
const messageBytes = Uint8Array.wrap(String.UTF8.encode(message));
this.setReturnData(messageBytes);
```

**实际案例**：
- `hello-world.ts` 中的 `setReturnData()` → 使用 `Uint8Array.wrap()`

---

## 📋 常见错误对照表

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 联合类型 | `string \| number` | 分离方法或使用类 |
| 可选属性 | `property?: Type` | 使用类，属性必填 |
| 字符串枚举 | `ASSET = 'asset'` | `ASSET = 0` |
| 对象返回 | `{ a: bool }` | 创建类封装 |
| 正则表达式 | `/pattern/g` | 手动字符串操作 |
| 导出类 | `export class` | 导出函数 |
| npm 导入 | `@package/module` | 相对路径 |
| ArrayBuffer | `String.UTF8.encode()` | `Uint8Array.wrap()` |

---

## 🔍 编译错误排查

### 错误：`ERROR AS100: Not implemented: union types`

**原因**：使用了联合类型

**解决**：
1. 检查函数参数和返回类型
2. 将联合类型改为单一类型或分离方法
3. 使用类封装复杂返回类型

---

### 错误：`ERROR AS219: Optional properties are not supported`

**原因**：interface 中使用了可选属性

**解决**：
1. 将 `interface` 改为 `class`
2. 所有属性设为必填
3. 使用 `null` 或默认值表示可选

---

### 错误：`ERROR TS2322: Type '~lib/string/String' is not assignable to type 'i32'`

**原因**：枚举值使用了字符串

**解决**：
1. 将字符串枚举改为数值枚举
2. 使用 `ASSET = 0` 而不是 `ASSET = 'asset'`

---

### 错误：`ERROR TS2322: Type '~lib/arraybuffer/ArrayBuffer' is not assignable to type '~lib/typedarray/Uint8Array'`

**原因**：`String.UTF8.encode()` 返回 `ArrayBuffer`

**解决**：
1. 使用 `Uint8Array.wrap()` 转换
2. `const bytes = Uint8Array.wrap(String.UTF8.encode(str));`

---

### 警告：`WARNING AS235: Only variables, functions and enums become WebAssembly module exports`

**原因**：导出了类

**解决**：
1. 移除 `export class`
2. 改为普通 `class`
3. 导出函数供 WASM 调用

---

## ✅ 最佳实践

### 1. 类型定义

```typescript
// ✅ 推荐：使用类封装复杂类型
class TransactionResult {
  success: bool;
  errorCode: ErrorCode;
  
  constructor(success: bool, errorCode: ErrorCode) {
    this.success = success;
    this.errorCode = errorCode;
  }
}

// ❌ 避免：使用对象字面量类型
function example(): { success: bool } { }
```

### 2. 函数设计

```typescript
// ✅ 推荐：分离方法处理不同类型
protected emitEventString(name: string, data: string): void { }
protected emitEventBytes(name: string, data: Uint8Array): void { }

// ❌ 避免：使用联合类型参数
protected emitEvent(name: string, data: string | Uint8Array): void { }
```

### 3. 枚举定义

```typescript
// ✅ 推荐：使用数值枚举
enum OutputType {
  ASSET = 0,
  STATE = 1,
  RESOURCE = 2,
}

// ❌ 避免：使用字符串枚举
enum OutputType {
  ASSET = 'asset',
  STATE = 'state',
}
```

### 4. 合约导出

```typescript
// ✅ 推荐：导出函数
class MyContract extends Contract {
  // ...
}

const contract = new MyContract();

export function Initialize(): u32 {
  return contract.onInit(params);
}

// ❌ 避免：导出类
export class MyContract extends Contract { }
```

---

## 🔗 相关文档

- [编译指南](./COMPILATION.md) - 详细的编译说明
- [导入路径指南](./IMPORT_GUIDE.md) - 导入路径说明
- [API 参考](./API_REFERENCE.md) - 完整 API 文档
- [开发者指南](./DEVELOPER_GUIDE.md) - 使用指南

---

## 📚 参考资源

- [AssemblyScript 官方文档](https://www.assemblyscript.org/)
- [AssemblyScript 限制](https://www.assemblyscript.org/limitations.html)
- [AssemblyScript 类型系统](https://www.assemblyscript.org/types.html)

---

**最后更新**：2025-11-19

