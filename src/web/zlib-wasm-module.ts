import zlibInitMethod from './build/zlib-wasm.js';
import zlibWasm from './build/zlib-wasm.wasm';
import {
  BufferInflationResult,
  IBufferToTextDecoder,
  InflationUtils,
  ITextToBufferEncoder,
  LoadState,
  Pointer,
  ZlibWasmOptions,
} from './types';
import { isNative, isWebview, writeNumberToByte, writeUint8Byte } from './util';

// const DEFAULT_COMPRESSION_LEVEL = 9;
// const DEFAULT_INITIAL_MEMORY_PAGES = 10;

export interface IZlibWasmModuleAPI {
  _mallocMemory(size: number): Pointer;

  _freeMemory(ptr: Pointer): void;

  _unGzipBase64Content(
    inputBufferPtr: Pointer,
    inputLength: number,
    base64InputPtr: Pointer,
    base64OutputLengthPtr: Pointer,
    outLengthPtr: Pointer,
  ): number;

  _getCompressedDataPtr(): Pointer;

  _getI32Value(ptr: Pointer): number;
}

export interface ZlibWasmModuleExports extends WebAssembly.Exports, IZlibWasmModuleAPI {

}

// 用几字节来保存 length 的值
export const LENGTH_BUFFER_SIZE: number = 4;

export interface IZlibWasmModuleOptions extends ZlibWasmOptions {
  /**
   * fall back inflation methods
   */
  inflationUtils: InflationUtils;

  encoder: ITextToBufferEncoder;

  decoder: IBufferToTextDecoder;
}

/**
 * 胶水代码模块的 API
 */
export interface IGlueModule extends IZlibWasmModuleAPI {
  ready: Promise<IGlueModule>;
  HEAPU8: Uint8Array;

  onAbort?(what: string): void;

  locateFile?(file: string): string;

  getValue(ptr: Pointer, type: 'i1' | 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double' | '*'): number;

  UTF8ToString(ptr: Pointer, len: number): string;
}

export class ZlibWasmModule {

  private glueModule: IGlueModule;

  // 加载状态
  private loadState: LoadState = LoadState.NOT_INIT;

  // 将 base64 字符编译为 ArrayBuffer，默认是 window.TextEncoder
  private encoder: ITextToBufferEncoder;
  // 将 ArrayBuffer 转化为字符，默认是 window.TextDecoder
  private decoder: IBufferToTextDecoder;

  private inflationUtils: InflationUtils;
  private wasmModuleExports: ZlibWasmModuleExports;

  constructor(options: IZlibWasmModuleOptions) {
    const { debug = false, inflationUtils, encoder, decoder } = options;

    this.inflationUtils = inflationUtils;
    this.encoder = encoder;
    this.decoder = decoder;

    if (ZlibWasmModule.isSupportWasm()) {
      this.loadState = LoadState.LOADING;
      this.init();
    } else {
      console.warn('[zlib-wasm] wasm not support');
      this.loadState = LoadState.NOT_SUPPORT;
    }
  }

  public loadedPromise: Promise<ZlibWasmModuleExports>;

  /**
   * 判断兼容性
   */
  static isSupportWasm(): boolean {
    return isWebview() && window.WebAssembly && isNative(window.WebAssembly.compile);
  }

  private async init() {
    // const wasmBinary = this.encoder.encode(zlibWasm);
    // const wasmBinary = Buffer.from(zlibWasm, 'base64');
    // const wasmBinary = await import('./build/zlib-wasm.wasm') as any;
    this.glueModule = {
      // wasmBinary,
      locateFile: () => {
        // return 'zlib-wasm.wasm';
        return zlibWasm;
      },
      onAbort: () => {
        this.loadState = LoadState.ERROR;
      },
      onRuntimeInitialized: () => {
        this.loadState = LoadState.READY;
        this.wasmModuleExports = {
          // 这个 g 开始，其实是 C 源码从上到下的顺序
          _getCompressedDataPtr: this.glueModule['asm']['f'],
          _unGzipBase64Content: this.glueModule['asm']['g'],
          _mallocMemory: this.glueModule['asm']['h'],
          _freeMemory: this.glueModule['asm']['i'],
          _getI32Value: this.glueModule['asm']['j'],
        };
      },
    } as any;

    this.loadedPromise = zlibInitMethod(this.glueModule);

  }

