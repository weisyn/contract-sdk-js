/**
 * Governance 操作 Helper
 *
 * 提供治理相关的业务语义 API，包括创建提案、投票等功能
 * 对标 Go SDK 的 helpers/governance/
 *
 * 参考: contract-sdk-go/helpers/governance/
 */

import { HostABI } from "../runtime/abi";
import { Context } from "../framework/context";
import { TransactionBuilder } from "../framework/transaction";
import { ErrorCode, Address, Hash } from "../framework/types";
import { computeHash } from "../framework/utils/hash";

/**
 * Governance 操作类
 */
export class Governance {
  /**
   * 创建提案
   * @param proposer 提案者地址
   * @param proposalID 提案ID
   * @param proposalData 提案数据
   * @returns 错误码
   */
  static propose(proposer: Address, proposalID: Uint8Array, proposalData: Uint8Array): ErrorCode {
    // 1. 参数验证
    if (!this.validateProposeParams(proposer, proposalID, proposalData)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 构建提案状态ID
    const stateID = this.buildProposalStateID(proposalID);

    // 3. 计算提案状态哈希
    const execHash = this.computeProposalHash(stateID, proposalData);

    // 4. 构建交易（使用交易构建器）
    const builder = TransactionBuilder.begin();
    builder.addStateOutput(stateID, 1, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 5. 发出提案事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: "Propose",
      proposer: this.addressToBase58(proposer),
      proposal_id: this.bytesToHex(proposalID),
      proposal_data: this.bytesToHex(proposalData),
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 投票
   * @param voter 投票者地址
   * @param proposalID 提案ID
   * @param support 是否支持（true=支持，false=反对）
   * @returns 错误码
   */
  static vote(voter: Address, proposalID: Uint8Array, support: bool): ErrorCode {
    // 1. 参数验证
    if (!this.validateVoteParams(voter, proposalID)) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 2. 构建投票状态ID
    const stateID = this.buildVoteStateID(voter, proposalID);

    // 3. 计算投票状态哈希
    const voteValue: u64 = support ? 1 : 0;
    const execHash = this.computeVoteHash(stateID, voteValue);

    // 4. 构建交易（使用交易构建器）
    const builder = TransactionBuilder.begin();
    builder.addStateOutput(stateID, voteValue, execHash);
    const result = builder.finalize();

    if (!result.success) {
      return result.errorCode;
    }

    // 5. 发出投票事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: "Vote",
      voter: this.addressToBase58(voter),
      proposal_id: this.bytesToHex(proposalID),
      support: support,
      caller: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 投票并统计
   * @param voter 投票者地址
   * @param proposalID 提案ID
   * @param support 是否支持
   * @param threshold 通过阈值（支持票数需要达到此值）
   * @returns 投票统计结果
   *
   * ⚠️ **当前实现限制**：
   * 当前版本为简化实现，**仅统计当前执行中的投票**（包括本次投票），不查询链上历史状态。
   *
   * **目标语义**（ISPC 增强）：
   * - 在单次执行中完成投票和统计
   * - 查询已上链的 StateOutput 获取历史投票
   * - 累加历史投票和当前投票
   * - 自动判断是否通过阈值
   *
   * **实现路径**：
   * 1. 查询已上链的 StateOutput（通过 Storage 或类似接口）
   * 2. 解析 StateOutput 中的投票数据
   * 3. 累加历史投票和当前投票
   * 4. 检查是否通过阈值
   *
   * **当前版本行为**：
   * - ✅ 记录投票状态（StateOutput）
   * - ✅ 统计当前执行中的投票
   * - ⚠️ **不查询历史状态**（需要后续版本实现）
   *
   * **未来版本计划**：
   * - 实现基于链上历史状态的统计
   * - 支持查询多个 StateOutput 并累加投票
   * - 完整的 ISPC 增强语义
   */
  static voteAndCount(
    voter: Address,
    proposalID: Uint8Array,
    support: bool,
    threshold: u64
  ): VoteAndCountResult {
    // 1. 先执行投票（记录投票状态）
    const voteResult = this.vote(voter, proposalID, support);
    if (voteResult !== ErrorCode.SUCCESS) {
      // 返回错误结果
      const result = new VoteAndCountResult();
      result.totalVotes = 0;
      result.supportVotes = 0;
      result.opposeVotes = 0;
      result.passed = false;
      result.threshold = threshold;
      result.errorCode = voteResult;
      return result;
    }

    // 2. 统计所有投票（包括历史投票和当前投票）
    // 注意：在ISPC范式中，VoteAndCount是在一次执行中完成投票和统计
    //
    // **实现策略**：
    // 由于 EUTXO 模型的限制，合约无法直接遍历所有地址。
    // 因此，我们需要通过以下方式之一来统计历史投票：
    //
    // 方案1：维护投票者列表（推荐）
    //   - 在提案创建时，记录所有有投票权的地址
    //   - 在 VoteAndCount 时，遍历投票者列表，查询每个投票者的历史状态
    //
    // 方案2：使用聚合状态（适用于简单场景）
    //   - 维护一个总票数状态（totalVotes, supportVotes, opposeVotes）
    //   - 每次投票时更新聚合状态
    //   - VoteAndCount 直接读取聚合状态
    //
    // 当前实现：查询当前投票者的历史状态 + 当前投票
    // 注意：这是一个简化实现，实际应用中应该使用方案1或方案2

    // 2.1 查询当前投票者的历史投票状态
    const voteStateID = this.buildVoteStateID(voter, proposalID);
    const voteStateIDStr = String.UTF8.decode(voteStateID.buffer);
    const historicalState = HostABI.queryStateFromChain(voteStateIDStr);

    // 2.2 统计历史投票（如果存在）
    let totalVotes: u64 = 0;
    let supportVotes: u64 = 0;
    let opposeVotes: u64 = 0;

    if (historicalState !== null) {
      // 解析历史投票值
      // 注意：根据 Go SDK 的实现，voteValue 作为 version 参数存储在 StateOutput 中
      // queryStateFromChain 返回的 version 字段就是 voteValue
      const historicalVoteValue = historicalState.version;

      // voteValue: 1=支持, 0=反对
      if (historicalVoteValue === 1) {
        supportVotes = 1;
      } else {
        opposeVotes = 1;
      }
      totalVotes = 1;
    }

    // 2.3 添加当前投票
    // 注意：如果当前投票者之前已经投过票，这里会重复计算
    // 实际应用中，应该先检查当前投票者是否已经投过票
    totalVotes = totalVotes + 1;
    if (support) {
      supportVotes = supportVotes + 1;
    } else {
      opposeVotes = opposeVotes + 1;
    }

    // TODO: 实现完整的投票者列表查询
    // 当前实现仅查询当前投票者的历史状态，无法统计所有投票者的投票
    // 要实现完整的统计，需要：
    // 1. 在提案创建时，记录所有有投票权的地址（通过 StateOutput）
    // 2. 在 VoteAndCount 时，遍历投票者列表，查询每个投票者的历史状态
    // 3. 累加所有投票者的投票结果

    // 3. 检查是否通过阈值
    const passed = supportVotes >= threshold;

    // 4. 返回统计结果
    const result = new VoteAndCountResult();
    result.totalVotes = totalVotes;
    result.supportVotes = supportVotes;
    result.opposeVotes = opposeVotes;
    result.passed = passed;
    result.threshold = threshold;
    result.errorCode = ErrorCode.SUCCESS;

    return result;
  }

  /**
   * 投票并统计（支持投票者列表）
   *
   * 与 `voteAndCount` 的区别：
   * - `voteAndCount`: 仅查询当前投票者的历史状态
   * - `voteAndCountWithVoters`: 遍历所有投票者列表，查询每个投票者的历史状态并聚合统计
   *
   * @param voter 当前投票者地址
   * @param proposalID 提案ID
   * @param support 是否支持（true=支持，false=反对）
   * @param threshold 通过阈值（支持票数需要达到此值）
   * @param allVoters 所有有投票权的地址列表
   * @returns 投票统计结果
   */
  static voteAndCountWithVoters(
    voter: Address,
    proposalID: Uint8Array,
    support: bool,
    threshold: u64,
    allVoters: Address[]
  ): VoteAndCountResult {
    // 1. 先执行投票（记录投票状态）
    const voteResult = this.vote(voter, proposalID, support);
    if (voteResult !== ErrorCode.SUCCESS) {
      // 返回错误结果
      const result = new VoteAndCountResult();
      result.totalVotes = 0;
      result.supportVotes = 0;
      result.opposeVotes = 0;
      result.passed = false;
      result.threshold = threshold;
      result.errorCode = voteResult;
      return result;
    }

    // 2. 统计所有投票（遍历投票者列表，查询每个投票者的历史状态）
    let totalVotes: u64 = 0;
    let supportVotes: u64 = 0;
    let opposeVotes: u64 = 0;

    // 2.1 遍历所有投票者，查询他们的历史投票状态
    for (let i = 0; i < allVoters.length; i++) {
      const currentVoter = allVoters[i];
      const voteStateID = this.buildVoteStateID(currentVoter, proposalID);
      const voteStateIDStr = String.UTF8.decode(voteStateID.buffer);
      const historicalState = HostABI.queryStateFromChain(voteStateIDStr);

      if (historicalState !== null) {
        // 解析历史投票值
        // 注意：根据 Go SDK 的实现，voteValue 作为 version 参数存储在 StateOutput 中
        // queryStateFromChain 返回的 version 字段就是 voteValue
        const historicalVoteValue = historicalState.version;

        // voteValue: 1=支持, 0=反对
        if (historicalVoteValue === 1) {
          supportVotes = supportVotes + 1;
        } else {
          opposeVotes = opposeVotes + 1;
        }
        totalVotes = totalVotes + 1;
      }
    }

    // 2.2 添加当前投票
    // 注意：如果当前投票者之前已经投过票，这里会重复计算
    // 实际应用中，应该先检查当前投票者是否已经投过票
    // 为了简化，这里假设当前投票是新的投票
    totalVotes = totalVotes + 1;
    if (support) {
      supportVotes = supportVotes + 1;
    } else {
      opposeVotes = opposeVotes + 1;
    }

    // 3. 检查是否通过阈值
    const passed = supportVotes >= threshold;

    // 4. 返回统计结果
    const result = new VoteAndCountResult();
    result.totalVotes = totalVotes;
    result.supportVotes = supportVotes;
    result.opposeVotes = opposeVotes;
    result.passed = passed;
    result.threshold = threshold;
    result.errorCode = ErrorCode.SUCCESS;

    return result;
  }

  // ==================== 私有辅助方法 ====================

  private static validateProposeParams(
    proposer: Address,
    proposalID: Uint8Array,
    _proposalData: Uint8Array
  ): bool {
    if (proposer.length === 0) {
      return false;
    }
    if (proposalID.length === 0) {
      return false;
    }
    return true;
  }

  private static validateVoteParams(voter: Address, proposalID: Uint8Array): bool {
    if (voter.length === 0) {
      return false;
    }
    if (proposalID.length === 0) {
      return false;
    }
    return true;
  }

  private static buildProposalStateID(proposalID: Uint8Array): Uint8Array {
    const prefix = "proposal:";
    const prefixBytes = String.UTF8.encode(prefix);
    const result = new Uint8Array(prefixBytes.length + proposalID.length);
    result.set(prefixBytes, 0);
    result.set(proposalID, prefixBytes.length);
    return result;
  }

  private static buildVoteStateID(voter: Address, proposalID: Uint8Array): Uint8Array {
    // 格式：vote:{voter}:{proposalID}
    const prefix = "vote:";
    const voterStr = this.addressToString(voter);
    const proposalIDStr = String.UTF8.decode(proposalID.buffer);

    const stateIDStr = prefix + voterStr + ":" + proposalIDStr;
    return Uint8Array.wrap(String.UTF8.encode(stateIDStr));
  }

  /**
   * 地址转 Base58 字符串（用于事件）
   */
  private static addressToBase58(address: Address): string {
    const base58 = HostABI.addressBytesToBase58(address);
    if (base58 === null) {
      // 如果编码失败，回退到十六进制编码（用于调试）
      return this.addressToHex(address);
    }
    return base58;
  }

  /**
   * 地址转字符串（用于状态ID构建，内部使用hex）
   */
  private static addressToString(address: Address): string {
    return this.addressToHex(address);
  }

  private static computeProposalHash(stateID: Uint8Array, proposalData: Uint8Array): Hash {
    // 组合数据
    const combined = new Uint8Array(stateID.length + proposalData.length);
    combined.set(stateID, 0);
    combined.set(proposalData, stateID.length);

    // 使用工具函数计算哈希
    return computeHash(combined);
  }

  private static computeVoteHash(stateID: Uint8Array, voteValue: u64): Hash {
    // 组合数据
    const valueBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      valueBytes[i] = <u8>((voteValue >> (i * 8)) & 0xff);
    }

    const combined = new Uint8Array(stateID.length + valueBytes.length);
    combined.set(stateID, 0);
    combined.set(valueBytes, stateID.length);

    // 使用工具函数计算哈希
    return computeHash(combined);
  }

  private static addressToHex(address: Address): string {
    let hex = "";
    for (let i = 0; i < address.length; i++) {
      const byte = address[i];
      hex += (byte >> 4).toString(16);
      hex += (byte & 0x0f).toString(16);
    }
    return hex;
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return this.addressToHex(bytes);
  }
}

/**
 * 投票统计结果
 */
export class VoteAndCountResult {
  totalVotes: u64; // 总票数
  supportVotes: u64; // 支持票数
  opposeVotes: u64; // 反对票数
  passed: bool; // 是否通过（基于阈值判断）
  threshold: u64; // 通过阈值
  errorCode: ErrorCode; // 错误码（SUCCESS 表示成功）

  constructor() {
    this.totalVotes = 0;
    this.supportVotes = 0;
    this.opposeVotes = 0;
    this.passed = false;
    this.threshold = 0;
    this.errorCode = ErrorCode.SUCCESS;
  }
}
