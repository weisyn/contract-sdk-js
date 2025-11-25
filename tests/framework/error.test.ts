/**
 * ErrorCodeMapper 测试
 */

import { ErrorCodeMapper } from '../../src/framework/error';
import { ErrorCode } from '../../src/framework/types';

describe('ErrorCodeMapper', () => {
  describe('fromHostABI', () => {
    it('应该正确映射 SUCCESS', () => {
      const result = ErrorCodeMapper.fromHostABI(0);
      expect(result).toBe(ErrorCode.SUCCESS);
    });

    it('应该正确映射 ERROR_INVALID_PARAMS', () => {
      const result = ErrorCodeMapper.fromHostABI(1);
      expect(result).toBe(ErrorCode.ERROR_INVALID_PARAMS);
    });

    it('应该正确映射 ERROR_EXECUTION_FAILED (0xFFFFFFFF)', () => {
      const result = ErrorCodeMapper.fromHostABI(0xFFFFFFFF);
      expect(result).toBe(ErrorCode.ERROR_EXECUTION_FAILED);
    });

    it('应该映射未知错误码为 ERROR_UNKNOWN', () => {
      const result = ErrorCodeMapper.fromHostABI(9999);
      expect(result).toBe(ErrorCode.ERROR_UNKNOWN);
    });
  });

  describe('toHostABI', () => {
    it('应该正确转换 ErrorCode 为 HostABI 返回码', () => {
      expect(ErrorCodeMapper.toHostABI(ErrorCode.SUCCESS)).toBe(0);
      expect(ErrorCodeMapper.toHostABI(ErrorCode.ERROR_INVALID_PARAMS)).toBe(1);
      expect(ErrorCodeMapper.toHostABI(ErrorCode.ERROR_EXECUTION_FAILED)).toBe(6);
    });
  });

  describe('isSuccess', () => {
    it('应该正确判断成功状态', () => {
      expect(ErrorCodeMapper.isSuccess(ErrorCode.SUCCESS)).toBe(true);
      expect(ErrorCodeMapper.isSuccess(ErrorCode.ERROR_INVALID_PARAMS)).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('应该正确判断失败状态', () => {
      expect(ErrorCodeMapper.isFailure(ErrorCode.SUCCESS)).toBe(false);
      expect(ErrorCodeMapper.isFailure(ErrorCode.ERROR_INVALID_PARAMS)).toBe(true);
    });
  });

  describe('getDescription', () => {
    it('应该返回所有错误码的描述', () => {
      expect(ErrorCodeMapper.getDescription(ErrorCode.SUCCESS)).toBe('Success');
      expect(ErrorCodeMapper.getDescription(ErrorCode.ERROR_INVALID_PARAMS)).toBe('Invalid parameters');
      expect(ErrorCodeMapper.getDescription(ErrorCode.ERROR_EXECUTION_FAILED)).toBe('Execution failed');
    });
  });
});

