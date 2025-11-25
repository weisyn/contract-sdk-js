/**
 * 治理代币合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建治理代币合约。
 * 治理代币是一种特殊的代币，持有者可以使用代币进行投票，参与去中心化治理。
 * 通过本示例，您可以学习：
 *   - 如何使用 helpers/token 模块创建治理代币
 *   - 如何将代币持有量与投票权关联
 *   - 如何实现治理代币的铸造、转移、投票等功能
 * 
 * 🎯 核心功能
 * 
 *  1. Mint - 铸造治理代币
 *     - 使用 token.Mint() 铸造治理代币
 *     - 持有代币即拥有投票权
 * 
 *  2. Transfer - 转移治理代币
 *     - 使用 token.Transfer() 转移代币
 *     - 转移代币时，投票权也随之转移
 * 
 *  3. DelegateVotingPower - 委托投票权
 *     - 将投票权委托给其他地址
 *     - 委托后，被委托者可以使用委托的代币进行投票
 * 
 *  4. VoteWithTokens - 使用代币投票
 *     - 使用治理代币进行投票
 *     - 投票权重 = 持有的代币数量
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode, HostABI, Token, Governance } from '@weisyn/contract-sdk-js/as';
import { Address, Amount, TokenID } from '@weisyn/contract-sdk-js/as';
import { findJSONField, parseUint64 } from '@weisyn/contract-sdk-js/as';
import { ParsingUtils } from '@weisyn/contract-sdk-js/as';
import { FormatUtils } from '@weisyn/contract-sdk-js/as';

/**
 * Governance Token 合约实例
 * 
 * 本合约使用 helpers/token 和 helpers/governance 模块提供的业务语义API，
 * 简化治理代币操作的实现，开发者只需关注业务逻辑。
 * 
 * 治理代币特点：
 *   - 持有代币即拥有投票权
 *   - 投票权重 = 持有的代币数量
 *   - 支持投票权委托
 */
