# 变更日志

**版本**：1.0  
**状态**：alpha  
**最后更新**：2025-11-26  
**所有者**：WES SDK 团队

---

本文档记录 WES Smart Contract SDK for TypeScript/AssemblyScript 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.1.2-alpha] - 2025-12-31

### 改进

- 与 WES v0.1.0 版本对齐
- 更新依赖和文档

---

## [0.1.1-alpha] - 2025-11-25

### 改进

#### 文档改进
- ✅ 更新了 README 文档，完善了快速开始指南
- ✅ 改进了 API 文档的结构和可读性
- ✅ 更新了文档中的时间戳和版本信息
- ✅ 完善了架构文档和设计说明
- ✅ 改进了合约模板的文档和示例
- ✅ 完善了 AssemblyScript 兼容性指南

#### TypeScript 改进
- ✅ 优化了类型定义的完整性和准确性
- ✅ 改进了类型推断，提供更好的 IDE 智能提示
- ✅ 增强了类型安全性，减少运行时错误
- ✅ 完善了泛型类型定义
- ✅ 改进了 AssemblyScript 类型映射

#### 合约模板优化
- ✅ 优化了标准合约模板的结构和代码质量
- ✅ 改进了模板的注释和文档
- ✅ 更新了模板的元数据和 ABI 定义
- ✅ 完善了学习模板的示例代码
- ✅ 改进了模板的构建脚本

#### Framework 改进
- ✅ 改进了错误处理机制，提供更清晰的错误信息
- ✅ 优化了交易构建器的 API
- ✅ 增强了 Runtime 层的稳定性
- ✅ 改进了合约基础结构的类型定义

#### Helpers 改进
- ✅ 优化了业务语义层的错误处理
- ✅ 改进了 Token、NFT、Staking、Governance 等模块的 API
- ✅ 增强了 External 模块的稳定性
- ✅ 完善了 RWA 模块的功能

**注意**: 此版本已发布，详细信息请参考 [_dev/publishing/versions/v0.1.1-alpha/release.md](./_dev/publishing/versions/v0.1.1-alpha/release.md)

---

## [0.1.0-alpha] - 2025-11-23

### 新增

#### 业务语义层（Helpers）

- ✅ **Token 模块**
  - 转账、批量转账
  - 代币铸造、销毁
  - 授权、冻结、空投
  - 状态代币管理

- ✅ **NFT 模块**
  - NFT 铸造
  - NFT 转移
  - NFT 元数据管理
  - NFT 查询

- ✅ **Staking 模块**
  - 质押、解质押
  - 委托、取消委托
  - 奖励领取

- ✅ **Governance 模块**
  - 提案创建
  - 投票、投票统计
  - 参数更新

- ✅ **Market 模块**
  - 托管（Escrow）
  - 分阶段释放（Vesting）
  - AMM 交换
  - 流动性管理

- ✅ **RWA 模块**
  - 现实世界资产验证
  - 资产估值
  - 资产代币化

- ✅ **External 模块**
  - 受控外部交互（ISPC 创新）
  - 外部 API 调用
  - 外部数据库查询
  - 替代传统预言机

#### 框架层（Framework）

- ✅ **运行时层（Runtime）**
  - WASM ABI 绑定
  - HostABI 封装
  - 内存管理
  - 环境变量访问

- ✅ **框架层（Framework）**
  - Contract 基础类型
  - Context 执行上下文
  - TransactionBuilder 交易构建器
  - Storage 状态存储
  - Result 结果类型

- ✅ **HostABI 封装**
  - 完整的 17 个 HostABI 原语封装
  - UTXO 查询（余额、详情）
  - 资源查询（详情、存在性检查）
  - 事件发出
  - 地址编码/解码

- ✅ **交易构建器**
  - 链式交易构建 API
  - 转账输出
  - 铸造输出
  - 状态输出
  - 资源输出
  - 交易完成

- ✅ **错误处理**
  - 统一的错误码定义
  - 错误映射机制
  - 错误处理工具

