/**
 * WES Contract SDK for TypeScript/AssemblyScript
 *
 * 主入口文件
 *
 * 本 SDK 支持使用 TypeScript/AssemblyScript 编写 WES 智能合约
 * 使用 AssemblyScript 编译器将代码编译为 WASM
 */

// 导出所有模块
export * from "./runtime";
export * from "./framework";
export * from "./helpers";
export * from "./as";

// 主要导出：合约开发者应该从 './as' 导入
export * from "./as";
