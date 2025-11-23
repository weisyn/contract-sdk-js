/**
 * Market 操作 Helper
 * 
 * 提供市场相关的业务语义 API，包括托管、分阶段释放等功能
 * 对标 Go SDK 的 helpers/market/
 * 
 * 参考: contract-sdk-go/helpers/market/
 * 
 * 注意：本模块仅提供原子操作（Escrow、Release），不包含组合场景（如Swap、Liquidity等）
 */

import { HostABI } from '../runtime/abi';
import { Context } from '../framework/context';
import { TransactionBuilder } from '../framework/transaction';
import { ErrorCode, Address, Amount, TokenID, Hash } from '../framework/types';
import { computeHash } from '../framework/utils/hash';

/**
 * Market 操作类
 */
export class Market {
  /**
   * 创建托管
   * @param buyer 买方地址
   * @param seller 卖方地址
   * @param amount 托管金额
   * @param tokenID 代币ID（null 表示原生币）
   * @param escrowID 托管ID
   * @returns 错误码
   */
  static escrow(
    buyer: Address,
    seller: Address,
    amount: Amount,
    tokenID: TokenID | null,
    escrowID: Uint8Array
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateEscrowParams(buyer, seller, amount, escrowID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(buyer, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建托管状态ID
    const stateID = this.buildEscrowStateID(escrowID);

    // 4. 计算托管状态哈希
    const execHash = this.computeEscrowHash(stateID, buyer, seller, amount);

    // 5. 构建交易（将代币转移到卖方地址，并记录托管状态）
    const builder = TransactionBuilder.begin();
    builder.transfer(buyer, seller, amount, tokenID);
    builder.addStateOutput(stateID, 1, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 6. 发出托管事件（使用Base58编码，与Go SDK保持一致）
    const caller = Context.getCaller();
    const buyerBase58 = this.addressToBase58(buyer);
    const sellerBase58 = this.addressToBase58(seller);
    const callerBase58 = this.addressToBase58(caller);
    const escrowIDStr = String.UTF8.decode(escrowID.buffer);
    
    const event = JSON.stringify({
      name: 'Escrow',
      buyer: buyerBase58,
      seller: sellerBase58,
      token_id: tokenID || '',
      amount: amount.toString(),
      escrow_id: escrowIDStr,
      caller: callerBase58,
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 创建分阶段释放计划
   * @param from 释放者地址
   * @param beneficiary 受益人地址
   * @param amount 总释放金额
   * @param tokenID 代币ID（null 表示原生币）
   * @param vestingID 释放计划ID
   * @returns 错误码
   */
  static release(
    from: Address,
    beneficiary: Address,
    amount: Amount,
    tokenID: TokenID | null,
    vestingID: Uint8Array
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateReleaseParams(from, beneficiary, amount, vestingID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(from, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建释放计划状态ID
    const stateID = this.buildVestingStateID(vestingID);

    // 4. 计算释放计划状态哈希
    const execHash = this.computeVestingHash(stateID, from, beneficiary, amount);

    // 5. 构建交易（将代币转移到受益人地址，并记录释放计划状态）
    // 注意：时间锁和释放条件验证是业务逻辑，需要在合约代码中实现
    const builder = TransactionBuilder.begin();
    builder.transfer(from, beneficiary, amount, tokenID);
    builder.addStateOutput(stateID, 1, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 6. 发出释放事件（使用Base58编码，与Go SDK保持一致）
    const caller = Context.getCaller();
    const fromBase58 = this.addressToBase58(from);
    const beneficiaryBase58 = this.addressToBase58(beneficiary);
    const callerBase58 = this.addressToBase58(caller);
    const vestingIDStr = String.UTF8.decode(vestingID.buffer);
    
    const event = JSON.stringify({
      name: 'Release',
      from: fromBase58,
      beneficiary: beneficiaryBase58,
      token_id: tokenID || '',
      total_amount: amount.toString(),
      vesting_id: vestingIDStr,
      caller: callerBase58,
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 私有辅助方法 ====================

  private static validateEscrowParams(
    buyer: Address,
    seller: Address,
    amount: Amount,
    escrowID: Uint8Array
  ): bool {
    if (buyer.length === 0 || seller.length === 0) {
      return false;
    }
    if (this.addressesEqual(buyer, seller)) {
      return false;
    }
    if (amount === 0) {
      return false;
    }
    if (escrowID.length === 0) {
      return false;
    }
    return true;
  }

  private static validateReleaseParams(
    from: Address,
    beneficiary: Address,
    amount: Amount,
    vestingID: Uint8Array
  ): bool {
    if (from.length === 0 || beneficiary.length === 0) {
      return false;
    }
    if (this.addressesEqual(from, beneficiary)) {
      return false;
    }
    if (amount === 0) {
      return false;
    }
    if (vestingID.length === 0) {
      return false;
    }
    return true;
  }

  private static buildEscrowStateID(escrowID: Uint8Array): Uint8Array {
    const prefix = 'escrow:';
    const prefixBytes = String.UTF8.encode(prefix);
    const result = new Uint8Array(prefixBytes.length + escrowID.length);
    result.set(prefixBytes, 0);
    result.set(escrowID, prefixBytes.length);
    return result;
  }

  private static buildVestingStateID(vestingID: Uint8Array): Uint8Array {
    const prefix = 'vesting:';
    const prefixBytes = String.UTF8.encode(prefix);
    const result = new Uint8Array(prefixBytes.length + vestingID.length);
    result.set(prefixBytes, 0);
    result.set(vestingID, prefixBytes.length);
    return result;
  }

  private static computeEscrowHash(
    stateID: Uint8Array,
    buyer: Address,
    seller: Address,
    amount: Amount
  ): Hash {
    // 组合所有数据
    const amountBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      amountBytes[i] = <u8>((amount >> (i * 8)) & 0xFF);
    }

    const combined = new Uint8Array(
      stateID.length + buyer.length + seller.length + amountBytes.length
    );
    let offset = 0;
    combined.set(stateID, offset);
    offset += stateID.length;
    combined.set(buyer, offset);
    offset += buyer.length;
    combined.set(seller, offset);
    offset += seller.length;
    combined.set(amountBytes, offset);

    // 使用工具函数计算哈希
    return computeHash(combined);
  }

  private static computeVestingHash(
    stateID: Uint8Array,
    from: Address,
    beneficiary: Address,
    amount: Amount
  ): Hash {
    // 组合所有数据
    const amountBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      amountBytes[i] = <u8>((amount >> (i * 8)) & 0xFF);
    }

    const combined = new Uint8Array(
      stateID.length + from.length + beneficiary.length + amountBytes.length
    );
    let offset = 0;
    combined.set(stateID, offset);
    offset += stateID.length;
    combined.set(from, offset);
    offset += from.length;
    combined.set(beneficiary, offset);
    offset += beneficiary.length;
    combined.set(amountBytes, offset);

    // 使用工具函数计算哈希
    return computeHash(combined);
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

