/**
 * 交易构建器
 * 
 * 提供链式 API 用于构建交易，支持 inputs/outputs/intents
 * 参考: contract-sdk-go/framework/internal/transaction.go
 */

import * as env from '../runtime/env';
import { allocateString, readBytes } from '../runtime/memory';
import { ErrorCode, Address, Amount, TokenID, Hash, TransactionResult, OutPoint, InputDescriptor, IntentDescriptor, IntentType } from './types';
import { encode as base64Encode } from './utils/base64';

// 输出类型常量（避免使用联合类型字符串）
const OUTPUT_TYPE_ASSET: i32 = 0;
const OUTPUT_TYPE_STATE: i32 = 1;
const OUTPUT_TYPE_RESOURCE: i32 = 2;

/**
 * 交易构建器
 * 提供链式 API 用于构建交易，支持 Draft JSON 格式
 */
export class TransactionBuilder {
  private inputs: Array<InputDescriptor> = [];
  private outputs: Array<OutputDescriptor> = [];
  private intents: Array<IntentDescriptor> = [];
  private finalized: bool = false;
  private signMode: string = 'defer_sign';

  /**
   * 开始构建交易
   */
  static begin(): TransactionBuilder {
    return new TransactionBuilder();
  }

  /**
   * 添加交易输入
   * @param outPoint UTXO 引用点
   * @param isReferenceOnly 是否仅作为引用（不消费）
   * @param unlockingProof 解锁证明（可选）
   */
  addInput(
    outPoint: OutPoint,
    isReferenceOnly: bool = false,
    unlockingProof: Uint8Array | null = null
  ): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    // 验证 outPoint
    if (outPoint.txHash.length !== 32) {
      return this;
    }

