/**
 * 基础质押合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建质押和委托相关的智能合约。
 * 通过本示例，您可以学习：
 *   - 如何使用 helpers/staking 模块进行质押和委托操作
 *   - 如何使用业务语义API简化质押合约开发
 *   - 如何实现完整的质押功能（Stake、Unstake、Delegate、Undelegate）
 * 
 * 🎯 核心功能
 * 
 *  1. Stake - 质押
 *     - 使用 staking.Stake() 进行代币质押
 *     - SDK 内部自动处理余额检查、交易构建、事件发出
 * 
 *  2. Unstake - 解质押
 *     - 使用 staking.Unstake() 解质押代币
 *     - 支持部分解质押或全部解质押
 * 
 *  3. Delegate - 委托
 *     - 使用 staking.Delegate() 将质押权委托给验证者
 *     - 适用于委托质押场景
 * 
 *  4. Undelegate - 取消委托
 *     - 使用 staking.Undelegate() 取消委托
 *     - 支持部分取消委托或全部取消委托
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import {
  Contract,
  Context,
  ErrorCode,
  HostABI,
  Delegation,
  Address,
  Amount,
  TokenID,
  findJSONField,
  parseUint64,
  ParsingUtils,
  FormatUtils,
} from '@weisyn/contract-sdk-js/as';

/**
 * Delegation Contract 基础质押合约
 * 
 * 本合约使用 helpers/staking 模块提供的业务语义API，
 * 简化质押和委托操作的实现，开发者只需关注业务逻辑。
 */
class DelegationContract extends Contract {
  private tokenID: TokenID | null = null; // 原生币

  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    // 发出合约初始化事件
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Delegation',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Stake') {
      return this.stake(params);
    } else if (functionName === 'Unstake') {
      return this.unstake(params);
    } else if (functionName === 'Delegate') {
      return this.delegate(params);
    } else if (functionName === 'Undelegate') {
      return this.undelegate(params);
    } else if (functionName === 'GetDelegationInfo') {
      return this.getDelegationInfo(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * Stake 质押代币
   * 
   * 使用 helpers/staking 模块的 Stake 函数进行代币质押。
   * SDK 内部会自动处理：
   *   - 余额检查（确保质押者余额充足）
   *   - 交易构建（自动构建 UTXO 交易）
   *   - 事件发出（自动发出 Stake 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "validator": "validator_address", // 验证者地址（Base58编码，必填）
   *   "amount": 10000                  // 质押数量（必填）
   * }
   * 
   * ⚠️ 注意：实际应用中需要业务规则检查
   *   - 验证者有效性检查（验证者是否在验证者列表中）
   *   - 最小质押数量检查
   *   - 锁定期检查（业务逻辑）
   */
  private stake(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const validatorStr = findJSONField(paramsStr, 'validator');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (validatorStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析验证者地址
    const validator = this.parseAddress(validatorStr);
    if (validator === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行代币质押
    // SDK 提供的 staking.Stake() 会自动处理：
    //   - 余额检查
    //   - 交易构建
    //   - 事件发出
    // ⚠️ 注意：实际应用中需要业务规则检查
    //   验证者有效性、最小质押数量、锁定期等应在应用层实现
    const caller = Context.getCaller();
    const result = Delegation.stake(caller, validator, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Unstake 解质押代币
   * 
   * 使用 helpers/staking 模块的 Unstake 函数解质押代币。
   * SDK 内部会自动处理：
   *   - 质押余额检查（确保有足够的质押余额）
   *   - 交易构建（自动构建 UTXO 交易）
   *   - 事件发出（自动发出 Unstake 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "validator": "validator_address", // 验证者地址（Base58编码，必填）
   *   "amount": 5000                    // 解质押数量（必填）
   * }
   * 
   * ⚠️ 注意：实际应用中需要业务规则检查
   *   - 锁定期检查（是否满足解锁条件）
   *   - 解质押冷却期检查
   */
  private unstake(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const validatorStr = findJSONField(paramsStr, 'validator');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (validatorStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析验证者地址
    const validator = this.parseAddress(validatorStr);
    if (validator === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行解质押
    // SDK 提供的 staking.Unstake() 会自动处理：
    //   - 质押余额检查
    //   - 交易构建
    //   - 事件发出
    // ⚠️ 注意：实际应用中需要业务规则检查
    //   锁定期、解质押冷却期等应在应用层实现
    const caller = Context.getCaller();
    const result = Delegation.unstake(caller, validator, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Delegate 委托质押
   * 
   * 使用 helpers/staking 模块的 Delegate 函数将质押权委托给验证者。
   * 
   * 参数格式（JSON）:
   * {
   *   "validator": "validator_address", // 验证者地址（Base58编码，必填）
   *   "amount": 5000                    // 委托数量（必填）
   * }
   */
  private delegate(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const validatorStr = findJSONField(paramsStr, 'validator');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (validatorStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析验证者地址
    const validator = this.parseAddress(validatorStr);
    if (validator === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行委托
    const caller = Context.getCaller();
    const result = Delegation.delegate(caller, validator, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Undelegate 取消委托
   * 
   * 使用 helpers/staking 模块的 Undelegate 函数取消委托。
   * 
   * 参数格式（JSON）:
   * {
   *   "validator": "validator_address", // 验证者地址（Base58编码，必填）
   *   "amount": 5000                    // 取消委托数量（必填）
   * }
   */
  private undelegate(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const validatorStr = findJSONField(paramsStr, 'validator');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (validatorStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析验证者地址
    const validator = this.parseAddress(validatorStr);
    if (validator === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行取消委托
    const caller = Context.getCaller();
    const result = Delegation.undelegate(caller, validator, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * GetDelegationInfo 查询质押信息
   * 
   * 查询指定地址的质押信息
   */
  private getDelegationInfo(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const addressStr = findJSONField(paramsStr, 'address');

    const address = addressStr !== '' 
      ? this.parseAddress(addressStr)
      : Context.getCaller();

    if (address === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 查询质押余额（简化实现）
    const stakedBalance = HostABI.queryUTXOBalance(address, this.tokenID);

    // 返回查询结果
    const result = JSON.stringify({
      address: this.addressToBase58(address),
      stakedBalance: stakedBalance.toString(),
      tokenID: this.tokenID || 'native',
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  /**
   * 解析地址
   */
  private parseAddress(addressStr: string): Address | null {
    return ParsingUtils.parseAddress(addressStr);
  }

  /**
   * 地址转Base58字符串（辅助方法）
   */
  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

// 合约实例（单例模式）
const contract = new DelegationContract();

/**
 * 合约初始化函数（WASM 导出）
 */
export function Initialize(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

/**
 * 合约执行函数（WASM 导出）
 */
export function Execute(): u32 {
  const maxLen = 8192;
  // 简化：假设函数名通过其他方式传递
  const functionName = 'GetDelegationInfo'; // 示例
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

