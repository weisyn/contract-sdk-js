/**
 * Base64 编码/解码工具
 *
 * 提供 Base64 编码和解码功能，用于地址编码等场景
 */

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Base64 编码
 * @param data 要编码的数据
 * @returns Base64 编码字符串
 */
export function encode(data: Uint8Array): string {
  let result = "";
  let i = 0;

  while (i < data.length) {
    // 读取 3 个字节
    const byte1 = data[i++];
    const byte2 = i < data.length ? data[i++] : 0;
    const byte3 = i < data.length ? data[i++] : 0;

    // 组合成 24 位
    const combined = (byte1 << 16) | (byte2 << 8) | byte3;

    // 转换为 4 个 Base64 字符
    result += BASE64_CHARS.charAt((combined >> 18) & 0x3f);
    result += BASE64_CHARS.charAt((combined >> 12) & 0x3f);

    if (i - 2 < data.length) {
      result += BASE64_CHARS.charAt((combined >> 6) & 0x3f);
    } else {
      result += "=";
    }

    if (i - 1 < data.length) {
      result += BASE64_CHARS.charAt(combined & 0x3f);
    } else {
      result += "=";
    }
  }

  return result;
}

/**
 * Base64 解码
 * @param encoded Base64 编码字符串
 * @returns 解码后的数据
 */
export function decode(encoded: string): Uint8Array {
  // 移除填充字符（AssemblyScript 不支持正则表达式，手动替换）
  let cleaned = "";
  for (let i = 0; i < encoded.length; i++) {
    if (encoded.charCodeAt(i) !== 61) {
      // 61 = '='
      cleaned += encoded.charAt(i);
    }
  }
  encoded = cleaned;

  const result = new Array<u8>();
  let i = 0;

  while (i < encoded.length) {
    // 读取 4 个字符
    const char1 = encoded.charCodeAt(i++);
    const hasChar2 = i < encoded.length;
    const char2 = hasChar2 ? encoded.charCodeAt(i++) : 0;
    const hasChar3 = i < encoded.length;
    const char3 = hasChar3 ? encoded.charCodeAt(i++) : 0;
    const hasChar4 = i < encoded.length;
    const char4 = hasChar4 ? encoded.charCodeAt(i++) : 0;

    // 转换为索引
    const index1 = BASE64_CHARS.indexOf(String.fromCharCode(char1));
    const index2 = hasChar2 && char2 > 0 ? BASE64_CHARS.indexOf(String.fromCharCode(char2)) : 0;
    const index3 = hasChar3 && char3 > 0 ? BASE64_CHARS.indexOf(String.fromCharCode(char3)) : 0;
    const index4 = hasChar4 && char4 > 0 ? BASE64_CHARS.indexOf(String.fromCharCode(char4)) : 0;

    // 组合成 24 位
    const combined = (index1 << 18) | (index2 << 12) | (index3 << 6) | index4;

    // 提取字节（根据实际字符数决定提取多少字节）
    // 第一个字节总是存在
    result.push((combined >> 16) & 0xff);
    // 第二个字节：如果有 char2 且不是填充字符
    if (hasChar2 && char2 > 0) {
      result.push((combined >> 8) & 0xff);
      // 第三个字节：如果有 char3 且不是填充字符
      if (hasChar3 && char3 > 0) {
        result.push(combined & 0xff);
      }
    }
  }

  // 兼容 AssemblyScript 和 Node.js 环境
  // @ts-ignore - AssemblyScript 特定 API
  if (typeof Uint8Array.wrap === 'function') {
    return Uint8Array.wrap(result);
  }
  // Node.js 环境：直接创建 Uint8Array
  return new Uint8Array(result);
}
