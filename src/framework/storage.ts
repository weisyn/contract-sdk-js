/**
 * 状态存储抽象
 *
 * 提供状态存储抽象（基于 Host state API）
 * 注意：EUTXO 模型无全局状态存储，这里主要用于查询外部状态
 */

import * as env from "../runtime/env";
import { allocateString, readBytes } from "../runtime/memory";
import { StateResult } from "./types";

/**
 * 状态存储类
 */
export class Storage {
  /**
   * 获取状态值
   * @param key 状态键
   * @returns 状态值，如果不存在返回 null
   */
  static get(key: string): Uint8Array | null {
    const keyPtr = allocateString(key);
    if (keyPtr === 0) {
      return null;
    }
    const keyLen = String.UTF8.byteLength(key);

    const maxValueLen = 8192; // 假设最大8KB
    const valuePtr = env.malloc(maxValueLen);
    if (valuePtr === 0) {
      return null;
    }

    const actualLen = env.stateGet(keyPtr, keyLen, valuePtr, maxValueLen);
    if (actualLen === 0) {
      return null;
    }

    return readBytes(valuePtr, actualLen);
  }

  /**
   * 从链上获取状态值
   * @param stateID 状态ID
   * @returns 状态值和版本，如果不存在返回 null
   */
  static getFromChain(stateID: string): StateResult | null {
    const stateIDPtr = allocateString(stateID);
    if (stateIDPtr === 0) {
      return null;
    }
    const stateIDLen = String.UTF8.byteLength(stateID);

    const maxValueLen = 8192; // 假设最大8KB
    const valuePtr = env.malloc(maxValueLen);
    if (valuePtr === 0) {
      return null;
    }

    const versionPtr = env.malloc(8); // u64 = 8 bytes
    if (versionPtr === 0) {
      return null;
    }

    const actualLen = env.stateGetFromChain(
      stateIDPtr,
      stateIDLen,
      valuePtr,
      maxValueLen,
      versionPtr
    );

    if (actualLen === 0) {
      return null;
    }

    // 读取版本（u64）
    // AssemblyScript: load<u64>(ptr) 从内存地址读取 u64
    const version = load<u64>(versionPtr);

    return new StateResult(readBytes(valuePtr, actualLen), version);
  }
}
