/**
 * DAO 治理合约模板
 * 
 * 完整的 DAO（去中心化自治组织）治理合约实现
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Governance } from '../../../src/helpers/governance';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';

/**
 * DAO 治理合约
 */
class DAOContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    // 发出合约初始化事件
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'DAO',
      owner: this.addressToHex(caller),
    });
    HostABI.emitEvent(event);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'CreateProposal') {
      return this.createProposal(params);
    } else if (functionName === 'Vote') {
      return this.vote(params);
    } else if (functionName === 'VoteAndCount') {
      return this.voteAndCount(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * 创建提案
   */
  createProposal(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const titleStr = findJSONField(paramsStr, 'title');
    
    if (proposalIDStr === '' || titleStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    const proposalData = Uint8Array.wrap(String.UTF8.encode(titleStr));
    
    const caller = Context.getCaller();
    return Governance.propose(caller, proposalID, proposalData);
  }

  /**
   * 投票
   */
  vote(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const supportStr = findJSONField(paramsStr, 'support');
    
    if (proposalIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    const support = supportStr === 'true' || supportStr === '1';
    
    const caller = Context.getCaller();
    return Governance.vote(caller, proposalID, support);
  }

  /**
   * 投票并统计
   */
  voteAndCount(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const proposalIDStr = findJSONField(paramsStr, 'proposal_id');
    const supportStr = findJSONField(paramsStr, 'support');
    const thresholdStr = findJSONField(paramsStr, 'threshold');
    
    if (proposalIDStr === '' || thresholdStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const proposalID = Uint8Array.wrap(String.UTF8.encode(proposalIDStr));
    const support = supportStr === 'true' || supportStr === '1';
    const threshold = parseUint64(thresholdStr);
    
    const caller = Context.getCaller();
    const result = Governance.voteAndCount(caller, proposalID, support, threshold);
    
    // 设置返回值（投票统计结果）
    const resultStr = JSON.stringify({
      totalVotes: result.totalVotes.toString(),
      supportVotes: result.supportVotes.toString(),
      opposeVotes: result.opposeVotes.toString(),
      passed: result.passed,
      threshold: result.threshold.toString(),
    });
    this.setReturnData(Uint8Array.wrap(String.UTF8.encode(resultStr)));
    
    return result.errorCode;
  }

  /**
   * 地址转十六进制字符串
   */
  private addressToHex(address: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < address.length; i++) {
      const byte = address[i];
      hex += (byte >> 4).toString(16);
      hex += (byte & 0x0f).toString(16);
    }
    return hex;
  }
}

// 合约实例（单例模式）
const contract = new DAOContract();

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
 * CreateProposal 函数（WASM 导出）
 */
export function CreateProposal(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.createProposal(params);
}

/**
 * Vote 函数（WASM 导出）
 */
export function Vote(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.vote(params);
}

/**
 * VoteAndCount 函数（WASM 导出）
 */
export function VoteAndCount(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.voteAndCount(params);
}

