/**
 * 错误码映射工具
 * 
 * 提供统一的错误码映射和转换功能
 * 确保与 Go SDK 的错误码语义一致
 * 
 * 参考: contract-sdk-go/framework/errors.go
 */

import { ErrorCode } from './types';

/**
 * 错误码映射类
 * 提供 HostABI 返回码到 ErrorCode 的映射
 */
export class ErrorCodeMapper {
  /**
   * 将 HostABI 返回码映射为 ErrorCode
   * @param hostABICode HostABI 返回的错误码（u32）
   * @returns 对应的 ErrorCode
   */
  static fromHostABI(hostABICode: u32): ErrorCode {
    // HostABI 错误码映射规则：
    // 0 = SUCCESS
    // 1 = ERROR_INVALID_PARAMS
    // 2 = ERROR_INSUFFICIENT_BALANCE
    // 3 = ERROR_UNAUTHORIZED
    // 4 = ERROR_NOT_FOUND
    // 5 = ERROR_ALREADY_EXISTS
    // 6 = ERROR_EXECUTION_FAILED
    // 7 = ERROR_INVALID_STATE
    // 8 = ERROR_TIMEOUT
    // 9 = ERROR_NOT_IMPLEMENTED
    // 10 = ERROR_PERMISSION_DENIED
    // 0xFFFFFFFF = ERROR_EXECUTION_FAILED (失败标志)
    
    if (hostABICode === 0) {
      return ErrorCode.SUCCESS;
    } else if (hostABICode === 0xFFFFFFFF) {
      return ErrorCode.ERROR_EXECUTION_FAILED;
    } else if (hostABICode >= 1 && hostABICode <= 10) {
      return hostABICode as ErrorCode;
    }
    
    // 未知错误码映射为 ERROR_UNKNOWN
    return ErrorCode.ERROR_UNKNOWN;
  }

  /**
   * 将 ErrorCode 转换为 HostABI 返回码
   * @param errorCode ErrorCode 枚举值
   * @returns HostABI 返回码（u32）
   */
  static toHostABI(errorCode: ErrorCode): u32 {
    return errorCode as u32;
  }

  /**
   * 检查是否为成功状态
   * @param errorCode 错误码
   * @returns 是否成功
   */
  static isSuccess(errorCode: ErrorCode): bool {
    return errorCode === ErrorCode.SUCCESS;
  }

  /**
   * 检查是否为失败状态
   * @param errorCode 错误码
   * @returns 是否失败
   */
  static isFailure(errorCode: ErrorCode): bool {
    return errorCode !== ErrorCode.SUCCESS;
  }

  /**
   * 获取错误码描述（用于调试）
   * @param errorCode 错误码
   * @returns 错误描述字符串
   */
  static getDescription(errorCode: ErrorCode): string {
    switch (errorCode) {
      case ErrorCode.SUCCESS:
        return 'Success';
      case ErrorCode.ERROR_INVALID_PARAMS:
        return 'Invalid parameters';
      case ErrorCode.ERROR_INSUFFICIENT_BALANCE:
        return 'Insufficient balance';
      case ErrorCode.ERROR_UNAUTHORIZED:
        return 'Unauthorized';
      case ErrorCode.ERROR_NOT_FOUND:
        return 'Not found';
      case ErrorCode.ERROR_ALREADY_EXISTS:
        return 'Already exists';
      case ErrorCode.ERROR_EXECUTION_FAILED:
        return 'Execution failed';
      case ErrorCode.ERROR_INVALID_STATE:
        return 'Invalid state';
      case ErrorCode.ERROR_TIMEOUT:
        return 'Timeout';
      case ErrorCode.ERROR_NOT_IMPLEMENTED:
        return 'Not implemented';
      case ErrorCode.ERROR_PERMISSION_DENIED:
        return 'Permission denied';
      case ErrorCode.ERROR_UNKNOWN:
        return 'Unknown error';
      default:
        return 'Unknown error code';
    }
  }
}

