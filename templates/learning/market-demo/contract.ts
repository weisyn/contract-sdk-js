/**
 * Market Demo 合约模板
 * 
 * 展示如何使用 Market Helper 实现托管和分阶段释放功能
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode, HostABI, Market } from '@weisyn/contract-sdk-js/as';

/**
 * Market 合约
 */
class MarketContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'CreateEscrow') {
      return this.createEscrow(params);
    } else if (functionName === 'CreateVesting') {
      return this.createVesting(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * 创建托管
   */
  createEscrow(params: Uint8Array): ErrorCode {
    // TODO: 解析参数（seller, amount, escrowID）
    // 当前简化处理
    const caller = Context.getCaller();
    const seller = caller; // 临时：使用调用者地址
    const amount: u64 = 10000; // 临时：固定金额
    const escrowID = Uint8Array.wrap(String.UTF8.encode('escrow_123'));

    const result = Market.escrow(caller, seller, amount, null, escrowID);
    return result;
  }

  /**
   * 创建分阶段释放计划
   */
  createVesting(params: Uint8Array): ErrorCode {
    // TODO: 解析参数（beneficiary, totalAmount, vestingID）
    // 当前简化处理
    const caller = Context.getCaller();
    const beneficiary = caller; // 临时：使用调用者地址
    const totalAmount: u64 = 100000; // 临时：固定金额
    const vestingID = Uint8Array.wrap(String.UTF8.encode('vesting_123'));

    const result = Market.release(caller, beneficiary, totalAmount, null, vestingID);
    return result;
  }
}

// 合约实例（单例模式）
const contract = new MarketContract();

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
  const functionName = 'CreateEscrow'; // 临时：固定函数名
  const params = new Uint8Array(0);
  return contract.onCall(functionName, params);
}

/**
 * CreateEscrow 函数（WASM 导出）
 */
export function CreateEscrow(): u32 {
  return contract.createEscrow(new Uint8Array(0));
}

/**
 * CreateVesting 函数（WASM 导出）
 */
export function CreateVesting(): u32 {
  return contract.createVesting(new Uint8Array(0));
}

