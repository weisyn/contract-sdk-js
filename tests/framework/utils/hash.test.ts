/**
 * 哈希工具函数测试
 */

import { computeHash } from '../../../src/framework/utils/hash';

describe('Hash Utils', () => {
  describe('computeHash', () => {
    it('should compute hash for empty data', () => {
      const data = new Uint8Array(0);
      const hash = computeHash(data);
      expect(hash.length).toBe(32);
    });

    it('should compute hash for simple data', () => {
      const data = Uint8Array.wrap(String.UTF8.encode('hello'));
      const hash = computeHash(data);
      expect(hash.length).toBe(32);
    });

    it('should compute hash for address-like data', () => {
      const data = new Uint8Array(20);
      data.fill(0x01);
      const hash = computeHash(data);
      expect(hash.length).toBe(32);
    });

    it('should produce deterministic hash', () => {
      const data = Uint8Array.wrap(String.UTF8.encode('test'));
      const hash1 = computeHash(data);
      const hash2 = computeHash(data);
      expect(hash1).toEqual(hash2);
    });

    it('should produce different hash for different data', () => {
      const data1 = Uint8Array.wrap(String.UTF8.encode('test1'));
      const data2 = Uint8Array.wrap(String.UTF8.encode('test2'));
      const hash1 = computeHash(data1);
      const hash2 = computeHash(data2);
      expect(hash1).not.toEqual(hash2);
    });
  });
});

