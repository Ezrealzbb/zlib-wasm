import { ZlibWasmOptions, DeflateLevel } from './types';
export declare class ZlibWasmParser {
    private memory;
    private instanceExports;
    private pako;
    private buff;
    private loadState;
    private debug;
    private timeMaps;
    timeSet: number[];
    private encoder;
    private decoder;
    private base64InputPtr;
    private base64InputByteLength;
    private base64OutputPtr;
    private base64OutputByteLength;
    private inputPtr;
    private inputByteLength;
    private outputPtr;
    private outputByteLength;
    private loadedPromiseResolver;
    loadedPromise: Promise<ZlibWasmParser>;
    constructor(options: ZlibWasmOptions);
    private init;
    private recordBase64;
    private recordGzip;
    private wasmLog;
    /**
     *
     * @param instance 校验 Webassembly compile 结果
     */
    private checkEnable;
    private timeRecord;
    private timeRecordEnd;
    /**
     * 释放内存
     */
    private reset;
    ungzip(base64Text: string): string;
    pakoUngzip(base64Text: string): string;
    gzip(text: string, level?: DeflateLevel): string;
    pakoGzip(text: string, level?: DeflateLevel): string;
    isReady(): boolean;
    setDebug(debug: boolean): void;
    /**
     * 判断兼容性
     */
    static isSupportWasm(): boolean;
}
