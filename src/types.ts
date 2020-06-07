export enum LoadState {
    NOT_SUPPORT = 'NOT_SUPPORT',
    LOADING = 'LOADING',
    READY = 'READY',
    ERROR = 'ERROR',
}

export type DeflateLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ZlibWasmOptions {
    debug: boolean;
    // loadWasm: () => void;
    // reporter: ({ key:  })
    // logger: 
}

export enum TimeRecordLabel {
    BASE64 = 'BASE64',
    WASM_UNGZIP = 'wasm_ungzip',
    PAKO_UNGZIP = 'pako_ungzip',
    WASM_GZIP = 'wasm_gzip',
    PAKO_GZIP = 'pako_gzip',
}

export interface InstaceExports extends WebAssembly.Exports {
    _free: (ptr: number) => void;
    _malloc: (size: number) => number;
    _base64_decode: (inputPtr: number, inputLen: number, outLen: number) => number;
    _uncompress_gzip: (inputPtr: number, inputLen: number, outPtr: number, outLen: number) => number;
    _compress_bound: (size: number) => number;
    _compress_gzip: (inputPtr: number, inputLen: number, outPtr: number, outLen: number, level: number) => number;
    _abort: () => void;
    _grow: () => void;
}