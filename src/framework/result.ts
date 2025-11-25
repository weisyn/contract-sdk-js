/**
 * 结果类型
 *
 * 提供 Result<T> 类型和错误处理
 */

import { ErrorCode } from "./types";

/**
 * Result 类型
 * 用于表示操作的成功或失败
 */
export class Result<T> {
  ok: bool;
  value: T | null;
  error: ErrorCode | null;

  private constructor(ok: bool, value: T | null = null, error: ErrorCode | null = null) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  /**
   * 创建成功结果
   */
  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value, null);
  }

  /**
   * 创建错误结果
   */
  static error<T>(code: ErrorCode): Result<T> {
    return new Result<T>(false, null, code);
  }

  /**
   * 检查是否成功
   */
  isOk(): bool {
    return this.ok;
  }

  /**
   * 检查是否失败
   */
  isErr(): bool {
    return !this.ok;
  }

  /**
   * 获取值（如果成功）
   */
  unwrap(): T {
    if (!this.ok || this.value === null) {
      throw new Error("Result is not ok");
    }
    return this.value!;
  }

  /**
   * 获取错误码（如果失败）
   */
  unwrapErr(): ErrorCode {
    if (this.ok || this.error === null) {
      throw new Error("Result is not error");
    }
    return this.error;
  }
}
