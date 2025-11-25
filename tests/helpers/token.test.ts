/**
 * Token Helper 测试
 */

import { Token } from '../../src/helpers/token';

describe('Token Helper', () => {
  describe('balanceOf', () => {
    it('should query balance', () => {
      const address = new Uint8Array(20);
      const tokenID = 'TEST_TOKEN';
      const balance = Token.balanceOf(address, tokenID);
      expect(typeof balance).toBe('number');
    });

    it('should handle null tokenID', () => {
      const address = new Uint8Array(20);
      const balance = Token.balanceOf(address, null);
      expect(typeof balance).toBe('number');
    });
  });

  // 注意：transfer, mint, burn 需要实际的 Host ABI 环境才能测试
  // 这些测试需要在集成测试中完成
});

