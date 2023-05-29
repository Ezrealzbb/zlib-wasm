/**
 * 判断是否是空指针，如果是空指针，则说明内存分配失败
 * @param ptr 指针
 */
export declare function isNULLPtr(ptr: number): boolean;
/**
 *  判断是否是原生方法
 * @param Ctor Webassembly & TextEncoder
 */
export declare function isNative(Ctor: any): boolean;
/**
 * 在worker 或 node 环境中不支持
 */
export declare function isWebview(): boolean;
/**
 * 获取比 x 大的且能被 y 整除的最小数
 * @param x 被除数
 * @param y 除数
 */
export declare function getMinDivisionNumber(x: number, y: number): number;
export declare const INVALID_BASE64_RE: RegExp;
export declare function base64clean(str: string): string;
/**
 *
 * @param str input string
 * @param heap arrayBuffer
 * @param outIdx start point
 * @param maxBytesToWrite memory to write
 */
export declare function stringToUTF8Array(str: string, heap: ArrayBuffer, outIdx: number, maxBytesToWrite: number): number;
export declare function UTF8ArrayToString(heapOrArray: any, idx: any, maxBytesToRead: any, decoder: any): any;
export declare function writeUint8Byte(targetBuffer: Uint8Array, sourceBuffer: Uint8Array, start: number): void;
export declare function writeNumberToByte(number: number, uint8Array: Uint8Array, offset: number): void;
export declare function isNativeTextToBufferEnable(): boolean;
export declare function isNativeBufferToTextEnable(): boolean;
