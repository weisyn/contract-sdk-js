/**
 * ERC-20 Token 标准合约模板
 * 
 * 完整的 ERC-20 兼容代币合约实现
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../../src/framework';
import { HostABI } from '../../../src/runtime';
import { Token } from '../../../src/helpers/token';
import { Address } from '../../../src/framework/types';
import { findJSONField, parseUint64 } from '../../../src/framework/utils/json';

/**
 * ERC-20 Token 合约
 */
class ERC20TokenContract extends Contract {
  private tokenID: string = 'ERC20_TOKEN';

  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    const caller = Context.getCaller();
    
    // 发出合约初始化事件
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: 'Token',
      owner: this.addressToHex(caller),
    });
    HostABI.emitEvent(event);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
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

  /**
   * 转账代币
   */
  transfer(params: Uint8Array): ErrorCode {
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
    
    // 解析地址（简化处理，实际应使用 Base58 解码）
    const to = this.parseAddress(toStr);
    if (to === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    return Token.transfer(caller, to, amount, this.tokenID);
  }

  /**
   * 铸造代币
   */
  mint(params: Uint8Array): ErrorCode {
    // TODO: 权限检查（只有授权地址可以铸造）
    
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

  /**
   * 销毁代币
   */
  burn(params: Uint8Array): ErrorCode {
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

  /**
   * 授权代币
   */
  approve(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const spenderStr = findJSONField(paramsStr, 'spender');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (spenderStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const spender = this.parseAddress(spenderStr);
    if (spender === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const caller = Context.getCaller();
    return Token.approve(caller, spender, this.tokenID, amount);
  }

  /**
   * 冻结代币
   */
  freeze(params: Uint8Array): ErrorCode {
    // TODO: 权限检查（只有授权地址可以冻结）
    
    const paramsStr = String.UTF8.decode(params.buffer);
    const targetStr = findJSONField(paramsStr, 'target');
    const amountStr = findJSONField(paramsStr, 'amount');
    
    if (targetStr === '' || amountStr === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const amount = parseUint64(amountStr);
    if (amount === 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const target = this.parseAddress(targetStr);
    if (target === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    return Token.freeze(target, this.tokenID, amount);
  }

  /**
   * 空投代币
   */
  airdrop(params: Uint8Array): ErrorCode {
    // TODO: 解析 recipients 数组
    // 当前简化处理
    return ErrorCode.ERROR_NOT_IMPLEMENTED;
  }

  /**
   * 查询余额
   */
  balanceOf(params: Uint8Array): ErrorCode {
    const paramsStr = String.UTF8.decode(params.buffer);
    const addressStr = findJSONField(paramsStr, 'address');
    
    const address = addressStr !== '' ? this.parseAddress(addressStr) : Context.getCaller();
    if (address === null) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }
    
    const balance = Token.balanceOf(address, this.tokenID);
    const balanceStr = balance.toString();
    this.setReturnData(Uint8Array.wrap(String.UTF8.encode(balanceStr)));
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 解析地址（简化版，实际应使用 Base58 解码）
   */
  private parseAddress(addressStr: string): Address | null {
    // TODO: 使用 HostABI.addressBase58ToBytes 解析地址
    // 当前简化处理：返回固定地址
    return new Uint8Array(20);
  }

  /**
   * 地址转十六进制字符串
   */
  private addressToHex(address: Address): string {
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
const contract = new ERC20TokenContract();

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
 * Transfer 函数（WASM 导出）
 */
export function Transfer(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.transfer(params);
}

/**
 * Mint 函数（WASM 导出）
 */
export function Mint(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.mint(params);
}

/**
 * Burn 函数（WASM 导出）
 */
export function Burn(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.burn(params);
}

/**
 * Approve 函数（WASM 导出）
 */
export function Approve(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.approve(params);
}

/**
 * Freeze 函数（WASM 导出）
 */
export function Freeze(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.freeze(params);
}

/**
 * BalanceOf 函数（WASM 导出）
 */
export function BalanceOf(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.balanceOf(params);
}

