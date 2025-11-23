/**
 * 收藏品NFT合约示例
 * 
 * 📋 示例说明
 * 
 * 本示例展示如何使用 WES Contract SDK JS 构建收藏品NFT合约。
 * 通过本示例，您可以学习如何使用 `helpers/nft` 模块创建和管理收藏品NFT。
 * 
 * 🎯 核心功能
 * 
 *  1. MintNFT - 铸造NFT
 *  2. TransferNFT - 转移NFT
 *  3. QueryNFT - 查询NFT信息
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { NFT } from '../../../src/helpers/nft';
import { Address, TokenID } from '../../../src/framework/types';
import { findJSONField } from '../../../src/framework/utils/json';
import { ParsingUtils } from '../../../src/framework/utils/parsing';
import { FormatUtils } from '../../../src/framework/utils/format';

class CollectiblesNFTContract extends Contract {
  private collectionName = 'Collectibles';
  private baseTokenURI = 'https://example.com/metadata/';

  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'CollectiblesNFT',
      owner: this.addressToBase58(caller),
    });
    HostABI.emitEvent(event);
    return ErrorCode.SUCCESS;
  }

  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'MintNFT') {
      return this.mintNFT(params);
    } else if (functionName === 'TransferNFT') {
      return this.transferNFT(params);
    } else if (functionName === 'QueryNFT') {
      return this.queryNFT(params);
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  private mintNFT(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const toStr = findJSONField(paramsStr, 'to');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');
    const seriesStr = findJSONField(paramsStr, 'series');
    const rarityStr = findJSONField(paramsStr, 'rarity');

    if (toStr === '' || tokenIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const tokenID: TokenID = tokenIDStr;
    const metadata = Uint8Array.wrap(String.UTF8.encode(JSON.stringify({
      series: seriesStr,
      rarity: rarityStr,
      description: findJSONField(paramsStr, 'description'),
    })));

    return NFT.mint(to, tokenID, metadata);
  }

  private transferNFT(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const fromStr = findJSONField(paramsStr, 'from');
    const toStr = findJSONField(paramsStr, 'to');
    const tokenIDStr = findJSONField(paramsStr, 'token_id');

    if (fromStr === '' || toStr === '' || tokenIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const from = this.parseAddress(fromStr);
    const to = this.parseAddress(toStr);
    if (from === null || to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const tokenID: TokenID = tokenIDStr;
    return NFT.transfer(from, to, tokenID);
  }

  private queryNFT(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const tokenIDStr = findJSONField(paramsStr, 'token_id');

    if (tokenIDStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    const tokenID: TokenID = tokenIDStr;
    const owner = NFT.ownerOf(tokenID);

    const result = JSON.stringify({
      token_id: tokenIDStr,
      owner: owner !== null ? this.addressToBase58(owner) : null,
      collection: this.collectionName,
      exists: owner !== null,
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

const contract = new CollectiblesNFTContract();

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
  const functionName = 'QueryNFT';
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}
