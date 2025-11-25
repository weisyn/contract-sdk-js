/**
 * Base64 工具测试
 */

import { encode, decode } from '../../../src/framework/utils/base64';

describe('Base64 Utils', () => {
  describe('encode', () => {
    it('should encode bytes to Base64', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const encoded = encode(bytes);
      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);
      const encoded = encode(bytes);
      expect(encoded).toBeTruthy();
    });
  });

  describe('decode', () => {
    it('should decode Base64 to bytes', () => {
      const original = new Uint8Array([72, 101, 108, 108, 111]);
      const encoded = encode(original);
      const decoded = decode(encoded);
      expect(decoded).toEqual(original);
    });

    it('should handle empty string', () => {
      const decoded = decode('');
      expect(decoded.length).toBe(0);
    });
  });

  describe('roundtrip', () => {
    it('should encode and decode correctly', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const encoded = encode(original);
      const decoded = decode(encoded);
      expect(decoded).toEqual(original);
    });
  });
});

