/**
 * Framework 层基础类型定义
 * 
 * 对标 Go SDK 的 framework/types.go 和 framework/contract_base.go
 */

// ==================== 基础类型 ====================

/** 地址类型（20字节） */
export type Address = Uint8Array;

/** 哈希类型（32字节） */
export type Hash = Uint8Array;

/** 代币ID类型 */
export type TokenID = string;

/** 金额类型 */
export type Amount = u64;

// ==================== 错误码 ====================

/** 错误码枚举 */
export enum ErrorCode {
  SUCCESS = 0,
  ERROR_INVALID_PARAMS = 1,
  ERROR_INSUFFICIENT_BALANCE = 2,
  ERROR_UNAUTHORIZED = 3,
  ERROR_NOT_FOUND = 4,
  ERROR_ALREADY_EXISTS = 5,
  ERROR_EXECUTION_FAILED = 6,
  ERROR_INVALID_STATE = 7,
  ERROR_TIMEOUT = 8,
  ERROR_NOT_IMPLEMENTED = 9,
  ERROR_PERMISSION_DENIED = 10,
  ERROR_UNKNOWN = 999,
}

// ==================== 返回类型 ====================

/** 交易构建结果 */
export class TransactionResult {
  success: bool;
  errorCode: ErrorCode;

  constructor(success: bool, errorCode: ErrorCode) {
    this.success = success;
    this.errorCode = errorCode;
  }
}

/** 状态查询结果 */
export class StateResult {
  value: Uint8Array;
  version: u64;

  constructor(value: Uint8Array, version: u64) {
    this.value = value;
    this.version = version;
  }
}

// ==================== UTXO 相关类型 ====================

/** UTXO 引用点 */
export class OutPoint {
  txHash: Hash;  // 32字节交易哈希
  index: u32;    // 输出索引

  constructor(txHash: Hash, index: u32) {
    this.txHash = txHash;
    this.index = index;
  }
}

/** 交易输出类型（使用数值枚举，兼容 AssemblyScript） */
export enum OutputType {
  ASSET = 0,
  RESOURCE = 1,
  STATE = 2,
}

/** 交易输出 */
export class TxOutput {
  type: OutputType;
  recipient: Address | null;  // 接收者地址（仅asset类型）
  amount: Amount;              // 金额（仅asset类型）
  tokenID: TokenID | null;     // 代币ID（仅asset类型）
  data: Uint8Array;            // 其他数据

  constructor(
    type: OutputType,
    recipient: Address | null = null,
    amount: Amount = 0,
    tokenID: TokenID | null = null,
    data: Uint8Array = new Uint8Array(0)
  ) {
    this.type = type;
    this.recipient = recipient;
    this.amount = amount;
    this.tokenID = tokenID;
    this.data = data;
  }
}

/** UTXO（未花费交易输出） */
export class UTXO {
  outPoint: OutPoint;
  output: TxOutput;

  constructor(outPoint: OutPoint, output: TxOutput) {
    this.outPoint = outPoint;
    this.output = output;
  }
}

// ==================== Resource 相关类型 ====================

/** Resource 类别 */
export enum ResourceCategory {
  STATIC = 0,
  EXECUTABLE = 1,
}

/** Resource（资源） */
export class Resource {
  contentHash: Hash;        // 32字节内容哈希
  category: ResourceCategory; // 资源类别
  mimeType: string;         // MIME 类型
  size: u64;                // 资源大小（字节）

  constructor(
    contentHash: Hash,
    category: ResourceCategory = ResourceCategory.STATIC,
    mimeType: string = '',
    size: u64 = 0
  ) {
    this.contentHash = contentHash;
    this.category = category;
    this.mimeType = mimeType;
    this.size = size;
  }
}

// ==================== TransactionBuilder 相关类型 ====================

/** 解锁证明（简化版，当前为空） */
export type UnlockingProof = Uint8Array;

/** 输入描述符 */
export class InputDescriptor {
  outPoint: OutPoint;
  isReferenceOnly: bool;
  unlockingProof: UnlockingProof | null;

  constructor(
    outPoint: OutPoint,
    isReferenceOnly: bool = false,
    unlockingProof: UnlockingProof | null = null
  ) {
    this.outPoint = outPoint;
    this.isReferenceOnly = isReferenceOnly;
    this.unlockingProof = unlockingProof;
  }
}

/** 意图类型 */
export enum IntentType {
  TRANSFER = 0,
  STAKE = 1,
}

/** 意图描述符 */
export class IntentDescriptor {
  intentType: IntentType;
  from: Address;
  to: Address | null;      // transfer 需要
  tokenID: TokenID | null; // transfer 需要
  amount: Amount;
  validator: Address | null; // stake 需要

  constructor(
    intentType: IntentType,
    from: Address,
    amount: Amount,
    to: Address | null = null,
    tokenID: TokenID | null = null,
    validator: Address | null = null
  ) {
    this.intentType = intentType;
    this.from = from;
    this.to = to;
    this.tokenID = tokenID;
    this.amount = amount;
    this.validator = validator;
  }
}
