/**
 * AddressUtils 测试
 */

import { AddressUtils } from '../../../src/framework/utils/address';
import { MockHostABI } from '../../integration/mock-hostabi';

// Mock HostABI
jest.mock('../../../src/runtime/abi', () => {
  const { MockHostABI } = require('../../integration/mock-hostabi');
  return {
    HostABI: MockHostABI,
  };
});

describe('AddressUtils', () => {
  let mockHostABI: MockHostABI;

  beforeEach(() => {
    mockHostABI = new MockHostABI();
  });

  describe('toBase58', () => {
    it('应该将地址转换为 Base58 字符串', () => {
      const address = new Uint8Array(20).fill(1);
      mockHostABI.setAddressBytesToBase58(address, 'testBase58');
      
      const result = AddressUtils.toBase58(address);
      expect(result).toBe('testBase58');
    });

    it('应该返回 null（如果转换失败）', () => {
      const address = new Uint8Array(20).fill(1);
      mockHostABI.setAddressBytesToBase58(address, null);
      
      const result = AddressUtils.toBase58(address);
      expect(result).toBeNull();
    });
  });

  describe('fromBase58', () => {
    it('应该将 Base58 字符串转换为地址', () => {
      const base58 = 'testBase58';
      const expectedAddress = new Uint8Array(20).fill(2);
      mockHostABI.setAddressBase58ToBytes(base58, expectedAddress);
      
      const result = AddressUtils.fromBase58(base58);
      expect(result).toEqual(expectedAddress);
    });

    it('应该返回 null（如果转换失败）', () => {
      const base58 = 'invalidBase58';
      mockHostABI.setAddressBase58ToBytes(base58, null);
      
      const result = AddressUtils.fromBase58(base58);
      expect(result).toBeNull();
    });
  });

  describe('isValid', () => {
    it('应该验证有效地址（20字节）', () => {
      const address = new Uint8Array(20);
      expect(AddressUtils.isValid(address)).toBe(true);
    });

    it('应该拒绝无效地址（非20字节）', () => {
      const address1 = new Uint8Array(19);
      const address2 = new Uint8Array(21);
      
      expect(AddressUtils.isValid(address1)).toBe(false);
      expect(AddressUtils.isValid(address2)).toBe(false);
    });
  });

  describe('toHex', () => {
    it('应该将地址转换为十六进制字符串', () => {
      const address = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
      const hex = AddressUtils.toHex(address);
      
      expect(hex).toBe('0123456789abcdef');
    });

    it('应该处理全零地址', () => {
      const address = new Uint8Array(20).fill(0);
      const hex = AddressUtils.toHex(address);
      
      expect(hex).toBe('0'.repeat(40));
    });
  });

  describe('equals', () => {
    it('应该正确比较相等的地址', () => {
      const addr1 = new Uint8Array([1, 2, 3, 4, 5]);
      const addr2 = new Uint8Array([1, 2, 3, 4, 5]);
      
      expect(AddressUtils.equals(addr1, addr2)).toBe(true);
    });

    it('应该正确比较不相等的地址', () => {
      const addr1 = new Uint8Array([1, 2, 3, 4, 5]);
      const addr2 = new Uint8Array([1, 2, 3, 4, 6]);
      
      expect(AddressUtils.equals(addr1, addr2)).toBe(false);
    });

    it('应该拒绝不同长度的地址', () => {
      const addr1 = new Uint8Array(20);
      const addr2 = new Uint8Array(19);
      
      expect(AddressUtils.equals(addr1, addr2)).toBe(false);
    });
  });
});

