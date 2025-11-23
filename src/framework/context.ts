/**
 * 执行上下文
 * 
 * 提供合约执行上下文信息
 * 参考: contract-sdk-go/framework/contract_base.go
 */

import { HostABI } from '../runtime/abi';
import { Address, Hash } from './types';

/**
 * 执行上下文类
 * 提供合约执行时的上下文信息
 */
export class Context {
  /**
   * 获取调用者地址
   */
  static getCaller(): Address {
    return HostABI.getCaller();
  }

  /**
   * 获取合约地址
   */
  static getContractAddress(): Address {
    return HostABI.getContractAddress();
  }

  /**
   * 获取当前交易ID
   */
  static getTransactionID(): Hash {
    return HostABI.getTransactionID();
  }

  /**
   * 获取当前时间戳
   */
  static getTimestamp(): u64 {
    return HostABI.getTimestamp();
  }

  /**
   * 获取当前区块高度
   */
  static getBlockHeight(): u64 {
    return HostABI.getBlockHeight();
  }

  /**
   * 获取指定高度的区块哈希
   */
  static getBlockHash(height: u64): Hash | null {
    return HostABI.getBlockHash(height);
  }

  /**
   * 获取链标识符
   */
  static getChainID(): Uint8Array | null {
    return HostABI.getChainID();
  }

  /**
   * 获取交易在区块中的索引
   */
  static getTxIndex(): u32 {
    return HostABI.getTxIndex();
  }

  /**
   * 获取指定高度的 Merkle 根
   */
  static getMerkleRoot(height: u64): Hash | null {
    return HostABI.getMerkleRoot(height);
  }

  /**
   * 获取指定高度的状态根
   */
  static getStateRoot(height: u64): Hash | null {
    return HostABI.getStateRoot(height);
  }

  /**
   * 获取状态版本
   */
  static getStateVersion(stateID: string): u64 {
    return HostABI.getStateVersion(stateID);
  }

  /**
   * 获取状态值
   */
  static getState(key: string): Uint8Array | null {
    return HostABI.stateGet(key);
  }

  /**
   * 获取区块时间戳（别名，与 getTimestamp 一致）
   */
  static getBlockTimestamp(): u64 {
    return HostABI.getTimestamp();
  }
}

