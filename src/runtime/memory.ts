/**
 * 内存管理辅助函数
 * 
 * 提供内存分配和字符串/字节数组转换的辅助函数
 */

import { malloc } from './env';

/**
 * 分配字符串到线性内存
 * @param str 要分配的字符串
 * @returns 内存指针
 */
export function allocateString(str: string): u32 {
  const utf8 = String.UTF8.encode(str);
  const ptr = malloc(utf8.byteLength);
  if (ptr === 0) {
    return 0;
  }
  // AssemblyScript: memory.copy(dest, src, size)
  memory.copy(ptr, changetype<usize>(utf8), utf8.byteLength);
  return ptr;
}

/**
 * 分配字节数组到线性内存
 * @param bytes 要分配的字节数组
 * @returns 内存指针
 */
export function allocateBytes(bytes: Uint8Array): u32 {
  const ptr = malloc(bytes.length);
  if (ptr === 0) {
    return 0;
  }
  // AssemblyScript: memory.copy(dest, src, size)
  memory.copy(ptr, changetype<usize>(bytes.buffer), bytes.length);
  return ptr;
}

/**
 * 从线性内存读取字符串
 * @param ptr 内存指针
 * @param len 长度
 * @returns 字符串
 */
export function readString(ptr: u32, len: u32): string {
  if (ptr === 0 || len === 0) {
    return '';
  }
  const buffer = new Uint8Array(len);
  // AssemblyScript: memory.copy(dest, src, size)
  memory.copy(changetype<usize>(buffer.buffer), ptr, len);
  return String.UTF8.decode(buffer.buffer);
}

/**
 * 从线性内存读取字节数组
 * @param ptr 内存指针
 * @param len 长度
 * @returns 字节数组
 */
export function readBytes(ptr: u32, len: u32): Uint8Array {
  if (ptr === 0 || len === 0) {
    return new Uint8Array(0);
  }
  const buffer = new Uint8Array(len);
  // AssemblyScript: memory.copy(dest, src, size)
  memory.copy(changetype<usize>(buffer.buffer), ptr, len);
  return buffer;
}

