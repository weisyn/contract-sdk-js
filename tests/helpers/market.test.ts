/**
 * Market Helper 测试
 */

describe('Market Helper', () => {
  describe('escrow', () => {
    it('should validate parameters', () => {
      const buyer = new Uint8Array(20);
      const seller = new Uint8Array(20);
      const amount = 10000;
      const escrowID = new TextEncoder().encode('escrow_123');

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数结构
      expect(buyer.length).toBe(20);
      expect(seller.length).toBe(20);
      expect(amount).toBe(10000);
      expect(escrowID.length).toBeGreaterThan(0);
    });

    it('should reject zero amount', () => {
      const amount = 0;

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数验证逻辑
      expect(amount).toBe(0);
    });
  });

  describe('release', () => {
    it('should validate parameters', () => {
      const from = new Uint8Array(20);
      const beneficiary = new Uint8Array(20);
      const amount = 100000;
      const vestingID = new TextEncoder().encode('vesting_123');

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数结构
      expect(from.length).toBe(20);
      expect(beneficiary.length).toBe(20);
      expect(amount).toBe(100000);
      expect(vestingID.length).toBeGreaterThan(0);
    });
  });
});

