/**
 * 地址编码工具
 * 
 * 提供地址的 Base58 编码/解码功能
 * 封装 HostABI 的地址编码函数
 */

import { HostABI } from '../../runtime/abi';
import { Address } from '../types';

/**
 * 地址编码工具类
 */
export class AddressUtils {
  /**
   * 地址字节数组转 Base58 字符串
   * @param address 地址字节数组（20字节）
   * @returns Base58 编码的地址字符串，失败返回 null
   */
  static toBase58(address: Address): string | null {
    return HostABI.addressBytesToBase58(address);
  }

  /**
   * Base58 字符串转地址字节数组
   * @param base58 Base58 编码的地址字符串
   * @returns 地址字节数组（20字节），失败返回 null
   */
  static fromBase58(base58: string): Address | null {
    return HostABI.addressBase58ToBytes(base58);
  }

  /**
   * 检查地址是否有效
   * @param address 地址字节数组
   * @returns 是否有效（长度为20字节）
   */
  static isValid(address: Address): bool {
    return address.length === 20;
  }

  /**
   * 地址转十六进制字符串（用于调试）
   * @param address 地址字节数组
   * @returns 十六进制字符串
   */
  static toHex(address: Address): string {
    let hex = '';
    for (let i = 0; i < address.length; i++) {
      const byte = address[i];
      const high = (byte >> 4) & 0xF;
      const low = byte & 0xF;
      hex += String.fromCharCode(high < 10 ? 48 + high : 87 + high);
      hex += String.fromCharCode(low < 10 ? 48 + low : 87 + low);
    }
    return hex;
  }

  /**
   * 地址转十六进制字符串（带 0x 前缀）
   * @param address 地址字节数组
   * @returns 十六进制字符串（带 0x 前缀）
   */
  static toHexWithPrefix(address: Address): string {
    return '0x' + this.toHex(address);
  }

  /**
   * 比较两个地址是否相等
   * @param addr1 地址1
   * @param addr2 地址2
   * @returns 是否相等
   */
  static equals(addr1: Address, addr2: Address): bool {
    if (addr1.length !== addr2.length) {
      return false;
    }
    for (let i = 0; i < addr1.length; i++) {
      if (addr1[i] !== addr2[i]) {
        return false;
      }
    }
    return true;
  }
}
