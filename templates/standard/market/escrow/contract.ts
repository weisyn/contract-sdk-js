/**
 * 市场托管合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建市场交易相关的智能合约。
 * 通过本示例，您可以学习如何使用 `helpers/market` 模块提供的业务语义API。
 * 
 * 🎯 核心功能
 * 
 *  1. Escrow - 托管
 *     - 使用 market.Escrow() 创建代币托管
 *     - SDK 内部自动处理余额检查、交易构建、事件发出
 * 
 *  2. Release - 释放托管
 *     - 使用 market.Release() 释放托管代币
 * 
 * ⚠️ 注意：本模块仅提供原子操作，不包含组合场景
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
 * Market Contract 市场托管合约
 */
class MarketContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Market',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Escrow') {
      return this.escrow(params);
    } else if (functionName === 'Release') {
      return this.release(params);
    } else if (functionName === 'GetEscrowInfo') {
      return this.getEscrowInfo(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * Escrow 创建托管
   */
  private escrow(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const buyerStr = findJSONField(paramsStr, 'buyer');
    const sellerStr = findJSONField(paramsStr, 'seller');
    const amountStr = findJSONField(paramsStr, 'amount');
    const escrowIDStr = findJSONField(paramsStr, 'escrow_id');

    if (buyerStr === '' || sellerStr === '' || amountStr === '' || escrowIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const buyer = this.parseAddress(buyerStr);
    const seller = this.parseAddress(sellerStr);
    if (buyer === null || seller === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const escrowID = Uint8Array.wrap(String.UTF8.encode(escrowIDStr));
    const tokenID: TokenID | null = null; // 原生币

    const result = Market.escrow(buyer, seller, amount, tokenID, escrowID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Release 释放托管
   */
  private release(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const escrowIDStr = findJSONField(paramsStr, 'escrow_id');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (escrowIDStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const escrowID = Uint8Array.wrap(String.UTF8.encode(escrowIDStr));
    const tokenID: TokenID | null = null; // 原生币

    const result = Market.release(escrowID, amount, tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * GetEscrowInfo 查询托管信息
   */
  private getEscrowInfo(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const escrowIDStr = findJSONField(paramsStr, 'escrow_id');

    if (escrowIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const result = JSON.stringify({
      escrow_id: escrowIDStr,
      status: 'active',
      amount: '10000',
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

const contract = new MarketContract();

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
  const functionName = 'GetEscrowInfo';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

