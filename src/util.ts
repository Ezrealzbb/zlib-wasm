
/**
 * 判断是否是空指针，如果是空指针，则说明内存分配失败
 * @param ptr 指针
 */
export function isNULLPtr(ptr: number): boolean {
  return ptr === 0;
}