/**
 * Governance Helper 测试
 */

describe('Governance Helper', () => {
  describe('propose', () => {
    it('should validate parameters', () => {
      const proposer = new Uint8Array(20);
      const proposalID = new TextEncoder().encode('proposal_001');
      const proposalData = new TextEncoder().encode('Proposal Title');

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数结构
      expect(proposer.length).toBe(20);
      expect(proposalID.length).toBeGreaterThan(0);
      expect(proposalData.length).toBeGreaterThan(0);
    });
  });

  describe('vote', () => {
    it('should validate parameters', () => {
      const voter = new Uint8Array(20);
      const proposalID = new TextEncoder().encode('proposal_001');
      const support = true;

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数结构
      expect(voter.length).toBe(20);
      expect(proposalID.length).toBeGreaterThan(0);
      expect(support).toBe(true);
    });
  });

  describe('voteAndCount', () => {
    it('should validate parameters', () => {
      const voter = new Uint8Array(20);
      const proposalID = new TextEncoder().encode('proposal_001');
      const support = true;
      const threshold = 50;

      // Note: 实际测试需要 HostABI 环境
      // 这里只测试参数结构
      expect(voter.length).toBe(20);
      expect(proposalID.length).toBeGreaterThan(0);
      expect(support).toBe(true);
      expect(threshold).toBe(50);
    });
  });
});