  /**
   * 解压 base64Text, 得到解压后 decoder.decode 的字符串
   * @param base64Text
   */
  unGzipRaw(base64Text: string): string {
    if (!this.isReady()) {
      return this.inflationUtils.inflationMethod(base64Text);
    }

    // 将text转换为 ArrayBuffer
    const inputBuffer = this.encoder.encode(base64Text);
    const inputBufferLength = inputBuffer.length;

    const inputBufferPtr = this.wasmModuleExports._mallocMemory(inputBufferLength);
    writeUint8Byte(this.glueModule.HEAPU8, inputBuffer, inputBufferPtr);

    const base64OutLength = Math.floor((inputBufferLength + 2) * 3 / 4) + 1;
    const base64OutLengthPtr = this.wasmModuleExports._mallocMemory(LENGTH_BUFFER_SIZE);
    writeNumberToByte(base64OutLength, this.glueModule.HEAPU8, base64OutLengthPtr);

    const base64InputPtr = this.wasmModuleExports._mallocMemory(base64OutLength);

    const outLengthPtr = this.wasmModuleExports._mallocMemory(LENGTH_BUFFER_SIZE);
    const unGzipRet = this.wasmModuleExports._unGzipBase64Content(
      inputBufferPtr,
      inputBufferLength,
      base64InputPtr,
      base64OutLengthPtr,
      outLengthPtr,
    );

    if (unGzipRet !== 0) {
      return this.inflationUtils.inflationMethod(base64Text);
    }

    const outputPtr = this.wasmModuleExports._getCompressedDataPtr();

    // read unGzip result form heap
    const retString = this.decoder.decode(this.glueModule.HEAPU8.subarray(outputPtr, outputPtr + this.wasmModuleExports._getI32Value(outLengthPtr)));

    // release heap pointer
    this.wasmModuleExports._freeMemory(inputBufferPtr);
    this.wasmModuleExports._freeMemory(base64InputPtr)
    this.wasmModuleExports._freeMemory(base64OutLengthPtr);
    this.wasmModuleExports._freeMemory(outLengthPtr);
    // 不可以 free outputPtr，因为内部会自己 free，否则 double free 会 oom
    // this.wasmModuleExports._freeMemory(outputPtr);

    return retString;

  }

  /**
   * 解压 base64Text, 得到解压后 decoder.decode 的 JSON 数据
   * @param base64Text
   */
  unGzip<T>(base64Text: string): BufferInflationResult<T> {
    if (!this.isReady()) {
      return this.inflationUtils.bufferInflationMethod<T>(base64Text);
    }

    // 将text转换为 ArrayBuffer
    const inputBuffer = this.encoder.encode(base64Text);
    const inputBufferLength = inputBuffer.length;

    const inputBufferPtr = this.wasmModuleExports._mallocMemory(inputBufferLength);
    writeUint8Byte(this.glueModule.HEAPU8, inputBuffer, inputBufferPtr);

    const base64OutLength = Math.floor((inputBufferLength + 2) * 3 / 4) + 1;
    const base64OutLengthPtr = this.wasmModuleExports._mallocMemory(LENGTH_BUFFER_SIZE);
    writeNumberToByte(base64OutLength, this.glueModule.HEAPU8, base64OutLengthPtr);

    const base64InputPtr = this.wasmModuleExports._mallocMemory(base64OutLength);

    const outLengthPtr = this.wasmModuleExports._mallocMemory(LENGTH_BUFFER_SIZE);
    const unGzipRet = this.wasmModuleExports._unGzipBase64Content(
      inputBufferPtr,
      inputBufferLength,
      base64InputPtr,
      base64OutLengthPtr,
      outLengthPtr,
    );

    if (unGzipRet !== 0) {
      return this.inflationUtils.bufferInflationMethod<T>(base64Text);
    }

    const outputPtr = this.wasmModuleExports._getCompressedDataPtr();

    // read unGzip result form heap
    const retString = this.decoder.decode(this.glueModule.HEAPU8.subarray(outputPtr, outputPtr + this.wasmModuleExports._getI32Value(outLengthPtr)));
    const base64DecodeBuffer = this.glueModule.HEAPU8.slice(base64OutLengthPtr, base64OutLengthPtr + this.wasmModuleExports._getI32Value(base64OutLengthPtr));

    // release heap pointer
    this.wasmModuleExports._freeMemory(inputBufferPtr);
    this.wasmModuleExports._freeMemory(base64InputPtr)
    this.wasmModuleExports._freeMemory(base64OutLengthPtr);
    this.wasmModuleExports._freeMemory(outLengthPtr);
    // 不可以 free outputPtr，因为内部会自己 free，否则 double free 会 oom
    // this.wasmModuleExports._freeMemory(outputPtr);

    return {
      buffer: base64DecodeBuffer,
      result: JSON.parse(retString) as T,
    };
  }

  isReady() {
    return this.loadState === LoadState.READY;
  }

}
