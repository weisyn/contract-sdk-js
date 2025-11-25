/**
 * WES Contract SDK - TypeScript Only Entry
 * 
 * 这个入口文件只导出 TypeScript 兼容的部分，不包含 AssemblyScript 特定的代码
 * 用于在 TypeScript/JavaScript 环境中使用 SDK 的工具函数
 * 
 * 注意：只导出 framework/utils/abi.ts，因为这是唯一不依赖 runtime 模块的文件
 */

// 只导出 ABI 工具函数（TypeScript 兼容，无 AssemblyScript 依赖）
export * from './framework/utils/abi';

