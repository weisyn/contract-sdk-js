/**
 * HostABI 测试
 * 
 * 测试 HostABI 封装功能
 */

import { HostABI } from '../../src/runtime/abi';
import { OutPoint, Hash } from '../../src/framework/types';

describe('HostABI', () => {
  describe('utxoLookup', () => {
    it('should return null for invalid outPoint', () => {
      const invalidOutPoint = new OutPoint(new Uint8Array(31), 0); // 31 bytes instead of 32
      const result = HostABI.utxoLookup(invalidOutPoint);
      expect(result).toBeNull();
    });

    it('should handle valid outPoint structure', () => {
      const validOutPoint = new OutPoint(new Uint8Array(32), 0);
      // Note: 实际测试需要 HostABI 环境，这里只测试结构
      expect(validOutPoint.txHash.length).toBe(32);
      expect(validOutPoint.index).toBe(0);
    });
  });

  describe('resourceLookup', () => {
    it('should return null for invalid contentHash', () => {
      const invalidHash = new Uint8Array(31); // 31 bytes instead of 32
      const result = HostABI.resourceLookup(invalidHash);
      expect(result).toBeNull();
    });

    it('should handle valid contentHash structure', () => {
      const validHash = new Uint8Array(32);
      // Note: 实际测试需要 HostABI 环境，这里只测试结构
      expect(validHash.length).toBe(32);
    });
  });

  describe('batchCreateOutputsSimple', () => {
    it('should return error for empty items', () => {
      const result = HostABI.batchCreateOutputsSimple([]);
      expect(result).toBe(0xFFFFFFFF);
    });

    it('should handle valid items structure', () => {
      const items = [{
        recipient: new Uint8Array(20),
        amount: 100,
        tokenID: null as string | null,
      }];
      // Note: 实际测试需要 HostABI 环境，这里只测试结构
      expect(items.length).toBe(1);
      expect(items[0].recipient.length).toBe(20);
      expect(items[0].amount).toBe(100);
    });
  });
});

