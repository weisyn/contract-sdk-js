/**
 * 装饰器
 * 
 * 提供 @contract, @view, @call 等装饰器
 * 
 * 注意：AssemblyScript 目前不支持装饰器，这些装饰器主要用于 TypeScript 开发时的标记
 * 实际编译到 AssemblyScript 时，装饰器会被忽略，需要通过其他方式实现（如代码生成或运行时注册）
 * 
 * 为了兼容 AssemblyScript，装饰器函数实现为空，仅作为类型标记使用
 */

/**
 * 合约装饰器
 * 标记一个类为合约
 * @param name 合约名称
 */
export function contract(_name: string): ClassDecorator {
  // AssemblyScript 不支持装饰器，此函数仅作为类型标记
  // 实际功能需要在编译时或运行时实现
  return function (_target: unknown) {
    // 空实现，仅用于类型检查
  } as ClassDecorator;
}

/**
 * 视图函数装饰器
 * 标记一个方法为视图函数（只读，不修改状态）
 * @param name 函数名（可选）
 */
export function view(_name?: string): MethodDecorator {
  // AssemblyScript 不支持装饰器，此函数仅作为类型标记
  // 注意：AssemblyScript 不支持 union types，使用 string 代替 string | symbol
  return function (_target: unknown, _propertyKey: string, _descriptor: PropertyDescriptor) {
    // 空实现，仅用于类型检查
  } as MethodDecorator;
}

/**
 * 调用函数装饰器
 * 标记一个方法为调用函数（可修改状态）
 * @param name 函数名（可选）
 */
export function call(_name?: string): MethodDecorator {
  // AssemblyScript 不支持装饰器，此函数仅作为类型标记
  // 注意：AssemblyScript 不支持 union types，使用 string 代替 string | symbol
  return function (_target: unknown, _propertyKey: string, _descriptor: PropertyDescriptor) {
    // 空实现，仅用于类型检查
  } as MethodDecorator;
}

