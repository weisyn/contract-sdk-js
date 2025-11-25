/**
 * Hello World 合约模板
 * 
 * 最简单的 WES 智能合约示例，展示 SDK 的基本用法
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 * 
 * ⚠️ 重要提示：
 * - AssemblyScript 不支持导出类，应导出函数（见下方 export function）
 * - 详细限制说明请参考 docs/ASSEMBLYSCRIPT_COMPATIBILITY.md
 */

import { Contract, Context, ErrorCode, HostABI } from '@weisyn/contract-sdk-js/as';

/**
 * Hello World 合约实例
 */
class HelloWorldContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    // 初始化逻辑（如果有）
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'SayHello') {
      return this.sayHello();
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * SayHello 函数
   * 返回问候消息
   */
  sayHello(): ErrorCode {
    const caller = Context.getCaller();
    const message = `Hello, ${this.addressToHex(caller)}!`;
    
    // 发出事件（使用字符串版本）
    this.emitEvent('Greeting', message);
    
    // 设置返回值（String.UTF8.encode 返回 ArrayBuffer，需要转换为 Uint8Array）
    const messageBytes = Uint8Array.wrap(String.UTF8.encode(message));
    this.setReturnData(messageBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 地址转十六进制字符串（辅助方法）
   */
  private addressToHex(address: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < address.length; i++) {
      const byte = address[i];
      hex += (byte >> 4).toString(16);
      hex += (byte & 0x0f).toString(16);
    }
    return hex;
  }
}

// 合约实例（单例模式）
const contract = new HelloWorldContract();

/**
 * 合约初始化函数（WASM 导出）
 * 对应 Go SDK 的 //export Initialize
 */
export function Initialize(): u32 {
  const maxLen = 8192; // 假设最大8KB
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

/**
 * 合约调用函数（WASM 导出）
 * 对应 Go SDK 的 //export Call
 */
export function Call(): u32 {
  // TODO: 从 Host ABI 获取函数名和参数
  // 当前简化处理：使用固定函数名
  const functionName = 'SayHello';
  const params = new Uint8Array(0);
  return contract.onCall(functionName, params);
}

/**
 * SayHello 函数（WASM 导出）
 * 对应 Go SDK 的 //export SayHello
 */
export function SayHello(): u32 {
  return contract.sayHello();
}

