export enum LoadState {
    NOT_SUPPORT = 'NOT_SUPPORT',
    LOADING = 'LOADING',
    READY = 'READY',
    ERROR = 'ERROR',
}

export type DeflateLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Pointer = number;

// zlib 定义的错误码
export enum ReturnCodes {
    Z_OK = 0,
    Z_STREAM_END = 1,
    Z_NEED_DICT = 2,
    Z_ERRNO = -1,
    Z_STREAM_ERROR = -2,
    Z_DATA_ERROR = -3,
    Z_BUF_ERROR = -5,
}

export interface ZlibWasmOptions {
    debug?: boolean;
}

export enum TimeRecordLabel {
    BASE64 = 'BASE64',
    WASM_UNGZIP = 'wasm_ungzip',
    PAKO_UNGZIP = 'pako_ungzip',
    WASM_GZIP = 'wasm_gzip',
    PAKO_GZIP = 'pako_gzip',
}

export type TimeRecordMaps = {
    [key in TimeRecordLabel]: number;
}

export interface InstaceExports extends WebAssembly.Exports {
    _free: (ptr: Pointer) => void;
    _malloc: (size: number) => Pointer;
    _base64_decode: (inputPtr: Pointer, inputLen: number, outLen: number) => Pointer;
    _base64_decode2: (inputPtr: Pointer, inputLen: number, outPtr: Pointer, outLen: number) => Pointer;
    _base64_encode: (inputPtr: Pointer, inputLen: number, outLen: number) => Pointer;
    _base64_encode2: (inputPtr: Pointer, inputLen: number, outPtr: Pointer, outLen: number) => Pointer;
    _uncompress_gzip: (inputPtr: Pointer, inputLen: number, outPtr: Pointer, outLen: number) => ReturnCodes;
    _compress_bound: (size: number) => number;
    _compress_gzip: (inputPtr: Pointer, inputLen: number, outPtr: Pointer, outLen: number, level: DeflateLevel) => ReturnCodes;
    _abort: () => void;
    _grow: () => void;
}