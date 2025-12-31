// Jest 配置
// 注意：tests 目录在发布时会被排除，所以配置需要支持 tests 目录不存在的情况
const fs = require('fs');
const path = require('path');

// 检查 tests 目录是否存在
const testsDir = path.join(__dirname, 'tests');
const hasTestsDir = fs.existsSync(testsDir);

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 如果 tests 目录存在，使用它；否则使用空数组（不会报错）
  roots: hasTestsDir ? ['<rootDir>/tests'] : ['<rootDir>'],
  testMatch: hasTestsDir 
    ? ['<rootDir>/tests/**/__tests__/**/*.ts', '<rootDir>/tests/**/?(*.)+(spec|test).ts']
    : ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  // 跳过对源代码的类型检查（源代码使用 AssemblyScript 语法）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: hasTestsDir ? ['<rootDir>/tests/setup/mock-assemblyscript.ts'] : [],
};
