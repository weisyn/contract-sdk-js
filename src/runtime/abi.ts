/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Host ABI TS 友好封装
 * 
 * 封装 Host ABI 函数，提供类型安全的 TypeScript API
 * 参考: contract-sdk-go/framework/hostabi.go
 */

import * as env from './env';
import { allocateString, allocateBytes, readString, readBytes } from './memory';
import { Address, OutPoint, UTXO, OutputType, TxOutput, Resource, ResourceCategory } from '../framework/types';
// Note: findJSONField and parseUint64 are used in AssemblyScript runtime but TypeScript compiler cannot detect them
import { findJSONField, extractJSONObject, parseUint64 } from '../framework/utils/json';
import { decode as base64Decode, encode as base64Encode } from '../framework/utils/base64';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Host ABI 封装类
 * 提供类型安全的 Host 函数调用接口
 */
export class HostABI {
  // ==================== ABI 版本 ====================

  /**
   * 获取 ABI 版本
   */
  static getABIVersion(): u32 {
    return env.getABIVersion();
  }

  /**
   * 检查 ABI 版本兼容性
   * @param expectedVersion 期望的版本号（(major<<16)|(minor<<8)|patch）
   * @returns 是否兼容
   */
  static checkABICompatibility(expectedVersion: u32): bool {
    const engineVersion = env.getABIVersion();
    // 主版本号必须相同
    return (engineVersion >> 16) == (expectedVersion >> 16);
  }

  // ==================== 基础环境函数 ====================

  /**
   * 获取调用者地址
   */
  static getCaller(): Address {
    const addrPtr = env.malloc(20);
    if (addrPtr === 0) {
      return new Uint8Array(20);
    }
    const len = env.getCaller(addrPtr);
    if (len === 0 || len > 20) {
      return new Uint8Array(20);
    }
    return readBytes(addrPtr, len);
  }

  /**
   * 获取合约地址
   */
  static getContractAddress(): Address {
    const addrPtr = env.malloc(20);
    if (addrPtr === 0) {
      return new Uint8Array(20);
    }
    const len = env.getContractAddress(addrPtr);
    if (len === 0 || len > 20) {
      return new Uint8Array(20);
    }
    return readBytes(addrPtr, len);
  }

  /**
   * 设置返回值数据
   */
  static setReturnData(data: Uint8Array): void {
    const ptr = allocateBytes(data);
    if (ptr !== 0) {
      env.setReturnData(ptr, data.length);
    }
  }

  /**
   * 发出事件
   * @param event JSON 格式的事件字符串
   */
  static emitEvent(event: string): void {
    const ptr = allocateString(event);
    if (ptr !== 0) {
      const utf8 = String.UTF8.encode(event);
      env.emitEvent(ptr, utf8.byteLength);
    }
  }

  /**
   * 记录调试日志
   */
  static logDebug(message: string): void {
    const ptr = allocateString(message);
    if (ptr !== 0) {
      const utf8 = String.UTF8.encode(message);
      env.logDebug(ptr, utf8.byteLength);
    }
  }

  /**
   * 获取合约初始化参数
   */
  static getContractInitParams(maxLen: u32): Uint8Array | null {
    const bufPtr = env.malloc(maxLen);
    if (bufPtr === 0) {
      return null;
    }
    const actualLen = env.getContractInitParams(bufPtr, maxLen);
    if (actualLen === 0) {
      return null;
    }
    return readBytes(bufPtr, actualLen);
  }

  /**
   * 获取合约调用参数（简化版，实际应通过其他方式获取函数名）
   */
  static getContractParams(maxLen: u32): Uint8Array | null {
    // 简化实现：复用初始化参数获取逻辑
    return this.getContractInitParams(maxLen);
  }

  // ==================== 区块视图函数 ====================

  /**
   * 获取当前时间戳
   */
  static getTimestamp(): u64 {
    return env.getTimestamp();
  }

  /**
   * 获取当前区块高度
   */
  static getBlockHeight(): u64 {
    return env.getBlockHeight();
  }

