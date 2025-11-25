/**
 * 分阶段释放合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建分阶段释放（Vesting）合约。
 * 通过本示例，您可以学习如何使用 `helpers/market` 模块实现代币的分阶段解锁和释放。
 * 
 * 🎯 核心功能
 * 
 *  1. CreateVesting - 创建释放计划
 *  2. ClaimVesting - 领取释放代币
 *  3. QueryVesting - 查询释放计划
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Market } from '../../../src/helpers/market';
import { Address, Amount, TokenID } from '../../../src/framework/types';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';
import { ParsingUtils } from '../../../src/framework/utils/parsing';
import { FormatUtils } from '../../../src/framework/utils/format';

/**
 * Vesting Contract 分阶段释放合约
 */
class VestingContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Vesting',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'CreateVesting') {
      return this.createVesting(params);
    } else if (functionName === 'ClaimVesting') {
      return this.claimVesting(params);
    } else if (functionName === 'QueryVesting') {
      return this.queryVesting(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * CreateVesting 创建释放计划
   */
  private createVesting(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const beneficiaryStr = findJSONField(paramsStr, 'beneficiary');
    const totalAmountStr = findJSONField(paramsStr, 'total_amount');
    const vestingIDStr = findJSONField(paramsStr, 'vesting_id');

    if (beneficiaryStr === '' || totalAmountStr === '' || vestingIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const totalAmount = parseUint64(totalAmountStr);
    if (totalAmount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const beneficiary = this.parseAddress(beneficiaryStr);
    if (beneficiary === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const vestingID = Uint8Array.wrap(String.UTF8.encode(vestingIDStr));
    const tokenID: TokenID | null = null; // 原生币

    // 使用 Market.Release 创建释放计划
    const result = Market.release(vestingID, totalAmount, tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * ClaimVesting 领取释放代币
   */
  private claimVesting(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const vestingIDStr = findJSONField(paramsStr, 'vesting_id');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (vestingIDStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const vestingID = Uint8Array.wrap(String.UTF8.encode(vestingIDStr));
    const tokenID: TokenID | null = null;

    // 释放代币
    const result = Market.release(vestingID, amount, tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * QueryVesting 查询释放计划
   */
  private queryVesting(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const vestingIDStr = findJSONField(paramsStr, 'vesting_id');

    if (vestingIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const result = JSON.stringify({
      vesting_id: vestingIDStr,
      total_amount: '1000000',
      claimed_amount: '0',
      remaining_amount: '1000000',
      status: 'active',
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  private parseAddress(addressStr: string): Address | null {
    return ParsingUtils.parseAddress(addressStr);
  }

  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

const contract = new VestingContract();

export function Initialize(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

export function Execute(): u32 {
  const maxLen = 8192;
  const functionName = 'QueryVesting';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

