# Contract SDK JS - 文档中心

**版本**: v0.1.0-alpha  
**最后更新**: 2025-11-19

---

<div align="center">

## 📚 文档导航中心

**按角色快速找到你需要的文档**

[👨‍💻 开发者](#-开发者) • [🏗️ 架构师/贡献者](#️-架构师贡献者) • [📖 参考文档](#-参考文档)

</div>

---

## 📋 文档定位说明

### 文档层次关系

```
主 README.md（用户入口）
    │
    ├─> 快速开始、核心特性、架构概览
    │
    └─> docs/README.md（文档中心）← 你现在在这里
            │
            ├─> 开发者指南、API 参考
            ├─> 架构设计文档
            └─> 模块文档、示例代码
```

**主 README.md** 的定位：
- ✅ **用户友好的入口**：快速了解 SDK，快速开始
- ✅ **核心价值展示**：突出 SDK 的核心能力和优势
- ✅ **简洁的架构说明**：SDK 定位和架构概览
- ✅ **文档导航入口**：指向文档中心（本文件）

**docs/README.md**（本文件）的定位：
- ✅ **文档索引中心**：列出所有文档及其定位
- ✅ **按角色导航**：为不同角色提供快速导航路径
- ✅ **文档分类**：按用户文档、设计文档、参考文档分类
- ✅ **使用建议**：为不同场景提供文档使用建议

---

## 👨‍💻 开发者

### 🚀 快速开始路径

```
1. [主 README](../README.md)
   └─> 了解 SDK 是什么，快速开始
   
2. [合约模板](../templates/)
   └─> 使用模板快速开始
   
3. [开发者指南](./DEVELOPER_GUIDE.md)
   └─> 深入学习核心概念
   
4. [API 参考](./API_REFERENCE.md)
   └─> 查阅详细的 API 文档
```

### 📖 核心文档

#### 必读文档（P0）

- ⭐ **[主 README](../README.md)** - SDK 总览和快速开始
  - SDK 简介和核心价值
  - 安装和第一个示例
  - 核心功能概览

- ⚠️ **[AssemblyScript 兼容性指南](./ASSEMBLYSCRIPT_COMPATIBILITY.md)** - **必读**：避免常见错误
  - AssemblyScript 限制说明
  - 常见错误对照表
  - 编译错误排查指南
  - 最佳实践建议

- 📖 **[开发者指南](./DEVELOPER_GUIDE.md)** - 如何使用 SDK
  - 快速开始
  - 核心概念
  - 常见场景
  - 最佳实践

- 📚 **[API 参考](./API_REFERENCE.md)** - SDK 接口详细说明
  - Runtime 层 API
  - Framework 层 API
  - Helpers 层 API
  - 使用示例

#### 推荐文档（P1）

- 💡 **[合约模板](../templates/)** - 合约开发模板
  - 学习模板（Hello World、Simple Token、Basic NFT）
  - 标准模板（ERC-20、DAO Governance、Market）
  - 模板使用指南

---

## 🏗️ 架构师/贡献者

### 架构设计文档

#### 核心设计文档（P1）

- 🏗️ **[架构设计](./ARCHITECTURE.md)** - SDK 整体架构设计讨论
  - 模块组织方式
  - 依赖关系说明
  - 设计决策记录

#### 规划文档（P2）

- 📈 **[架构规划](./ARCHITECTURE_PLAN.md)** - SDK 架构规划文档
  - 未来演进方向
  - 技术债务管理

#### 集成文档（P1）

- 🔗 **[能力对比矩阵](./capability-comparison.md)** - Go/JS SDK 能力对比
  - Framework 层能力对比
  - Helpers 层能力对比
  - 模板能力对比
  - 文档能力对比

- 🔗 **[错误处理集成](./ERROR_HANDLING_INTEGRATION.md)** - Contract SDK ↔ Client SDK 错误处理链路
  - 合约错误码到 WES Problem Details 映射
  - Client SDK 错误解析流程
  - 完整错误处理示例

- 🔗 **[Helpers-Client 映射](./HELPERS_CLIENT_MAPPING.md)** - Contract SDK Helpers ↔ Client SDK Services 对应关系
  - 各模块的 Helpers-Services 映射表
  - 使用场景示例
  - 双视角开发指南

---

## 📖 参考文档

### 规范文档

- **模板元数据格式**：`src/metadata/schema.json` - JSON Schema 定义
- **TypeScript 类型**：`src/types.ts` - 完整的类型定义

### 开发指南

- **测试指南**：`tests/` - 单元测试和集成测试
- **构建配置**：`rollup.config.js` - Rollup 构建配置

---

## 🎯 快速导航路径

### 新手入门路径

```
1. [主 README](../README.md)
   └─> 了解 SDK 是什么，快速开始
   
2. [合约模板](../templates/)
   └─> 使用模板快速开始
   
3. [开发者指南](./DEVELOPER_GUIDE.md)
   └─> 深入学习核心概念
   
4. [API 参考](./API_REFERENCE.md)
   └─> 查阅详细的 API 文档
```

### 功能开发路径

```
1. [核心功能](../README.md#-核心功能)
   └─> 了解 SDK 提供的功能
   
2. [开发者指南](./DEVELOPER_GUIDE.md)
   └─> 学习如何使用 SDK
   
3. [API 参考](./API_REFERENCE.md)
   └─> 查阅详细的 API 文档
   
4. [合约模板](../templates/)
   └─> 参考实际应用模板
```

### 深入理解路径

```
1. [SDK 架构](../README.md#️-架构概览)
   └─> 理解 SDK 定位和架构
   
2. [架构设计](./ARCHITECTURE.md)
   └─> 了解架构设计决策
   
3. [源代码](../src/)
   └─> 深入源码实现
```

---

## 📋 文档分类

### 用户文档（面向开发者）

| 文档 | 说明 | 优先级 |
|------|------|--------|
| ⭐ [主 README](../README.md) | SDK 总览和快速开始 | P0 |
| 📖 [开发者指南](./DEVELOPER_GUIDE.md) | 如何使用 SDK | P0 |
| 📚 [API 参考](./API_REFERENCE.md) | SDK 接口详细说明 | P0 |
| 💡 [合约模板](../templates/) | 合约开发模板 | P1 |

### 设计文档（面向架构师和贡献者）

| 文档 | 说明 | 优先级 |
|------|------|--------|
| 🏗️ [架构设计](./ARCHITECTURE.md) | 架构设计讨论 | P1 |
| 📈 [架构规划](./ARCHITECTURE_PLAN.md) | 架构规划文档 | P2 |

### 参考文档（面向高级开发者）

| 文档 | 说明 | 优先级 |
|------|------|--------|
| 📘 [模板元数据格式](../src/metadata/schema.json) | JSON Schema 定义 | P2 |
| 🔗 [TypeScript 类型](../src/types.ts) | 完整的类型定义 | P2 |
| 🧪 [测试代码](../tests/) | 单元测试和集成测试 | P2 |

---

## 💡 文档使用建议

### 如果你是新手

1. **先看主 README**：了解 SDK 是什么，完成快速开始
2. **运行基础示例**：完成第一个示例，理解基本概念
3. **阅读开发者指南**：深入学习核心概念和最佳实践
4. **参考示例代码**：学习实际应用示例

### 如果你在开发功能

1. **查看核心功能**：了解 SDK 提供的功能
2. **查阅 API 参考**：查找具体的 API 使用方法
3. **参考示例代码**：学习实际应用示例

### 如果你想贡献代码

1. **阅读架构设计文档**：理解 SDK 的整体架构
2. **查看源代码**：了解实现细节
3. **参考架构规划**：了解未来演进方向

---

## 🔗 外部资源

- [WES 主项目](https://github.com/weisyn/weisyn-core) - WES 区块链核心实现
- [Contract SDK (Go)](https://github.com/weisyn/contract-sdk-go) - 智能合约开发 SDK（Go）
- [Client SDK (JS/TS)](https://github.com/weisyn/client-sdk-js) - 客户端 SDK（JavaScript/TypeScript 版本）

---

**最后更新**: 2025-11-19  
**维护者**: WES Core Team

