/**
 * 提案投票治理合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建去中心化治理相关的智能合约。
 * 通过本示例，您可以学习：
 *   - 如何使用 helpers/governance 模块进行治理操作
 *   - 如何使用业务语义API简化治理合约开发
 *   - 如何实现完整的治理功能（Propose、Vote）
 * 
 * 🎯 核心功能
 * 
 *  1. Propose - 创建提案
 *     - 使用 governance.Propose() 创建治理提案
 *     - SDK 内部自动处理状态输出、事件发出
 * 
 *  2. Vote - 投票
 *     - 使用 governance.Vote() 对提案进行投票
 *     - 支持支持/反对两种投票方式
 * 
 *  3. VoteAndCount - 投票并计数
 *     - 使用 governance.VoteAndCount() 投票并统计结果
 *     - 自动判断提案是否通过
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode, HostABI, Governance } from '@weisyn/contract-sdk-js/as';
import { findJSONField, parseUint64 } from '@weisyn/contract-sdk-js/as';
import { ParsingUtils } from '@weisyn/contract-sdk-js/as';
import { FormatUtils } from '@weisyn/contract-sdk-js/as';

/**
 * Governance Contract 提案投票治理合约
 * 
 * 本合约使用 helpers/governance 模块提供的业务语义API，
 * 简化治理操作的实现，开发者只需关注业务逻辑。
 */
class GovernanceContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    // 发出合约初始化事件
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Governance',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Propose') {
      return this.propose(params);
    } else if (functionName === 'Vote') {
      return this.vote(params);
    } else if (functionName === 'VoteAndCount') {
      return this.voteAndCount(params);
    } else if (functionName === 'GetProposalInfo') {
      return this.getProposalInfo(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * Propose 创建提案
   * 
   * 使用 helpers/governance 模块的 Propose 函数创建治理提案。
   * SDK 内部会自动处理：
   *   - 状态输出构建（自动构建提案状态输出）
   *   - 事件发出（自动发出 Propose 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "proposal_id": "proposal_123",        // 提案ID（必填）
   *   "proposal_data": "proposal content"  // 提案内容（必填）
   * }
   * 
   * ⚠️ 注意：实际应用中需要业务规则检查
   *   - 提案创建权限检查（谁可以创建提案）
   *   - 提案格式验证（提案内容是否符合规范）
   *   - 提案ID唯一性检查
   */
  private propose(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const proposalDataStr = findJSONField(paramsStr, 'proposal_data');

    if (proposalIDStr === '' || proposalDataStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：使用 SDK 基础能力创建提案
    // SDK 提供的 governance.Propose() 会自动处理：
    //   - 状态输出构建
    //   - 事件发出
    // ⚠️ 注意：实际应用中需要业务规则检查
    //   提案创建权限、提案格式验证、提案ID唯一性等应在应用层实现
    const caller = Context.getCaller();
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    const proposalData = Uint8Array.wrap(String.UTF8.encode(proposalDataStr));
    
    const result = Governance.propose(caller, proposalID, proposalData);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * Vote 投票
   * 
   * 使用 helpers/governance 模块的 Vote 函数对提案进行投票。
   * SDK 内部会自动处理：
   *   - 状态输出构建（自动构建投票状态输出）
   *   - 事件发出（自动发出 Vote 事件）
   * 
   * 参数格式（JSON）:
   * {
   *   "proposal_id": "proposal_123",  // 提案ID（必填）
   *   "support": true                 // 是否支持（必填）
   * }
   * 
   * ⚠️ 注意：实际应用中需要业务规则检查
   *   - 提案存在性检查（提案是否已创建）
   *   - 投票权限检查（谁可以投票）
   *   - 重复投票检查（是否已经投过票）
   *   - 投票时间窗口检查（是否在投票期内）
   */
  private vote(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const supportStr = findJSONField(paramsStr, 'support');

    if (proposalIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：解析支持/反对
    const support = supportStr === 'true' || supportStr === '1';

    // 步骤3：使用 SDK 基础能力进行投票
    // SDK 提供的 governance.Vote() 会自动处理：
    //   - 状态输出构建
    //   - 事件发出
    // ⚠️ 注意：实际应用中需要业务规则检查
    //   提案存在性、投票权限、重复投票、投票时间窗口等应在应用层实现
    const caller = Context.getCaller();
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    
    const result = Governance.vote(caller, proposalID, support);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * VoteAndCount 投票并计数
   * 
   * 使用 helpers/governance 模块的 VoteAndCount 函数投票并统计结果。
   * 
   * 参数格式（JSON）:
   * {
   *   "proposal_id": "proposal_123",  // 提案ID（必填）
   *   "support": true,                // 是否支持（必填）
   *   "threshold": 1000               // 通过阈值（必填）
   * }
   */
  private voteAndCount(params: Uint8Array): ErrorCode {
    // 步骤1：解析参数并验证
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const supportStr = findJSONField(paramsStr, 'support');
    const thresholdStr = findJSONField(paramsStr, 'threshold');

    if (proposalIDStr === '' || thresholdStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const support = supportStr === 'true' || supportStr === '1';
    const threshold = parseUint64(thresholdStr);
    if (threshold === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 步骤2：使用 SDK 基础能力进行投票并计数
    const caller = Context.getCaller();
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    
    const result = Governance.voteAndCount(caller, proposalID, support, threshold);
    
    // 返回投票结果
    const resultData = JSON.stringify({
      proposal_id: proposalIDStr,
      passed: result.passed.toString(),
      supportVotes: result.supportVotes.toString(),
      opposeVotes: result.opposeVotes.toString(),
      totalVotes: result.totalVotes.toString(),
      threshold: threshold.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(resultData));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  /**
   * GetProposalInfo 查询提案信息
   * 
   * 查询指定提案的信息
   */
  private getProposalInfo(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');

    if (proposalIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 查询提案信息（简化实现）
    const result = JSON.stringify({
      proposal_id: proposalIDStr,
      proposer: 'example_proposer',
      proposal_data: 'example_proposal_data',
      created_at: Context.getBlockTimestamp().toString(),
      status: 'active',
      yesVotes: '0',
      noVotes: '0',
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }


  /**
   * 地址转Base58字符串（辅助方法）
   */
  private addressToBase58(address: Uint8Array): string {
    // 简化实现：实际应使用 HostABI.addressBytesToBase58
    return FormatUtils.addressToBase58(address);
  }
}

// 合约实例（单例模式）
const contract = new GovernanceContract();

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
  const functionName = 'GetProposalInfo'; // 示例
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

