/**
 * ABI JSON 解析和 JSON Payload 构建工具
 * 
 * 提供 ABI JSON 解析和合约调用参数编码功能
 * 用于将合约调用参数转换为 WES 节点期望的 JSON payload 格式
 * 
 * @module framework/utils/abi
 */

/**
 * ABI 方法参数信息
 */
export interface ABIParameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  /**
   * 结构体字段定义（当 type 为 struct 或 object 时）
   * 用于嵌套结构体的编码
   */
  structFields?: ABIParameter[];
}

/**
 * ABI 方法信息
 */
export interface ABIMethod {
  name: string;
  type: 'read' | 'write';
  parameters: ABIParameter[];
  returnType?: string;
  isReferenceOnly?: boolean;
}

/**
 * ABI JSON 格式
 */
export interface ABI {
  methods: ABIMethod[];
  version?: string;
}

/**
 * JSON Payload 构建选项
 */
export interface BuildPayloadOptions {
  /**
   * 是否包含调用者地址（from）
   */
  includeFrom?: boolean;
  
  /**
   * 调用者地址（如果 includeFrom 为 true）
   */
  from?: string | Uint8Array;
  
  /**
   * 是否包含接收者地址（to）
   */
  includeTo?: boolean;
  
  /**
   * 接收者地址（如果 includeTo 为 true）
   */
  to?: string | Uint8Array;
  
  /**
   * 是否包含金额（amount）
   */
  includeAmount?: boolean;
  
  /**
   * 金额值（如果 includeAmount 为 true）
   */
  amount?: string | number | bigint;
  
  /**
   * 是否包含代币 ID（token_id）
   */
  includeTokenId?: boolean;
  
  /**
   * 代币 ID（如果 includeTokenId 为 true）
   */
  tokenId?: string | Uint8Array;
}

/**
 * 解析 ABI JSON 字符串
 * 
 * @param abiJson ABI JSON 字符串
 * @returns 解析后的 ABI 对象
 */
