/**
 * commodity 代币化合约示例
 */
import { Contract, Context, ErrorCode, HostABI, Token, Market } from '@weisyn/contract-sdk-js/as';
import { Address, Amount, TokenID } from '@weisyn/contract-sdk-js/as';
import { findJSONField, parseUint64 } from '@weisyn/contract-sdk-js/as';
import { ParsingUtils } from '@weisyn/contract-sdk-js/as';
import { FormatUtils } from '@weisyn/contract-sdk-js/as';

class commodityContract extends Contract {
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'commodity',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'Tokenizecommodity') {
      return this.tokenizeAsset(params);
    } else if (functionName === 'Transfercommodity') {
      return this.transferAsset(params);
    } else if (functionName === 'Escrowcommodity') {
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

const contract = new commodityContract();

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
  const functionName = 'Tokenizecommodity';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}
