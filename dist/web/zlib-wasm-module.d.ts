import { BufferInflationResult, IBufferToTextDecoder, InflationUtils, ITextToBufferEncoder, Pointer, ZlibWasmOptions } from './types';
export interface IZlibWasmModuleAPI {
    _mallocMemory(size: number): Pointer;
    _freeMemory(ptr: Pointer): void;
    _unGzipBase64Content(inputBufferPtr: Pointer, inputLength: number, base64InputPtr: Pointer, base64OutputLengthPtr: Pointer, outLengthPtr: Pointer): number;
    _getCompressedDataPtr(): Pointer;
    _getI32Value(ptr: Pointer): number;
}
export interface ZlibWasmModuleExports extends WebAssembly.Exports, IZlibWasmModuleAPI {
}
export declare const LENGTH_BUFFER_SIZE: number;
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
export declare class ZlibWasmModule {
    private glueModule;
    private loadState;
    private encoder;
    private decoder;
    private inflationUtils;
    private wasmModuleExports;
    constructor(options: IZlibWasmModuleOptions);
    loadedPromise: Promise<ZlibWasmModuleExports>;
    /**
     * 判断兼容性
     */
    static isSupportWasm(): boolean;
    private init;
    /**
     * 解压 base64Text, 得到解压后 decoder.decode 的字符串
     * @param base64Text
     */
    unGzipRaw(base64Text: string): string;
    /**
     * 解压 base64Text, 得到解压后 decoder.decode 的 JSON 数据
     * @param base64Text
     */
    unGzip<T>(base64Text: string): BufferInflationResult<T>;
    isReady(): boolean;
}
