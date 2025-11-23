/**
 * Simple Token 合约模板
 * 
 * 展示如何使用 Token Helper 实现代币合约
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../src/framework';
import { HostABI } from '../../src/runtime';
import { Token } from '../../src/helpers/token';

/**
 * Simple Token 合约
 */
class SimpleTokenContract extends Contract {
  private tokenID: string = 'MY_TOKEN';

  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    // 解析初始化参数（如果有）
    // 例如：设置代币名称、符号等
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Transfer') {
      return this.transfer(params);
    } else if (functionName === 'Mint') {
      return this.mint(params);
    } else if (functionName === 'BalanceOf') {
      return this.balanceOf(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * 转账函数
   */
  transfer(params: Uint8Array): ErrorCode {
    // TODO: 解析参数（to, amount）
    // 当前简化处理
    const caller = Context.getCaller();
    const to = caller; // 临时：使用调用者地址
    const amount: u64 = 100; // 临时：固定金额

    const result = Token.transfer(caller, to, amount, this.tokenID);
    return result;
  }

  /**
   * 铸造函数
   */
  mint(params: Uint8Array): ErrorCode {
    // TODO: 权限检查
    // TODO: 解析参数（to, amount）

    const caller = Context.getCaller();
    const to = caller; // 临时：使用调用者地址
    const amount: u64 = 1000; // 临时：固定金额

    const result = Token.mint(to, amount, this.tokenID);
    return result;
  }

  /**
   * 查询余额函数
   */
  balanceOf(params: Uint8Array): ErrorCode {
    // TODO: 解析参数（address）
    const caller = Context.getCaller();
    const balance = Token.balanceOf(caller, this.tokenID);

    // 设置返回值
    const balanceStr = balance.toString();
    this.setReturnData(Uint8Array.wrap(String.UTF8.encode(balanceStr)));

    return ErrorCode.SUCCESS;
  }
}

// 合约实例（单例模式）
const contract = new SimpleTokenContract();

/**
 * 合约初始化函数（WASM 导出）
 */
export function Initialize(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

/**
 * 合约调用函数（WASM 导出）
 */
export function Call(): u32 {
  const functionName = 'Transfer'; // 临时：固定函数名
  const params = new Uint8Array(0);
  return contract.onCall(functionName, params);
}

/**
 * Transfer 函数（WASM 导出）
 */
export function Transfer(): u32 {
  return contract.transfer(new Uint8Array(0));
}

/**
 * Mint 函数（WASM 导出）
 */
export function Mint(): u32 {
  return contract.mint(new Uint8Array(0));
}

/**
 * BalanceOf 函数（WASM 导出）
 */
export function BalanceOf(): u32 {
  return contract.balanceOf(new Uint8Array(0));
}

