/**
 * WES Contract SDK - 类型定义
 * 
 * 本文件提供 AssemblyScript 合约 SDK 的核心类型定义
 * 
 * 注意：这些类型主要用于 TypeScript 开发时的类型检查
 * 实际编译到 AssemblyScript 时，会使用 framework/types.ts 中的类型
 */

// 重新导出 framework 层的类型
export * from './framework/types';

// 重新导出 framework 层的其他类型
export * from './framework/context';
export * from './framework/storage';
export * from './framework/result';
export * from './framework/contract';
