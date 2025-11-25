/**
 * 合约基类
 *
 * 提供合约基类和生命周期管理
 */

import { HostABI } from "../runtime/abi";
import { Context } from "./context";
import { ErrorCode, Address } from "./types";

/**
 * 合约基类
 * 所有合约都应继承此类
 */
export abstract class Contract {
  /**
   * 合约初始化
   * 在合约部署时调用
   * @param params 初始化参数
   * @returns 错误码
   */
  abstract onInit(params: Uint8Array): ErrorCode;

  /**
   * 合约调用
   * 在合约被调用时调用
   * @param functionName 函数名
   * @param params 调用参数
   * @returns 错误码
   */
  abstract onCall(functionName: string, params: Uint8Array): ErrorCode;

  /**
   * 获取调用者地址
   */
  protected getCaller(): Address {
    return Context.getCaller();
  }

  /**
   * 获取执行上下文
   */
  protected getContext(): Context {
    return Context;
  }

  /**
   * 发出事件（字符串数据）
   * @param name 事件名
   * @param data 事件数据（字符串）
   */
  protected emitEventString(name: string, data: string): void {
    const event = `{"name":"${name}","data":"${data}"}`;
    HostABI.emitEvent(event);
  }

  /**
   * 发出事件（字节数组数据）
   * @param name 事件名
   * @param data 事件数据（字节数组）
   */
  protected emitEventBytes(name: string, data: Uint8Array): void {
    // TODO: 实现 Base64 编码（AssemblyScript 可能需要手动实现）
    // 临时：将字节数组转为十六进制字符串
    let hex = "";
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      hex += (byte >> 4).toString(16);
      hex += (byte & 0x0f).toString(16);
    }
    const event = `{"name":"${name}","data":"${hex}"}`;
    HostABI.emitEvent(event);
  }

  /**
   * 发出事件（兼容方法，优先使用字符串）
   * @param name 事件名
   * @param data 事件数据
   */
  protected emitEvent(name: string, data: string): void {
    this.emitEventString(name, data);
  }

  /**
   * 设置返回值数据
   * @param data 返回数据
   */
  protected setReturnData(data: Uint8Array): void {
    HostABI.setReturnData(data);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   */
  protected logDebug(message: string): void {
    HostABI.logDebug(message);
  }
}
