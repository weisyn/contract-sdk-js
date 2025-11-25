/**
 * 错误码映射到 WES 错误码
 *
 * 本文件提供合约错误码到 WES Problem Details 错误码的映射
 * 合约执行时，错误码会被区块链服务层（weisyn.git）捕获并转换为 Problem Details
 * 本文件提供映射关系，帮助开发者理解错误码的含义
 */

import { ErrorCode } from "./types";

/**
 * WES 错误码常量
 */
export const WESErrorCode = {
  // 通用错误
  COMMON_VALIDATION_ERROR: "COMMON_VALIDATION_ERROR",
  COMMON_INTERNAL_ERROR: "COMMON_INTERNAL_ERROR",
  COMMON_TIMEOUT: "COMMON_TIMEOUT",

  // 区块链/合约错误
  BC_INSUFFICIENT_BALANCE: "BC_INSUFFICIENT_BALANCE",
  BC_CONTRACT_NOT_FOUND: "BC_CONTRACT_NOT_FOUND",
  BC_CONTRACT_INVOCATION_FAILED: "BC_CONTRACT_INVOCATION_FAILED",
} as const;

/**
 * 将合约错误码映射到 WES 错误码
 */
export function contractErrorCodeToWESCode(contractErrorCode: ErrorCode): string {
  switch (contractErrorCode) {
    case ErrorCode.SUCCESS:
      return ""; // 成功，无错误码
    case ErrorCode.ERROR_INVALID_PARAMS:
      return WESErrorCode.COMMON_VALIDATION_ERROR;
    case ErrorCode.ERROR_INSUFFICIENT_BALANCE:
      return WESErrorCode.BC_INSUFFICIENT_BALANCE;
    case ErrorCode.ERROR_UNAUTHORIZED:
      return WESErrorCode.COMMON_VALIDATION_ERROR; // 授权错误属于验证错误
    case ErrorCode.ERROR_NOT_FOUND:
      return WESErrorCode.BC_CONTRACT_NOT_FOUND; // 或 BC_TX_NOT_FOUND，取决于上下文
    case ErrorCode.ERROR_ALREADY_EXISTS:
      return WESErrorCode.COMMON_VALIDATION_ERROR;
    case ErrorCode.ERROR_EXECUTION_FAILED:
      return WESErrorCode.BC_CONTRACT_INVOCATION_FAILED;
    case ErrorCode.ERROR_INVALID_STATE:
      return WESErrorCode.BC_CONTRACT_INVOCATION_FAILED;
    case ErrorCode.ERROR_TIMEOUT:
      return WESErrorCode.COMMON_TIMEOUT;
    case ErrorCode.ERROR_NOT_IMPLEMENTED:
      return WESErrorCode.BC_CONTRACT_INVOCATION_FAILED;
    case ErrorCode.ERROR_PERMISSION_DENIED:
      return WESErrorCode.COMMON_VALIDATION_ERROR;
    case ErrorCode.ERROR_UNKNOWN:
      return WESErrorCode.COMMON_INTERNAL_ERROR;
    default:
      return WESErrorCode.COMMON_INTERNAL_ERROR;
  }
}

/**
 * 将合约错误码映射到用户友好的消息
 */
export function contractErrorCodeToUserMessage(contractErrorCode: ErrorCode): string {
  switch (contractErrorCode) {
    case ErrorCode.SUCCESS:
      return "";
    case ErrorCode.ERROR_INVALID_PARAMS:
      return "参数验证失败，请检查输入参数。";
    case ErrorCode.ERROR_INSUFFICIENT_BALANCE:
      return "余额不足，无法完成交易。";
    case ErrorCode.ERROR_UNAUTHORIZED:
      return "未授权操作，请检查权限。";
    case ErrorCode.ERROR_NOT_FOUND:
      return "资源不存在。";
    case ErrorCode.ERROR_ALREADY_EXISTS:
      return "资源已存在。";
    case ErrorCode.ERROR_EXECUTION_FAILED:
      return "合约执行失败，请检查合约逻辑。";
    case ErrorCode.ERROR_INVALID_STATE:
      return "合约状态无效，请检查合约状态。";
    case ErrorCode.ERROR_TIMEOUT:
      return "执行超时，请稍后重试。";
    case ErrorCode.ERROR_NOT_IMPLEMENTED:
      return "功能未实现。";
    case ErrorCode.ERROR_PERMISSION_DENIED:
      return "权限不足，无法执行此操作。";
    case ErrorCode.ERROR_UNKNOWN:
      return "未知错误，请稍后重试或联系管理员。";
    default:
      return "未知错误，请稍后重试或联系管理员。";
  }
}

/**
 * 将合约错误码映射到 HTTP 状态码
 */
export function contractErrorCodeToHTTPStatus(contractErrorCode: ErrorCode): number {
  switch (contractErrorCode) {
    case ErrorCode.SUCCESS:
      return 200;
    case ErrorCode.ERROR_INVALID_PARAMS:
      return 400;
    case ErrorCode.ERROR_INSUFFICIENT_BALANCE:
      return 422;
    case ErrorCode.ERROR_UNAUTHORIZED:
      return 401;
    case ErrorCode.ERROR_NOT_FOUND:
      return 404;
    case ErrorCode.ERROR_ALREADY_EXISTS:
      return 409;
    case ErrorCode.ERROR_EXECUTION_FAILED:
      return 422;
    case ErrorCode.ERROR_INVALID_STATE:
      return 422;
    case ErrorCode.ERROR_TIMEOUT:
      return 408;
    case ErrorCode.ERROR_NOT_IMPLEMENTED:
      return 501;
    case ErrorCode.ERROR_PERMISSION_DENIED:
      return 403;
    case ErrorCode.ERROR_UNKNOWN:
      return 500;
    default:
      return 500;
  }
}