    const input = new InputDescriptor(outPoint, isReferenceOnly, unlockingProof);
    this.inputs.push(input);
    return this;
  }

  /**
   * 添加资产输出
   * @param to 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   */
  addAssetOutput(to: Address, amount: Amount, tokenID: TokenID | null): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    const desc = new OutputDescriptor(OUTPUT_TYPE_ASSET);
    desc.to = to;
    desc.amount = amount;
    desc.tokenID = tokenID;
    this.outputs.push(desc);

    return this;
  }

  /**
   * 添加状态输出
   * @param stateID 状态ID
   * @param version 版本号
   * @param execHash 执行哈希
   */
  addStateOutput(stateID: Uint8Array, version: u64, execHash: Hash): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    const desc = new OutputDescriptor(OUTPUT_TYPE_STATE);
    desc.stateID = stateID;
    desc.version = version;
    desc.execHash = execHash;
    this.outputs.push(desc);

    return this;
  }

  /**
   * 添加资源输出
   * @param resource 资源数据
   * @param owner 资源所有者地址
   */
  addResourceOutput(resource: Uint8Array, owner: Address): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    const desc = new OutputDescriptor(OUTPUT_TYPE_RESOURCE);
    desc.resource = resource;
    desc.owner = owner;
    this.outputs.push(desc);

    return this;
  }

  /**
   * 添加转账意图
   * @param from 发送者地址
   * @param to 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   */
  transferIntent(
    from: Address,
    to: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    const intent = new IntentDescriptor(
      IntentType.TRANSFER,
      from,
      amount,
      to,
      tokenID
    );
    this.intents.push(intent);

    return this;
  }

  /**
   * 添加质押意图
   * @param staker 质押者地址
   * @param amount 金额
   * @param validator 验证者地址
   */
  stakeIntent(
    staker: Address,
    amount: Amount,
    validator: Address
  ): TransactionBuilder {
    if (this.finalized) {
      return this;
    }

    const intent = new IntentDescriptor(
      IntentType.STAKE,
      staker,
      amount,
      null,
      null,
      validator
    );
    this.intents.push(intent);

    return this;
  }

  /**
   * 转账操作（兼容旧 API，内部使用 transferIntent）
   * @param from 发送者地址
   * @param to 接收者地址
   * @param amount 金额
   * @param tokenID 代币ID（null 表示原生币）
   */
  transfer(
    from: Address,
    to: Address,
    amount: Amount,
    tokenID: TokenID | null
  ): TransactionBuilder {
    return this.transferIntent(from, to, amount, tokenID);
  }

  /**
   * 设置签名模式
   * @param mode 签名模式（"defer_sign" | "delegated" | "threshold" | "paymaster"）
   */
  setSignMode(mode: string): TransactionBuilder {
    if (this.finalized) {
      return this;
    }
    this.signMode = mode;
    return this;
  }

  /**
   * 完成交易构建
   * 构造 Draft JSON 并调用 host_build_transaction
   * @returns 交易结果
   */
  finalize(): TransactionResult {
    if (this.finalized) {
      return new TransactionResult(false, ErrorCode.ERROR_INVALID_STATE);
    }
    
    this.finalized = true;
    
    // 序列化 Draft JSON
    const draftJSON = this.serializeDraft();
    if (draftJSON === '') {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }

    // 分配内存并写入 Draft JSON
    const draftPtr = allocateString(draftJSON);
    if (draftPtr === 0) {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }
    const draftLen = String.UTF8.byteLength(draftJSON);

    // 分配 receipt 缓冲区（4KB）
    const receiptSize: u32 = 4096;
    const receiptPtr = env.malloc(receiptSize);
    if (receiptPtr === 0) {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }

    // 调用 host_build_transaction
    const result = env.hostBuildTransaction(draftPtr, draftLen, receiptPtr, receiptSize);
    if (result !== ErrorCode.SUCCESS) {
      return new TransactionResult(false, result as ErrorCode);
    }

    // 读取 receipt JSON
    const receiptBytes = readBytes(receiptPtr, receiptSize);
    if (receiptBytes.length === 0) {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }

    // 找到实际的 JSON 结束位置
    const actualLen = this.findJSONEnd(receiptBytes);
    if (actualLen === 0) {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }

    const receiptJSON = String.UTF8.decode(receiptBytes.slice(0, actualLen).buffer);

    // 解析 receipt JSON，检查是否有错误
    if (this.hasError(receiptJSON)) {
      return new TransactionResult(false, ErrorCode.ERROR_EXECUTION_FAILED);
    }

    // 成功
    return new TransactionResult(true, ErrorCode.SUCCESS);
  }

  /**
   * 序列化 Draft 为 JSON
   * 格式与 Go SDK 对齐
   */
  private serializeDraft(): string {
    let json = `{"sign_mode":"${this.signMode}","outputs":[`;

    // 序列化 outputs
    for (let i = 0; i < this.outputs.length; i++) {
      if (i > 0) {
        json += ',';
      }
      const out = this.outputs[i];
      
      json += `{"type":"${this.getOutputTypeString(out.kind)}"`;

      if (out.kind === OUTPUT_TYPE_ASSET) {
        const toHex = this.addressToHex(out.to!);
        json += `,"owner":"${toHex}"`;
        json += `,"amount":"${out.amount!.toString()}"`;
        if (out.tokenID !== null && out.tokenID !== '') {
          const tokenIDHex = this.stringToHex(out.tokenID);
          json += `,"token_id":"${tokenIDHex}"`;
        } else {
          json += `,"token_id":""`;
        }
        json += `,"metadata":{}`;
      } else if (out.kind === OUTPUT_TYPE_STATE) {
        const stateIDBase64 = base64Encode(out.stateID!);
        json += `,"state_id":"${stateIDBase64}"`;
        json += `,"version":${out.version!.toString()}`;
        const execHashBase64 = base64Encode(out.execHash!);
        json += `,"exec_hash":"${execHashBase64}"`;
      } else if (out.kind === OUTPUT_TYPE_RESOURCE) {
        const resourceBase64 = base64Encode(out.resource!);
        json += `,"resource":"${resourceBase64}"`;
      }

      json += '}';
    }

    json += `],"intents":[`;

    // 序列化 intents
    for (let i = 0; i < this.intents.length; i++) {
      if (i > 0) {
        json += ',';
      }
      const intent = this.intents[i];
      
      json += `{"type":"${this.getIntentTypeString(intent.intentType)}","params":{`;

      if (intent.intentType === IntentType.TRANSFER) {
        const fromHex = this.addressToHex(intent.from);
        const toHex = this.addressToHex(intent.to!);
        json += `"from":"${fromHex}"`;
        json += `,"to":"${toHex}"`;
        if (intent.tokenID !== null && intent.tokenID !== '') {
          const tokenIDHex = this.stringToHex(intent.tokenID);
          json += `,"token_id":"${tokenIDHex}"`;
        } else {
          json += `,"token_id":""`;
        }
        json += `,"amount":"${intent.amount.toString()}"`;
      } else if (intent.intentType === IntentType.STAKE) {
        const stakerHex = this.addressToHex(intent.from);
        const validatorHex = this.addressToHex(intent.validator!);
        json += `"staker":"${stakerHex}"`;
        json += `,"amount":"${intent.amount.toString()}"`;
        json += `,"validator":"${validatorHex}"`;
      }

      json += '}}';
    }

    json += ']}';

    return json;
  }

  /**
   * 获取输出类型字符串
   */
  private getOutputTypeString(kind: i32): string {
    if (kind === OUTPUT_TYPE_ASSET) return 'asset';
    if (kind === OUTPUT_TYPE_STATE) return 'state';
    if (kind === OUTPUT_TYPE_RESOURCE) return 'resource';
    return 'asset';
  }

  /**
   * 获取意图类型字符串
   */
  private getIntentTypeString(intentType: IntentType): string {
    if (intentType === IntentType.TRANSFER) return 'transfer';
    if (intentType === IntentType.STAKE) return 'stake';
    return 'transfer';
  }

  /**
   * 地址转十六进制字符串
   */
  private addressToHex(address: Address): string {
    let hex = '';
    for (let i = 0; i < address.length; i++) {
      const byte = address[i];
      const high = (byte >> 4) & 0xF;
      const low = byte & 0xF;
      hex += String.fromCharCode(high < 10 ? 48 + high : 87 + high);
      hex += String.fromCharCode(low < 10 ? 48 + low : 87 + low);
    }
    return hex;
  }

  /**
   * 字符串转十六进制（用于 tokenID）
   */
  private stringToHex(str: string): string {
    const bytes = String.UTF8.encode(str);
    let hex = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      const byte = bytes[i];
      const high = (byte >> 4) & 0xF;
      const low = byte & 0xF;
      hex += String.fromCharCode(high < 10 ? 48 + high : 87 + high);
      hex += String.fromCharCode(low < 10 ? 48 + low : 87 + low);
    }
    return hex;
  }

  /**
   * 查找 JSON 结束位置
   */
  private findJSONEnd(data: Uint8Array): u32 {
    // 从后往前查找最后一个 '}'
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] === 0x7D) { // '}'
        return i + 1;
      }
      // 跳过空白字符
      if (data[i] !== 0x20 && data[i] !== 0x09 && data[i] !== 0x0A && data[i] !== 0x0D && data[i] !== 0) {
        break;
      }
    }
    return 0;
  }

  /**
   * 检查 receipt JSON 是否有错误
   */
  private hasError(receiptJSON: string): bool {
    // 简单检查：查找 "error" 字段且值不为空/null
    const errorIdx = receiptJSON.indexOf('"error"');
    if (errorIdx < 0) {
      return false;
    }
    
    // 检查 error 字段的值
    const valueStart = receiptJSON.indexOf(':', errorIdx);
    if (valueStart < 0) {
      return false;
    }
    
    // 跳过空白字符
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let idx = valueStart + 1;
    while (idx < receiptJSON.length && (receiptJSON.charCodeAt(idx) === 0x20 || receiptJSON.charCodeAt(idx) === 0x09)) {
      idx++;
    }
    
    // 检查是否为 null 或空字符串
    if (idx < receiptJSON.length) {
      const char = receiptJSON.charCodeAt(idx);
      if (char === 0x6E) { // 'n' (null)
        return false;
      }
      if (char === 0x22) { // '"'
        // 检查是否为空字符串
        if (idx + 1 < receiptJSON.length && receiptJSON.charCodeAt(idx + 1) === 0x22) {
          return false;
        }
      }
    }
    
    return true;
  }
}

/**
 * 输出描述符
 */
class OutputDescriptor {
  kind: i32;                    // 输出类型
  to: Address | null;           // 资产输出接收者
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  amount: Amount | null;        // 资产输出金额
  tokenID: TokenID | null;      // 资产输出代币ID
  stateID: Uint8Array | null;   // 状态输出ID
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  version: u64 | null;          // 状态版本
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  execHash: Hash | null;        // 执行哈希
  resource: Uint8Array | null;  // 资源数据
  owner: Address | null;         // 资源所有者

  constructor(kind: i32) {
    this.kind = kind;
    this.to = null;
    this.amount = 0;
    this.tokenID = null;
    this.stateID = null;
    this.version = 0;
    this.execHash = null;
    this.resource = null;
    this.owner = null;
  }
}