  /**
   * 获取指定高度的区块哈希
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  static getBlockHash(height: u64): Hash | null {
    const hashPtr = env.malloc(32);
    if (hashPtr === 0) {
      return null;
    }
    const len = env.getBlockHash(height, hashPtr);
    if (len === 0 || len !== 32) {
      return null;
    }
    return readBytes(hashPtr, 32);
  }

  /**
   * 获取指定高度的 Merkle 根
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  static getMerkleRoot(height: u64): Hash | null {
    const rootPtr = env.malloc(32);
    if (rootPtr === 0) {
      return null;
    }
    const len = env.getMerkleRoot(height, rootPtr);
    if (len === 0 || len !== 32) {
      return null;
    }
    return readBytes(rootPtr, 32);
  }

  /**
   * 获取指定高度的状态根
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  static getStateRoot(height: u64): Hash | null {
    const rootPtr = env.malloc(32);
    if (rootPtr === 0) {
      return null;
    }
    const len = env.getStateRoot(height, rootPtr);
    if (len === 0 || len !== 32) {
      return null;
    }
    return readBytes(rootPtr, 32);
  }

  /**
   * 获取指定高度的矿工地址
   */
  static getMinerAddress(height: u64): Address | null {
    const addrPtr = env.malloc(20);
    if (addrPtr === 0) {
      return null;
    }
    const len = env.getMinerAddress(height, addrPtr);
    if (len === 0 || len > 20) {
      return null;
    }
    return readBytes(addrPtr, len);
  }

  // ==================== 交易上下文函数 ====================

  /**
   * 获取当前交易ID
   */
  static getTransactionID(): Hash {
    const hashPtr = env.malloc(32);
    if (hashPtr === 0) {
      return new Uint8Array(32);
    }
    const len = env.getTxHash(hashPtr);
    if (len === 0 || len !== 32) {
      return new Uint8Array(32);
    }
    return readBytes(hashPtr, 32);
  }

  /**
   * 获取当前交易在区块中的索引
   */
  static getTxIndex(): u32 {
    return env.getTxIndex();
  }

  // ==================== HostABI v1 新增函数 ====================

  /**
   * 获取链标识符
   */
  static getChainID(): Uint8Array | null {
    const chainIDPtr = env.malloc(64);
    if (chainIDPtr === 0) {
      return null;
    }
    const len = env.getChainID(chainIDPtr);
    if (len === 0) {
      return null;
    }
    return readBytes(chainIDPtr, len);
  }

  // ==================== UTXO 操作函数 ====================

  /**
   * 查询 UTXO 余额
   */
  static queryUTXOBalance(address: Address, tokenID: string | null): u64 {
    const addrPtr = allocateBytes(address);
    if (addrPtr === 0) {
      return 0;
    }
    let tokenIDPtr: u32 = 0;
    let tokenIDLen: u32 = 0;
    if (tokenID !== null) {
      const tokenIDBytes = allocateString(tokenID);
      if (tokenIDBytes !== 0) {
        tokenIDPtr = tokenIDBytes;
        tokenIDLen = String.UTF8.byteLength(tokenID);
      }
    }
    return env.queryUTXOBalance(addrPtr, tokenIDPtr, tokenIDLen);
  }

