/**
 * 哈希计算工具
 *
 * 提供简单的哈希计算功能，对齐 Go SDK 的 ComputeHash
 * 使用 FNV-1a 哈希算法（简化版，用于状态ID哈希计算）
 */

import type { Hash } from "../types";

/**
 * 计算哈希值（对齐 Go SDK 的 ComputeHash）
 * 使用 FNV-1a 哈希算法
 * @param data 输入数据
 * @returns 32字节哈希值
 */
export function computeHash(data: Uint8Array): Hash {
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  const fnvOffset64: u64 = 14695981039346656037;
  const fnvPrime64: u64 = 1099511628211;

  let hash: u64 = fnvOffset64;
  for (let i = 0; i < data.length; i++) {
    hash = hash ^ data[i];
    hash = hash * fnvPrime64;
  }

  // 将64位哈希扩展到32字节（通过多次哈希和组合）
  const result = new Uint8Array(32);
  const hash1 = hash;
  const hash2 = hash * fnvPrime64;
  const hash3 = hash2 * fnvPrime64;
  const hash4 = hash3 * fnvPrime64;

  for (let i = 0; i < 8; i++) {
    result[i] = (hash1 >> (i * 8)) as u8;
    result[i + 8] = (hash2 >> (i * 8)) as u8;
    result[i + 16] = (hash3 >> (i * 8)) as u8;
    result[i + 24] = (hash4 >> (i * 8)) as u8;
  }

  return result;
}
