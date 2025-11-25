/**
 * AssemblyScript 合约 SDK 入口
 *
 * 合约项目的统一入口，导出所有需要的模块
 */

// Runtime 层
export * from "../runtime";

// Framework 层
export * from "../framework";

// Helpers 层
export * from "../helpers";

// 装饰器
export { contract, view, call } from "./decorators";