  /**
   * 查询指定 UTXO（JSON 格式）
   * @param outPoint UTXO 引用点
   * @returns UTXO 信息，如果不存在返回 null
   */
  static utxoLookup(outPoint: OutPoint): UTXO | null {
    // 验证参数
    if (outPoint.txHash.length !== 32) {
      return null;
    }

    const txIDPtr = allocateBytes(outPoint.txHash);
    if (txIDPtr === 0) {
      return null;
    }

    const outputSize = 8192; // 假设最大8KB
    const outputPtr = env.malloc(outputSize);
    if (outputPtr === 0) {
      return null;
    }

    const actualLen = env.utxoLookupJSON(
      txIDPtr,
      32,
      outPoint.index,
      outputPtr,
      outputSize
    );

    if (actualLen === 0) {
      return null;
    }

    // 读取 JSON 数据
    const jsonBytes = readBytes(outputPtr, actualLen);
    if (jsonBytes.length === 0) {
      return null;
    }

    // 解析 JSON 字符串
    const jsonStr = String.UTF8.decode(jsonBytes.buffer);
    
    // 确定输出类型
    let outputType: OutputType = OutputType.ASSET; // 默认类型
    if (findJSONField(jsonStr, 'asset') !== '') {
      outputType = OutputType.ASSET;
    } else if (findJSONField(jsonStr, 'state') !== '') {
      outputType = OutputType.STATE;
    } else if (findJSONField(jsonStr, 'resource') !== '') {
      outputType = OutputType.RESOURCE;
    }
    
    // 解析 owner 字段（地址）
    const ownerStr = findJSONField(jsonStr, 'owner');
    let recipient: Address | null = null;
    if (ownerStr !== '') {
      // Base64 解码地址（protobuf JSON 使用 Base64 编码字节）
      const ownerBytes = base64Decode(ownerStr);
      if (ownerBytes.length >= 20) {
        recipient = ownerBytes.slice(0, 20);
      }
    }
    
    // 解析 asset 字段（如果存在）
    let amount: u64 = 0;
    let tokenID: string | null = null;
    if (outputType === OutputType.ASSET) {
      const assetJSON = extractJSONObject(jsonStr, 'asset');
      if (assetJSON !== '') {
        // 解析 amount
        const amountStr = findJSONField(assetJSON, 'amount');
        if (amountStr !== '') {
          amount = parseUint64(amountStr);
        }
        
        // 解析 tokenId
        const tokenIDStr = findJSONField(assetJSON, 'tokenId');
        if (tokenIDStr !== '') {
          tokenID = tokenIDStr;
        }
      }
    }
    
    // 构造 UTXO 对象
    const output = new TxOutput(
      outputType,
      recipient,
      amount,
      tokenID,
      jsonBytes // 保存原始 JSON 数据
    );
    
    return new UTXO(outPoint, output);
  }

  /**
   * 检查 UTXO 是否存在
   */
  static utxoExists(outPoint: OutPoint): bool {
    if (outPoint.txHash.length !== 32) {
      return false;
    }

    const txIDPtr = allocateBytes(outPoint.txHash);
    if (txIDPtr === 0) {
      return false;
    }

    const result = env.utxoExists(txIDPtr, 32, outPoint.index);
    return result === 1;
  }

  /**
   * 创建 UTXO 输出
   * @param recipient 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（可选）
   * @returns 输出索引，失败返回 0xFFFFFFFF
   */
  static createUTXOOutput(
    recipient: Address,
    amount: u64,
    tokenID: string | null
  ): u32 {
    const recipientPtr = allocateBytes(recipient);
    if (recipientPtr === 0) {
      return 0xFFFFFFFF;
    }

    let tokenIDPtr: u32 = 0;
    let tokenIDLen: u32 = 0;
    if (tokenID !== null) {
      const tokenIDBytes = allocateString(tokenID);
      if (tokenIDBytes !== 0) {
        tokenIDPtr = tokenIDBytes;
        tokenIDLen = String.UTF8.byteLength(tokenID);
      }
    }

    return env.createUTXOOutput(recipientPtr, amount, tokenIDPtr, tokenIDLen);
  }

  /**
   * 追加状态输出
   * @param stateID 状态ID
   * @param version 状态版本
   * @param execHash 执行哈希
   * @param publicInputs 公共输入（可选）
   * @param parentHash 父哈希（可选）
   * @returns 输出索引，失败返回 0xFFFFFFFF
   */
  static appendStateOutput(
    stateID: Uint8Array,
    version: u64,
    execHash: Hash,
    publicInputs: Uint8Array | null = null,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    parentHash: Hash | null = null
  ): u32 {
    const stateIDPtr = allocateBytes(stateID);
    if (stateIDPtr === 0) {
      return 0xFFFFFFFF;
    }

    const execHashPtr = allocateBytes(execHash);
    if (execHashPtr === 0) {
      return 0xFFFFFFFF;
    }

    let publicInputsPtr: u32 = 0;
    let publicInputsLen: u32 = 0;
    if (publicInputs !== null && publicInputs.length > 0) {
      const ptr = allocateBytes(publicInputs);
      if (ptr !== 0) {
        publicInputsPtr = ptr;
        publicInputsLen = publicInputs.length;
      }
    }

    let parentHashPtr: u32 = 0;
    if (parentHash !== null) {
      const ptr = allocateBytes(parentHash);
      if (ptr !== 0) {
        parentHashPtr = ptr;
      }
    }

    return env.appendStateOutput(
      stateIDPtr,
      stateID.length,
      version,
      execHashPtr,
      publicInputsPtr,
      publicInputsLen,
      parentHashPtr
    );
  }

