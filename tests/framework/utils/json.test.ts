/**
 * JSON 工具函数测试
 */

import { findJSONField, extractJSONObject, parseUint64 } from '../../../src/framework/utils/json';

describe('JSON Utils', () => {
  describe('findJSONField', () => {
    it('should find string field', () => {
      const json = '{"name":"test","value":"hello"}';
      const result = findJSONField(json, 'name');
      expect(result).toBe('test');
    });

    it('should find number field', () => {
      const json = '{"amount":100,"count":50}';
      const result = findJSONField(json, 'amount');
      expect(result).toBe('100');
    });

    it('should return empty string for non-existent field', () => {
      const json = '{"name":"test"}';
      const result = findJSONField(json, 'missing');
      expect(result).toBe('');
    });

    it('should handle nested JSON', () => {
      const json = '{"outer":{"inner":"value"}}';
      const result = findJSONField(json, 'outer');
      expect(result).toBe('');
    });
  });

  describe('extractJSONObject', () => {
    it('should extract simple object', () => {
      const json = '{"asset":{"amount":100,"tokenId":"TOKEN"}}';
      const result = extractJSONObject(json, 'asset');
      expect(result).toBe('{"amount":100,"tokenId":"TOKEN"}');
    });

    it('should return empty string for non-existent object', () => {
      const json = '{"name":"test"}';
      const result = extractJSONObject(json, 'missing');
      expect(result).toBe('');
    });

    it('should handle nested objects', () => {
      const json = '{"data":{"nested":{"value":123}}}';
      const result = extractJSONObject(json, 'data');
      expect(result).toContain('nested');
    });
  });

  describe('parseUint64', () => {
    it('should parse valid number string', () => {
      expect(parseUint64('100')).toBe(100);
      expect(parseUint64('0')).toBe(0);
      expect(parseUint64('999999999')).toBe(999999999);
    });

    it('should parse partial number string', () => {
      expect(parseUint64('123abc')).toBe(123);
      expect(parseUint64('456.789')).toBe(456);
    });

    it('should return 0 for empty string', () => {
      expect(parseUint64('')).toBe(0);
    });

    it('should return 0 for non-numeric string', () => {
      expect(parseUint64('abc')).toBe(0);
    });
  });
});
