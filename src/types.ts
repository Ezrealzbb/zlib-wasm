export enum LoadState {
    NOT_SUPPORT = 'NOT_SUPPORT',
    LOADING = 'LOADING',
    READY = 'READY',
    ERROR = 'ERROR',
}



export interface ZlibWasmOptions {
    debug: boolean;
    // loadWasm: () => void;
    // reporter: ({ key:  })
    // logger: 
}

export interface InstaceExports extends WebAssembly.Exports {
    _free: (ptr: number) => void;
    _malloc: (size: number) => number;
    _base64_decode: (inputPtr: number, inputLen: number, outLen: number) => number;
    _uncompress_gzip: (inputPtr: number, inputLen: number, outPtr: number, outLen: number) => number;
    _compress_bound: (size: number) => number;
    _abort: () => void;
    _grow: () => void;
}