  /**
   * 追加资源输出
   * @param resource 资源数据（字节数组）
   * @param owner 资源所有者地址
   * @param lockingConditions 锁定条件（JSON字符串，可选）
   * @returns 输出索引，失败返回 0xFFFFFFFF
   */
  static appendResourceOutput(
    resource: Uint8Array,
    owner: Address,
    lockingConditions: string | null = null
  ): u32 {
    const resourcePtr = allocateBytes(resource);
    if (resourcePtr === 0) {
      return 0xFFFFFFFF;
    }

    const ownerPtr = allocateBytes(owner);
    if (ownerPtr === 0) {
      return 0xFFFFFFFF;
    }

    let lockingPtr: u32 = 0;
    let lockingLen: u32 = 0;
    if (lockingConditions !== null && lockingConditions !== '') {
      const ptr = allocateString(lockingConditions);
      if (ptr !== 0) {
        lockingPtr = ptr;
        lockingLen = String.UTF8.byteLength(lockingConditions);
      }
    }

    return env.appendResourceOutput(
      resourcePtr,
      resource.length,
      ownerPtr,
      owner.length,
      lockingPtr,
      lockingLen
    );
  }

  /**
   * 创建带锁定条件的资产输出
   * @param recipient 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（可选）
   * @param lockingConditions 锁定条件（JSON字符串，可选）
   * @returns 输出索引，失败返回 0xFFFFFFFF
   */
  static createAssetOutputWithLock(
    recipient: Address,
    amount: u64,
    tokenID: string | null,
    lockingConditions: string | null = null
  ): u32 {
    const recipientPtr = allocateBytes(recipient);
    if (recipientPtr === 0) {
      return 0xFFFFFFFF;
    }

    let tokenIDPtr: u32 = 0;
    let tokenIDLen: u32 = 0;
    if (tokenID !== null) {
      const tokenIDBytes = allocateString(tokenID);
      if (tokenIDBytes !== 0) {
        tokenIDPtr = tokenIDBytes;
        tokenIDLen = String.UTF8.byteLength(tokenID);
      }
    }

    let lockingPtr: u32 = 0;
    let lockingLen: u32 = 0;
    if (lockingConditions !== null && lockingConditions !== '') {
      const ptr = allocateString(lockingConditions);
      if (ptr !== 0) {
        lockingPtr = ptr;
        lockingLen = String.UTF8.byteLength(lockingConditions);
      }
    }

    return env.createAssetOutputWithLock(
      recipientPtr,
      recipient.length,
      amount,
      tokenIDPtr,
      tokenIDLen,
      lockingPtr,
      lockingLen
    );
  }

  /**
   * 批量创建资产输出（简化版）
   * @param items 输出项列表，每个项包含 recipient、amount、tokenID
   * @returns 成功创建的输出数量，失败返回 0xFFFFFFFF
   */
  static batchCreateOutputsSimple(items: Array<{recipient: Address; amount: u64; tokenID: string | null}>): u32 {
    if (items.length === 0) {
      return 0xFFFFFFFF;
    }

    // 构造批量输出 JSON（手动序列化避免引入完整 JSON 库）
    let batchJSON = '[';
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        batchJSON += ',';
      }
      const item = items[i];
      
      // Base64 编码地址
      const recipientBase64 = base64Encode(item.recipient);
      
      batchJSON += `{"recipient":"${recipientBase64}","amount":${item.amount}`;
      
      if (item.tokenID !== null && item.tokenID !== '') {
        // Base64 编码 TokenID
        const tokenIDBytes = String.UTF8.encode(item.tokenID);
        const tokenIDBase64 = base64Encode(Uint8Array.wrap(tokenIDBytes));
        batchJSON += `,"token_id":"${tokenIDBase64}"`;
      } else {
        batchJSON += `,"token_id":null`;
      }
      
