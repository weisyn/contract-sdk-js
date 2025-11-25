/**
 * AMM（自动化做市商）合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建 AMM（Automated Market Maker）合约。
 * 通过本示例，您可以学习如何使用 `helpers/token` 和 `helpers/market` 模块实现完整的AMM功能。
 * 
 * 🎯 核心功能
 * 
 *  1. AddLiquidity - 添加流动性
 *  2. RemoveLiquidity - 移除流动性
 *  3. SwapTokens - 代币交换
 * 
 * ⚠️ 注意：本示例是简化实现
 *   实际应用中需要实现恒定乘积公式、滑点保护、手续费分成等
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode, HostABI, Token } from '@weisyn/contract-sdk-js/as';
import { Address, Amount, TokenID } from '@weisyn/contract-sdk-js/as';
import { findJSONField, parseUint64 } from '@weisyn/contract-sdk-js/as';
import { ParsingUtils } from '@weisyn/contract-sdk-js/as';
import { FormatUtils } from '@weisyn/contract-sdk-js/as';

/**
 * AMM Contract AMM合约
 */
class AMMContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'AMM',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'AddLiquidity') {
      return this.addLiquidity(params);
    } else if (functionName === 'RemoveLiquidity') {
      return this.removeLiquidity(params);
    } else if (functionName === 'SwapTokens') {
      return this.swapTokens(params);
    } else if (functionName === 'QueryPoolInfo') {
      return this.queryPoolInfo(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * AddLiquidity 添加流动性
   */
  private addLiquidity(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const tokenAIDStr = findJSONField(paramsStr, 'token_a_id');
    const tokenBIDStr = findJSONField(paramsStr, 'token_b_id');
    const amountAStr = findJSONField(paramsStr, 'amount_a');
    const amountBStr = findJSONField(paramsStr, 'amount_b');

    if (tokenAIDStr === '' || tokenBIDStr === '' || amountAStr === '' || amountBStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amountA = parseUint64(amountAStr);
    const amountB = parseUint64(amountBStr);
    if (amountA === 0 || amountB === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const tokenAID: TokenID = tokenAIDStr;
    const tokenBID: TokenID = tokenBIDStr;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();

    // 转移代币到合约（简化实现）
    const resultA = Token.transfer(caller, contractAddr, amountA, tokenAID);
    if (resultA !== ErrorCode.SUCCESS) {
      return resultA;
    }

    const resultB = Token.transfer(caller, contractAddr, amountB, tokenBID);
    if (resultB !== ErrorCode.SUCCESS) {
      return resultB;
    }

    // 计算并铸造LP Token（简化实现）
    const lpAmount = amountA + amountB; // 简化计算
    const lpTokenID: TokenID = `LP_${tokenAIDStr}_${tokenBIDStr}`;
    const resultLP = Token.mint(caller, lpAmount, lpTokenID);
    if (resultLP !== ErrorCode.SUCCESS) {
      return resultLP;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * RemoveLiquidity 移除流动性
   */
  private removeLiquidity(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const tokenAIDStr = findJSONField(paramsStr, 'token_a_id');
    const tokenBIDStr = findJSONField(paramsStr, 'token_b_id');
    const lpTokenAmountStr = findJSONField(paramsStr, 'lp_token_amount');

    if (tokenAIDStr === '' || tokenBIDStr === '' || lpTokenAmountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const lpTokenAmount = parseUint64(lpTokenAmountStr);
    if (lpTokenAmount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const lpTokenID: TokenID = `LP_${tokenAIDStr}_${tokenBIDStr}`;
    const caller = Context.getCaller();

    // 销毁LP Token
    const resultBurn = Token.burn(caller, lpTokenAmount, lpTokenID);
    if (resultBurn !== ErrorCode.SUCCESS) {
      return resultBurn;
    }

    // 返回代币（简化实现）
    const contractAddr = Context.getContractAddress();
    const amountA = lpTokenAmount / 2; // 简化计算
    const amountB = lpTokenAmount / 2;

    const tokenAID: TokenID = tokenAIDStr;
    const tokenBID: TokenID = tokenBIDStr;

    const resultA = Token.transfer(contractAddr, caller, amountA, tokenAID);
    if (resultA !== ErrorCode.SUCCESS) {
      return resultA;
    }

    const resultB = Token.transfer(contractAddr, caller, amountB, tokenBID);
    if (resultB !== ErrorCode.SUCCESS) {
      return resultB;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * SwapTokens 代币交换
   */
  private swapTokens(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const tokenInIDStr = findJSONField(paramsStr, 'token_in_id');
    const tokenOutIDStr = findJSONField(paramsStr, 'token_out_id');
    const amountInStr = findJSONField(paramsStr, 'amount_in');

    if (tokenInIDStr === '' || tokenOutIDStr === '' || amountInStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const amountIn = parseUint64(amountInStr);
    if (amountIn === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 简化实现：直接按1:1比例交换
    const amountOut = amountIn; // 简化计算，实际应使用恒定乘积公式

    const tokenInID: TokenID = tokenInIDStr;
    const tokenOutID: TokenID = tokenOutIDStr;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();

    // 转移输入代币到合约
    const resultIn = Token.transfer(caller, contractAddr, amountIn, tokenInID);
    if (resultIn !== ErrorCode.SUCCESS) {
      return resultIn;
    }

    // 转移输出代币给用户
    const resultOut = Token.transfer(contractAddr, caller, amountOut, tokenOutID);
    if (resultOut !== ErrorCode.SUCCESS) {
      return resultOut;
    }

    return ErrorCode.SUCCESS;
  }

  /**
   * QueryPoolInfo 查询池信息
   */
  private queryPoolInfo(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const tokenAIDStr = findJSONField(paramsStr, 'token_a_id');
    const tokenBIDStr = findJSONField(paramsStr, 'token_b_id');

    if (tokenAIDStr === '' || tokenBIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const contractAddr = Context.getContractAddress();
    const tokenAID: TokenID = tokenAIDStr;
    const tokenBID: TokenID = tokenBIDStr;

    const balanceA = HostABI.queryUTXOBalance(contractAddr, tokenAID);
    const balanceB = HostABI.queryUTXOBalance(contractAddr, tokenBID);

    const result = JSON.stringify({
      token_a_id: tokenAIDStr,
      token_b_id: tokenBIDStr,
      balance_a: balanceA.toString(),
      balance_b: balanceB.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

const contract = new AMMContract();

export function Initialize(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

export function Execute(): u32 {
  const maxLen = 8192;
  const functionName = 'QueryPoolInfo';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

