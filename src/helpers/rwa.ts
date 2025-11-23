/**
 * RWA 操作 Helper
 * 
 * 提供现实世界资产（RWA）代币化功能
 * 基于 ISPC 受控外部交互机制，替代传统预言机
 * 对标 Go SDK 的 helpers/rwa/
 * 
 * 参考: contract-sdk-go/helpers/rwa/
 */

import { External, Evidence } from './external';
import { Token } from './token';
import { Context } from '../framework/context';
import { ErrorCode, TokenID, Amount } from '../framework/types';
import { findJSONField, parseUint64 } from '../framework/utils/json';

/**
 * 验证并代币化结果
 */
export class ValidateAndTokenizeResult {
  tokenID: TokenID;
  validated: bool;
  validationProof: Uint8Array;
  valuation: Amount;
  valuationProof: Uint8Array;

  constructor(
    tokenID: TokenID,
    validated: bool,
    validationProof: Uint8Array,
    valuation: Amount,
    valuationProof: Uint8Array
  ) {
    this.tokenID = tokenID;
    this.validated = validated;
    this.validationProof = validationProof;
    this.valuation = valuation;
    this.valuationProof = valuationProof;
  }
}

/**
 * RWA 操作类
 */
export class RWA {
  /**
   * 验证并代币化资产
   * 
   * ISPC 创新点：
   * - 通过受控外部交互机制调用外部验证和估值 API
   * - 无需传统预言机，由 ISPC 运行时自动生成 ZK 证明
   * - 验证和估值结果自动上链
   * 
   * @param assetID 资产ID
   * @param documents 资产文档（JSON 字符串）
   * @param validatorAPI 验证服务 API 端点
   * @param validatorEvidence 验证佐证
   * @param valuationAPI 估值服务 API 端点
   * @param valuationEvidence 估值佐证
   * @returns 验证并代币化结果，失败返回 null
   */
  static validateAndTokenize(
    assetID: string,
    documents: string,
    validatorAPI: string,
    validatorEvidence: Evidence | null,
    valuationAPI: string,
    valuationEvidence: Evidence | null
  ): ValidateAndTokenizeResult | null {
    // 1. 参数验证
    if (assetID === '' || validatorAPI === '' || valuationAPI === '') {
      return null;
    }

    if (validatorEvidence === null || valuationEvidence === null) {
      return null;
    }

    // 2. 通过 ISPC 受控机制验证资产
    const validationParams = this.buildValidationParams(assetID, documents);
    const validationData = External.validateAndQuery(
      'api_response',
      validatorAPI,
      validationParams,
      validatorEvidence
    );

    if (validationData === null) {
      return null;
    }

    // 解析验证结果
    const validationJSON = String.UTF8.decode(validationData.buffer);
    const validatedStr = findJSONField(validationJSON, 'validated');
    const validated = validatedStr === 'true' || validatedStr === '1';

    // 3. 通过 ISPC 受控机制获取资产估值
    const valuationParams = this.buildValuationParams(assetID);
    const valuationData = External.validateAndQuery(
      'api_response',
      valuationAPI,
      valuationParams,
      valuationEvidence
    );

    if (valuationData === null) {
      return null;
    }

    // 解析估值结果
    const valuationJSON = String.UTF8.decode(valuationData.buffer);
    const valueStr = findJSONField(valuationJSON, 'value');
    const valuation = parseUint64(valueStr);

    if (valuation === 0) {
      return null; // 估值失败
    }

    // 4. 执行代币化（使用 Token Helper）
    const caller = Context.getCaller();
    const tokenID: TokenID = 'RWA_' + assetID;
    
    const mintResult = Token.mint(caller, valuation, tokenID);
    if (mintResult !== ErrorCode.SUCCESS) {
      return null;
    }

    // 5. 返回结果（包含验证和估值的证明）
    return new ValidateAndTokenizeResult(
      tokenID,
      validated,
      validationData,
      valuation,
      valuationData
    );
  }

  /**
   * 验证资产
   * @param assetID 资产ID
   * @param documents 资产文档（JSON 字符串）
   * @param validatorAPI 验证服务 API 端点
   * @param evidence 验证佐证
   * @returns 是否验证通过，失败返回 null
   */
  static validateAsset(
    assetID: string,
    documents: string,
    validatorAPI: string,
    evidence: Evidence | null
  ): bool | null {
    if (assetID === '' || validatorAPI === '' || evidence === null) {
      return null;
    }

    const validationParams = this.buildValidationParams(assetID, documents);
    const validationData = External.validateAndQuery(
      'api_response',
      validatorAPI,
      validationParams,
      evidence
    );

    if (validationData === null) {
      return null;
    }

    const validationJSON = String.UTF8.decode(validationData.buffer);
    const validatedStr = findJSONField(validationJSON, 'validated');
    const isValid: bool = validatedStr === 'true' || validatedStr === '1';
    return isValid;
  }

  /**
   * 评估资产价值
   * @param assetID 资产ID
   * @param documents 资产文档（JSON 字符串）
   * @param valuationAPI 估值服务 API 端点
   * @param evidence 估值佐证
   * @returns 资产估值，失败返回 null
   */
  static valueAsset(
    assetID: string,
    documents: string,
    valuationAPI: string,
    evidence: Evidence | null
  ): Amount | null {
    if (assetID === '' || valuationAPI === '' || evidence === null) {
      return null;
    }

    const valuationParams = this.buildValuationParams(assetID);
    const valuationData = External.validateAndQuery(
      'api_response',
      valuationAPI,
      valuationParams,
      evidence
    );

    if (valuationData === null) {
      return null;
    }

    const valuationJSON = String.UTF8.decode(valuationData.buffer);
    const valueStr = findJSONField(valuationJSON, 'value');
    const valuation: Amount = parseUint64(valueStr);

    return valuation > 0 ? valuation : null;
  }

  /**
   * 构建验证参数 JSON
   */
  private static buildValidationParams(assetID: string, documents: string): string {
    let params = '{';
    params += `"asset_id":"${this.escapeJSON(assetID)}"`;
    params += `,"documents":${documents}`;
    params += '}';
    return params;
  }

  /**
   * 构建估值参数 JSON
   */
  private static buildValuationParams(assetID: string): string {
    let params = '{';
    params += `"asset_id":"${this.escapeJSON(assetID)}"`;
    params += '}';
    return params;
  }

  /**
   * 转义 JSON 字符串
   */
  private static escapeJSON(str: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      if (char === 0x22) { // '"'
        result += '\\"';
      } else if (char === 0x5C) { // '\'
        result += '\\\\';
      } else if (char === 0x0A) { // '\n'
        result += '\\n';
      } else if (char === 0x0D) { // '\r'
        result += '\\r';
      } else if (char === 0x09) { // '\t'
        result += '\\t';
      } else {
        result += String.fromCharCode(char);
      }
    }
    return result;
  }
}

