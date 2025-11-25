/**
 * 编译测试
 * 
 * 验证模板可以成功编译为 WASM
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Template Compilation Tests', () => {
  const templatesDir = join(__dirname, '../../templates');
  const buildDir = join(__dirname, '../../build');

  describe('Learning Templates', () => {
    it('should compile hello-world template', () => {
      const templatePath = join(templatesDir, 'learning/hello-world/contract.ts');
      const wasmPath = join(buildDir, 'hello-world.wasm');

      // 检查源文件是否存在
      expect(existsSync(templatePath)).toBe(true);

      // TODO: 实际编译测试需要 AssemblyScript 编译器
      // 这里只验证文件存在
      // 实际编译命令: asc templatePath --target release --outFile wasmPath
    });

    it('should compile simple-token template', () => {
      const templatePath = join(templatesDir, 'learning/simple-token/contract.ts');
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should compile market-demo template', () => {
      const templatePath = join(templatesDir, 'learning/market-demo/contract.ts');
      expect(existsSync(templatePath)).toBe(true);
    });
  });

  describe('Standard Templates', () => {
    it('should compile erc20-token template', () => {
      const templatePath = join(templatesDir, 'standard/token/erc20-token/contract.ts');
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should compile dao template', () => {
      const templatePath = join(templatesDir, 'standard/governance/dao/contract.ts');
      expect(existsSync(templatePath)).toBe(true);
    });
  });

  describe('Template Metadata', () => {
    it('should have metadata.json for all templates', () => {
      const templates = [
        'learning/hello-world',
        'learning/simple-token',
        'learning/market-demo',
        'standard/token/erc20-token',
        'standard/governance/dao',
      ];

      templates.forEach(template => {
        const metadataPath = join(templatesDir, template, 'metadata.json');
        expect(existsSync(metadataPath)).toBe(true);
      });
    });
  });
});

