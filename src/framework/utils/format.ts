/**
 * 格式化工具
 * 
 * 提供数据格式化功能，用于事件和返回值格式化
 */

import { Address } from '../types';
import { AddressUtils } from './address';

/**
 * 格式化工具类
 */
export class FormatUtils {
  /**
   * 字节数组转十六进制字符串
   * @param bytes 字节数组
   * @returns 十六进制字符串
   */
  static bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      const high = (byte >> 4) & 0xF;
      const low = byte & 0xF;
      hex += String.fromCharCode(high < 10 ? 48 + high : 87 + high);
      hex += String.fromCharCode(low < 10 ? 48 + low : 87 + low);
    }
    return hex;
  }

  /**
   * 字节数组转十六进制字符串（带 0x 前缀）
   * @param bytes 字节数组
   * @returns 十六进制字符串（带 0x 前缀）
   */
  static bytesToHexWithPrefix(bytes: Uint8Array): string {
    return '0x' + this.bytesToHex(bytes);
  }

  /**
   * 地址转 Base58 字符串（用于事件和返回值）
   * @param address 地址
   * @returns Base58 字符串，失败返回十六进制字符串
   */
  static addressToString(address: Address): string {
    const base58 = AddressUtils.toBase58(address);
    if (base58 !== null) {
      return base58;
    }
    // 回退到十六进制
    return AddressUtils.toHex(address);
  }

  /**
   * 地址转十六进制字符串（用于调试）
   * @param address 地址
   * @returns 十六进制字符串
   */
  static addressToHex(address: Address): string {
    return AddressUtils.toHex(address);
  }

  /**
   * 地址转 Base58 字符串（用于事件）
   * @param address 地址
   * @returns Base58 字符串，失败返回占位符
   */
  static addressToBase58(address: Address): string {
    const base58 = AddressUtils.toBase58(address);
    if (base58 !== null) {
      return base58;
    }
    // 回退到十六进制（带前缀）
    return AddressUtils.toHexWithPrefix(address);
  }
}

