export enum LoadState {
    NOT_SUPPORT = 'NOT_SUPPORT',
    LOADING = 'LOADING',
    READY = 'READY',
    ERROR = 'ERROR',
}



export interface ZlibWasmOptions {
    debug: boolean;
    // reporter: ({ key:  })
    // logger: 
}

export interface InstaceExports extends WebAssembly.Exports {
    _free: (ptr: number) => void;
    _malloc: (size: number) => number;
    _base64_decode: (inputPtr: number, inputLen: number, outPtr: number) => void;
    _uncompress_gzip: (inputPtr: number, inputLen: number, outPtr: number, outLen: number) => number;
}