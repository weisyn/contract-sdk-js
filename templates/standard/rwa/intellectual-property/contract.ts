/**
 * intellectual property 代币化合约示例
 */
import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Token } from '../../../src/helpers/token';
import { Market } from '../../../src/helpers/market';
import { Address, Amount, TokenID } from '../../../src/framework/types';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';
import { ParsingUtils } from '../../../src/framework/utils/parsing';
import { FormatUtils } from '../../../src/framework/utils/format';

class intellectual propertyContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'intellectual property',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Tokenizeintellectual property') {
      return this.tokenizeAsset(params);
    } else if (functionName === 'Transferintellectual property') {
      return this.transferAsset(params);
    } else if (functionName === 'Escrowintellectual property') {
      return this.escrowAsset(params);
    } else if (functionName === 'ReleaseDividend') {
      return this.releaseDividend(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  private tokenizeAsset(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const assetIDStr = findJSONField(paramsStr, 'asset_id');
    const totalSupplyStr = findJSONField(paramsStr, 'total_supply');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (assetIDStr === '' || totalSupplyStr === '' || tokenIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const totalSupply = parseUint64(totalSupplyStr);
    const tokenID: TokenID = tokenIDStr;
    const caller = Context.getCaller();
    return Token.mint(caller, totalSupply, tokenID);
  }

  private transferAsset(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const amountStr = findJSONField(paramsStr, 'amount');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    if (toStr === '' || amountStr === '' || tokenIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const tokenID: TokenID = tokenIDStr;
    const caller = Context.getCaller();
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    return Token.transfer(caller, to, amount, tokenID);
  }

  private escrowAsset(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const buyerStr = findJSONField(paramsStr, 'buyer');
    const sellerStr = findJSONField(paramsStr, 'seller');
    const amountStr = findJSONField(paramsStr, 'amount');
    const escrowIDStr = findJSONField(paramsStr, 'escrow_id');
    if (buyerStr === '' || sellerStr === '' || amountStr === '' || escrowIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const escrowID = Uint8Array.wrap(String.UTF8.encode(escrowIDStr));
    const buyer = this.parseAddress(buyerStr);
    const seller = this.parseAddress(sellerStr);
    if (buyer === null || seller === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    return Market.escrow(buyer, seller, amount, null, escrowID);
  }

  private releaseDividend(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const vestingIDStr = findJSONField(paramsStr, 'vesting_id');
    const amountStr = findJSONField(paramsStr, 'amount');
    if (vestingIDStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    const amount = parseUint64(amountStr);
    const vestingID = Uint8Array.wrap(String.UTF8.encode(vestingIDStr));
    return Market.release(vestingID, amount, null);
  }

  private parseAddress(addressStr: string): Address | null {
    return ParsingUtils.parseAddress(addressStr);
  }

  private addressToBase58(address: Address): string {
    return FormatUtils.addressToBase58(address);
  }
}

const contract = new intellectual propertyContract();

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
  const functionName = 'Tokenizeintellectual property';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}
