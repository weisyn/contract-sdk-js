/**
 * WES Host ABI 函数声明
 * 
 * 本文件声明所有 WES Host ABI 函数，使用 AssemblyScript 的 @external 装饰器
 * 这些函数在 WASM 编译时会被链接到宿主函数
 * 
 * 参考: contract-sdk-go/framework/host_functions.go
 */

// ==================== ABI 版本函数 ====================

/** 获取引擎支持的 Host ABI 版本 */
@external("env", "get_abi_version")
export declare function getABIVersion(): u32;

// ==================== 基础环境函数 ====================

/** 获取调用者地址 */
@external("env", "get_caller")
export declare function getCaller(addrPtr: u32): u32;

/** 获取合约地址 */
@external("env", "get_contract_address")
export declare function getContractAddress(addrPtr: u32): u32;

/** 设置返回值数据 */
@external("env", "set_return_data")
export declare function setReturnData(dataPtr: u32, dataLen: u32): u32;

/** 发出事件 */
@external("env", "emit_event")
export declare function emitEvent(eventPtr: u32, eventLen: u32): u32;

/** 记录调试日志 */
@external("env", "log_debug")
export declare function logDebug(messagePtr: u32, messageLen: u32): u32;

/** 获取合约初始化参数 */
@external("env", "get_contract_init_params")
export declare function getContractInitParams(bufPtr: u32, bufLen: u32): u32;

// ==================== 区块视图函数 ====================

/** 获取当前时间戳 */
@external("env", "get_timestamp")
export declare function getTimestamp(): u64;

/** 获取当前区块高度 */
@external("env", "get_block_height")
export declare function getBlockHeight(): u64;

/** 获取指定高度的区块哈希 */
@external("env", "get_block_hash")
export declare function getBlockHash(height: u64, hashPtr: u32): u32;

/** 获取指定高度的 Merkle 根 */
@external("env", "get_merkle_root")
export declare function getMerkleRoot(height: u64, rootPtr: u32): u32;

/** 获取指定高度的状态根 */
@external("env", "get_state_root")
export declare function getStateRoot(height: u64, rootPtr: u32): u32;

/** 获取指定高度的矿工地址 */
@external("env", "get_miner_address")
export declare function getMinerAddress(height: u64, addrPtr: u32): u32;

// ==================== 交易上下文函数 ====================

/** 获取当前交易哈希 */
@external("env", "get_tx_hash")
export declare function getTxHash(hashPtr: u32): u32;

/** 获取当前交易在区块中的索引 */
@external("env", "get_tx_index")
export declare function getTxIndex(): u32;

// ==================== UTXO 操作函数 ====================

/** 创建 UTXO 输出 */
@external("env", "create_utxo_output")
export declare function createUTXOOutput(
  recipientPtr: u32,
  amount: u64,
  tokenIDPtr: u32,
  tokenIDLen: u32
): u32;

/** 查询 UTXO 余额 */
@external("env", "query_utxo_balance")
export declare function queryUTXOBalance(
  addressPtr: u32,
  tokenIDPtr: u32,
  tokenIDLen: u32
): u64;

/** 查询指定 UTXO（二进制格式） */
@external("env", "utxo_lookup")
export declare function utxoLookup(
  txIDPtr: u32,
  txIDLen: u32,
  index: u32,
  outputPtr: u32,
  outputSize: u32
): u32;

/** 查询指定 UTXO（JSON 格式） */
@external("env", "utxo_lookup_json")
export declare function utxoLookupJSON(
  txIDPtr: u32,
  txIDLen: u32,
  index: u32,
  outputPtr: u32,
  outputSize: u32
): u32;

/** 检查 UTXO 是否存在 */
@external("env", "utxo_exists")
export declare function utxoExists(
  txIDPtr: u32,
  txIDLen: u32,
  index: u32
): u32;

// ==================== 资源查询函数 ====================

/** 查询资源（二进制格式） */
@external("env", "resource_lookup")
export declare function resourceLookup(
  contentHashPtr: u32,
  contentHashLen: u32,
  resourcePtr: u32,
  resourceSize: u32
): u32;

/** 查询资源（JSON 格式） */
@external("env", "resource_lookup_json")
export declare function resourceLookupJSON(
  contentHashPtr: u32,
  contentHashLen: u32,
  resourcePtr: u32,
  resourceSize: u32
): u32;