class GovernanceTokenContract extends Contract {
  private tokenID: TokenID = 'GOV_TOKEN';

  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    // 发出合约初始化事件
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'GovernanceToken',
      owner: FormatUtils.addressToString(caller),
    });
    HostABI.emitEvent(event);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Mint') {
      return this.mint(params);
    } else if (functionName === 'Transfer') {
      return this.transfer(params);
    } else if (functionName === 'DelegateVotingPower') {
      return this.delegateVotingPower(params);
    } else if (functionName === 'VoteWithTokens') {
      return this.voteWithTokens(params);
    } else if (functionName === 'BalanceOf') {
      return this.balanceOf(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * Mint 铸造治理代币
   * 
   * 使用 helpers/token 模块的 Mint 函数铸造治理代币。
   * 持有代币即拥有投票权，投票权重等于持有的代币数量。
   * SDK 内部会自动处理：
   *   - 交易构建（自动构建 UTXO 交易）
   *   - 事件发出（自动发出 Mint 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "to": "receiver_address",    // 接收者地址（Base58编码，必填）
   *   "amount": 1000               // 铸造数量（必填）
   * }
   * 
   * ⚠️ 注意：实际应用中需要权限检查
   *   - 只有授权地址才能调用 Mint
   *   - 权限检查逻辑应在应用层实现
   */
  private mint(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析接收者地址
    const to = ParsingUtils.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行代币铸造
    // SDK 提供的 token.Mint() 会自动处理：
    //   - 交易构建
    //   - 事件发出
    // ⚠️ 注意：实际应用中需要权限检查
    //   只有授权地址才能调用 Mint，权限检查逻辑应在应用层实现
    const result = Token.mint(to, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Transfer 转移治理代币
   * 
   * 使用 helpers/token 模块的 Transfer 函数转移治理代币。
   * 转移代币时，投票权也随之转移。
   * SDK 内部会自动处理：
   *   - 余额检查（确保发送者余额充足）
   *   - 交易构建（自动构建 UTXO 交易）
   *   - 找零处理（自动处理找零 UTXO）
   *   - 事件发出（自动发出 Transfer 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "to": "receiver_address",    // 接收者地址（Base58编码，必填）
   *   "amount": 100                // 转账数量（必填）
   * }
   */
  private transfer(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析接收者地址
    const to = ParsingUtils.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：使用 SDK 基础能力进行代币转账
    // SDK 提供的 token.Transfer() 会自动处理：
    //   - 余额检查
    //   - 交易构建
    //   - 事件发出
    const caller = Context.getCaller();
    const result = Token.transfer(caller, to, amount, this.tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * DelegateVotingPower 委托投票权
   * 
   * 将投票权委托给其他地址。
   * 委托后，被委托者可以使用委托的代币进行投票。
   * 
   * 参数格式（JSON）:
   * {
   *   "delegate": "delegate_address",  // 被委托者地址（Base58编码，必填）
   *   "amount": 500                   // 委托的代币数量（必填）
   * }
   * 
   * ⚠️ 注意：这是一个简化实现
   *   实际应用中，应该使用状态输出存储委托关系
   *   并在投票时检查委托的代币数量
   */
  private delegateVotingPower(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const delegateStr = findJSONField(paramsStr, 'delegate');
    const amountStr = findJSONField(paramsStr, 'amount');

    if (delegateStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析被委托者地址
    const delegate = ParsingUtils.parseAddress(delegateStr);
    if (delegate === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤3：检查委托者余额
    const caller = Context.getCaller();
    const balance = HostABI.queryUTXOBalance(caller, this.tokenID);
    if (balance < amount) {
      return ErrorCode.ERROR_INSUFFICIENT_BALANCE;
    }

    // 步骤4：记录委托关系
    // ⚠️ 注意：这是一个简化实现
    //   实际应用中，应该使用状态输出存储委托关系
    //   并在投票时检查委托的代币数量
    //   这里只发出事件，实际委托关系应该在应用层维护

    // 步骤5：发出委托事件
    const event = JSON.stringify({
      name: 'VotingPowerDelegated',
      delegator: FormatUtils.addressToString(caller),
      delegate: FormatUtils.addressToString(delegate),
      amount: amount.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * VoteWithTokens 使用代币投票
   * 
   * 使用治理代币进行投票。
   * 投票权重 = 持有的代币数量 + 委托的代币数量
   * 
   * 参数格式（JSON）:
   * {
   *   "proposal_id": "proposal_123",  // 提案ID（必填）
   *   "support": true                 // 是否支持（必填）
   * }
   * 
   * ⚠️ 注意：这是一个简化实现
   *   实际应用中，应该考虑委托的代币数量
   *   投票权重 = 持有的代币数量 + 委托的代币数量
   */
  private voteWithTokens(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const supportStr = findJSONField(paramsStr, 'support');

    if (proposalIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析支持/反对
    const support = supportStr === 'true' || supportStr === '1';

    // 步骤3：计算投票权重（持有的代币数量）
    const caller = Context.getCaller();
    const votingPower = HostABI.queryUTXOBalance(caller, this.tokenID);

    // ⚠️ 注意：这是一个简化实现
    //   实际应用中，应该考虑委托的代币数量
    //   投票权重 = 持有的代币数量 + 委托的代币数量

    // 步骤4：使用 SDK 基础能力进行投票
    // SDK 提供的 governance.Vote() 会自动处理：
    //   - 状态输出构建
    //   - 事件发出
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    const result = Governance.vote(caller, proposalID, support);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    // 步骤5：发出代币投票事件（包含投票权重）
    const event = JSON.stringify({
      name: 'TokenVote',
      voter: FormatUtils.addressToString(caller),
      proposal_id: proposalIDStr,
      support: support,
      voting_power: votingPower.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * BalanceOf 查询余额
   * 
   * 查询指定地址的治理代币余额
   */
  private balanceOf(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const addressStr = findJSONField(paramsStr, 'address');

    const address = addressStr !== '' 
      ? ParsingUtils.parseAddress(addressStr)
      : Context.getCaller();

    if (address === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const balance = HostABI.queryUTXOBalance(address, this.tokenID);

    // 返回查询结果
    const result = JSON.stringify({
      address: FormatUtils.addressToString(address),
      balance: balance.toString(),
      tokenID: this.tokenID,
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

}

// 合约实例（单例模式）
const contract = new GovernanceTokenContract();

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
  const functionName = 'BalanceOf'; // 示例
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