export function parseABI(abiJson: string): ABI {
  try {
    const parsed = JSON.parse(abiJson);
    return normalizeABI(parsed);
  } catch (error) {
    throw new Error(`Failed to parse ABI JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 规范化 ABI 格式
 * 
 * @param data 任意格式的 ABI 数据
 * @returns 规范化的 ABI 对象
 */
export function normalizeABI(data: any): ABI {
  if (data.methods && Array.isArray(data.methods)) {
    return {
      methods: data.methods,
      version: data.version || '1.0.0',
    };
  }
  
  // 如果数据是方法数组，包装成 ABI 格式
  if (Array.isArray(data)) {
    return {
      methods: data,
      version: '1.0.0',
    };
  }
  
  // 其他格式尝试转换
  return {
    methods: [],
    version: '1.0.0',
  };
}

/**
 * 从 ABI 中查找方法信息
 * 
 * @param abi ABI 对象
 * @param methodName 方法名
 * @returns 方法信息，如果未找到则返回 null
 */
export function findMethod(abi: ABI, methodName: string): ABIMethod | null {
  return abi.methods.find(m => m.name === methodName) || null;
}

/**
 * 构建 JSON Payload（用于 WES 合约调用）
 * 
 * 根据方法签名和参数类型，将参数值转换为 JSON 对象
 * WES 节点期望 JSON payload（Base64 编码），而非 Ethereum ABI 编码
 * 
 * @param methodInfo 方法信息（包含参数类型）
 * @param args 参数值数组
 * @param options 构建选项（可选）
 * @returns JSON 对象
 */
export function buildJSONPayload(
  methodInfo: ABIMethod | null,
  args: any[],
  options: BuildPayloadOptions = {}
): Record<string, any> {
  const payload: Record<string, any> = {};

  // 添加选项中的字段
  if (options.includeFrom && options.from) {
    payload.from = convertAddress(options.from);
  }
  
  if (options.includeTo && options.to) {
    payload.to = convertAddress(options.to);
  }
  
  if (options.includeAmount && options.amount !== undefined) {
    payload.amount = convertAmount(options.amount);
  }
  
  if (options.includeTokenId && options.tokenId !== undefined) {
    payload.token_id = convertTokenId(options.tokenId);
  }

  // 添加方法参数
  if (methodInfo && methodInfo.parameters.length > 0) {
    // 如果有方法信息，使用参数类型进行转换
    methodInfo.parameters.forEach((param, index) => {
      if (index < args.length) {
        const value = args[index];
        // 传递结构体字段定义（用于嵌套结构体）
        payload[param.name] = convertValueToJSONType(
          value,
          param.type,
          param.structFields
        );
      }
    });
  } else {
    // 如果没有方法信息，使用类型推断
    args.forEach((arg, index) => {
      payload[`arg${index}`] = inferJSONType(arg);
    });
  }

  return payload;
}

/**
 * 将值转换为 JSON 类型（根据参数类型）
 * 
 * @param value 参数值
 * @param type 参数类型
 * @param structFields 结构体字段定义（可选，用于嵌套结构体）
 * @returns 转换后的 JSON 值
 */
export function convertValueToJSONType(
  value: any,
  type: string,
  structFields?: ABIParameter[]
): any {
  const normalizedType = type.toLowerCase();

  // 检查是否为结构体类型
  if (isStructType(normalizedType)) {
    return convertStructToJSON(value, structFields);
  }

  // 检查是否为数组类型
  if (normalizedType.endsWith('[]')) {
    return convertArrayToJSON(value, normalizedType, structFields);
  }

  switch (normalizedType) {
    case 'address':
      // 地址：保持字符串格式（WES 使用 Base58 或 hex）
      return convertAddress(value);
    
    case 'number':
    case 'uint256':
    case 'int256':
    case 'u32':
    case 'u64':
    case 'i32':
    case 'i64':
      // 数字：转换为字符串（WES 使用字符串表示大数）
      return convertAmount(value);
    
    case 'bool':
    case 'boolean':
      // 布尔值：保持布尔类型
      return Boolean(value);
    
    case 'bytes':
    case 'bytes32':
      // 字节数组：转换为 hex 字符串
      return convertBytes(value);
    
    case 'string':
    default:
      // 字符串：保持字符串类型
      return String(value);
  }
}

/**
 * 判断是否为结构体类型
 */
function isStructType(type: string): boolean {
  const normalized = type.toLowerCase();
  return (
    normalized === 'struct' ||
    normalized === 'object' ||
    normalized.startsWith('struct:') ||
    normalized.startsWith('object:')
  );
}

/**
 * 将结构体转换为 JSON 对象
 * 
 * @param value 结构体值（对象、数组或字符串）
 * @param structFields 结构体字段定义（可选）
 * @returns JSON 对象
 */
function convertStructToJSON(
  value: any,
  structFields?: ABIParameter[]
): Record<string, any> {
  // 如果值已经是对象，直接使用
  if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Uint8Array)) {
    // 如果有结构体字段定义，递归转换每个字段
    if (structFields && structFields.length > 0) {
      const result: Record<string, any> = {};
      structFields.forEach(field => {
        if (field.name in value) {
          const fieldValue = value[field.name];
          // 递归转换字段值
          result[field.name] = convertValueToJSONType(
            fieldValue,
            field.type,
            field.structFields
          );
        } else if (field.required !== false) {
          // 必需字段缺失，使用 undefined（调用方应处理）
          result[field.name] = undefined;
        }
      });
      return result;
    }
    // 没有字段定义，直接返回对象
    return value;
  }

  // 如果是字符串，尝试解析为 JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return convertStructToJSON(parsed, structFields);
      }
    } catch (error) {
      // 解析失败，返回空对象
      console.warn('Failed to parse struct value as JSON:', error);
    }
  }

  // 如果值不是对象，返回空对象（或抛出错误）
  if (structFields && structFields.length > 0) {
    // 有字段定义但值不是对象，返回空对象（调用方应处理）
    console.warn('Struct value is not an object, returning empty object');
    return {};
  }

  // 默认返回空对象
  return {};
}

/**
 * 将数组转换为 JSON 数组
 * 
 * @param value 数组值
 * @param arrayType 数组类型（如 "uint256[]", "struct:User[]"）
 * @param structFields 结构体字段定义（如果数组元素是结构体）
 * @returns JSON 数组
 */
function convertArrayToJSON(
  value: any,
  arrayType: string,
  structFields?: ABIParameter[]
): any[] {
  // 确保值是数组
  if (!Array.isArray(value)) {
    // 如果不是数组，尝试转换
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return convertArrayToJSON(parsed, arrayType, structFields);
        }
      } catch (error) {
        // 解析失败
      }
    }
    // 无法转换，返回空数组
    console.warn('Array value is not an array, returning empty array');
    return [];
  }

  // 提取元素类型（移除 []）
  const elementType = arrayType.slice(0, -2);

  // 转换每个元素
  return value.map(item => {
    return convertValueToJSONType(item, elementType, structFields);
  });
}

/**
 * 推断 JSON 类型（当没有方法信息时）
 * 
 * @param value 参数值
 * @returns 推断后的 JSON 值
 */
export function inferJSONType(value: any): any {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Uint8Array) {
    return convertBytes(value);
  }
  // 如果是对象（可能是结构体），直接返回
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  // 如果是数组，递归推断每个元素
  if (Array.isArray(value)) {
    return value.map(item => inferJSONType(item));
  }
  return String(value);
}

/**
 * 转换地址为字符串格式
 * 
 * @param address 地址（字符串或字节数组）
 * @returns 地址字符串
 */
export function convertAddress(address: string | Uint8Array): string {
  if (typeof address === 'string') {
    return address;
  }
  return bytesToHex(address);
}

/**
 * 转换金额为字符串格式
 * 
 * @param amount 金额（数字、字符串或 BigInt）
 * @returns 金额字符串
 */
export function convertAmount(amount: string | number | bigint): string {
  if (typeof amount === 'bigint') {
    return amount.toString();
  }
  return typeof amount === 'number' ? amount.toString() : String(amount);
}

/**
 * 转换代币 ID 为字符串格式
 * 
 * @param tokenId 代币 ID（字符串或字节数组）
 * @returns 代币 ID 字符串
 */
export function convertTokenId(tokenId: string | Uint8Array): string {
  if (typeof tokenId === 'string') {
    return tokenId;
  }
  return bytesToHex(tokenId);
}

/**
 * 转换字节数组为十六进制字符串
 * 
 * @param bytes 字节数组
 * @returns 十六进制字符串（不带 0x 前缀）
 */
export function convertBytes(bytes: string | Uint8Array): string {
  if (typeof bytes === 'string') {
    // 如果已经是字符串，移除 0x 前缀（如果有）
    return bytes.startsWith('0x') ? bytes.slice(2) : bytes;
  }
  return bytesToHex(bytes);
}

/**
 * 将字节数组转换为十六进制字符串
 * 
 * @param bytes 字节数组
 * @returns 十六进制字符串（不带 0x 前缀）
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 将 JSON Payload 编码为 Base64 字符串
 * 
 * @param payload JSON 对象
 * @returns Base64 编码的字符串
 */
export function encodePayload(payload: Record<string, any>): string {
  const jsonString = JSON.stringify(payload);
  // 在浏览器环境中使用 btoa，在 Node.js 环境中使用 Buffer
  if (typeof btoa !== 'undefined') {
    return btoa(jsonString);
  } else if (typeof Buffer !== 'undefined') {
    return Buffer.from(jsonString, 'utf-8').toString('base64');
  } else {
    throw new Error('No base64 encoding function available. Please provide btoa or Buffer.');
  }
}

/**
 * 构建并编码 JSON Payload（一步完成）
 * 
 * @param methodInfo 方法信息
 * @param args 参数值数组
 * @param options 构建选项
 * @returns Base64 编码的 JSON payload
 */
export function buildAndEncodePayload(
  methodInfo: ABIMethod | null,
  args: any[],
  options: BuildPayloadOptions = {}
): string {
  const payload = buildJSONPayload(methodInfo, args, options);
  return encodePayload(payload);
}

