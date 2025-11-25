#!/usr/bin/env node

/**
 * 将生成的 ABI JSON 合并到模板元数据 metadata.json 的 methods 字段
 * 
 * 用法:
 *   ts-node tools/merge-abi-to-metadata.ts <template-path>
 * 
 * 示例:
 *   ts-node tools/merge-abi-to-metadata.ts templates/learning/hello-world
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

interface TemplateMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  parameters: any[];
  risks: string[];
  prerequisites: string[];
  examples: string[];
  codePreview?: string;
  wasmPath?: string;
  sourcePath?: string;
  version?: string;
  author?: string;
  license?: string;
  language?: 'go' | 'typescript' | 'assemblyscript';
  level?: 'learning' | 'standard';
  helpers?: string[];
  methods?: MethodInfo[]; // 新增：方法列表
}

/**
 * 合并 ABI 到模板元数据
 */
function mergeABIToMetadata(templatePath: string): void {
  const metadataPath = join(templatePath, 'metadata.json');
  const abiPath = join(templatePath, 'abi.json');

  // 检查文件是否存在
  if (!existsSync(metadataPath)) {
    console.error(`❌ 错误: 找不到 metadata.json: ${metadataPath}`);
    process.exit(1);
  }

  if (!existsSync(abiPath)) {
    console.warn(`⚠️  警告: 找不到 abi.json: ${abiPath}`);
    console.warn(`   请先运行: npm run generate:abi:template -- ${templatePath}`);
    return;
  }

  // 读取文件
  let metadata: TemplateMetadata;
  let abi: ABI;

  try {
    metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  } catch (error) {
    console.error(`❌ 错误: 无法解析 metadata.json: ${error}`);
    process.exit(1);
  }

  try {
    abi = JSON.parse(readFileSync(abiPath, 'utf-8'));
  } catch (error) {
    console.error(`❌ 错误: 无法解析 abi.json: ${error}`);
    process.exit(1);
  }

  // 合并 methods 字段
  if (abi.methods && abi.methods.length > 0) {
    metadata.methods = abi.methods;
    console.log(`✅ 已合并 ${abi.methods.length} 个方法到 metadata.json`);
    
    // 显示方法列表
    abi.methods.forEach(method => {
      console.log(`   - ${method.name} (${method.type})`);
    });
  } else {
    console.warn(`⚠️  警告: ABI 中没有方法`);
  }

  // 保存更新后的 metadata.json
  try {
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');
    console.log(`✅ 已更新 metadata.json: ${metadataPath}`);
  } catch (error) {
    console.error(`❌ 错误: 无法写入 metadata.json: ${error}`);
    process.exit(1);
  }
}

// 主函数
const templatePath = process.argv[2];

if (!templatePath) {
  console.error('❌ 错误: 请指定模板路径');
  console.error('用法: ts-node tools/merge-abi-to-metadata.ts <template-path>');
  console.error('示例: ts-node tools/merge-abi-to-metadata.ts templates/learning/hello-world');
  process.exit(1);
}

mergeABIToMetadata(templatePath);

