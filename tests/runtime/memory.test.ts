/**
 * Runtime 层内存管理测试
 * 
 * 测试内存分配和读取功能
 */

import { allocateString, allocateBytes, readString, readBytes } from '../../src/runtime/memory';

describe('Memory Utils', () => {
  describe('allocateString', () => {
    it('should allocate string and return pointer', () => {
      const str = 'Hello, World!';
      const ptr = allocateString(str);
      expect(ptr).not.toBe(0);
    });

    it('should handle empty string', () => {
      const ptr = allocateString('');
      expect(ptr).not.toBe(0);
    });
  });

  describe('readString', () => {
    it('should read allocated string correctly', () => {
      const str = 'Test String';
      const ptr = allocateString(str);
      const len = str.length;
      const read = readString(ptr, len);
      expect(read).toBe(str);
    });
  });

  describe('allocateBytes', () => {
    it('should allocate bytes and return pointer', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);
      const ptr = allocateBytes(bytes);
      expect(ptr).not.toBe(0);
    });

    it('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);
      const ptr = allocateBytes(bytes);
      expect(ptr).not.toBe(0);
    });
  });

  describe('readBytes', () => {
    it('should read allocated bytes correctly', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);
      const ptr = allocateBytes(bytes);
      const read = readBytes(ptr, bytes.length);
      expect(read).toEqual(bytes);
    });
  });
});

