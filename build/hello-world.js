async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
      malloc(size) {
        // src/runtime/env/malloc(u32) => u32
        size = size >>> 0;
        return malloc(size);
      },
      get_contract_init_params(bufPtr, bufLen) {
        // src/runtime/env/getContractInitParams(u32, u32) => u32
        bufPtr = bufPtr >>> 0;
        bufLen = bufLen >>> 0;
        return get_contract_init_params(bufPtr, bufLen);
      },
      get_caller(addrPtr) {
        // src/runtime/env/getCaller(u32) => u32
        addrPtr = addrPtr >>> 0;
        return get_caller(addrPtr);
      },
      emit_event(eventPtr, eventLen) {
        // src/runtime/env/emitEvent(u32, u32) => u32
        eventPtr = eventPtr >>> 0;
        eventLen = eventLen >>> 0;
        return emit_event(eventPtr, eventLen);
      },
      set_return_data(dataPtr, dataLen) {
        // src/runtime/env/setReturnData(u32, u32) => u32
        dataPtr = dataPtr >>> 0;
        dataLen = dataLen >>> 0;
        return set_return_data(dataPtr, dataLen);
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    Initialize() {
      // examples/hello-world/Initialize() => u32
      return exports.Initialize() >>> 0;
    },
    Call() {
      // examples/hello-world/Call() => u32
      return exports.Call() >>> 0;
    },
    SayHello() {
      // examples/hello-world/SayHello() => u32
      return exports.SayHello() >>> 0;
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  return adaptedExports;
}
export const {
  memory,
  Initialize,
  Call,
  SayHello,
} = await (async url => instantiate(
  await (async () => {
    const isNodeOrBun = typeof process != "undefined" && process.versions != null && (process.versions.node != null || process.versions.bun != null);
    if (isNodeOrBun) { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
    else { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
  })(), {
  }
))(new URL("hello-world.wasm", import.meta.url));
