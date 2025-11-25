/**
 * 代币操作 Helper
 *
 * 提供代币转账、铸造、销毁等功能
 * 对标 Go SDK 的 helpers/token/
 *
 * 参考: contract-sdk-go/helpers/token/
 */

import { HostABI } from "../runtime/abi";
import { Context } from "../framework/context";
import { TransactionBuilder } from "../framework/transaction";
import { ErrorCode, Address, Amount, TokenID, Hash } from "../framework/types";
import { computeHash } from "../framework/utils/hash";
// Note: base64Encode and AddressUtils may be used in AssemblyScript runtime
// but TypeScript compiler cannot detect them
// import { encode as base64Encode } from '../framework/utils/base64';
// import { AddressUtils } from '../framework/utils/address';

/**
 * 代币操作类
 */
export class Token {
  /**
   * 转账代币
   * @param from 发送者地址
   * @param to 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static transfer(from: Address, to: Address, amount: Amount, tokenID: TokenID | null): ErrorCode {
    // 1. 参数验证
    if (!this.validateTransferParams(from, to, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(from, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 创建 UTXO 输出（转账给接收者）
    const outputIndex = HostABI.createUTXOOutput(to, amount, tokenID);
    if (outputIndex === 0xffffffff) {
      return ErrorCode.ERROR_EXECUTION_FAILED;
    }

    // 4. 发出转账事件
    const event = JSON.stringify({
      name: "Transfer",
      from: this.addressToBase58(from),
      to: this.addressToBase58(to),
      token_id: tokenID || "",
      amount: amount.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 铸造代币
   * @param to 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID
   * @returns 错误码
   */
  static mint(to: Address, amount: Amount, tokenID: TokenID): ErrorCode {
    // 1. 参数验证
    if (!this.validateMintParams(to, tokenID, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 创建 UTXO 输出（铸造给接收者）
    const outputIndex = HostABI.createUTXOOutput(to, amount, tokenID);
    if (outputIndex === 0xffffffff) {
      return ErrorCode.ERROR_EXECUTION_FAILED;
    }

    // 3. 发出铸造事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: "Mint",
      to: this.addressToBase58(to),
      token_id: tokenID,
      amount: amount.toString(),
      minter: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 销毁代币
   * @param from 发送者地址
   * @param amount 金额
   * @param tokenID 代币ID
   * @returns 错误码
   *
   * 实现说明：
   * 在UTXO模型中，销毁代币的标准方式是将其转移到零地址。
   * 零地址是一个特殊的地址，代币一旦转移到零地址，就无法再被使用。
   * 这是UTXO模型中的标准销毁方式，符合区块链的去中心化原则。
   */
  static burn(from: Address, amount: Amount, tokenID: TokenID): ErrorCode {
    // 1. 参数验证
    if (!this.validateBurnParams(from, tokenID, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(from, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建交易：将代币转移到零地址（销毁）
    // 零地址是一个全0的地址，代币转移到零地址后无法再被使用
    const zeroAddr = new Uint8Array(20); // 全0地址

    // 使用TransactionBuilder构建转账交易
    const builder = TransactionBuilder.begin();
    // transfer(from, to, amount, tokenID)
    builder.transfer(from, zeroAddr, amount, tokenID);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 4. 发出销毁事件
    const fromBase58 = this.addressToBase58(from);
    const event = JSON.stringify({
      name: "Burn",
      from: fromBase58,
      token_id: tokenID,
      amount: amount.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 查询余额
   * @param address 地址
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 余额
   */
  static balanceOf(address: Address, tokenID: TokenID | null): Amount {
    return HostABI.queryUTXOBalance(address, tokenID);
  }

  /**
   * 授权代币
   * @param owner 代币所有者地址
   * @param spender 被授权地址
   * @param tokenID 代币ID
   * @param amount 授权数量
   * @returns 错误码
   */
  static approve(owner: Address, spender: Address, tokenID: TokenID, amount: Amount): ErrorCode {
    // 1. 参数验证
    if (!this.validateApproveParams(owner, spender, tokenID, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(owner, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建授权状态ID
    // 格式：approve:{owner}:{spender}:{tokenID}
    const stateID = this.buildApproveStateID(owner, spender, tokenID);

    // 4. 计算授权状态哈希
    const execHash = this.computeApproveHash(stateID, amount);

    // 5. 构建交易（使用StateOutput记录授权状态）
    const builder = TransactionBuilder.begin();
    builder.addStateOutput(stateID, 1, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 6. 发出授权事件
    const event = JSON.stringify({
      name: "Approve",
      owner: this.addressToBase58(owner),
      spender: this.addressToBase58(spender),
      token_id: tokenID,
      amount: amount.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 冻结代币
   * @param target 目标地址
   * @param tokenID 代币ID
   * @param amount 冻结数量
   * @returns 错误码
   */
  static freeze(target: Address, tokenID: TokenID, amount: Amount): ErrorCode {
    // 1. 参数验证
    if (!this.validateFreezeParams(target, tokenID, amount)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 查询余额
    const balance = HostABI.queryUTXOBalance(target, tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 3. 构建冻结状态ID
    const stateID = this.buildFreezeStateID(target, tokenID);

    // 4. 计算冻结状态哈希
    const execHash = this.computeFreezeHash(stateID, amount);

    // 5. 构建交易（使用StateOutput记录冻结状态）
    const builder = TransactionBuilder.begin();
    builder.addStateOutput(stateID, 1, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 6. 发出冻结事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: "Freeze",
      target: this.addressToBase58(target),
      token_id: tokenID,
      amount: amount.toString(),
      freezer: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 批量空投
   * @param from 发送者地址
   * @param recipients 接收者列表
   * @param tokenID 代币ID（null 表示原生币）
   * @returns 错误码
   */
  static airdrop(
    from: Address,
    recipients: Array<AirdropRecipient>,
    tokenID: TokenID | null
  ): ErrorCode {
    // 1. 参数验证
    if (!this.validateAirdropParams(from, recipients, tokenID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 计算总金额
    let totalAmount: u64 = 0;
    for (let i = 0; i < recipients.length; i++) {
      totalAmount += recipients[i].amount;
    }

    // 3. 查询余额
    const balance = HostABI.queryUTXOBalance(from, tokenID);
    if (balance < totalAmount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 4. 构建批量输出项
    const items = new Array<{ recipient: Address; amount: u64; tokenID: string | null }>();
    for (let i = 0; i < recipients.length; i++) {
      items.push({
        recipient: recipients[i].address,
        amount: recipients[i].amount,
        tokenID: tokenID,
      });
    }

    // 5. 批量创建输出
    const count = HostABI.batchCreateOutputsSimple(items);
    if (count === 0xffffffff) {
      return ErrorCode.ERROR_EXECUTION_FAILED;
    }

    // 6. 发出空投事件
    const event = JSON.stringify({
      name: "Airdrop",
      from: this.addressToBase58(from),
      token_id: tokenID || "",
      total_amount: totalAmount.toString(),
      recipient_count: recipients.length.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 批量铸造
   * @param recipients 接收者列表
   * @param tokenID 代币ID
   * @returns 错误码
   */
  static batchMint(recipients: Array<MintRecipient>, tokenID: TokenID): ErrorCode {
    // 1. 参数验证
    if (!this.validateBatchMintParams(recipients, tokenID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 构建批量输出项
    const items = new Array<{ recipient: Address; amount: u64; tokenID: string | null }>();
    for (let i = 0; i < recipients.length; i++) {
      items.push({
        recipient: recipients[i].address,
        amount: recipients[i].amount,
        tokenID: tokenID,
      });
    }

    // 3. 批量创建输出
    const count = HostABI.batchCreateOutputsSimple(items);
    if (count === 0xffffffff) {
      return ErrorCode.ERROR_EXECUTION_FAILED;
    }

    // 4. 发出批量铸造事件
    const caller = Context.getCaller();
    let totalAmount: u64 = 0;
    for (let i = 0; i < recipients.length; i++) {
      totalAmount += recipients[i].amount;
    }

    const event = JSON.stringify({
      name: "BatchMint",
      minter: this.addressToBase58(caller),
      token_id: tokenID,
      recipient_count: recipients.length.toString(),
      total_amount: totalAmount.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 验证转账参数
   */
  private static validateTransferParams(from: Address, to: Address, amount: Amount): bool {
    // 验证地址不为空
    if (from.length === 0 || to.length === 0) {
      return false;
    }

    // 验证地址不能相同
    if (this.addressesEqual(from, to)) {
      return false;
    }

    // 验证金额大于 0
    if (amount === 0) {
      return false;
    }

    return true;
  }

  /**
   * 验证铸造参数
   */
  private static validateMintParams(to: Address, tokenID: TokenID, amount: Amount): bool {
    // 验证地址不为空
    if (to.length === 0) {
      return false;
    }

    // 验证代币ID不为空
    if (tokenID.length === 0) {
      return false;
    }

    // 验证金额大于 0
    if (amount === 0) {
      return false;
    }

    return true;
  }

  /**
   * 验证销毁参数
   */
  private static validateBurnParams(from: Address, tokenID: TokenID, amount: Amount): bool {
    // 验证地址不为空
    if (from.length === 0) {
      return false;
    }

    // 验证代币ID不为空
    if (tokenID.length === 0) {
      return false;
    }

    // 验证金额大于 0
    if (amount === 0) {
      return false;
    }

    return true;
  }

  /**
   * 比较两个地址是否相等
   */
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
    // 使用 HostABI 的地址编码函数
    const base58 = HostABI.addressBytesToBase58(address);
    if (base58 === null) {
      // 如果编码失败，回退到十六进制编码（用于调试）
      let hex = "";
      for (let i = 0; i < address.length; i++) {
        const byte = address[i];
        hex += (byte >> 4).toString(16);
        hex += (byte & 0x0f).toString(16);
      }
      return hex;
    }
    return base58;
  }

  /**
   * 地址转字符串（用于状态ID构建）
   */
  private static addressToString(address: Address): string {
    return this.addressToBase58(address);
  }

  /**
   * 验证授权参数
   */
  private static validateApproveParams(
    owner: Address,
    spender: Address,
    tokenID: TokenID,
    amount: Amount
  ): bool {
    // 验证地址不为空
    if (owner.length === 0 || spender.length === 0) {
      return false;
    }

    // 验证地址不能相同
    if (this.addressesEqual(owner, spender)) {
      return false;
    }

    // 验证代币ID不为空
    if (tokenID.length === 0) {
      return false;
    }

    // 验证金额大于 0
    if (amount === 0) {
      return false;
    }

    return true;
  }

  /**
   * 构建授权状态ID
   */
  private static buildApproveStateID(
    owner: Address,
    spender: Address,
    tokenID: TokenID
  ): Uint8Array {
    const stateIDStr =
      "approve:" +
      this.addressToString(owner) +
      ":" +
      this.addressToString(spender) +
      ":" +
      tokenID;
    return Uint8Array.wrap(String.UTF8.encode(stateIDStr));
  }

  /**
   * 计算授权状态哈希
   */
  private static computeApproveHash(stateID: Uint8Array, amount: Amount): Hash {
    // 组合所有数据用于哈希计算
    const amountBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      amountBytes[i] = (amount >> (i * 8)) as u8;
    }

    const data = new Uint8Array(stateID.length + 8);
    for (let i = 0; i < stateID.length; i++) {
      data[i] = stateID[i];
    }
    for (let i = 0; i < 8; i++) {
      data[stateID.length + i] = amountBytes[i];
    }

    return computeHash(data);
  }

  /**
   * 验证冻结参数
   */
  private static validateFreezeParams(target: Address, tokenID: TokenID, amount: Amount): bool {
    // 验证地址不为空
    if (target.length === 0) {
      return false;
    }

    // 验证代币ID不为空
    if (tokenID.length === 0) {
      return false;
    }

    // 验证金额大于 0
    if (amount === 0) {
      return false;
    }

    return true;
  }

  /**
   * 构建冻结状态ID
   */
  private static buildFreezeStateID(target: Address, tokenID: TokenID): Uint8Array {
    const stateIDStr = "freeze:" + this.addressToString(target) + ":" + tokenID;
    return Uint8Array.wrap(String.UTF8.encode(stateIDStr));
  }

  /**
   * 计算冻结状态哈希
   */
  private static computeFreezeHash(stateID: Uint8Array, amount: Amount): Hash {
    // 组合所有数据用于哈希计算
    const amountBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      amountBytes[i] = (amount >> (i * 8)) as u8;
    }

    const data = new Uint8Array(stateID.length + 8);
    for (let i = 0; i < stateID.length; i++) {
      data[i] = stateID[i];
    }
    for (let i = 0; i < 8; i++) {
      data[stateID.length + i] = amountBytes[i];
    }

    return computeHash(data);
  }

  /**
   * 验证空投参数
   */
  private static validateAirdropParams(
    from: Address,
    recipients: Array<AirdropRecipient>,
    _tokenID: TokenID | null
  ): bool {
    // 验证发送者地址
    if (from.length === 0) {
      return false;
    }

    // 验证接收者列表
    if (recipients.length === 0) {
      return false;
    }

    // 验证每个接收者
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (recipient.address.length === 0) {
        return false;
      }
      if (recipient.amount === 0) {
        return false;
      }

      // 检查重复地址
      for (let j = i + 1; j < recipients.length; j++) {
        if (this.addressesEqual(recipient.address, recipients[j].address)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 验证批量铸造参数
   */
  private static validateBatchMintParams(recipients: Array<MintRecipient>, tokenID: TokenID): bool {
    // 验证接收者列表
    if (recipients.length === 0) {
      return false;
    }

    // 验证代币ID不为空
    if (tokenID.length === 0) {
      return false;
    }

    // 验证每个接收者
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (recipient.address.length === 0) {
        return false;
      }
      if (recipient.amount === 0) {
        return false;
      }

      // 检查重复地址
      for (let j = i + 1; j < recipients.length; j++) {
        if (this.addressesEqual(recipient.address, recipients[j].address)) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * 空投接收者
 */
export interface AirdropRecipient {
  address: Address;
  amount: Amount;
}

/**
 * 铸造接收者
 */
export interface MintRecipient {
  address: Address;
  amount: Amount;
}
