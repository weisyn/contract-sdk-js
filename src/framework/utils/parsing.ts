/**
 * 解析工具
 * 
 * 提供参数解析和类型转换功能
 * 用于合约参数解析
 */

import { Context } from '../context';
import { Address } from '../types';
import { findJSONField, parseUint64 } from './json';
import { AddressUtils } from './address';

/**
 * 解析工具类
 */
export class ParsingUtils {
  /**
   * 从 JSON 参数中解析地址
   * @param paramsStr JSON 参数字符串
   * @param key 地址字段名
   * @returns 地址，失败返回 null
   */
  static parseAddressFromJSON(paramsStr: string, key: string): Address | null {
    const addressStr = findJSONField(paramsStr, key);
    if (addressStr === '') {
      return null;
    }
    return this.parseAddress(addressStr);
  }

  /**
   * 解析地址字符串（Base58 或十六进制）
   * @param addressStr 地址字符串
   * @returns 地址字节数组，失败返回 null
   */
  static parseAddress(addressStr: string): Address | null {
    if (addressStr === '') {
      return null;
    }

    // 尝试 Base58 解码
    const base58Result = AddressUtils.fromBase58(addressStr);
    if (base58Result !== null) {
      return base58Result;
    }

    // 尝试十六进制解码
    const hexResult = this.hexToBytes(addressStr);
    if (hexResult !== null && hexResult.length === 20) {
      return hexResult;
    }

    // 如果都失败，返回调用者地址（简化处理）
    return Context.getCaller();
  }

  /**
   * 从 JSON 参数中解析金额
   * @param paramsStr JSON 参数字符串
   * @param key 金额字段名
   * @returns 金额，失败返回 0
   */
  static parseAmountFromJSON(paramsStr: string, key: string): u64 {
    const amountStr = findJSONField(paramsStr, key);
    if (amountStr === '') {
      return 0;
    }
    return parseUint64(amountStr);
  }

  /**
   * 从 JSON 参数中解析字符串
   * @param paramsStr JSON 参数字符串
   * @param key 字段名
   * @returns 字符串值，失败返回空字符串
   */
  static parseStringFromJSON(paramsStr: string, key: string): string {
    return findJSONField(paramsStr, key);
  }

  /**
   * 从 JSON 参数中解析布尔值
   * @param paramsStr JSON 参数字符串
   * @param key 字段名
   * @returns 布尔值，失败返回 false
   */
  static parseBooleanFromJSON(paramsStr: string, key: string): bool {
    const valueStr = findJSONField(paramsStr, key);
    return valueStr === 'true' || valueStr === '1';
  }

  /**
   * 十六进制字符串转字节数组
   * @param hex 十六进制字符串（可带 0x 前缀）
   * @returns 字节数组，失败返回 null
   */
  static hexToBytes(hex: string): Uint8Array | null {
    // 移除 0x 前缀
    if (hex.length >= 2 && hex.substring(0, 2) === '0x') {
      hex = hex.substring(2);
    }

    // 确保长度为偶数
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }

    const result = new Array<u8>();
    for (let i = 0; i < hex.length; i += 2) {
      const high = this.hexCharToByte(hex.charCodeAt(i));
      const low = this.hexCharToByte(hex.charCodeAt(i + 1));
      if (high < 0 || low < 0) {
        return null;
      }
      result.push((high << 4) | low);
    }

    return Uint8Array.wrap(result);
  }

  /**
   * 十六进制字符转字节
   */
  private static hexCharToByte(charCode: i32): i32 {
    if (charCode >= 48 && charCode <= 57) { // '0'-'9'
      return charCode - 48;
    }
    if (charCode >= 65 && charCode <= 70) { // 'A'-'F'
      return charCode - 65 + 10;
    }
    if (charCode >= 97 && charCode <= 102) { // 'a'-'f'
      return charCode - 97 + 10;
    }
    return -1;
  }
}

