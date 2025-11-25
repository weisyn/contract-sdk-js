/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Staking 操作 Helper
 * 
 * 提供质押和委托相关的业务语义 API
 * 对标 Go SDK 的 helpers/staking/
 * 
 * 参考: contract-sdk-go/helpers/staking/
 */

// Note: HostABI and ErrorCode are used in AssemblyScript runtime but TypeScript compiler cannot detect them
import { HostABI } from '../runtime/abi';
import { Context } from '../framework/context';
import { TransactionBuilder } from '../framework/transaction';
import { ErrorCode, Address, Amount, TokenID } from '../framework/types';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Staking 操作类
 */
export class Staking {
  /**
   * 质押
   * @param staker 质押者地址
   * @param validator 验证者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static stake(
    staker: Address,
    validator: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateStakeParams(staker, validator, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(staker, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建交易（质押操作：将代币转移到验证者地址）
    const builder = TransactionBuilder.begin();
    builder.transfer(staker, validator, amount, tokenID);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 4. 发出质押事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'Stake',
      staker: this.addressToBase58(staker),
      validator: this.addressToBase58(validator),
      token_id: tokenID || '',
      amount: amount.toString(),
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 解质押
   * @param staker 质押者地址
   * @param validator 验证者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static unstake(
    staker: Address,
    validator: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateStakeParams(staker, validator, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询验证者地址的余额（质押的代币）
    const balance = HostABI.queryUTXOBalance(validator, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建交易（解质押操作：将代币从验证者地址转回质押者）
    const builder = TransactionBuilder.begin();
    builder.transfer(validator, staker, amount, tokenID);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 4. 发出解质押事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'Unstake',
      staker: this.addressToBase58(staker),
      validator: this.addressToBase58(validator),
      token_id: tokenID || '',
      amount: amount.toString(),
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 委托
   * @param delegator 委托者地址
   * @param validator 验证者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static delegate(
    delegator: Address,
    validator: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateDelegateParams(delegator, validator, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(delegator, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建交易（委托操作：将代币转移到验证者地址）
    const builder = TransactionBuilder.begin();
    builder.transfer(delegator, validator, amount, tokenID);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 4. 发出委托事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'Delegate',
      delegator: this.addressToBase58(delegator),
      validator: this.addressToBase58(validator),
      token_id: tokenID || '',
      amount: amount.toString(),
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 取消委托
   * @param delegator 委托者地址
   * @param validator 验证者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static undelegate(
    delegator: Address,
    validator: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateDelegateParams(delegator, validator, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询验证者地址的余额（委托的代币）
    const balance = HostABI.queryUTXOBalance(validator, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建交易（取消委托操作：将代币从验证者地址转回委托者）
    const builder = TransactionBuilder.begin();
    builder.transfer(validator, delegator, amount, tokenID);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 4. 发出取消委托事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'Undelegate',
      delegator: this.addressToBase58(delegator),
      validator: this.addressToBase58(validator),
      token_id: tokenID || '',
      amount: amount.toString(),
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 私有辅助方法 ====================

  private static validateStakeParams(
    staker: Address,
    validator: Address,
    amount: Amount
  ): bool {
    if (staker.length === 0 || validator.length === 0) {
      return false;
    }
    if (this.addressesEqual(staker, validator)) {
      return false;
    }
    if (amount === 0) {
      return false;
    }
    return true;
  }

  private static validateDelegateParams(
    delegator: Address,
    validator: Address,
    amount: Amount
  ): bool {
    return this.validateStakeParams(delegator, validator, amount);
  }

  private static addressesEqual(a: Address, b: Address): bool {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * 地址转 Base58 字符串
   * 使用 HostABI 提供的地址编码函数，与 Go SDK 保持一致
   */
  private static addressToBase58(address: Address): string {
    const base58 = HostABI.addressBytesToBase58(address);
    if (base58 === null) {
      // 如果编码失败，回退到十六进制编码（用于调试）
      let hex = '';
      for (let i = 0; i < address.length; i++) {
        const byte = address[i];
        hex += (byte >> 4).toString(16);
        hex += (byte & 0x0f).toString(16);
      }
      return hex;
    }
    return base58;
  }
}

