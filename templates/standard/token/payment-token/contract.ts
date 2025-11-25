/**
 * 支付代币合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建支付代币合约。
 * 支付代币是一种专门用于支付的代币，具有快速转账、低手续费等特点。
 * 通过本示例，您可以学习如何使用 `helpers/token` 模块实现支付代币的核心功能。
 * 
 * 🎯 核心功能
 * 
 *  1. Transfer - 转账
 *     - 使用 token.Transfer() 进行快速转账
 *     - SDK 内部自动处理余额检查、交易构建、事件发出
 * 
 *  2. Mint - 铸造
 *     - 使用 token.Mint() 铸造新代币
 *     - 支持向指定地址铸造指定数量代币
 * 
 *  3. Burn - 销毁
 *     - 使用 token.Burn() 销毁代币
 *     - 从调用者地址销毁指定数量代币
 * 
 *  4. Approve - 授权
 *     - 使用 token.Approve() 授权其他地址使用代币
 *     - 支持 ERC-20 风格的授权机制
 * 
 *  5. Freeze - 冻结
 *     - 使用 token.Freeze() 冻结指定地址的代币
 *     - 适用于合规、风控等场景
 * 
 *  6. Airdrop - 空投
 *     - 使用 token.Airdrop() 批量空投代币
 *     - 支持一次性向多个地址空投不同数量代币
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Token } from '../../../src/helpers/token';
import { Address, Amount, TokenID } from '../../../src/framework/types';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';
import { ParsingUtils } from '../../../src/framework/utils/parsing';
import { FormatUtils } from '../../../src/framework/utils/format';

/**
 * Payment Token 合约实例
 * 
 * 支付代币特点：
 *   - 快速转账
 *   - 低手续费
 *   - 适合日常支付场景
 */
class PaymentTokenContract extends Contract {
  private tokenID: TokenID = 'PAYMENT_TOKEN';

  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'PaymentToken',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    
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
    } else if (functionName === 'Burn') {
      return this.burn(params);
    } else if (functionName === 'Approve') {
      return this.approve(params);
    } else if (functionName === 'Freeze') {
      return this.freeze(params);
    } else if (functionName === 'Airdrop') {
      return this.airdrop(params);
    } else if (functionName === 'BalanceOf') {
      return this.balanceOf(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * Transfer 转账代币
   * 
   * 快速转账，适合日常支付
   */
  private transfer(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    const result = Token.transfer(caller, to, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * Mint 铸造代币
   */
  private mint(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const result = Token.mint(to, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * Burn 销毁代币
   */
  private burn(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    const result = Token.burn(caller, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * Approve 授权
   */
  private approve(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const spenderStr = findJSONField(paramsStr, 'spender');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (spenderStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    const spender = this.parseAddress(spenderStr);
    if (spender === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    const result = Token.approve(caller, spender, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * Freeze 冻结
   */
  private freeze(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const targetStr = findJSONField(paramsStr, 'target');
    
    if (targetStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const target = this.parseAddress(targetStr);
    if (target === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const result = Token.freeze(target, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * Airdrop 空投
   */
  private airdrop(params: Uint8Array): ErrorCode {
    // 简化实现：实际应解析多个地址和数量
    const paramsStr = String.UTF8.decode(params.buffer);
    const recipientsStr = findJSONField(paramsStr, 'recipients');
    
    if (recipientsStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    // 简化：假设只有一个接收者
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    // 使用 BatchMint 进行批量空投
    const recipients: Address[] = [to];
    const amounts: Amount[] = [amount];
    
    const result = Token.batchMint(recipients, amounts, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    return ErrorCode.SUCCESS;
  }

  /**
   * BalanceOf 查询余额
   */
  private balanceOf(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const addressStr = findJSONField(paramsStr, 'address');

    const address = addressStr !== '' 
      ? this.parseAddress(addressStr)
      : Context.getCaller();

    if (address === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const balance = HostABI.queryUTXOBalance(address, this.tokenID);

    const result = JSON.stringify({
      address: this.addressToBase58(address),
      balance: balance.toString(),
      tokenID: this.tokenID,
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

const contract = new PaymentTokenContract();

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
  const functionName = 'BalanceOf';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

