#!/usr/bin/env node

/**
 * ABI 元数据生成工具（正则版本，兼容回退）
 * 
 * 从合约 TypeScript 文件中提取方法信息，生成 ABI JSON
 * 优先使用 AST 解析（generate-abi-ast.ts），此文件作为回退方案
 * 
 * 用法:
 *   ts-node tools/generate-abi.ts <contract-file> [output-file]
 * 
 * 示例:
 *   ts-node tools/generate-abi.ts templates/learning/hello-world/contract.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

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
 * 解析合约文件，提取方法信息
 */
function parseContractFile(filePath: string): ABI {
  const content = readFileSync(filePath, 'utf-8');
  const methods: MethodInfo[] = [];

  // 查找 onCall 方法中的函数路由
  const onCallMatch = content.match(/onCall\s*\([^)]*functionName:\s*string[^)]*\)[^{]*\{([^}]*)\}/s);
  if (onCallMatch) {
    const onCallBody = onCallMatch[1];
    
    // 提取函数名映射（例如: if (functionName === 'SayHello')）
    const functionMatches = onCallBody.matchAll(/if\s*\(functionName\s*===\s*['"]([^'"]+)['"]\)/g);
    for (const match of functionMatches) {
      const functionName = match[1];
      
      // 查找对应的函数定义
      const functionRegex = new RegExp(
        `(?:public\\s+)?(?:private\\s+)?(?:static\\s+)?(?:async\\s+)?${functionName}\\s*\\([^)]*\\)\\s*:\\s*([^\\s{]+)`,
        's'
      );
      const funcMatch = content.match(functionRegex);
      
      if (funcMatch) {
        const returnType = funcMatch[1].trim();
        
        // 提取参数
        const paramMatch = content.match(
          new RegExp(`${functionName}\\s*\\(([^)]*)\\)`, 's')
        );
        const parameters: ParameterInfo[] = [];
        
        if (paramMatch && paramMatch[1].trim()) {
          const paramsStr = paramMatch[1].trim();
          // 简单解析参数（格式: name: type, name2: type2）
          const paramPairs = paramsStr.split(',').map(p => p.trim());
          for (const param of paramPairs) {
            const [name, type] = param.split(':').map(s => s.trim());
            if (name && type) {
              parameters.push({
                name,
                type: normalizeType(type),
                required: true,
              });
            }
          }
        }
        
        // 判断方法类型（简单启发式）
        const isRead = isReadMethod(functionName, returnType);
        
        methods.push({
          name: functionName,
          type: isRead ? 'read' : 'write',
          parameters,
          returnType: normalizeType(returnType),
          isReferenceOnly: isRead,
        });
      }
    }
  }

  // 查找导出的函数（例如: export function Execute）
  const exportMatches = content.matchAll(/export\s+function\s+(\w+)\s*\([^)]*\)/g);
  for (const match of exportMatches) {
    const functionName = match[1];
    // 跳过 Initialize 和 Execute（这些是框架函数）
    if (functionName === 'Initialize' || functionName === 'Execute') {
      continue;
    }
    
    // 查找函数定义
    const funcMatch = content.match(
      new RegExp(`export\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*:\\s*([^\\s{]+)`, 's')
    );
    
    if (funcMatch) {
      const returnType = funcMatch[2]?.trim() || 'void';
      const parameters: ParameterInfo[] = [];
      
      if (funcMatch[1]?.trim()) {
        const paramsStr = funcMatch[1].trim();
        const paramPairs = paramsStr.split(',').map(p => p.trim());
        for (const param of paramPairs) {
          const [name, type] = param.split(':').map(s => s.trim());
          if (name && type) {
            parameters.push({
              name,
              type: normalizeType(type),
              required: true,
            });
          }
        }
      }
      
      const isRead = isReadMethod(functionName, returnType);
      
      methods.push({
        name: functionName,
        type: isRead ? 'read' : 'write',
        parameters,
        returnType: normalizeType(returnType),
        isReferenceOnly: isRead,
      });
    }
  }

  return {
    methods,
    version: '1.0.0',
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
    console.error('用法: ts-node tools/generate-abi.ts <contract-file> [output-file]');
    process.exit(1);
  }

  const contractFile = args[0];
  const outputFile = args[1] || join(dirname(contractFile), 'abi.json');

  if (!existsSync(contractFile)) {
    console.error(`错误: 文件不存在: ${contractFile}`);
    process.exit(1);
  }

  try {
    console.log(`解析合约文件: ${contractFile}`);
    const abi = parseContractFile(contractFile);
    
    console.log(`找到 ${abi.methods.length} 个方法:`);
    abi.methods.forEach(method => {
      console.log(`  - ${method.name} (${method.type})`);
    });
    
    const json = JSON.stringify(abi, null, 2);
    writeFileSync(outputFile, json, 'utf-8');
    
    console.log(`\n✅ ABI 已生成: ${outputFile}`);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行 main 函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseContractFile };
export type { ABI, MethodInfo };