      batchJSON += `,"locking_conditions":[]}`;
    }
    batchJSON += ']';

    // 分配内存并写入 JSON
    const jsonBytes = String.UTF8.encode(batchJSON);
    const batchPtr = allocateBytes(Uint8Array.wrap(jsonBytes));
    if (batchPtr === 0) {
      return 0xFFFFFFFF;
    }

    // 调用宿主函数
    const result = env.batchCreateOutputs(batchPtr, jsonBytes.byteLength);
    return result;
  }

  // ==================== 资源查询函数 ====================

  /**
   * 检查资源是否存在
   */
  static resourceExists(contentHash: Hash): bool {
    if (contentHash.length !== 32) {
      return false;
    }

    const contentHashPtr = allocateBytes(contentHash);
    if (contentHashPtr === 0) {
      return false;
    }

    const result = env.resourceExists(contentHashPtr, 32);
    return result === 1;
  }

  /**
   * 查询指定资源（JSON 格式）
   * @param contentHash 资源内容哈希
   * @returns Resource 信息，如果不存在返回 null
   */
  static resourceLookup(contentHash: Hash): Resource | null {
    if (contentHash.length !== 32) {
      return null;
    }

    const contentHashPtr = allocateBytes(contentHash);
    if (contentHashPtr === 0) {
      return null;
    }

    const resourceSize = 8192; // 假设最大8KB
    const resourcePtr = env.malloc(resourceSize);
    if (resourcePtr === 0) {
      return null;
    }

    const actualLen = env.resourceLookupJSON(
      contentHashPtr,
      32,
      resourcePtr,
      resourceSize
    );

    if (actualLen === 0) {
      return null;
    }

    // 读取 JSON 数据
    const jsonBytes = readBytes(resourcePtr, actualLen);
    if (jsonBytes.length === 0) {
      return null;
    }

    // 解析 JSON 字符串
    const jsonStr = String.UTF8.decode(jsonBytes.buffer);
    
    // 解析 category 字段
    const categoryStr = findJSONField(jsonStr, 'category');
    let category: ResourceCategory = ResourceCategory.STATIC; // 默认类别
    if (categoryStr === 'EXECUTABLE' || categoryStr === '1') {
      category = ResourceCategory.EXECUTABLE;
    }
    
    // 解析 mimeType 字段
    const mimeType = findJSONField(jsonStr, 'mimeType');
    
    // 解析 size 字段
    const sizeStr = findJSONField(jsonStr, 'size');
    let size: u64 = 0;
    if (sizeStr !== '') {
      size = parseUint64(sizeStr);
    }
    
    return new Resource(contentHash, category, mimeType, size);
  }

  // ==================== 状态查询函数 ====================

  /**
   * 获取状态值
   */
  static stateGet(key: string): Uint8Array | null {
    const keyPtr = allocateString(key);
    if (keyPtr === 0) {
      return null;
    }
    const keyLen = String.UTF8.byteLength(key);

    const maxValueLen = 8192;
    const valuePtr = env.malloc(maxValueLen);
    if (valuePtr === 0) {
      return null;
    }

    const actualLen = env.stateGet(keyPtr, keyLen, valuePtr, maxValueLen);
    if (actualLen === 0) {
      return null;
    }

    return readBytes(valuePtr, actualLen);
  }

  /**
   * 获取状态版本
   */
  static getStateVersion(stateID: string): u64 {
    const stateIDPtr = allocateString(stateID);
    if (stateIDPtr === 0) {
      return 0;
    }
    const stateIDLen = String.UTF8.byteLength(stateID);
    return env.getStateVersion(stateIDPtr, stateIDLen);
  }

  /**
   * 从链上查询历史状态
   * 
   * 🎯 **用途**：查询链上已确认交易中的 StateOutput，返回匹配 stateID 的最新状态值和版本号
   * 
   * **参数**：
   *   - stateID: 状态ID（字符串）
   * 
   * **返回**：
   *   - value: 状态值（executionResultHash），如果不存在返回 null
   *   - version: 状态版本号，如果不存在返回 0
   * 
   * **注意**：
   *   - 查询链上已确认的历史状态，不是当前交易草稿中的状态
   *   - 从链尖向后查找最近100个区块
   *   - 返回版本号最高的状态值
   * 
   * **示例**：
   * ```typescript
   * const stateID = 'vote:address1:proposal_001';
   * const result = HostABI.queryStateFromChain(stateID);
   * if (result !== null) {
   *   const value = result.value;
   *   const version = result.version;
   * }
   * ```
   */
  static queryStateFromChain(stateID: string): { value: Uint8Array; version: u64 } | null {
    const stateIDPtr = allocateString(stateID);
    if (stateIDPtr === 0) {
      return null;
    }
    const stateIDLen = String.UTF8.byteLength(stateID);

    const maxValueLen = 8192;
    const valuePtr = env.malloc(maxValueLen);
    if (valuePtr === 0) {
      return null;
    }

    // 分配版本号缓冲区（8字节，u64）
    const versionPtr = env.malloc(8);
    if (versionPtr === 0) {
      return null;
    }

    const status = env.stateGetFromChain(stateIDPtr, stateIDLen, valuePtr, maxValueLen, versionPtr);
    if (status === 0) {
      // 成功：读取状态值和版本号
      const value = readBytes(valuePtr, maxValueLen);
      // 读取版本号（u64，8字节）
      const versionBytes = readBytes(versionPtr, 8);
      let version: u64 = 0;
      for (let i = 0; i < 8; i++) {
        version = version | (<u64>versionBytes[i] << (i * 8));
      }
      return { value, version };
    }

    // 失败或不存在
    return null;
  }

  // ==================== 地址编码函数 ====================

  /**
   * 地址字节数组转 Base58
   */
  static addressBytesToBase58(address: Address): string | null {
    const addrPtr = allocateBytes(address);
    if (addrPtr === 0) {
      return null;
    }

    const maxLen = 64;
    const resultPtr = env.malloc(maxLen);
    if (resultPtr === 0) {
      return null;
    }

    const len = env.addressBytesToBase58(addrPtr, resultPtr, maxLen);
    if (len === 0) {
      return null;
    }

    return readString(resultPtr, len);
  }

  /**
   * Base58 地址转字节数组
   */
  static addressBase58ToBytes(base58: string): Address | null {
    const base58Ptr = allocateString(base58);
    if (base58Ptr === 0) {
      return null;
    }
    const base58Len = String.UTF8.byteLength(base58);

    const resultPtr = env.malloc(20);
    if (resultPtr === 0) {
      return null;
    }

    const len = env.addressBase58ToBytes(base58Ptr, base58Len, resultPtr);
    if (len === 0 || len > 20) {
      return null;
    }

    return readBytes(resultPtr, len);
  }

  // ==================== 受控外部交互函数（ISPC）====================

  /**
   * 声明外部状态预期
   * @param claim JSON 格式的声明
   * @returns 声明ID，失败返回 null
   */
  static declareExternalState(claim: string): string | null {
    const claimPtr = allocateString(claim);
    if (claimPtr === 0) {
      return null;
    }
    const claimLen = String.UTF8.byteLength(claim);

    const claimIDSize = 64;
    const claimIDPtr = env.malloc(claimIDSize);
    if (claimIDPtr === 0) {
      return null;
    }

    const actualLen = env.hostDeclareExternalState(
      claimPtr,
      claimLen,
      claimIDPtr,
      claimIDSize
    );

    if (actualLen === 0) {
      return null;
    }

    return readString(claimIDPtr, actualLen);
  }

  /**
   * 提供验证佐证
   * @param claimID 声明ID
   * @param evidence JSON 格式的佐证
   * @returns 是否成功
   */
  static provideEvidence(claimID: string, evidence: string): bool {
    const claimIDPtr = allocateString(claimID);
    if (claimIDPtr === 0) {
      return false;
    }
    const claimIDLen = String.UTF8.byteLength(claimID);

    const evidencePtr = allocateString(evidence);
    if (evidencePtr === 0) {
      return false;
    }
    const evidenceLen = String.UTF8.byteLength(evidence);

    const result = env.hostProvideEvidence(
      claimIDPtr,
      claimIDLen,
      evidencePtr,
      evidenceLen
    );

    return result === 1;
  }

  /**
   * 查询受控外部状态
   * @param claimID 声明ID
   * @returns 查询结果（JSON字符串），失败返回 null
   */
  static queryControlledState(claimID: string): string | null {
    const claimIDPtr = allocateString(claimID);
    if (claimIDPtr === 0) {
      return null;
    }
    const claimIDLen = String.UTF8.byteLength(claimID);

    const resultSize = 8192;
    const resultPtr = env.malloc(resultSize);
    if (resultPtr === 0) {
      return null;
    }

    const actualLen = env.hostQueryControlledState(
      claimIDPtr,
      claimIDLen,
      resultPtr,
      resultSize
    );

    if (actualLen === 0) {
      return null;
    }

    return readString(resultPtr, actualLen);
  }
}
