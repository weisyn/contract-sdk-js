/**
 * Context API 测试
 */

import { Context } from '../../src/framework/context';
import { MockHostABI } from '../integration/mock-hostabi';
import * as HostABIModule from '../../src/runtime/abi';

// Mock HostABI
jest.mock('../../src/runtime/abi', () => {
  const { MockHostABI } = require('../integration/mock-hostabi');
  return {
    HostABI: MockHostABI,
  };
});

describe('Context', () => {
  let mockHostABI: MockHostABI;

  beforeEach(() => {
    mockHostABI = new MockHostABI();
    // 设置默认值
    mockHostABI.setBlockHash(100, new Uint8Array(32).fill(0xAA));
    mockHostABI.setMerkleRoot(100, new Uint8Array(32).fill(0xBB));
    mockHostABI.setStateRoot(100, new Uint8Array(32).fill(0xCC));
    mockHostABI.setStateVersion('state:test', 1);
    mockHostABI.setState('key:test', new Uint8Array([1, 2, 3]));
    mockHostABI.setAddressBytesToBase58(new Uint8Array(20).fill(1), 'testBase58');
  });

  describe('getCaller', () => {
    it('应该返回调用者地址', () => {
      const caller = Context.getCaller();
      expect(caller).toBeInstanceOf(Uint8Array);
      expect(caller.length).toBe(20);
    });
  });

  describe('getContractAddress', () => {
    it('应该返回合约地址', () => {
      const contractAddr = Context.getContractAddress();
      expect(contractAddr).toBeInstanceOf(Uint8Array);
      expect(contractAddr.length).toBe(20);
    });
  });

  describe('getTransactionID', () => {
    it('应该返回交易ID', () => {
      const txID = Context.getTransactionID();
      expect(txID).toBeInstanceOf(Uint8Array);
      expect(txID.length).toBe(32);
    });
  });

  describe('getTimestamp', () => {
    it('应该返回时间戳', () => {
      const timestamp = Context.getTimestamp();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe('getBlockHeight', () => {
    it('应该返回区块高度', () => {
      const height = Context.getBlockHeight();
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getBlockHash', () => {
    it('应该返回指定高度的区块哈希', () => {
      const hash = Context.getBlockHash(100);
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash!.length).toBe(32);
    });

    it('应该返回 null（如果区块不存在）', () => {
      mockHostABI.setBlockHash(999, null);
      const hash = Context.getBlockHash(999);
      expect(hash).toBeNull();
    });
  });

  describe('getChainID', () => {
    it('应该返回链ID', () => {
      const chainID = Context.getChainID();
      expect(chainID).toBeInstanceOf(Uint8Array);
    });
  });

  describe('getTxIndex', () => {
    it('应该返回交易索引', () => {
      const index = Context.getTxIndex();
      expect(typeof index).toBe('number');
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMerkleRoot', () => {
    it('应该返回指定高度的 Merkle 根', () => {
      const root = Context.getMerkleRoot(100);
      expect(root).toBeInstanceOf(Uint8Array);
      expect(root!.length).toBe(32);
    });
  });

  describe('getStateRoot', () => {
    it('应该返回指定高度的状态根', () => {
      const root = Context.getStateRoot(100);
      expect(root).toBeInstanceOf(Uint8Array);
      expect(root!.length).toBe(32);
    });
  });

  describe('getStateVersion', () => {
    it('应该返回状态版本', () => {
      const version = Context.getStateVersion('state:test');
      expect(typeof version).toBe('number');
      expect(version).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getState', () => {
    it('应该返回状态值', () => {
      const value = Context.getState('key:test');
      expect(value).toBeInstanceOf(Uint8Array);
    });

    it('应该返回 null（如果状态不存在）', () => {
      mockHostABI.setState('key:notfound', null);
      const value = Context.getState('key:notfound');
      expect(value).toBeNull();
    });
  });

  describe('getBlockTimestamp', () => {
    it('应该返回区块时间戳（别名）', () => {
      const timestamp = Context.getBlockTimestamp();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBe(Context.getTimestamp());
    });
  });
});

