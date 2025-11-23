#!/usr/bin/env node

/**
 * ABI 元数据生成工具（AST 版本）
 * 
 * 使用 TypeScript Compiler API 进行 AST 解析，提高解析准确性
 * 
 * 用法:
 *   ts-node tools/generate-abi-ast.ts <contract-file> [output-file]
 * 
 * 示例:
 *   ts-node tools/generate-abi-ast.ts templates/learning/hello-world/contract.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import * as ts from 'typescript';

interface MethodInfo {
  name: string;
  type: 'read' | 'write';
  parameters: ParameterInfo[];
  returnType?: string;
  description?: string;
  isReferenceOnly?: boolean;
}

interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface ABI {
  methods: MethodInfo[];
  version: string;
}

/**
 * 使用 TypeScript Compiler API 解析合约文件
 */
function parseContractFileAST(filePath: string): ABI {
  const content = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const methods: MethodInfo[] = [];
  const functionNames = new Set<string>();

  // 遍历 AST 节点
  function visit(node: ts.Node) {
    // 查找 onCall 方法中的函数路由
    if (ts.isMethodDeclaration(node) && node.name && node.name.getText(sourceFile) === 'onCall') {
      const onCallBody = node.body;
      if (onCallBody) {
        // 在 onCall 方法体中查找 if (functionName === 'XXX') 模式
        onCallBody.forEachChild((child) => {
          if (ts.isIfStatement(child)) {
            const condition = child.expression;
            if (ts.isBinaryExpression(condition) &&
                condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) {
              const left = condition.left;
              const right = condition.right;
              
              if (ts.isIdentifier(left) && left.getText(sourceFile) === 'functionName' &&
                  ts.isStringLiteral(right)) {
                const functionName = right.text;
                functionNames.add(functionName);
              }
            }
          }
        });
      }
    }

    // 查找类方法定义
    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.getText(sourceFile);
      if (name && (functionNames.has(name) || isPublicMethod(node))) {
        const methodInfo = extractMethodInfo(node, sourceFile);
        if (methodInfo) {
          methods.push(methodInfo);
        }
      }
    }

    // 查找导出的函数
    if (ts.isFunctionDeclaration(node) && 
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const name = node.name?.getText(sourceFile);
      if (name && name !== 'Initialize' && name !== 'Execute') {
        const methodInfo = extractMethodInfo(node, sourceFile);
        if (methodInfo) {
          methods.push(methodInfo);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    methods,
    version: '1.0.0',
  };
}

/**
 * 检查是否为公共方法
 */
function isPublicMethod(node: ts.MethodDeclaration | ts.FunctionDeclaration): boolean {
  if (!ts.isMethodDeclaration(node)) {
    return false;
  }
  
  const modifiers = node.modifiers;
  if (!modifiers) {
    return true; // 默认公共
  }
  
  // 检查是否有 private 或 protected 修饰符
  return !modifiers.some(m => 
    m.kind === ts.SyntaxKind.PrivateKeyword ||
    m.kind === ts.SyntaxKind.ProtectedKeyword
  );
}

/**
 * 从 AST 节点提取方法信息
 */
function extractMethodInfo(
  node: ts.MethodDeclaration | ts.FunctionDeclaration,
  sourceFile: ts.SourceFile
): MethodInfo | null {
  const name = node.name?.getText(sourceFile);
  if (!name) {
    return null;
  }

  // 提取返回类型
  const returnType = node.type
    ? normalizeType(node.type.getText(sourceFile))
    : 'void';

  // 提取参数
  const parameters: ParameterInfo[] = [];
  if (node.parameters) {
    for (const param of node.parameters) {
      const paramName = param.name.getText(sourceFile);
      const paramType = param.type
        ? normalizeType(param.type.getText(sourceFile))
        : 'any';
      const isOptional = param.questionToken !== undefined;

      parameters.push({
        name: paramName,
        type: paramType,
        required: !isOptional,
      });
    }
  }

  // 判断方法类型
  const isRead = isReadMethod(name, returnType);

  return {
    name,
    type: isRead ? 'read' : 'write',
    parameters,
    returnType,
    isReferenceOnly: isRead,
  };
}

/**
 * 规范化类型名称
 */
function normalizeType(type: string): string {
  const typeMap: Record<string, string> = {
    'u32': 'number',
    'u64': 'number',
    'i32': 'number',
    'i64': 'number',
    'bool': 'boolean',
    'string': 'string',
    'Uint8Array': 'bytes',
    'Address': 'address',
    'Hash': 'bytes32',
    'TokenID': 'string',
    'Amount': 'number',
    'ErrorCode': 'number',
  };

  // 移除可选标记和数组标记
  type = type.replace(/\?/g, '').replace(/\[\]/g, '');
  
  // 处理联合类型（取第一个）
  if (type.includes('|')) {
    type = type.split('|')[0].trim();
  }
  
  // 处理泛型（移除泛型参数）
  if (type.includes('<')) {
    type = type.split('<')[0].trim();
  }
  
  // 查找映射
  for (const [key, value] of Object.entries(typeMap)) {
    if (type.includes(key)) {
      return value;
    }
  }

  // 默认返回原类型（小写）
  return type.toLowerCase();
}

/**
 * 判断是否为只读方法
 */
function isReadMethod(name: string, returnType: string): boolean {
  const readPrefixes = ['get', 'query', 'is', 'has', 'balance', 'total', 'count'];
  const lowerName = name.toLowerCase();
  
  // 检查方法名前缀
  for (const prefix of readPrefixes) {
    if (lowerName.startsWith(prefix)) {
      return true;
    }
  }
  
  // 如果返回类型是查询类型，也可能是只读
  if (returnType.includes('Query') || returnType.includes('Result')) {
    return true;
  }
  
  return false;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('用法: ts-node tools/generate-abi-ast.ts <contract-file> [output-file]');
    process.exit(1);
  }

  const contractFile = args[0];
  const outputFile = args[1] || join(dirname(contractFile), 'abi.json');

  if (!existsSync(contractFile)) {
    console.error(`错误: 文件不存在: ${contractFile}`);
    process.exit(1);
  }

  try {
    console.log(`解析合约文件 (AST): ${contractFile}`);
    const abi = parseContractFileAST(contractFile);
    
    console.log(`找到 ${abi.methods.length} 个方法:`);
    abi.methods.forEach(method => {
      console.log(`  - ${method.name} (${method.type})`);
    });
    
    const json = JSON.stringify(abi, null, 2);
    writeFileSync(outputFile, json, 'utf-8');
    
    console.log(`\n✅ ABI 已生成: ${outputFile}`);
  } catch (error) {
    console.error('错误:', error);
    // 如果 AST 解析失败，回退到正则解析
    console.log('AST 解析失败，尝试使用正则解析...');
    try {
      const { parseContractFile } = require('./generate-abi');
      const abi = parseContractFile(contractFile);
      const json = JSON.stringify(abi, null, 2);
      writeFileSync(outputFile, json, 'utf-8');
      console.log(`✅ ABI 已生成（使用正则解析）: ${outputFile}`);
    } catch (fallbackError) {
      console.error('正则解析也失败:', fallbackError);
      process.exit(1);
    }
  }
}

// 如果直接运行此文件，执行 main 函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseContractFileAST };
export type { ABI, MethodInfo };

