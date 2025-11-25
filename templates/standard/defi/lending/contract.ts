/**
 * 借贷协议合约示例
 */
import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Token } from '../../../src/helpers/token';
import { Market } from '../../../src/helpers/market';
import { Address, Amount, TokenID } from '../../../src/framework/types';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';
import { ParsingUtils } from '../../../src/framework/utils/parsing';
import { FormatUtils } from '../../../src/framework/utils/format';

class LendingContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Lending',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Deposit') {
      return this.deposit(params);
    } else if (functionName === 'Borrow') {
      return this.borrow(params);
    } else if (functionName === 'Repay') {
      return this.repay(params);
    } else if (functionName === 'Withdraw') {
      return this.withdraw(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  private deposit(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const tokenID: TokenID | null = tokenIDStr !== '' ? tokenIDStr : null;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();
    return Token.transfer(caller, contractAddr, amount, tokenID);
  }

  private borrow(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const tokenID: TokenID | null = tokenIDStr !== '' ? tokenIDStr : null;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();
    return Token.transfer(contractAddr, caller, amount, tokenID);
  }

  private repay(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const tokenID: TokenID | null = tokenIDStr !== '' ? tokenIDStr : null;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();
    return Token.transfer(caller, contractAddr, amount, tokenID);
  }

  private withdraw(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const amountStr = findJSONField(paramsStr, 'amount');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const tokenID: TokenID | null = tokenIDStr !== '' ? tokenIDStr : null;
    const caller = Context.getCaller();
    const contractAddr = Context.getContractAddress();
    return Token.transfer(contractAddr, caller, amount, tokenID);
  }

  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

const contract = new LendingContract();

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
  const functionName = 'Deposit';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}
