
/**
 * 判断是否是空指针，如果是空指针，则说明内存分配失败
 * @param ptr 指针
 */
export function isNULLPtr(ptr: number): boolean {
  return ptr === 0;
}

/**
 *  判断是否是原生方法
 * @param Ctor Webassembly & TextEncoder
 */
export function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

/**
 * 在worker 或 node 环境中不支持
 */
export function isWebview(): boolean {
  return typeof window === 'object';
}

/**
 * 获取比 x 大的且能被 y 整除的最小数
 * @param x 被除数
 * @param y 除数
 */
export function getMinDivisionNumber(x: number, y: number) {
  const reset = x % y;
  return reset ? x + y - reset : x;
}

export function noop() {
  
}