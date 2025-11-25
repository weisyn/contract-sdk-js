/**
 * External 操作 Helper
 *
 * 提供受控外部交互（ISPC）功能，用于调用外部 API 和查询外部数据库
 * 对标 Go SDK 的 helpers/external/
 *
 * 参考: contract-sdk-go/helpers/external/
 *
 * ISPC 创新：受控外部交互，替代传统预言机
 */

import { HostABI } from "../runtime/abi";
import { encode as base64Encode } from "../framework/utils/base64";

/**
 * 证据类型（用于 ISPC 受控外部交互）
 */
export interface Evidence {
  apiSignature: Uint8Array | null; // API 签名
  responseHash: Uint8Array | null; // 响应哈希
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  timestamp: u64 | null; // 时间戳
  nonce: Uint8Array | null; // 随机数
}

/**
 * External 操作类
 */
export class External {
  /**
   * 调用外部 API（基于 ISPC 受控外部交互）
   * @param url API 端点 URL
   * @param method HTTP 方法（GET/POST）
   * @param params 请求参数（JSON 字符串）
   * @param evidence 验证佐证
   * @returns API 响应数据（JSON 字符串），失败返回 null
   */
  static callAPI(
    url: string,
    method: string,
    params: string,
    evidence: Evidence | null
  ): string | null {
    // 1. 参数验证
    if (url === "" || method === "") {
      return null;
    }

    // 2. 构建外部状态声明（claim）
    const claim = this.buildAPIClaim(url, method, params);
    if (claim === null) {
      return null;
    }

    // 3. 声明外部状态预期
    const claimID = HostABI.declareExternalState(claim);
    if (claimID === null) {
      return null;
    }

    // 4. 提供验证佐证（如果提供）
    if (evidence !== null) {
      const evidenceJSON = this.buildEvidenceJSON(evidence);
      const success = HostABI.provideEvidence(claimID, evidenceJSON);
      if (!success) {
        return null;
      }
    }

    // 5. 查询受控外部状态（获取 API 响应）
    const result = HostABI.queryControlledState(claimID);
    return result;
  }

  /**
   * 验证并查询外部 API（简化版，封装 callAPI）
   * @param claimType 声明类型（如 "api_response"）
   * @param url API 端点 URL
   * @param params 请求参数（JSON 字符串）
   * @param evidence 验证佐证
   * @returns API 响应数据（字节数组），失败返回 null
   */
  static validateAndQuery(
    _claimType: string,
    url: string,
    params: string,
    evidence: Evidence | null
  ): Uint8Array | null {
    const method = "POST"; // 默认使用 POST
    const responseJSON = this.callAPI(url, method, params, evidence);
    if (responseJSON === null) {
      return null;
    }

    // 将 JSON 字符串转换为字节数组
    const utf8 = String.UTF8.encode(responseJSON);
    return Uint8Array.wrap(utf8);
  }

  /**
   * 查询外部数据库（基于 ISPC 受控外部交互）
   * @param dbID 数据库标识符
   * @param query 查询语句（JSON 字符串）
   * @param evidence 验证佐证
   * @returns 查询结果（JSON 字符串），失败返回 null
   */
  static queryDatabase(dbID: string, query: string, evidence: Evidence | null): string | null {
    // 构建数据库查询 URL（简化实现）
    const url = `database://${dbID}/query`;
    return this.callAPI(url, "POST", query, evidence);
  }

  /**
   * 构建 API 声明 JSON
   */
  private static buildAPIClaim(url: string, method: string, params: string): string | null {
    // 构建声明 JSON
    // 格式：{"type":"api_call","url":"...","method":"...","params":"..."}
    let claim = '{"type":"api_call"';
    claim += `,"url":"${this.escapeJSON(url)}"`;
    claim += `,"method":"${this.escapeJSON(method)}"`;
    claim += `,"params":${params}`;
    claim += "}";
    return claim;
  }

  /**
   * 构建证据 JSON
   */
  private static buildEvidenceJSON(evidence: Evidence): string {
    let json = "{";
    let first = true;

    if (evidence.apiSignature !== null) {
      if (!first) json += ",";
      first = false;
      const sigBase64 = this.bytesToBase64(evidence.apiSignature);
      json += `"api_signature":"${sigBase64}"`;
    }

    if (evidence.responseHash !== null) {
      if (!first) json += ",";
      first = false;
      const hashBase64 = this.bytesToBase64(evidence.responseHash);
      json += `"response_hash":"${hashBase64}"`;
    }

    if (evidence.timestamp !== null) {
      if (!first) json += ",";
      first = false;
      json += `"timestamp":${evidence.timestamp.toString()}`;
    }

    if (evidence.nonce !== null) {
      if (!first) json += ",";
      first = false;
      const nonceBase64 = this.bytesToBase64(evidence.nonce);
      json += `"nonce":"${nonceBase64}"`;
    }

    json += "}";
    return json;
  }

  /**
   * 转义 JSON 字符串
   */
  private static escapeJSON(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      if (char === 0x22) {
        // '"'
        result += '\\"';
      } else if (char === 0x5c) {
        // '\'
        result += "\\\\";
      } else if (char === 0x0a) {
        // '\n'
        result += "\\n";
      } else if (char === 0x0d) {
        // '\r'
        result += "\\r";
      } else if (char === 0x09) {
        // '\t'
        result += "\\t";
      } else {
        result += String.fromCharCode(char);
      }
    }
    return result;
  }

  /**
   * 字节数组转 Base64
   */
  private static bytesToBase64(bytes: Uint8Array): string {
    return base64Encode(bytes);
  }
}
