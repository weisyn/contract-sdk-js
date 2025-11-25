/**
 * JSON 解析工具
 *
 * 提供简单的 JSON 解析功能，用于解析合约参数
 * 注意：AssemblyScript 的 JSON 支持有限，这里提供基础实现
 */

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/**
 * 解析 JSON 字符串中的字符串值
 * @param json JSON 字符串
 * @param key 键名
 * @returns 值，如果不存在返回 null
 */
export function parseString(json: string, key: string): string | null {
  // TODO: 实现正则表达式匹配
  // 当前简化实现：手动解析
  const keyIndex = json.indexOf(`"${key}"`);
  if (keyIndex === -1) {
    return null;
  }

  const colonIndex = json.indexOf(":", keyIndex);
  if (colonIndex === -1) {
    return null;
  }

  const quoteStart = json.indexOf('"', colonIndex);
  if (quoteStart === -1) {
    return null;
  }

  const quoteEnd = json.indexOf('"', quoteStart + 1);
  if (quoteEnd === -1) {
    return null;
  }

  return json.substring(quoteStart + 1, quoteEnd);
}

/**
 * 解析 JSON 字符串中的数字值
 * @param json JSON 字符串
 * @param key 键名
 * @returns 值，如果不存在返回 null
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function parseNumber(json: string, key: string): u64 | null {
  const keyIndex = json.indexOf(`"${key}"`);
  if (keyIndex === -1) {
    return null;
  }

  const colonIndex = json.indexOf(":", keyIndex);
  if (colonIndex === -1) {
    return null;
  }

  // 跳过空白字符
  let start = colonIndex + 1;
  while (start < json.length && (json.charCodeAt(start) === 32 || json.charCodeAt(start) === 9)) {
    start++;
  }

  // 解析数字
  let end = start;
  while (end < json.length && json.charCodeAt(end) >= 48 && json.charCodeAt(end) <= 57) {
    end++;
  }

  if (end === start) {
    return null;
  }

  const numStr = json.substring(start, end);
  return U64.parseInt(numStr, 10);
}

/**
 * 解析 JSON 字符串中的布尔值
 * @param json JSON 字符串
 * @param key 键名
 * @returns 值，如果不存在返回 null
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function parseBoolean(json: string, key: string): bool | null {
  const keyIndex = json.indexOf(`"${key}"`);
  if (keyIndex === -1) {
    return null;
  }

  const colonIndex = json.indexOf(":", keyIndex);
  if (colonIndex === -1) {
    return null;
  }

  // 跳过空白字符
  let start = colonIndex + 1;
  while (start < json.length && (json.charCodeAt(start) === 32 || json.charCodeAt(start) === 9)) {
    start++;
  }

  // 检查 true/false
  if (json.substring(start, start + 4) === "true") {
    return true;
  }
  if (json.substring(start, start + 5) === "false") {
    return false;
  }

  return null;
}

/**
 * 查找 JSON 字段值（字符串类型，对齐 Go SDK 的 findJSONField）
 * @param jsonStr JSON 字符串
 * @param key 键名
 * @returns 字段值，如果不存在返回空字符串
 */
export function findJSONField(jsonStr: string, key: string): string {
  const keyPattern = `"${key}":"`;

  // 首先尝试匹配带引号的字符串值
  let startIdx = -1;
  for (let i = 0; i <= jsonStr.length - keyPattern.length; i++) {
    if (jsonStr.substring(i, i + keyPattern.length) === keyPattern) {
      startIdx = i + keyPattern.length;
      break;
    }
  }

  if (startIdx !== -1) {
    // 字符串值（带引号）
    let endIdx = startIdx;
    while (endIdx < jsonStr.length && jsonStr.charCodeAt(endIdx) !== 34) {
      // 34 = '"'
      endIdx++;
    }

    if (endIdx > startIdx) {
      return jsonStr.substring(startIdx, endIdx);
    }
  }

  // 尝试不带引号的数字值
  const keyPattern2 = `"${key}":`;
  startIdx = -1;
  for (let i = 0; i <= jsonStr.length - keyPattern2.length; i++) {
    if (jsonStr.substring(i, i + keyPattern2.length) === keyPattern2) {
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      startIdx = i + keyPattern2.length;
      // 跳过空格
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      while (startIdx < jsonStr.length && jsonStr.charCodeAt(startIdx) === 32) {
        startIdx++;
      }
      break;
    }
  }

  if (startIdx === -1) {
    return "";
  }

  // 解析数字或字符串
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let endIdx = startIdx;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  if (startIdx < jsonStr.length && jsonStr.charCodeAt(startIdx) === 34) {
    // 字符串值
    startIdx++;
    while (endIdx < jsonStr.length && jsonStr.charCodeAt(endIdx) !== 34) {
      endIdx++;
    }
  } else {
    // 数字值
    while (
      endIdx < jsonStr.length &&
      jsonStr.charCodeAt(endIdx) >= 48 &&
      jsonStr.charCodeAt(endIdx) <= 57
    ) {
      endIdx++;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  if (endIdx > startIdx) {
    return jsonStr.substring(startIdx, endIdx);
  }

  return "";
}

/**
 * 提取 JSON 对象字段（对齐 Go SDK 的 extractJSONObject）
 * @param jsonStr JSON 字符串
 * @param key 键名
 * @returns JSON 对象字符串，如果不存在返回空字符串
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function extractJSONObject(jsonStr: string, key: string): string {
  const keyPattern = `"${key}":{`;

  let startIdx = -1;
  for (let i = 0; i <= jsonStr.length - keyPattern.length; i++) {
    if (jsonStr.substring(i, i + keyPattern.length) === keyPattern) {
      startIdx = i + keyPattern.length - 1; // 包含 '{'
      break;
    }
  }

  if (startIdx === -1) {
    return "";
  }

  // 找到匹配的 '}'
  let braceCount = 0;
  let endIdx = startIdx;
  while (endIdx < jsonStr.length) {
    if (jsonStr.charCodeAt(endIdx) === 123) {
      // '{'
      braceCount++;
    } else if (jsonStr.charCodeAt(endIdx) === 125) {
      // '}'
      braceCount--;
      if (braceCount === 0) {
        endIdx++; // 包含 '}'
        break;
      }
    }
    endIdx++;
  }

  if (endIdx > startIdx) {
    return jsonStr.substring(startIdx, endIdx);
  }

  return "";
}

/**
 * 解析无符号64位整数（对齐 Go SDK 的 ParseUint64）
 * @param str 数字字符串
 * @returns 解析后的数字，失败返回 0
 */
export function parseUint64(str: string): u64 {
  if (str.length === 0) {
    return 0;
  }

  let result: u64 = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      result = result * 10 + (charCode - 48);
    } else {
      break;
    }
  }

  return result;
}

/**
 * 构建简单的 JSON 对象
 * @param obj 键值对对象
 * @returns JSON 字符串
 */
export function stringify(obj: Map<string, string>): string {
  let result = "{";
  let first = true;

  // 将迭代器转换为数组，避免在 MapIterator 上使用 length 和索引
  const keys = Array.from(obj.keys());
  for (let i = 0; i < keys.length; i++) {
    if (!first) {
      result += ",";
    }
    first = false;

    const key = keys[i];
    const value = obj.get(key);
    result += `"${key}":"${value}"`;
  }

  result += "}";
  return result;
}
/* eslint-enable @typescript-eslint/no-redundant-type-constituents */
