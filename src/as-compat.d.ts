/**
 * AssemblyScript 兼容层（仅用于 TypeScript/rollup 类型检查）
 *
 * 说明：
 * - 这些声明只为让 TypeScript 编译通过，不会在运行时真正生效
 * - 合约实际运行时由 AssemblyScript 编译器和 WES Host 提供实现
 */

// ======== 基本数值类型别名 ========

/** 8 位无符号整数（在 TS 中用 number 近似表示） */
type u8 = number;

/** 32 位无符号整数（在 TS 中用 number 近似表示） */
type u32 = number;

/** 64 位无符号整数（在 TS 中用 number 近似表示） */
type u64 = number;

/** 指针/地址大小整数（在 TS 中用 number 近似表示） */
type usize = number;

/** 32 位有符号整数（用于 U64.parseInt 的 radix 等） */
type i32 = number;

/** 布尔类型别名，兼容 AssemblyScript 的 bool */
type bool = boolean;

// ======== AssemblyScript 内置函数/对象声明 ========

/**
 * AssemblyScript 内置的内存对象
 * 这里只声明 copy 函数以通过类型检查
 */
declare const memory: {
  copy(dest: usize, src: usize, n: usize): void;
};

/**
 * AssemblyScript 的类型转换辅助函数
 */
declare function changetype<T>(value: any): T;

/**
 * AssemblyScript 的 UTF8 编解码接口
 * 通过扩展 StringConstructor 来避免 TS 报错
 */
interface StringConstructor {
  UTF8: {
    encode(str: string): Uint8Array;
    // 在 TS 中放宽为 any，避免 ArrayBuffer / ArrayBufferLike 细节差异导致 TS2345
    decode(buffer: any): string;
    byteLength(str: string): u32;
  };
}

/**
 * AssemblyScript 的 Uint8Array.wrap 静态方法
 */
interface Uint8ArrayConstructor {
  // 在 TS 中放宽为 any，便于接收 ArrayBuffer、Uint8Array 甚至 number[]
  wrap(buffer: any): Uint8Array;
}

/**
 * AssemblyScript 的 64 位整数工具（仅用于类型检查）
 */
declare namespace U64 {
  function parseInt(str: string, radix?: i32): u64;
}

/**
 * AssemblyScript 内置的内存读取函数
 */
declare function load<T>(ptr: any): T;

/**
 * AssemblyScript 的 @external 装饰器
 * 在 TS 中声明为一个普通装饰器工厂函数即可
 */
declare function external(
  module: string,
  name: string
): (target: any, propertyKey?: string | symbol, descriptor?: any) => void;
