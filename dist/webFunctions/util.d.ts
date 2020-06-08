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