/** 检查资源是否存在 */
@external("env", "resource_exists")
export declare function resourceExists(
  contentHashPtr: u32,
  contentHashLen: u32
): u32;

// ==================== 状态查询函数 ====================

/** 获取状态值 */
@external("env", "state_get")
export declare function stateGet(
  keyPtr: u32,
  keyLen: u32,
  valuePtr: u32,
  valueLen: u32
): u32;

/** 从链上获取状态值 */
@external("env", "state_get_from_chain")
export declare function stateGetFromChain(
  stateIDPtr: u32,
  stateIDLen: u32,
  valuePtr: u32,
  valueLen: u32,
  versionPtr: u32
): u32;

// ==================== 交易构建函数 ====================

/** 追加状态输出 */
@external("env", "append_state_output")
export declare function appendStateOutput(
  stateIDPtr: u32,
  stateIDLen: u32,
  stateVersion: u64,
  execHashPtr: u32,
  publicInputsPtr: u32,
  publicInputsLen: u32,
  parentHashPtr: u32
): u32;

/** 追加资源输出 */
@external("env", "append_resource_output")
export declare function appendResourceOutput(
  resourcePtr: u32,
  resourceLen: u32,
  ownerPtr: u32,
  ownerLen: u32,
  lockingPtr: u32,
  lockingLen: u32
): u32;

/** 创建带锁定的资产输出 */
@external("env", "create_asset_output_with_lock")
export declare function createAssetOutputWithLock(
  recipientPtr: u32,
  recipientLen: u32,
  amount: u64,
  tokenIDPtr: u32,
  tokenIDLen: u32,
  lockingPtr: u32,
  lockingLen: u32
): u32;

/** 批量创建输出 */
@external("env", "batch_create_outputs")
export declare function batchCreateOutputs(
  batchPtr: u32,
  batchLen: u32
): u32;

/** 追加交易输入 */
@external("env", "append_tx_input")
export declare function appendTxInput(
  txIDPtr: u32,
  txIDLen: u32,
  index: u32,
  isRefOnly: u32,
  proofPtr: u32,
  proofLen: u32
): u32;

/** 构建交易（从 Draft JSON） */
@external("env", "host_build_transaction")
export declare function hostBuildTransaction(
  draftPtr: u32,
  draftLen: u32,
  receiptPtr: u32,
  receiptSize: u32
): u32;

// ==================== HostABI v1 新增函数 ====================

/** 获取链标识符 */
@external("env", "get_chain_id")
export declare function getChainID(chainIDPtr: u32): u32;

/** 获取状态版本 */
@external("env", "get_state_version")
export declare function getStateVersion(stateIDPtr: u32, stateIDLen: u32): u64;

// ==================== 内存管理函数 ====================

/** 分配内存 */
@external("env", "malloc")
export declare function malloc(size: u32): u32;

// ==================== 地址编码函数 ====================

/** 地址字节数组转 Base58 */
@external("env", "address_bytes_to_base58")
export declare function addressBytesToBase58(
  addrPtr: u32,
  resultPtr: u32,
  maxLen: u32
): u32;

/** Base58 地址转字节数组 */
@external("env", "address_base58_to_bytes")
export declare function addressBase58ToBytes(
  base58Ptr: u32,
  base58Len: u32,
  resultPtr: u32
): u32;

// ==================== 受控外部交互函数（ISPC创新）====================
//
// 🌟 **ISPC核心创新**：受控外部交互，替代传统预言机
//
// **使用建议**：
//   - ✅ **推荐**：使用 `helpers/external` 模块的业务语义接口
//   - ⚠️ **不推荐**：直接使用这些底层 HostABI 函数（除非有特殊需求）
//
// ⚠️ **注意**：这些函数可能还在开发中，如果底层未实现，会返回错误

/** 声明外部状态预期 */
@external("env", "host_declare_external_state")
export declare function hostDeclareExternalState(
  claimPtr: u32,
  claimLen: u32,
  claimIDPtr: u32,
  claimIDSize: u32
): u32;

/** 提供验证佐证 */
@external("env", "host_provide_evidence")
export declare function hostProvideEvidence(
  claimIDPtr: u32,
  claimIDLen: u32,
  evidencePtr: u32,
  evidenceLen: u32
): u32;

/** 查询受控外部状态 */
@external("env", "host_query_controlled_state")
export declare function hostQueryControlledState(
  claimIDPtr: u32,
  claimIDLen: u32,
  resultPtr: u32,
  resultSize: u32
): u32;

