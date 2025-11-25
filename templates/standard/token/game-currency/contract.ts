/**
 * 游戏货币合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建游戏货币合约。
 * 游戏货币是一种专门用于游戏内交易的代币，支持游戏内购买、奖励发放等场景。
 * 通过本示例，您可以学习如何使用 `helpers/token` 模块实现游戏货币的核心功能。
 * 
 * 🎯 核心功能
 * 
 *  1. Transfer - 转账（玩家之间的交易）
 *  2. Mint - 铸造（奖励发放）
 *  3. Burn - 销毁（道具购买）
 *  4. Approve - 授权
 *  5. Freeze - 冻结
 *  6. Airdrop - 空投（活动奖励）
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import {
  Contract,
  Context,
  ErrorCode,
  HostABI,
  Token,
  Address,
  Amount,
  TokenID,
  findJSONField,
  parseUint64,
  ParsingUtils,
  FormatUtils,
} from '@weisyn/contract-sdk-js/as';

/**
 * Game Currency 合约实例
 * 
 * 游戏货币特点：
 *   - 游戏内交易
 *   - 奖励发放
 *   - 道具购买
 */
class GameCurrencyContract extends Contract {
  private tokenID: TokenID = 'GAME_CURRENCY';

  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'GameCurrency',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Transfer') {
      return this.transfer(params);
    } else if (functionName === 'Mint') {
      return this.mint(params);
    } else if (functionName === 'Burn') {
      return this.burn(params);
    } else if (functionName === 'Approve') {
      return this.approve(params);
    } else if (functionName === 'Freeze') {
      return this.freeze(params);
    } else if (functionName === 'Airdrop') {
      return this.airdrop(params);
    } else if (functionName === 'BalanceOf') {
      return this.balanceOf(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  private transfer(params: Uint8Array): ErrorCode {
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
    
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    return Token.transfer(caller, to, amount, this.tokenID);
  }

  private mint(params: Uint8Array): ErrorCode {
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
    
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    return Token.mint(to, amount, this.tokenID);
  }

  private burn(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    return Token.burn(caller, amount, this.tokenID);
  }

  private approve(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const spenderStr = findJSONField(paramsStr, 'spender');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (spenderStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    const spender = this.parseAddress(spenderStr);
    if (spender === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    return Token.approve(caller, spender, amount, this.tokenID);
  }

  private freeze(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const targetStr = findJSONField(paramsStr, 'target');
    
    if (targetStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const target = this.parseAddress(targetStr);
    if (target === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    return Token.freeze(target, this.tokenID);
  }

  private airdrop(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (toStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const recipients: Address[] = [to];
    const amounts: Amount[] = [amount];
    
    return Token.batchMint(recipients, amounts, this.tokenID);
  }

  private balanceOf(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const addressStr = findJSONField(paramsStr, 'address');
    const address = addressStr !== '' ? this.parseAddress(addressStr) : Context.getCaller();
    if (address === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const balance = HostABI.queryUTXOBalance(address, this.tokenID);
    const result = JSON.stringify({
      address: this.addressToBase58(address),
      balance: balance.toString(),
      tokenID: this.tokenID,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    return ErrorCode.SUCCESS;
  }

  private parseAddress(addressStr: string): Address | null {
    return ParsingUtils.parseAddress(addressStr);
  }

  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

const contract = new GameCurrencyContract();

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
  const functionName = 'BalanceOf';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

