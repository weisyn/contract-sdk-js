/**
 * NFT 操作 Helper
 * 
 * 提供 NFT 铸造、转移等功能
 * 对标 Go SDK 的 helpers/nft/
 * 
 * 参考: contract-sdk-go/helpers/nft/
 */

import { HostABI } from '../runtime/abi';
import { Context } from '../framework/context';
import { TransactionBuilder } from '../framework/transaction';
import { ErrorCode, Address, TokenID, Hash } from '../framework/types';
import { Storage } from '../framework/storage';
import { computeHash } from '../framework/utils/hash';
import { Token } from './token';

/**
 * NFT 操作类
 */
export class NFT {
  /**
   * 铸造 NFT
   * @param to 接收者地址
   * @param tokenID 代币ID（NFT ID）
   * @param metadata 元数据
   * @returns 错误码
   */
  static mint(to: Address, tokenID: TokenID, metadata: Uint8Array | null): ErrorCode {
    // 1. 参数验证
    if (!this.validateMintParams(to, tokenID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 检查 NFT 是否已存在
    const owner = this.ownerOf(tokenID);
    if (owner !== null) {
      return ErrorCode.ERROR_ALREADY_EXISTS;
    }

    // 3. 使用 Token.mint 铸造 NFT（数量为 1）
    const mintResult = Token.mint(to, 1, tokenID);
    if (mintResult !== ErrorCode.SUCCESS) {
      return mintResult;
    }

    // 4. 存储 NFT 元数据（使用 StateOutput，如果提供了元数据）
    if (metadata !== null && metadata.length > 0) {
      // 构建元数据状态ID
      const metadataStateID = this.buildMetadataStateID(tokenID);
      // 计算元数据哈希
      const metadataHash = this.computeMetadataHash(metadataStateID, metadata);
      // 添加状态输出
      const builder = TransactionBuilder.begin();
      builder.addStateOutput(metadataStateID, 1, metadataHash);
      const stateResult = builder.finalize();
      if (!stateResult.success) {
        return stateResult.errorCode;
      }
    }

    // 5. 发出 NFT 铸造事件
    const caller = Context.getCaller();
    const eventData: Record<string, string> = {
      name: 'NFTMint',
      to: this.addressToBase58(to),
      token_id: tokenID,
      minter: this.addressToBase58(caller),
    };
    // 如果有元数据，添加到事件中
    if (metadata !== null && metadata.length > 0) {
      eventData.metadata = String.UTF8.decode(metadata.buffer);
    }
    const event = JSON.stringify(eventData);
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 转移 NFT
   * @param from 发送者地址
   * @param to 接收者地址
   * @param tokenID 代币ID（NFT ID）
   * @returns 错误码
   */
  static transfer(from: Address, to: Address, tokenID: TokenID): ErrorCode {
    // 1. 参数验证
    if (!this.validateTransferParams(from, to, tokenID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 检查 NFT 所有者
    const owner = this.ownerOf(tokenID);
    if (owner === null) {
      return ErrorCode.ERROR_NOT_FOUND;
    }

    // 3. 验证发送者是所有者
    if (!this.addressesEqual(owner, from)) {
      return ErrorCode.ERROR_UNAUTHORIZED;
    }

    // 4. 在EUTXO模型中，所有权通过UTXO转移来更新
    // token.Transfer已经完成了所有权的转移，不需要额外的状态更新

    // 5. 发出 NFT 转移事件
    const event = JSON.stringify({
      name: 'NFTTransfer',
      from: this.addressToBase58(from),
      to: this.addressToBase58(to),
      token_id: tokenID,
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 查询 NFT 所有者
   * @param tokenID 代币ID（NFT ID）
   * @returns 所有者地址，如果不存在返回 null
   */
  static ownerOf(tokenID: TokenID): Address | null {
    // 参数验证
    if (tokenID.length === 0) {
      return null;
    }

    // 在EUTXO模型中，NFT所有权通过查询UTXO余额来确定
    // 如果某个地址对某个tokenID的余额为1，则该地址拥有该NFT
    // 
    // 注意：这是一个简化实现
    // 实际应用中，NFT所有权应该通过StateOutput或索引来管理
    // 当前实现仅作为示例，实际应该使用更高效的查询方式
    // 
    // 返回null表示NFT不存在或无法确定所有者
    // 实际应用中应该实现完整的查询逻辑（如通过索引服务）

    // TODO: 实现完整的查询逻辑
    // 当前实现：查询调用者地址的余额
    const caller = Context.getCaller();
    const balance = HostABI.queryUTXOBalance(caller, tokenID);
    if (balance === 1) {
      return caller;
    }

    return null;
  }

  /**
   * 查询 NFT 元数据
   * @param tokenID 代币ID（NFT ID）
   * @returns 元数据，如果不存在返回 null
   */
  static getMetadata(tokenID: TokenID): Uint8Array | null {
    const metadataKey = `nft_metadata_${tokenID}`;
    return Storage.get(metadataKey);
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 验证铸造参数
   */
  private static validateMintParams(to: Address, tokenID: TokenID): bool {
    if (to.length === 0) {
      return false;
    }
    if (tokenID.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * 验证转移参数
   */
  private static validateTransferParams(
    from: Address,
    to: Address,
    tokenID: TokenID
  ): bool {
    if (from.length === 0 || to.length === 0) {
      return false;
    }
    if (this.addressesEqual(from, to)) {
      return false;
    }
    if (tokenID.length === 0) {
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

  /**
   * 构建元数据状态ID
   * @param tokenID 代币ID（NFT ID）
   * @returns 状态ID字节数组
   */
  private static buildMetadataStateID(tokenID: TokenID): Uint8Array {
    const stateIDStr = `nft_metadata_${tokenID}`;
    return Uint8Array.wrap(String.UTF8.encode(stateIDStr));
  }

  /**
   * 计算元数据哈希
   * @param stateID 状态ID
   * @param metadata 元数据
   * @returns 哈希值
   */
  private static computeMetadataHash(stateID: Uint8Array, metadata: Uint8Array): Hash {
    // 组合状态ID和元数据用于哈希计算
    const combined = new Uint8Array(stateID.length + metadata.length);
    combined.set(stateID, 0);
    combined.set(metadata, stateID.length);
    
    // 使用工具函数计算哈希
    return computeHash(combined);
  }
}