- ✅ **类型系统**
  - 完整的 TypeScript 类型定义
  - Address、Hash、TokenID、Amount 等基础类型
  - 编译期类型检查

#### 合约模板

- ✅ **学习模板**
  - Hello World 模板
  - 简单代币模板
  - 基础 NFT 模板
  - 市场演示模板
  - 空白模板

- ✅ **标准模板**
  - ERC20 代币模板
  - DAO 治理模板
  - DeFi 模板（AMM、借贷、流动性池）
  - NFT 模板（数字艺术品、收藏品、游戏资产等）
  - RWA 模板（房地产、供应链等）

#### 构建和工具

- ✅ **AssemblyScript 支持**
  - AssemblyScript 编译器集成
  - WASM 编译配置
  - ABI 生成工具

- ✅ **TypeScript 支持**
  - 完整的 TypeScript 类型定义
  - TypeScript 编译配置
  - 类型声明文件生成

- ✅ **代码质量工具**
  - ESLint 配置
  - Prettier 配置
  - TypeScript 严格模式
  - 预发布检查（prepack 脚本）

- ✅ **NPM 发布支持**
  - package.json 配置
  - 发布前检查
  - GitHub Actions 自动发布

#### 文档

- ✅ **开发者文档**
  - 快速开始指南
  - 开发者指南
  - 架构文档
  - API 参考文档

- ✅ **设计文档**
  - 产品愿景
  - 架构设计
  - Helpers 设计
  - Framework 设计
  - AssemblyScript 兼容性指南

### 技术特性

- ✅ **TypeScript/AssemblyScript 支持** - 使用熟悉的语言编写合约
- ✅ **WASM 优化** - 专为 AssemblyScript WASM 编译优化
- ✅ **类型安全** - 完整的 TypeScript 类型定义和编译期检查
- ✅ **与 Go SDK 对齐** - 业务语义 API 与 Go SDK 保持一致

### ISPC 创新

- ✅ **受控外部交互** - 合约可以直接调用外部 API，无需传统预言机
- ✅ **单次调用，多点验证** - 自动生成 ZK 证明
- ✅ **业务执行能力** - 支持跨系统的原子性业务流程

### 代码质量

- ✅ **ESLint 配置** - 统一的代码质量检查规则
- ✅ **Prettier 配置** - 统一的代码格式化规则
- ✅ **TypeScript 严格模式** - 完整的类型检查
- ✅ **预发布检查** - `prepack` 脚本自动运行代码质量检查

### 已知限制

根据 [实施计划](./_dev/IMPLEMENTATION_PLAN.md)，contract-sdk-js 的核心功能（Phase 1-4）已完成。当前限制主要与跨语言对齐和工具链集成相关：

- ⚠️ 这是 Alpha 版本，主要用于功能验证和测试
- ⚠️ API 可能在未来版本中发生变化
- ⚠️ 不建议在生产环境使用
- ⚠️ 与 Go SDK 的跨语言一致性测试仍在进行中
- ⚠️ Workbench/编译服务集成需要进一步完善

---

## [未发布]

### 计划中

根据 [实施计划](./_dev/IMPLEMENTATION_PLAN.md) 和与 contract-sdk-go 保持一致的原则：

#### 跨语言对齐（与 contract-sdk-go 同步）

- [ ] 完善跨语言一致性测试框架
- [ ] 确保 Helpers API 在 Go/TS/AS 中行为一致
- [ ] 建立跨语言 ABI/元数据统一规范

#### 工具链集成

- [ ] 完善 Workbench 集成（ABI 元数据导出）
- [ ] 完善编译服务集成（AssemblyScript 编译支持）
- [ ] 完善模板元数据结构化

#### 测试与质量

- [ ] 完善单元测试覆盖率
- [ ] 增加集成测试
- [ ] 性能优化

#### 文档与工具

- [ ] 更多合约模板
- [ ] 工具链改进

---

**最后更新**: 2025-11-26

