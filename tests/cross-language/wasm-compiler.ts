/**
 * WASM 编译器工具
 * 
 * 用于编译 Go 和 TS/AS 合约为 WASM
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

/**
 * 编译结果
 */
export interface CompileResult {
  success: boolean;
  wasmPath?: string;
  error?: string;
}

/**
 * Go 合约编译器
 */
export class GoCompiler {
  /**
   * 编译 Go 合约为 WASM
   * @param sourcePath Go 合约源文件路径
   * @param outputPath 输出 WASM 文件路径（可选）
   * @returns 编译结果
   */
  static async compile(sourcePath: string, outputPath?: string): Promise<CompileResult> {
    try {
      // 检查 TinyGo 是否安装
      try {
        await execAsync('tinygo version');
      } catch (error) {
        return {
          success: false,
          error: 'TinyGo 未安装，请先安装 TinyGo: https://tinygo.org/getting-started/install/',
        };
      }

      // 如果没有指定输出路径，使用临时目录
      if (!outputPath) {
        const tempDir = join(tmpdir(), `wes-test-${Date.now()}`);
        mkdirSync(tempDir, { recursive: true });
        outputPath = join(tempDir, 'contract.wasm');
      }

      // 确保输出目录存在
      const outputDir = join(outputPath, '..');
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // 构建 TinyGo 编译命令
      const command = `tinygo build -o ${outputPath} -target=wasi -scheduler=none -no-debug -opt=2 -gc=leaking ${sourcePath}`;

      // 执行编译
      const { stderr } = await execAsync(command);

      if (existsSync(outputPath)) {
        return {
          success: true,
          wasmPath: outputPath,
        };
      } else {
        return {
          success: false,
          error: `编译失败: ${stderr || '未知错误'}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `编译错误: ${error.message || String(error)}`,
      };
    }
  }

  /**
   * 从源代码字符串编译 Go 合约
   * @param sourceCode Go 合约源代码
   * @param outputPath 输出 WASM 文件路径（可选）
   * @returns 编译结果
   */
  static async compileFromSource(sourceCode: string, outputPath?: string): Promise<CompileResult> {
    // 创建临时文件
    const tempDir = join(tmpdir(), `wes-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const tempSourcePath = join(tempDir, 'main.go');

    // 写入源代码
    writeFileSync(tempSourcePath, sourceCode, 'utf-8');

    // 编译
    const result = await this.compile(tempSourcePath, outputPath);

    return result;
  }
}

/**
 * TypeScript/AssemblyScript 合约编译器
 */
export class TypeScriptCompiler {
  /**
   * 编译 TS/AS 合约为 WASM
   * @param sourcePath TS/AS 合约源文件路径
   * @param outputPath 输出 WASM 文件路径（可选）
   * @returns 编译结果
   */
  static async compile(sourcePath: string, outputPath?: string): Promise<CompileResult> {
    try {
      // 检查 AssemblyScript 编译器是否可用
      try {
        await execAsync('npx asc --version');
      } catch (error) {
        return {
          success: false,
          error: 'AssemblyScript 编译器未安装，请先安装: npm install -g assemblyscript',
        };
      }

      // 如果没有指定输出路径，使用临时目录
      if (!outputPath) {
        const tempDir = join(tmpdir(), `wes-test-${Date.now()}`);
        mkdirSync(tempDir, { recursive: true });
        outputPath = join(tempDir, 'contract.wasm');
      }

      // 确保输出目录存在
      const outputDir = join(outputPath, '..');
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // 构建 AssemblyScript 编译命令
      const command = `npx asc ${sourcePath} --target release --optimize --outFile ${outputPath}`;

      // 执行编译
      const { stderr } = await execAsync(command);

      if (existsSync(outputPath)) {
        return {
          success: true,
          wasmPath: outputPath,
        };
      } else {
        return {
          success: false,
          error: `编译失败: ${stderr || '未知错误'}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `编译错误: ${error.message || String(error)}`,
      };
    }
  }

  /**
   * 从源代码字符串编译 TS/AS 合约
   * @param sourceCode TS/AS 合约源代码
   * @param outputPath 输出 WASM 文件路径（可选）
   * @returns 编译结果
   */
  static async compileFromSource(sourceCode: string, outputPath?: string): Promise<CompileResult> {
    // 创建临时文件
    const tempDir = join(tmpdir(), `wes-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const tempSourcePath = join(tempDir, 'contract.ts');

    // 写入源代码
    writeFileSync(tempSourcePath, sourceCode, 'utf-8');

    // 编译
    const result = await this.compile(tempSourcePath, outputPath);

    return result;
  }
}

